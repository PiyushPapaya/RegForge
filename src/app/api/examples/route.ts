import { NextResponse } from "next/server";
import { listExamples } from "@/lib/supabase/extractions";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json({ examples: await listExamples() }); }
