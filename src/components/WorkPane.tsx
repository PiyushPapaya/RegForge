// src/components/WorkPane.tsx
"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RegisterTable } from "@/components/RegisterTable";
import { CodeViewer } from "@/components/CodeViewer";
import { InitTimeline } from "@/components/InitTimeline";
import type { RegisterMap } from "@/lib/schema/registerMap";
import type { InitResult } from "@/lib/generate/initSequence";

type GenFile = { name: string; content: string };
type Tab = "registers" | "code" | "init";

export function WorkPane({
  map, files, init, busy, onChange, onCite, onGenerate,
}: {
  map: RegisterMap; files: GenFile[]; init: InitResult | null; busy: boolean;
  onChange: (m: RegisterMap) => void; onCite: (page: number) => void; onGenerate: () => void;
}) {
  const generated = files.length > 0;
  const [tab, setTab] = useState<Tab>("registers");
  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "registers", label: "Registers" },
    { id: "code", label: "Code", disabled: !generated },
    { id: "init", label: "Init", disabled: !generated },
  ];

  return (
    <div className="panel flex h-[72vh] flex-col overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3 py-2">
        {tabs.map((t) => (
          <button key={t.id} disabled={t.disabled} onClick={() => setTab(t.id)}
            className={`focusable rounded px-2.5 py-1 font-mono text-xs transition-colors disabled:opacity-40 ${
              tab === t.id ? "bg-[var(--panel-2)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
            {t.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-[var(--muted)]">
          {map.device.name} · {map.registers.length} regs
        </span>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}>
            {tab === "registers" && <RegisterTable map={map} onChange={onChange} onCite={onCite} />}
            {tab === "code" && <CodeViewer files={files} />}
            {tab === "init" && <InitTimeline init={init} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {tab === "registers" && (
        <div className="border-t border-[var(--border)] p-3">
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={onGenerate} disabled={busy}
            className="focusable w-full rounded-lg px-4 py-2.5 font-medium text-black transition-shadow disabled:opacity-50"
            style={{
              background: "linear-gradient(90deg, var(--accent), var(--accent-bright))",
              boxShadow: "0 0 0 1px rgba(61,220,145,0.4), 0 8px 24px -10px rgba(61,220,145,0.5)",
            }}>
            {busy ? "Generating…" : generated ? "Re-generate Driver →" : "Generate Driver →"}
          </motion.button>
        </div>
      )}
    </div>
  );
}
