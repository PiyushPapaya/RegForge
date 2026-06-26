import { NextRequest, NextResponse } from "next/server";
import { getExtraction } from "@/lib/supabase/extractions";
export const runtime = "nodejs";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const map = await getExtraction(id);
  return map ? NextResponse.json({ map }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
