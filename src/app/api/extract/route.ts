import { NextRequest, NextResponse } from "next/server";
import { extractRegisterMap } from "@/lib/extract/extractRegisterMap";
import { makeClient, makePdfCaller } from "@/types/anthropic";
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
  const pdf = Buffer.from(await file.arrayBuffer());
  const caller = makePdfCaller(makeClient());

  const result = await extractRegisterMap(pdf, caller);
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
}
