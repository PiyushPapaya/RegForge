// src/components/RegisterTable.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { rowDelay } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/reducedMotion";
import type { RegisterMap, Register } from "@/lib/schema/registerMap";

export function RegisterTable({ map, onChange, onCite }: {
  map: RegisterMap; onChange: (m: RegisterMap) => void; onCite: (page: number) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const total = map.registers.length;
  function editReg(i: number, patch: Partial<Register>) {
    onChange({ ...map, registers: map.registers.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  }
  function cells(r: Register, i: number) {
    return (
      <>
        <td className="px-3 py-2">
          <input
            className="focusable w-20 rounded bg-transparent font-mono text-[var(--accent)] outline-none focus:bg-[var(--bg)]"
            value={r.address} onChange={(e) => editReg(i, { address: e.target.value })}
          />
        </td>
        <td className="px-3 py-2">
          <button className="text-left text-[var(--text)] transition-colors hover:text-[var(--accent-bright)]"
            onClick={() => setOpen(open === i ? null : i)}>{r.name}</button>
          {open === i && (
            <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-[var(--muted)]">
              {r.fields.map((f, j) => <li key={j}><span className="text-[var(--link)]">{f.bits}</span> {f.name}</li>)}
            </ul>
          )}
        </td>
        <td className="px-3 py-2 font-mono text-[var(--muted)]">{r.access}</td>
        <td className="px-3 py-2 font-mono">{r.reset_value}</td>
        <td className="px-3 py-2">
          <button className="font-mono text-[var(--link)] transition-colors hover:text-[var(--accent)]"
            onClick={() => onCite(r.source.page)}>p{r.source.page}</button>
        </td>
      </>
    );
  }
  return (
    <div className="panel overflow-auto">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-[var(--panel)]/95 backdrop-blur">
          <tr className="text-left font-mono text-[var(--muted)]">
            <th className="px-3 py-2 font-normal">Addr</th>
            <th className="px-3 py-2 font-normal">Name</th>
            <th className="px-3 py-2 font-normal">Acc</th>
            <th className="px-3 py-2 font-normal">Reset</th>
            <th className="px-3 py-2 font-normal">Src</th>
          </tr>
        </thead>
        <tbody>
          {map.registers.map((r, i) =>
            reduced ? (
              <tr key={i} className="border-t border-[var(--border)] align-top transition-colors hover:bg-[var(--panel-2)]">{cells(r, i)}</tr>
            ) : (
              <motion.tr key={i}
                className="border-t border-[var(--border)] align-top transition-colors hover:bg-[var(--panel-2)]"
                initial={{ opacity: 0, y: 6, boxShadow: "inset 2px 0 0 rgba(61,220,145,0.6)" }}
                animate={{ opacity: 1, y: 0, boxShadow: "inset 0 0 0 rgba(61,220,145,0)" }}
                transition={{ delay: rowDelay(i, total, false), duration: 0.25 }}>
                {cells(r, i)}
              </motion.tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
