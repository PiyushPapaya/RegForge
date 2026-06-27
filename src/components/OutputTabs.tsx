"use client";
import { useState } from "react";
import { CodeViewer } from "@/components/CodeViewer";
import type { InitResult } from "@/lib/generate/initSequence";

type GenFile = { name: string; content: string };

export function OutputTabs({ files, init }: { files: GenFile[]; init: InitResult | null }) {
  const [tab, setTab] = useState<"code" | "init">("code");
  if (files.length === 0) return <div className="text-[var(--muted)] text-sm">Generated code will appear here.</div>;
  return (
    <div>
      <div className="mb-3 flex gap-2 text-xs">
        <button onClick={() => setTab("code")}
          className={`rounded px-2 py-1 ${tab === "code" ? "bg-[var(--accent)] text-black" : "panel"}`}>Code</button>
        {init && (
          <button onClick={() => setTab("init")}
            className={`rounded px-2 py-1 ${tab === "init" ? "bg-[var(--accent)] text-black" : "panel"}`}>Init</button>
        )}
      </div>
      {tab === "code" && <CodeViewer files={files} />}
      {tab === "init" && init && (
        <ol className="space-y-2 text-sm">
          {init.degraded && <li className="text-[var(--warn)]">Init reasoning unavailable — showing raw hints.</li>}
          {init.steps.map((s) => (
            <li key={s.order} className="panel p-2">
              <span className="text-[var(--accent)]">{s.order}.</span> {s.action}
              {s.detail && <span className="text-[var(--muted)]"> — {s.detail}</span>}
              {s.source && <span className="ml-2 text-[var(--link)] text-xs">p{s.source.page}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
