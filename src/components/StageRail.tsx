// src/components/StageRail.tsx
"use client";
import { motion } from "framer-motion";
import { STAGES, stageState, type Stage } from "@/lib/stages";
import { useReducedMotion } from "@/lib/motion/reducedMotion";

const LABEL: Record<Stage, string> = { upload: "Upload", extract: "Extract", verify: "Verify", generate: "Generate" };

export function StageRail({ current, substatus }: { current: Stage; substatus?: string }) {
  const reduced = useReducedMotion();
  const idx = STAGES.indexOf(current);
  const fillPct = STAGES.length > 1 ? (idx / (STAGES.length - 1)) * 100 : 0;

  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <div className="relative flex items-center" style={{ width: 320 }}>
        {/* track */}
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[var(--border)]" />
        {/* fill */}
        <motion.div
          className="absolute left-0 top-1/2 h-px -translate-y-1/2"
          style={{ background: "linear-gradient(90deg, var(--accent), var(--link))" }}
          initial={false}
          animate={{ width: `${fillPct}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="relative flex w-full justify-between">
          {STAGES.map((s) => {
            const st = stageState(current, s);
            const dot =
              st === "done" ? "bg-[var(--done)] border-[var(--done)]"
              : st === "active" ? "bg-[var(--accent-bright)] border-[var(--accent-bright)]"
              : "bg-[var(--bg)] border-[var(--border)]";
            const txt =
              st === "pending" ? "text-[var(--muted)]" : "text-[var(--text)]";
            return (
              <div key={s} className="flex flex-col items-center gap-1">
                <span className={`relative h-2.5 w-2.5 rounded-full border ${dot}`}>
                  {st === "active" && !reduced && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: "0 0 0 0 var(--accent-bright)" }}
                      animate={{ boxShadow: ["0 0 0 0 rgba(94,240,168,0.5)", "0 0 0 6px rgba(94,240,168,0)"] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
                </span>
                <span className={`absolute mt-4 ${txt}`} style={{ transform: "translateY(2px)" }}>{LABEL[s]}</span>
              </div>
            );
          })}
        </div>
      </div>
      {substatus && <span className="ml-2 text-[var(--muted)]">{substatus}</span>}
    </div>
  );
}
