// src/components/Cockpit.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "@/components/icons";

export function Cockpit({ source, work, citePage }: {
  source: React.ReactNode; work: React.ReactNode; citePage?: number | null;
}) {
  // On mobile the source PDF is a drawer so it never buries the work pane.
  // null = follow the default (auto-open once a citation exists); a boolean is a user override.
  const [override, setOverride] = useState<boolean | null>(null);
  const showSource = override ?? !!citePage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:h-[calc(100dvh-5.5rem)] lg:grid-cols-[5fr_7fr]"
    >
      {/* Source — drawer on mobile (order 2), fixed left pane on desktop (order 1). */}
      <section className="order-2 min-w-0 lg:order-1 lg:h-full lg:min-h-0">
        <button
          onClick={() => setOverride(!showSource)}
          aria-expanded={showSource}
          aria-controls="source-pane"
          className="focusable panel-recessed mb-2 flex w-full cursor-pointer items-center justify-between px-3 py-2.5 font-mono text-step--1 text-[var(--muted-strong)] lg:hidden"
        >
          <span>{showSource ? "Hide datasheet source" : "View datasheet source"}</span>
          <ChevronRightIcon className={`transition-transform ${showSource ? "rotate-90" : ""}`} style={{ fontSize: "1rem" }} />
        </button>
        <div
          id="source-pane"
          className={`overflow-hidden transition-[height] duration-300 lg:h-full ${
            showSource ? "h-[55vh]" : "h-0"
          } lg:!h-full`}
        >
          {source}
        </div>
      </section>

      {/* Work — primary surface. First on mobile, right on desktop. */}
      <section className="order-1 h-[calc(100dvh-9.5rem)] min-w-0 lg:order-2 lg:h-full lg:min-h-0">
        {work}
      </section>
    </motion.div>
  );
}
