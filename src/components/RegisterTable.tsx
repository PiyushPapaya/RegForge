// src/components/RegisterTable.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { rowDelay } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/reducedMotion";
import { ChevronRightIcon } from "@/components/icons";
import type { RegisterMap, Register } from "@/lib/schema/registerMap";

const ACCESS = ["RW", "RO", "WO"] as const;

/** Inline cell that visibly reads as editable: dashed underline at rest, lit on hover/focus. */
function EditText({
  value, onChange, mono, className, ariaLabel,
}: {
  value: string; onChange: (v: string) => void;
  mono?: boolean; className?: string; ariaLabel: string;
}) {
  return (
    <input
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`focusable w-full min-w-0 rounded-sm border-b border-dashed border-transparent bg-transparent px-1 -mx-1 outline-none transition-colors hover:border-[var(--border-bright)] hover:bg-[var(--bg)] focus:border-[var(--focus)] focus:bg-[var(--bg)] ${
        mono ? "font-mono" : ""
      } ${className ?? ""}`}
    />
  );
}

export function RegisterTable({ map, onChange, onCite }: {
  map: RegisterMap; onChange: (m: RegisterMap) => void; onCite: (page: number) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [edited, setEdited] = useState<Set<number>>(new Set());
  const reduced = useReducedMotion();
  const total = map.registers.length;

  function editReg(i: number, patch: Partial<Register>) {
    setEdited((prev) => prev.has(i) ? prev : new Set(prev).add(i));
    onChange({ ...map, registers: map.registers.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  }

  function cells(r: Register, i: number) {
    const isOpen = open === i;
    const hasFields = r.fields.length > 0;
    const isEdited = edited.has(i);
    return (
      <>
        <td className="relative px-3 py-2">
          {isEdited && (
            <span
              className="absolute left-0 top-0 h-full w-0.5 rounded-r bg-[var(--accent)]"
              aria-hidden
            />
          )}
          <EditText
            ariaLabel={`Address for ${r.name}`} mono value={r.address}
            onChange={(v) => editReg(i, { address: v })}
            className="w-20 text-[var(--accent)]"
          />
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            {hasFields ? (
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`fields-${i}`}
                aria-label={`${isOpen ? "Hide" : "Show"} bitfields for ${r.name}`}
                className="focusable -ml-1 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-[var(--muted)] transition-colors hover:text-[var(--text)]"
              >
                <ChevronRightIcon className={`transition-transform ${isOpen ? "rotate-90" : ""}`} style={{ fontSize: "0.9rem" }} />
              </button>
            ) : (
              <span className="h-4 w-4 shrink-0" aria-hidden />
            )}
            <EditText
              ariaLabel={`Name for register at ${r.address}`} value={r.name}
              onChange={(v) => editReg(i, { name: v })}
            />
          </div>
          {isOpen && (
            <ul id={`fields-${i}`} className="ml-5 mt-1.5 space-y-1 font-mono text-step--1">
              {r.fields.map((f, j) => (
                <li key={j} className="flex items-baseline gap-2">
                  <span className="w-10 shrink-0 text-[var(--link)]">{f.bits}</span>
                  <span className="text-[var(--text)]">{f.name}</span>
                  <span className="text-[var(--muted)]">{f.access}</span>
                  {f.reset && <span className="text-[var(--muted)]">rst {f.reset}</span>}
                </li>
              ))}
            </ul>
          )}
        </td>
        <td className="px-3 py-2">
          <select
            aria-label={`Access for ${r.name}`}
            value={r.access}
            onChange={(e) => editReg(i, { access: e.target.value as Register["access"] })}
            className="focusable cursor-pointer rounded-sm border-b border-dashed border-transparent bg-transparent px-1 -mx-1 font-mono text-[var(--muted-strong)] outline-none transition-colors hover:border-[var(--border-bright)] hover:bg-[var(--bg)] focus:border-[var(--focus)] focus:bg-[var(--bg)]"
          >
            {ACCESS.map((a) => <option key={a} value={a} className="bg-[var(--panel)]">{a}</option>)}
          </select>
        </td>
        <td className="px-3 py-2">
          <EditText
            ariaLabel={`Reset value for ${r.name}`} mono value={r.reset_value}
            onChange={(v) => editReg(i, { reset_value: v })}
            className="w-16"
          />
        </td>
        <td className="px-3 py-2">
          <button className="focusable rounded font-mono text-[var(--link)] transition-colors hover:text-[var(--accent)]"
            aria-label={`View source page ${r.source.page} for ${r.name}`}
            onClick={() => onCite(r.source.page)}>p{r.source.page}</button>
        </td>
      </>
    );
  }

  return (
    <div className="panel-recessed overflow-auto">
      <table className="w-full border-collapse text-step-0">
        <caption className="sr-only">
          Extracted register map. Cells are editable — correct any value the model got wrong, then generate.
        </caption>
        <thead className="sticky top-0 z-10 bg-[var(--panel)]/95 backdrop-blur">
          <tr className="text-left font-mono text-step--1 text-[var(--muted)]">
            <th scope="col" className="px-3 py-2 font-normal">Addr</th>
            <th scope="col" className="px-3 py-2 font-normal">Name</th>
            <th scope="col" className="px-3 py-2 font-normal">Acc</th>
            <th scope="col" className="px-3 py-2 font-normal">Reset</th>
            <th scope="col" className="px-3 py-2 font-normal">Src</th>
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
