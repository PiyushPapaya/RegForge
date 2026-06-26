import { NextRequest, NextResponse } from "next/server";
import { RegisterMapSchema } from "@/lib/schema/registerMap";
import { generateHeader } from "@/lib/generate/templateHeader";
import { generateDriver } from "@/lib/generate/templateDriver";
import { buildInitSequence } from "@/lib/generate/initSequence";
import { makeClient, MODEL } from "@/types/anthropic";

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

  const client = makeClient();
  const init = await buildInitSequence(map, async (prompt) => {
    const msg = await client.messages.create({
      model: MODEL, max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });
    const b = msg.content.find((x) => x.type === "text");
    return b && b.type === "text" ? b.text : "";
  });

  return NextResponse.json({
    files: [
      { name: `${slug}_regs.h`, content: header },
      { name: `${slug}.h`, content: driver.h },
      { name: `${slug}.c`, content: driver.c },
    ],
    init,
  });
}
