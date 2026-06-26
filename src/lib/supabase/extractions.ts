import { serverClient } from "@/lib/supabase/client";
import type { RegisterMap } from "@/lib/schema/registerMap";

export async function saveExtraction(map: RegisterMap): Promise<string> {
  const db = serverClient();
  const { data, error } = await db
    .from("extractions")
    .insert({ device_name: map.device.name, vendor: map.device.vendor, register_map: map })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function getExtraction(id: string): Promise<RegisterMap | null> {
  const db = serverClient();
  const { data, error } = await db.from("extractions").select("register_map").eq("id", id).single();
  if (error || !data) return null;
  return (data as { register_map: RegisterMap }).register_map;
}

export async function listExamples(): Promise<{ id: string; device_name: string; vendor: string }[]> {
  const db = serverClient();
  const { data, error } = await db
    .from("extractions").select("id, device_name, vendor").eq("is_example", true);
  if (error || !data) return [];
  return data as { id: string; device_name: string; vendor: string }[];
}
