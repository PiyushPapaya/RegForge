import { NextRequest, NextResponse } from "next/server";
import { extractRegisterMap } from "@/lib/extract/extractRegisterMap";
import { buildExtractionPrompt } from "@/lib/extract/prompt";
import { resolveProvider } from "@/lib/llm/registry";
import { ProviderError } from "@/lib/llm/errors";
import { saveExtraction } from "@/lib/supabase/extractions";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 25 * 1024 * 1024; // ~25MB guardrail

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("pdf");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No PDF uploaded." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "PDF too large (max ~25MB / ~120 pages)." }, { status: 413 });
  }
  const provider = (form.get("provider") as string) || undefined;
  const apiKey = (form.get("apiKey") as string) || undefined;

  // Resolve the provider up front so key/config errors return a clean HTTP error
  // (not a mid-stream event the client has to special-case).
  let llm;
  try {
    llm = resolveProvider({ provider, apiKey });
  } catch (e) {
    if (e instanceof ProviderError) {
      return NextResponse.json({ error: e.userMessage }, { status: e.status === 401 ? 400 : e.status });
    }
    throw e;
  }

  const pdf = Buffer.from(await file.arrayBuffer());
  const basePrompt = buildExtractionPrompt();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(o)}\n\n`));
      try {
        send({ phase: "reading" });

        // Stream tokens when the provider supports it; count registers as they form.
        let buffered = "";
        if (typeof llm.extractFromPdfStream === "function") {
          let count = 0;
          for await (const delta of llm.extractFromPdfStream(pdf, basePrompt)) {
            buffered += delta;
            // "reset_value" appears exactly once per register (fields use "reset"),
            // so its running count is a monotonic "registers seen so far" signal.
            const n = (buffered.match(/"reset_value"/g) || []).length;
            if (n !== count) { count = n; send({ phase: "extracting", registersFound: n }); }
          }
        } else {
          buffered = await llm.extractFromPdf(pdf, basePrompt);
        }

        send({ phase: "validating" });

        // Reuse the existing Zod + one-retry validator. First call returns the text
        // we already streamed; if it fails validation, the retry falls back to a
        // fresh (non-streaming) model call — exactly the original behaviour.
        let first = true;
        const result = await extractRegisterMap(pdf, async (prompt, p) => {
          if (first) { first = false; return buffered; }
          return llm.extractFromPdf(p, prompt);
        });

        if (!result.ok) {
          send({ phase: "error", error: result.error });
        } else if (!result.map.device_detected) {
          send({ phase: "error", device_detected: false,
            error: "This doesn't look like a single-chip I2C/SPI sensor datasheet." });
        } else {
          let id: string | null = null;
          try { id = await saveExtraction(result.map); } catch { /* persistence is best-effort */ }
          send({ phase: "done", id, map: result.map });
        }
      } catch (e) {
        const error = e instanceof ProviderError ? e.userMessage : "Extraction failed unexpectedly.";
        send({ phase: "error", error });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
