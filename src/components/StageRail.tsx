"use client";
import { motion } from "framer-motion";
import { STAGES, stageState, type Stage } from "@/lib/stages";
import { prefersReducedMotion } from "@/components/motion";

const LABEL: Record<Stage, string> = { upload: "Upload", extract: "Extract", verify: "Verify", generate: "Generate" };

export function StageRail({ current, substatus }: { current: Stage; substatus?: string }) {
  const reduce = prefersReducedMotion();
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      {STAGES.map((s, i) => {
        const st = stageState(current, s);
        const color = st === "done" ? "text-[var(--accent)]" : st === "active" ? "text-[var(--accent-bright)]" : "text-[var(--muted)]";
        const label = <>{st === "done" ? "◉" : "○"} {LABEL[s]}</>;
        return (
          <span key={s} className="flex items-center gap-2">
            {st === "active" && !reduce ? (
              <motion.span layout className={color}
                animate={{ opacity: [1, 0.55, 1], scale: [1, 1.04, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                {label}
              </motion.span>
            ) : (
              <span className={`${color} ${st === "active" ? "animate-pulse" : ""}`}>{label}</span>
            )}
            {i < STAGES.length - 1 && <span className="text-[var(--border)]">─</span>}
          </span>
        );
      })}
      {substatus && <span className="ml-3 text-[var(--muted)]">{substatus}</span>}
    </div>
  );
}
