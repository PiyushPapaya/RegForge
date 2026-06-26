import { z } from "zod";
import type { RegisterMap } from "@/lib/schema/registerMap";

export type InitCaller = (prompt: string) => Promise<string>;

const StepSchema = z.object({
  order: z.number().int(),
  action: z.string().min(1),
  detail: z.string().default(""),
  source: z.object({ page: z.number().int(), section: z.string().optional() }).optional(),
});
const ResponseSchema = z.object({ steps: z.array(StepSchema).min(1) });
export type InitStep = z.infer<typeof StepSchema>;

export interface InitResult { steps: InitStep[]; degraded: boolean; }

export function buildInitPrompt(map: RegisterMap): string {
  return `Given this verified register map (JSON) for ${map.device.name}, produce the ordered power-on initialization sequence.
Return ONLY JSON: { "steps": [ { "order": number, "action": string, "detail": string, "source": { "page": number, "section": string } } ] }.
Use the register names and addresses from the map. Ground steps in these hints: ${JSON.stringify(map.init_hints)}.
Register map: ${JSON.stringify({ device: map.device, registers: map.registers })}`;
}

export async function buildInitSequence(map: RegisterMap, call: InitCaller): Promise<InitResult> {
  try {
    const raw = await call(buildInitPrompt(map));
    const cleaned = raw.replace(/```(?:json)?/g, "").trim();
    const parsed = ResponseSchema.safeParse(JSON.parse(cleaned));
    if (parsed.success) return { steps: parsed.data.steps, degraded: false };
  } catch {
    /* fall through to degraded */
  }
  const steps: InitStep[] = map.init_hints.length
    ? map.init_hints.map((h, i) => ({ order: i + 1, action: h, detail: "" }))
    : [{ order: 1, action: "No init hints were extracted; consult the datasheet.", detail: "" }];
  return { steps, degraded: true };
}
