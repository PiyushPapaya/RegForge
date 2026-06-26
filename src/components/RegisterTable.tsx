"use client";
import { useState } from "react";
import type { RegisterMap, Register } from "@/lib/schema/registerMap";

export function RegisterTable({ map, onChange, onCite }: {
  map: RegisterMap;
  onChange: (m: RegisterMap) => void;
  onCite: (page: number) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);

  function editReg(i: number, patch: Partial<Register>) {
    const registers = map.registers.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange({ ...map, registers });
  }

  return (
    <table className="w-full border-collapse font-mono text-xs">
      <thead>
        <tr className="text-left text-neutral-400">
          <th className="p-1">Addr</th><th className="p-1">Name</th>
          <th className="p-1">Acc</th><th className="p-1">Reset</th><th className="p-1">Src</th>
        </tr>
      </thead>
      <tbody>
        {map.registers.map((r, i) => (
          <tr key={i} className="border-t border-neutral-800 align-top">
            <td className="p-1">
              <input className="w-16 bg-transparent" value={r.address}
                onChange={(e) => editReg(i, { address: e.target.value })} />
            </td>
            <td className="p-1">
              <button className="text-emerald-400" onClick={() => setOpen(open === i ? null : i)}>{r.name}</button>
              {open === i && (
                <ul className="mt-1 text-neutral-400">
                  {r.fields.map((f, j) => <li key={j}>{f.bits}: {f.name}</li>)}
                </ul>
              )}
            </td>
            <td className="p-1">{r.access}</td>
            <td className="p-1">{r.reset_value}</td>
            <td className="p-1">
              <button className="text-sky-400" onClick={() => onCite(r.source.page)}>📄 p{r.source.page}</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
