// src/components/ExampleChips.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { RegisterMap } from "@/lib/schema/registerMap";

type Item = { id: string; device_name: string; vendor: string };

export function ExampleChips({ onLoad }: { onLoad: (m: RegisterMap) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    fetch("/api/examples").then((r) => r.json()).then((d) => setItems(d.examples ?? [])).catch(() => {});
  }, []);
  async function load(id: string) {
    const d = await (await fetch(`/api/examples/${id}`)).json();
    if (d.map) onLoad(d.map);
  }
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-xs text-[var(--muted)]">or try an example</p>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((it, i) => (
          <motion.button
            key={it.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -2 }}
            onClick={() => load(it.id)}
            className="focusable panel px-3 py-1.5 text-left transition-colors hover:border-[var(--accent)]"
          >
            <span className="font-mono text-xs text-[var(--text)]">{it.device_name}</span>
            <span className="ml-2 font-mono text-[10px] text-[var(--muted)]">{it.vendor}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
