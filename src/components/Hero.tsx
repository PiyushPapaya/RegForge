// src/components/Hero.tsx
"use client";
import { motion } from "framer-motion";
import { DropTarget } from "@/components/DropTarget";
import { ExampleChips } from "@/components/ExampleChips";
import { staggerContainer, riseIn } from "@/lib/motion/variants";
import type { RegisterMap } from "@/lib/schema/registerMap";

export function Hero({ busy, status, onFile, onLoadExample }: {
  busy: boolean; status: string;
  onFile: (f: File) => void; onLoadExample: (m: RegisterMap) => void;
}) {
  return (
    <motion.section
      variants={staggerContainer} initial="hidden" animate="show"
      className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-[8vh] text-center"
    >
      <motion.p variants={riseIn} className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        Datasheet → C Driver
      </motion.p>
      <motion.h1 variants={riseIn} className="max-w-2xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Turn a sensor datasheet into a <span className="gradient-text">working C driver</span>.
      </motion.h1>
      <motion.p variants={riseIn} className="max-w-xl text-[var(--muted)]">
        Drop a PDF. RegForge extracts a verified register map, then generates the header, driver, and a cited init sequence.
      </motion.p>
      <motion.div variants={riseIn} className="w-full">
        <div className="flex justify-center">
          <DropTarget onFile={onFile} busy={busy} status={status} />
        </div>
      </motion.div>
      <motion.div variants={riseIn}><ExampleChips onLoad={onLoadExample} /></motion.div>
      <motion.div variants={riseIn} className="flex flex-wrap justify-center gap-x-6 gap-y-1 font-mono text-xs text-[var(--muted)]">
        <span>4 layers generated</span><span>·</span><span>cited to the page</span><span>·</span><span>schema-validated</span>
      </motion.div>
    </motion.section>
  );
}
