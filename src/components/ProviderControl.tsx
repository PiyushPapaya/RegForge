"use client";
import { useState } from "react";
import { PROVIDER_NAMES, type ProviderName } from "@/lib/llm/types";

const LABEL: Record<ProviderName, string> = { anthropic: "Anthropic", openai: "OpenAI (paid)", gemini: "Gemini (free)" };

export function ProviderControl({
  provider, apiKey, onProvider, onKey,
}: {
  provider: ProviderName; apiKey: string;
  onProvider: (p: ProviderName) => void; onKey: (k: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex items-center gap-2 font-mono text-xs">
      <select value={provider} onChange={(e) => onProvider(e.target.value as ProviderName)}
        className="panel px-2 py-1 text-[var(--text)]">
        {PROVIDER_NAMES.map((p) => <option key={p} value={p}>{LABEL[p]}</option>)}
      </select>
      <button className="panel px-2 py-1" onClick={() => setOpen(!open)} aria-label="API key settings">⚙</button>
      {open && (
        <div className="panel absolute right-0 top-8 z-10 w-72 p-3">
          <label className="mb-1 block text-[var(--muted)]">Your {LABEL[provider]} API key (optional)</label>
          <input type="password" value={apiKey} onChange={(e) => onKey(e.target.value)}
            placeholder="Leave blank to use server default"
            className="panel w-full px-2 py-1 text-[var(--text)]" />
          <p className="mt-2 text-[var(--muted)]">Never stored — sent only with your request.</p>
        </div>
      )}
    </div>
  );
}
