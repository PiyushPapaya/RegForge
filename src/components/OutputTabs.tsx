"use client";
import { useState } from "react";
import { CodePanel } from "@/components/CodePanel";
import { PdfPreview } from "@/components/PdfPreview";
import { buildZip } from "@/lib/zip";
import type { InitResult } from "@/lib/generate/initSequence";

type GenFile = { name: string; content: string };

export function OutputTabs({ files, init, citePage, pdfUrl }: {
  files: GenFile[]; init: InitResult | null; citePage: number | null; pdfUrl: string | null;
}) {
  const tabs = ["Source", ...files.map((f) => f.name), "Init"];
  const [tab, setTab] = useState(0);

  async function downloadZip() {
    const bytes = await buildZip(files);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/zip" }));
    a.download = "regforge-driver.zip"; a.click();
  }

  if (files.length === 0) return <div className="text-neutral-500 text-sm">Generated code will appear here.</div>;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`rounded px-2 py-1 ${i === tab ? "bg-emerald-600" : "bg-neutral-800"}`}>{t}</button>
        ))}
        <button className="ml-auto rounded bg-sky-700 px-2 py-1" onClick={downloadZip}>Download .zip</button>
      </div>
      {tab === 0 && <PdfPreview url={pdfUrl} page={citePage} />}
      {tab >= 1 && tab <= files.length && (
        <CodePanel name={files[tab - 1].name} content={files[tab - 1].content} />
      )}
      {tab === tabs.length - 1 && init && (
        <ol className="space-y-2 text-sm">
          {init.degraded && <li className="text-amber-400">Init reasoning unavailable — showing raw hints.</li>}
          {init.steps.map((s) => (
            <li key={s.order} className="rounded bg-neutral-900 p-2">
              <span className="text-emerald-400">{s.order}.</span> {s.action}
              {s.detail && <span className="text-neutral-400"> — {s.detail}</span>}
              {s.source && <button className="ml-2 text-sky-400 text-xs">p{s.source.page}</button>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
