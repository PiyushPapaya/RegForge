// src/components/Hero.tsx
"use client";
import { motion } from "framer-motion";
import { DropTarget } from "@/components/DropTarget";
import { ExtractProgress } from "@/components/ExtractProgress";
import { ExampleChips } from "@/components/ExampleChips";
import { HeroPreview } from "@/components/HeroPreview";
import { ShieldCheckIcon } from "@/components/icons";
import { staggerContainer, riseIn } from "@/lib/motion/variants";
import type { RegisterMap } from "@/lib/schema/registerMap";
import type { ExtractPhase } from "@/app/page";

export function Hero({ busy, status, extractPhase, registersFound, onFile, onLoadExample }: {
  busy: boolean; status: string; extractPhase: ExtractPhase; registersFound: number;
  onFile: (f: File) => void; onLoadExample: (m: RegisterMap) => void;
}) {
  return (
    <motion.section
      variants={staggerContainer} initial="hidden" animate="show"
      className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 pt-[7vh] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-[10vh]"
    >
      {/* Left: pitch + action */}
      <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
        <motion.p variants={riseIn} className="font-mono text-step--1 uppercase tracking-[0.3em] text-[var(--muted)]">
          Datasheet → C Driver
        </motion.p>
        <motion.h1 variants={riseIn} className="max-w-2xl text-balance text-step-5 font-semibold tracking-tight">
          Turn a sensor datasheet into a <span className="text-[var(--accent)]">working C driver</span>.
        </motion.h1>
        <motion.p variants={riseIn} className="max-w-xl text-step-1 text-[var(--muted)]">
          Drop a PDF. RegForge extracts a verified register map, then generates the header, driver, and a cited init sequence.
        </motion.p>
        <motion.div variants={riseIn} className="w-full">
          <div className="flex justify-center lg:justify-start">
            {busy
              ? <ExtractProgress phase={extractPhase} registersFound={registersFound} status={status} />
              : <DropTarget onFile={onFile} busy={busy} status={status} />}
          </div>
        </motion.div>
        <motion.div variants={riseIn}><ExampleChips onLoad={onLoadExample} /></motion.div>
        <motion.div variants={riseIn} className="flex flex-wrap justify-center gap-x-6 gap-y-1 font-mono text-step--1 text-[var(--muted)] lg:justify-start">
          <span>4 layers generated</span><span aria-hidden>·</span><span>cited to the page</span><span aria-hidden>·</span><span>schema-validated</span>
        </motion.div>
        <motion.p variants={riseIn} className="flex max-w-md items-start gap-2 text-step--1 text-[var(--muted)]">
          <ShieldCheckIcon className="mt-0.5 shrink-0 text-[var(--accent)]" style={{ fontSize: "1rem" }} />
          <span>You verify the extracted register map before anything is generated. Code is built from
          deterministic templates — never hallucinated — and every line cites its datasheet page.</span>
        </motion.p>
      </div>

      {/* Right: the living artifact — proof, not promise. Hidden on small screens. */}
      <motion.div variants={riseIn} className="hidden lg:block">
        <HeroPreview />
      </motion.div>
    </motion.section>
  );
}
