import { NextRequest, NextResponse } from "next/server";
import { RegisterMapSchema } from "@/lib/schema/registerMap";
import { generateHeader } from "@/lib/generate/templateHeader";
import { generateDriver } from "@/lib/generate/templateDriver";
import { buildInitSequence } from "@/lib/generate/initSequence";
import { resolveProvider } from "@/lib/llm/registry";
import { ProviderError } from "@/lib/llm/errors";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = RegisterMapSchema.safeParse(body?.map);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid register map." }, { status: 400 });
  }
  const map = parsed.data;
  const slug = map.device.name.toLowerCase().replace(/[^a-z0-9]/g, "_");

  const header = generateHeader(map);
  const driver = generateDriver(map);

  let llm;
  try {
    llm = resolveProvider({ provider: body?.provider, apiKey: body?.apiKey });
  } catch (e) {
    if (e instanceof ProviderError) {
      return NextResponse.json({ error: e.userMessage }, { status: 400 });
    }
    throw e;
  }

  // buildInitSequence already degrades gracefully if the call throws.
  const init = await buildInitSequence(map, (prompt) => llm.reasonText(prompt));

  return NextResponse.json({
    files: [
      { name: `${slug}_regs.h`, content: header },
      { name: `${slug}.h`, content: driver.h },
      { name: `${slug}.c`, content: driver.c },
    ],
    init,
  });
}
