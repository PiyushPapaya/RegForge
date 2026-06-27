"use client";
import { useState } from "react";
import { CodeViewer } from "@/components/CodeViewer";
import { buildZip } from "@/lib/zip";
import type { InitResult } from "@/lib/generate/initSequence";

type GenFile = { name: string; content: string };

export function OutputTabs({ files, init }: { files: GenFile[]; init: InitResult | null }) {
  const tabs = [...files.map((f) => f.name), "Init"];
  const [tab, setTab] = useState(0);
  async function downloadZip() {
    const bytes = await buildZip(files);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/zip" }));
    a.download = "regforge-driver.zip"; a.click();
  }
  if (files.length === 0) return <div className="text-[var(--muted)] text-sm">Generated code will appear here.</div>;
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`rounded px-2 py-1 ${i === tab ? "bg-[var(--accent)] text-black" : "panel"}`}>{t}</button>
        ))}
        <button className="ml-auto rounded bg-[var(--link)] px-2 py-1 text-black" onClick={downloadZip}>Download .zip</button>
      </div>
      {tab < files.length
        ? <CodeViewer name={files[tab].name} content={files[tab].content} />
        : init && (
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
