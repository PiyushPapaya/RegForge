// src/components/ProviderControl.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROVIDER_NAMES, type ProviderName } from "@/lib/llm/types";
import { SlidersIcon } from "@/components/icons";

const LABEL: Record<ProviderName, string> = { anthropic: "Anthropic", openai: "OpenAI (paid)", gemini: "Gemini (free)" };

export function ProviderControl({
  provider, apiKey, onProvider, onKey,
}: {
  provider: ProviderName; apiKey: string;
  onProvider: (p: ProviderName) => void; onKey: (k: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Move focus into the dialog on open; restore it to the trigger on close.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (document.activeElement && ref.current?.contains(document.activeElement)) triggerRef.current?.focus();
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center gap-2 font-mono text-step--1"
      onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); } }}>
      <div className="panel flex items-center gap-2 px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
        <label htmlFor="provider-select" className="sr-only">LLM provider</label>
        <select
          id="provider-select"
          value={provider}
          onChange={(e) => onProvider(e.target.value as ProviderName)}
          className="focusable cursor-pointer bg-transparent pr-1 text-[var(--text)] outline-none"
        >
          {PROVIDER_NAMES.map((p) => <option key={p} value={p} className="bg-[var(--panel)]">{LABEL[p]}</option>)}
        </select>
      </div>
      <button
        ref={triggerRef}
        className="focusable panel flex cursor-pointer items-center px-2 py-1.5 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="API key settings"
      ><SlidersIcon style={{ fontSize: "0.95rem" }} /></button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog" aria-modal="false" aria-label="API key settings"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="panel absolute right-0 top-11 z-20 w-72 p-3"
          >
            <label htmlFor="api-key-input" className="mb-1 block text-[var(--muted)]">Your {LABEL[provider]} API key (optional)</label>
            <input
              id="api-key-input" ref={inputRef}
              type="password" value={apiKey} onChange={(e) => onKey(e.target.value)}
              placeholder="Leave blank to use server default"
              className="focusable w-full rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-[var(--text)] outline-none"
            />
            <p className="mt-2 text-[var(--muted)]">Never stored — sent only with your request.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
