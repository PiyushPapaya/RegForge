export const STAGES = ["upload", "extract", "verify", "generate"] as const;
export type Stage = (typeof STAGES)[number];
export type StageState = "done" | "active" | "pending";

export function stageState(current: Stage, target: Stage): StageState {
  const ci = STAGES.indexOf(current), ti = STAGES.indexOf(target);
  if (ti < ci) return "done";
  if (ti === ci) return "active";
  return "pending";
}
