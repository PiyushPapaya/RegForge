// src/app/page.tsx
"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import type { RegisterMap } from "@/lib/schema/registerMap";
import type { InitResult } from "@/lib/generate/initSequence";
import type { Stage } from "@/lib/stages";
import type { ProviderName } from "@/lib/llm/types";

type GenFile = { name: string; content: string };
export type ExtractPhase = "reading" | "extracting" | "validating" | null;

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [map, setMap] = useState<RegisterMap | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [extractPhase, setExtractPhase] = useState<ExtractPhase>(null);
  const [registersFound, setRegistersFound] = useState(0);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [files, setFiles] = useState<GenFile[]>([]);
  const [init, setInit] = useState<InitResult | null>(null);
  const [citePage, setCitePage] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [provider, setProvider] = useState<ProviderName>("gemini");
  const [apiKey, setApiKey] = useState("");

  async function handleFile(f: File) {
    setBusy(true); setError(""); setStage("extract"); setStatus(`Reading ${f.name}…`);
    setExtractPhase("reading"); setRegistersFound(0); setLastFile(f);
    setPdfUrl(URL.createObjectURL(f)); setFileName(f.name);
    const fd = new FormData();
    fd.append("pdf", f); fd.append("provider", provider); if (apiKey) fd.append("apiKey", apiKey);
    try {
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const ctype = res.headers.get("content-type") ?? "";
      // Early guardrail errors (bad file, key) come back as plain JSON, not a stream.
      if (!ctype.includes("text/event-stream")) {
        const data = await res.json().catch(() => ({ error: "Extraction failed." }));
        setError(data.error ?? "Extraction failed."); setStage("upload"); return;
      }
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let finished = false;
      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let sep: number;
        while ((sep = buf.indexOf("\n\n")) >= 0) {
          const frame = buf.slice(0, sep); buf = buf.slice(sep + 2);
          const line = frame.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.phase === "reading") setExtractPhase("reading");
          else if (evt.phase === "extracting") { setExtractPhase("extracting"); setRegistersFound(evt.registersFound ?? 0); }
          else if (evt.phase === "validating") setExtractPhase("validating");
          else if (evt.phase === "error") { setError(evt.error ?? "Extraction failed."); setStage("upload"); finished = true; }
          else if (evt.phase === "done") { setMap(evt.map); setStage("verify"); finished = true; }
        }
      }
    } catch { setError("Network error during extraction."); setStage("upload"); }
    finally { setBusy(false); setExtractPhase(null); }
  }

  function retryExtract() { if (lastFile) handleFile(lastFile); }

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
      extractPhase={extractPhase} registersFound={registersFound}
      files={files} init={init} citePage={citePage} pdfUrl={pdfUrl} fileName={fileName}
      provider={provider} apiKey={apiKey} onProvider={setProvider} onKey={setApiKey}
      onFile={handleFile} onLoadExample={loadExample} onRetry={retryExtract}
      onChange={setMap} onCite={setCitePage} onGenerate={generate}
    />
  );
}
