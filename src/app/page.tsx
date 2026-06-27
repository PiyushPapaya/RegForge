"use client";
import { useState } from "react";
import { StageRail } from "@/components/StageRail";
import { ProviderControl } from "@/components/ProviderControl";
import { Cockpit } from "@/components/Cockpit";
import { SourcePane } from "@/components/SourcePane";
import { RegisterTable } from "@/components/RegisterTable";
import { OutputTabs } from "@/components/OutputTabs";
import type { RegisterMap } from "@/lib/schema/registerMap";
import type { InitResult } from "@/lib/generate/initSequence";
import type { Stage } from "@/lib/stages";
import type { ProviderName } from "@/lib/llm/types";

type GenFile = { name: string; content: string };

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [map, setMap] = useState<RegisterMap | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<GenFile[]>([]);
  const [init, setInit] = useState<InitResult | null>(null);
  const [citePage, setCitePage] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [provider, setProvider] = useState<ProviderName>("gemini");
  const [apiKey, setApiKey] = useState("");

  async function handleFile(f: File) {
    setBusy(true); setError(""); setStage("extract"); setStatus(`Reading ${f.name}…`);
    setPdfUrl(URL.createObjectURL(f));
    const fd = new FormData();
    fd.append("pdf", f); fd.append("provider", provider); if (apiKey) fd.append("apiKey", apiKey);
    try {
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Extraction failed."); setStage("upload"); return; }
      setMap(data.map); setStage("verify");
    } catch { setError("Network error during extraction."); setStage("upload"); }
    finally { setBusy(false); }
  }

  function loadExample(m: RegisterMap) { setMap(m); setStage("verify"); setPdfUrl(null); }

  async function generate() {
    if (!map) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map, provider, apiKey: apiKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Generation failed."); return; }
      setFiles(data.files); setInit(data.init); setStage("generate");
    } catch { setError("Network error during generation."); }
    finally { setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <h1 className="font-mono text-xl font-semibold tracking-tight">RegForge</h1>
          <StageRail current={stage} substatus={busy ? status : undefined} />
        </div>
        <ProviderControl provider={provider} apiKey={apiKey} onProvider={setProvider} onKey={setApiKey} />
      </header>
      {error && <p className="mb-4 panel p-3 text-[var(--warn)]">{error}</p>}
      <Cockpit
        source={<SourcePane pdfUrl={pdfUrl} citePage={citePage} busy={busy} status={status} onFile={handleFile} onLoadExample={loadExample} />}
        work={
          map ? (
            stage === "generate" && files.length > 0
              ? <OutputTabs files={files} init={init} />
              : <div>
                  <RegisterTable map={map} onChange={setMap} onCite={setCitePage} />
                  <button className="mt-4 rounded bg-[var(--accent)] px-4 py-2 text-black disabled:opacity-50"
                    onClick={generate} disabled={busy}>Generate Driver →</button>
                </div>
          ) : <div className="text-[var(--muted)] text-sm">Drop a datasheet to begin.</div>
        }
      />
    </main>
  );
}
