// src/components/SiteHeader.tsx
"use client";
import Link from "next/link";
import { StageRail } from "@/components/StageRail";
import { ProviderControl } from "@/components/ProviderControl";
import type { Stage } from "@/lib/stages";
import type { ProviderName } from "@/lib/llm/types";
import type { ExtractPhase } from "@/app/page";

const PHASE_LABEL: Record<Exclude<ExtractPhase, null>, string> = {
  reading: "Reading datasheet…", extracting: "Extracting registers", validating: "Validating…",
};

export function SiteHeader({
  stage, substatus, inCockpit, busy, extractPhase, registersFound, provider, apiKey, onProvider, onKey,
}: {
  stage: Stage; substatus?: string; inCockpit: boolean;
  busy: boolean; extractPhase: ExtractPhase; registersFound: number;
  provider: ProviderName; apiKey: string;
  onProvider: (p: ProviderName) => void; onKey: (k: string) => void;
}) {
  const mobileStatus = busy && extractPhase
    ? extractPhase === "extracting" && registersFound > 0
      ? `Extracting registers · ${registersFound} found`
      : PHASE_LABEL[extractPhase]
    : null;

  return (
    <header
      className={`sticky top-0 z-30 px-6 py-3 transition-colors ${
        inCockpit ? "border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="focusable group flex items-center gap-2.5 rounded" aria-label="RegForge home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" width={22} height={22} className="rounded-[5px]" />
            <span className="font-mono text-step-1 font-semibold tracking-tight text-[var(--text)]">
              Reg<span className="text-[var(--accent)]">Forge</span>
            </span>
          </Link>
          <div className="hidden sm:block"><StageRail current={stage} substatus={substatus} /></div>
        </div>
        <ProviderControl provider={provider} apiKey={apiKey} onProvider={onProvider} onKey={onKey} />
      </div>
      {/* Mobile-only progress strip — the rail is hidden below sm, so phones would otherwise go dark. */}
      {mobileStatus && (
        <div className="mt-2 flex items-center gap-2 font-mono text-step--1 text-[var(--accent)] sm:hidden">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
          {mobileStatus}
        </div>
      )}
    </header>
  );
}
