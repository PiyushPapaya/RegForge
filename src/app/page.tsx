"use client";
import { useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { RegisterTable } from "@/components/RegisterTable";
import { OutputTabs } from "@/components/OutputTabs";
import { ExampleGallery } from "@/components/ExampleGallery";
import type { RegisterMap } from "@/lib/schema/registerMap";
import type { InitResult } from "@/lib/generate/initSequence";

type GenFile = { name: string; content: string };

export default function Home() {
  const [map, setMap] = useState<RegisterMap | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<GenFile[]>([]);
  const [init, setInit] = useState<InitResult | null>(null);
  const [citePage, setCitePage] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function handleFile(f: File) {
    setBusy(true); setError(""); setStatus(`Uploading ${f.name}…`);
    setPdfUrl(URL.createObjectURL(f));
    const fd = new FormData(); fd.append("pdf", f);
    try {
      setStatus("Reading datasheet and extracting registers…");
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Extraction failed."); return; }
      setMap(data.map);
    } catch { setError("Network error during extraction."); }
    finally { setBusy(false); }
  }

  async function generate() {
    if (!map) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Generation failed."); return; }
      setFiles(data.files); setInit(data.init);
    } catch { setError("Network error during generation."); }
    finally { setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">RegForge</h1>
      {error && <p className="mb-4 rounded bg-red-950 p-3 text-red-300">{error}</p>}
      {!map ? (
        <>
          <Dropzone onFile={handleFile} busy={busy} status={status} />
          <ExampleGallery onLoad={setMap} />
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RegisterTable map={map} onChange={setMap} onCite={(p) => setCitePage(p)} />
            <button className="mt-4 rounded bg-emerald-600 px-4 py-2 disabled:opacity-50"
              onClick={generate} disabled={busy}>Generate Driver →</button>
          </div>
          <OutputTabs files={files} init={init} citePage={citePage} pdfUrl={pdfUrl} />
        </div>
      )}
    </main>
  );
}
