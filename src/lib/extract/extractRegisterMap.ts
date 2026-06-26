import { RegisterMapSchema, type RegisterMap } from "@/lib/schema/registerMap";
import { buildExtractionPrompt } from "@/lib/extract/prompt";

export type TextCaller = (prompt: string, pdf: Buffer) => Promise<string>;

export type ExtractResult =
  | { ok: true; map: RegisterMap }
  | { ok: false; error: string };

function stripFences(s: string): string {
  const m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (m ? m[1] : s).trim();
}

function tryParse(raw: string): RegisterMap | null {
  try {
    const obj = JSON.parse(stripFences(raw));
    const res = RegisterMapSchema.safeParse(obj);
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

export async function extractRegisterMap(pdf: Buffer, call: TextCaller): Promise<ExtractResult> {
  const base = buildExtractionPrompt();
  let map = tryParse(await call(base, pdf));
  if (!map) {
    const retry = base + "\n\nYour previous reply was not valid JSON matching the schema. Reply with ONLY the corrected JSON object.";
    map = tryParse(await call(retry, pdf));
  }
  return map ? { ok: true, map } : { ok: false, error: "Could not extract a valid register map." };
}
