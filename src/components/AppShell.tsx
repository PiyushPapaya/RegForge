// src/components/AppShell.tsx
"use client";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loadGsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reducedMotion";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { Cockpit } from "@/components/Cockpit";
import { SourcePane } from "@/components/SourcePane";
import { WorkPane } from "@/components/WorkPane";
import type { RegisterMap } from "@/lib/schema/registerMap";
import type { InitResult } from "@/lib/generate/initSequence";
import type { Stage } from "@/lib/stages";
import type { ProviderName } from "@/lib/llm/types";

type GenFile = { name: string; content: string };

export function AppShell(props: {
  stage: Stage; map: RegisterMap | null; busy: boolean; status: string; error: string;
  files: GenFile[]; init: InitResult | null; citePage: number | null; pdfUrl: string | null;
  fileName?: string; provider: ProviderName; apiKey: string;
  onProvider: (p: ProviderName) => void; onKey: (k: string) => void;
  onFile: (f: File) => void; onLoadExample: (m: RegisterMap) => void;
  onChange: (m: RegisterMap) => void; onCite: (page: number) => void; onGenerate: () => void;
}) {
  const inCockpit = props.map != null;
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let tween: { kill: () => void } | null = null;
    loadGsap().then((gsap) => {
      if (!gsap || !glowRef.current) return;
      tween = gsap.to(glowRef.current, {
        backgroundPosition: "60% 40%", scale: 1.06, opacity: 0.85,
        duration: 8, yoyo: true, repeat: -1, ease: "sine.inOut",
      });
    });
    return () => { tween?.kill(); };
  }, []);
  return (
    <main className="min-h-screen">
      <div className="glow" aria-hidden ref={glowRef} />
      <SiteHeader
        stage={props.stage} substatus={props.busy ? props.status : undefined} inCockpit={inCockpit}
        provider={props.provider} apiKey={props.apiKey} onProvider={props.onProvider} onKey={props.onKey}
      />
      {props.error && (
        <div className="mx-auto mt-3 max-w-3xl px-6">
          <p className="panel border-[var(--error)] px-3 py-2 text-sm text-[var(--error)]">{props.error}</p>
        </div>
      )}
      <AnimatePresence mode="wait">
        {!inCockpit ? (
          <motion.div key="hero"
            exit={{ opacity: 0, y: -24, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <Hero busy={props.busy} status={props.status} onFile={props.onFile} onLoadExample={props.onLoadExample} />
          </motion.div>
        ) : (
          <Cockpit key="cockpit"
            source={<SourcePane pdfUrl={props.pdfUrl} citePage={props.citePage} fileName={props.fileName} />}
            work={<WorkPane map={props.map!} files={props.files} init={props.init} busy={props.busy}
              onChange={props.onChange} onCite={props.onCite} onGenerate={props.onGenerate} />}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
