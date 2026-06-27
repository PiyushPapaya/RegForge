// src/components/SiteHeader.tsx
"use client";
import { StageRail } from "@/components/StageRail";
import { ProviderControl } from "@/components/ProviderControl";
import type { Stage } from "@/lib/stages";
import type { ProviderName } from "@/lib/llm/types";

export function SiteHeader({
  stage, substatus, inCockpit, provider, apiKey, onProvider, onKey,
}: {
  stage: Stage; substatus?: string; inCockpit: boolean;
  provider: ProviderName; apiKey: string;
  onProvider: (p: ProviderName) => void; onKey: (k: string) => void;
}) {
  return (
    <header
      className={`sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 px-6 py-3 transition-colors ${
        inCockpit ? "border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <div className="flex items-center gap-6">
        <span className="font-mono text-base font-semibold tracking-tight">
          Reg<span className="gradient-text">Forge</span>
        </span>
        <div className="hidden sm:block"><StageRail current={stage} substatus={substatus} /></div>
      </div>
      <ProviderControl provider={provider} apiKey={apiKey} onProvider={onProvider} onKey={onKey} />
    </header>
  );
}
