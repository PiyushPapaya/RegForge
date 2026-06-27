// src/components/InitTimeline.tsx
"use client";
import { motion } from "framer-motion";
import type { InitResult } from "@/lib/generate/initSequence";

export function InitTimeline({ init }: { init: InitResult | null }) {
  if (!init) return <div className="font-mono text-sm text-[var(--muted)]">Init sequence will appear here.</div>;
  return (
    <div>
      {init.degraded && (
        <p className="mb-3 rounded border border-[var(--warn)] bg-[rgba(224,168,94,0.08)] px-3 py-2 text-xs text-[var(--warn)]">
          Init reasoning unavailable — showing raw hints from the datasheet.
        </p>
      )}
      <ol className="relative ml-3 space-y-3 border-l border-[var(--border)] pl-5">
        {init.steps.map((s, i) => (
          <motion.li key={s.order}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="relative">
            <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--bg)] font-mono text-[10px] text-[var(--accent)]">
              {s.order}
            </span>
            <div className="text-sm text-[var(--text)]">{s.action}</div>
            {s.detail && <div className="mt-0.5 text-xs text-[var(--muted)]">{s.detail}</div>}
            {s.source && <span className="mt-1 inline-block font-mono text-[11px] text-[var(--link)]">p{s.source.page}</span>}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
