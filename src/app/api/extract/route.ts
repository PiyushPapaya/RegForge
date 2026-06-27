import { NextRequest, NextResponse } from "next/server";
import { extractRegisterMap } from "@/lib/extract/extractRegisterMap";
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
  try {
    // Adapt the provider to the existing TextCaller seam: (prompt, pdf) order.
    const result = await extractRegisterMap(pdf, (prompt, p) => llm.extractFromPdf(p, prompt));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }
    if (!result.map.device_detected) {
      return NextResponse.json(
        { error: "This doesn't look like a single-chip I2C/SPI sensor datasheet.", device_detected: false },
        { status: 422 }
      );
    }
    let id: string | null = null;
    try { id = await saveExtraction(result.map); } catch { /* persistence is best-effort */ }
    return NextResponse.json({ id, map: result.map });
  } catch (e) {
    if (e instanceof ProviderError) {
      return NextResponse.json({ error: e.userMessage }, { status: e.status });
    }
    return NextResponse.json({ error: "Extraction failed unexpectedly." }, { status: 500 });
  }
}
