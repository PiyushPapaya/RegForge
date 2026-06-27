// src/app/page.tsx
"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
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
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [provider, setProvider] = useState<ProviderName>("gemini");
  const [apiKey, setApiKey] = useState("");

  async function handleFile(f: File) {
    setBusy(true); setError(""); setStage("extract"); setStatus(`Reading ${f.name}…`);
    setPdfUrl(URL.createObjectURL(f)); setFileName(f.name);
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

  function loadExample(m: RegisterMap) {
    setMap(m); setStage("verify"); setPdfUrl(null); setFileName(undefined);
    setFiles([]); setInit(null);
  }

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
    <AppShell
      stage={stage} map={map} busy={busy} status={status} error={error}
      files={files} init={init} citePage={citePage} pdfUrl={pdfUrl} fileName={fileName}
      provider={provider} apiKey={apiKey} onProvider={setProvider} onKey={setApiKey}
      onFile={handleFile} onLoadExample={loadExample}
      onChange={setMap} onCite={setCitePage} onGenerate={generate}
    />
  );
}
