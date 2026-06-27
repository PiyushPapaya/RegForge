// src/components/ExtractProgress.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion/reducedMotion";
import type { ExtractPhase } from "@/app/page";

const PHASES: { id: Exclude<ExtractPhase, null>; label: string }[] = [
  { id: "reading", label: "Reading datasheet" },
  { id: "extracting", label: "Extracting registers" },
  { id: "validating", label: "Validating schema" },
];

export function ExtractProgress({ phase, registersFound, status }: {
  phase: ExtractPhase; registersFound: number; status: string;
}) {
  const reduced = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const activeIdx = phase ? PHASES.findIndex((p) => p.id === phase) : 0;

  return (
    <div className="panel-raised relative flex h-72 w-full max-w-xl flex-col justify-center gap-4 overflow-hidden px-6">
      {/* Calm vertical scan sweep — instrument reading its target. */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[rgba(61,220,145,0.10)] to-transparent scanline" aria-hidden />
      )}

      <ol className="flex flex-col gap-3 font-mono text-step-0">
        {PHASES.map((p, i) => {
          const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "pending";
          return (
            <li key={p.id} className="flex items-center gap-3">
              <span className={`relative flex h-2.5 w-2.5 shrink-0 rounded-full border ${
                state === "done" ? "border-[var(--done)] bg-[var(--done)]"
                : state === "active" ? "border-[var(--accent-bright)] bg-[var(--accent-bright)]"
                : "border-[var(--border)] bg-[var(--bg)]"
              }`}>
                {state === "active" && !reduced && (
                  <motion.span className="absolute inset-0 rounded-full"
                    animate={{ boxShadow: ["0 0 0 0 rgba(94,240,168,0.5)", "0 0 0 6px rgba(94,240,168,0)"] }}
                    transition={{ duration: 1.4, repeat: Infinity }} />
                )}
              </span>
              <span className={state === "pending" ? "text-[var(--muted)]" : "text-[var(--text)]"}>
                {p.label}
                {p.id === "extracting" && registersFound > 0 && (
                  <span className="ml-2 text-[var(--accent)]">{registersFound} found</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 font-mono text-step--1 text-[var(--muted)]">
        <span className="truncate">{status || "Working…"}</span>
        <span className="tabular-nums">{elapsed}s</span>
      </div>
    </div>
  );
}
