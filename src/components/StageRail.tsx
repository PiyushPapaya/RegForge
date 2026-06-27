"use client";
import { STAGES, stageState, type Stage } from "@/lib/stages";

const LABEL: Record<Stage, string> = { upload: "Upload", extract: "Extract", verify: "Verify", generate: "Generate" };

export function StageRail({ current, substatus }: { current: Stage; substatus?: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      {STAGES.map((s, i) => {
        const st = stageState(current, s);
        const color = st === "done" ? "text-[var(--accent)]" : st === "active" ? "text-[var(--accent-bright)]" : "text-[var(--muted)]";
        const dot = st === "active" ? "animate-pulse" : "";
        return (
          <span key={s} className="flex items-center gap-2">
            <span className={`${color} ${dot}`}>{st === "done" ? "◉" : "○"} {LABEL[s]}</span>
            {i < STAGES.length - 1 && <span className="text-[var(--border)]">─</span>}
          </span>
        );
      })}
      {substatus && <span className="ml-3 text-[var(--muted)]">{substatus}</span>}
    </div>
  );
}
