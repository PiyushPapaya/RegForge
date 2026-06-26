"use client";
import { useEffect, useState } from "react";
import type { RegisterMap } from "@/lib/schema/registerMap";

export function ExampleGallery({ onLoad }: { onLoad: (m: RegisterMap) => void }) {
  const [items, setItems] = useState<{ id: string; device_name: string; vendor: string }[]>([]);
  useEffect(() => { fetch("/api/examples").then((r) => r.json()).then((d) => setItems(d.examples ?? [])).catch(() => {}); }, []);
  async function load(id: string) {
    const d = await (await fetch(`/api/examples/${id}`)).json();
    if (d.map) onLoad(d.map);
  }
  if (items.length === 0) return null;
  return (
    <div className="mt-6">
      <p className="mb-2 text-sm text-neutral-400">Or try an example:</p>
      <div className="flex flex-wrap gap-3">
        {items.map((it) => (
          <button key={it.id} onClick={() => load(it.id)}
            className="rounded-lg border border-neutral-700 px-4 py-3 text-left hover:border-emerald-500">
            <div className="font-medium">{it.device_name}</div>
            <div className="text-xs text-neutral-500">{it.vendor}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
