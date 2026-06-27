// src/components/HeroPreview.tsx
"use client";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion/reducedMotion";

// A tiny, honest sample of the real pipeline: extracted rows → generated C.
const ROWS = [
  { addr: "0x0F", name: "WHO_AM_I", def: "#define BMI270_REG_WHO_AM_I 0x0F" },
  { addr: "0x7C", name: "PWR_CONF", def: "#define BMI270_REG_PWR_CONF  0x7C" },
  { addr: "0x7D", name: "PWR_CTRL", def: "#define BMI270_REG_PWR_CTRL  0x7D" },
];

export function HeroPreview() {
  const reduced = useReducedMotion();
  const loop = reduced
    ? {}
    : { repeat: Infinity, repeatType: "reverse" as const, duration: 2.2, ease: "easeInOut" as const };

  return (
    <div className="panel-raised w-full overflow-hidden p-4 text-left" aria-hidden>
      <div className="mb-3 flex items-center gap-2 font-mono text-step--1 text-[var(--muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        register map → driver
      </div>

      {/* Extracted register rows */}
      <div className="space-y-1.5 font-mono text-step--1">
        {ROWS.map((r, i) => (
          <motion.div key={r.name}
            initial={reduced ? false : { opacity: 0.5 }}
            animate={reduced ? {} : { opacity: [0.5, 1, 0.5] }}
            transition={reduced ? {} : { ...loop, delay: i * 0.25 }}
            className="flex items-center gap-3 rounded border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5">
            <span className="w-12 text-[var(--accent)]">{r.addr}</span>
            <span className="text-[var(--text)]">{r.name}</span>
            <span className="ml-auto text-[var(--link)]">p{12 + i}</span>
          </motion.div>
        ))}
      </div>

      <div className="my-3 flex items-center gap-2 text-[var(--muted)]">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="font-mono text-step--1">generate</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {/* Generated header lines */}
      <div className="space-y-0.5 rounded border border-[var(--border)] bg-[var(--panel)] p-2.5 font-mono text-step--1">
        {ROWS.map((r, i) => (
          <motion.div key={r.def}
            initial={reduced ? false : { opacity: 0, x: -6 }}
            animate={reduced ? {} : { opacity: [0, 1, 1, 0], x: [-6, 0, 0, -6] }}
            transition={reduced ? {} : { repeat: Infinity, duration: 4.4, times: [0, 0.2, 0.85, 1], delay: 0.6 + i * 0.3 }}
            className="whitespace-pre text-[var(--text)]">
            <span className="text-[var(--accent-bright)]">#define</span>
            <span className="text-[var(--muted-strong)]">{r.def.replace("#define", "")}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
