"use client";
import { useState } from "react";
import type { RegisterMap, Register } from "@/lib/schema/registerMap";

export function RegisterTable({ map, onChange, onCite }: {
  map: RegisterMap; onChange: (m: RegisterMap) => void; onCite: (page: number) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  function editReg(i: number, patch: Partial<Register>) {
    onChange({ ...map, registers: map.registers.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  }
  return (
    <div className="panel overflow-auto">
      <table className="w-full border-collapse font-mono text-xs">
        <thead className="sticky top-0 bg-[var(--panel)]">
          <tr className="text-left text-[var(--muted)]">
            <th className="p-2">Addr</th><th className="p-2">Name</th>
            <th className="p-2">Acc</th><th className="p-2">Reset</th><th className="p-2">Src</th>
          </tr>
        </thead>
        <tbody>
          {map.registers.map((r, i) => (
            <tr key={i} className="border-t border-[var(--border)] align-top">
              <td className="p-2">
                <input className="w-20 bg-transparent text-[var(--accent)] outline-none"
                  value={r.address} onChange={(e) => editReg(i, { address: e.target.value })} />
              </td>
              <td className="p-2">
                <button className="text-[var(--text)] hover:text-[var(--accent-bright)]"
                  onClick={() => setOpen(open === i ? null : i)}>{r.name}</button>
                {open === i && (
                  <ul className="mt-1 text-[var(--muted)]">
                    {r.fields.map((f, j) => <li key={j}>{f.bits}: {f.name}</li>)}
                  </ul>
                )}
              </td>
              <td className="p-2 text-[var(--muted)]">{r.access}</td>
              <td className="p-2">{r.reset_value}</td>
              <td className="p-2">
                <button className="text-[var(--link)]" onClick={() => onCite(r.source.page)}>📄 p{r.source.page}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
