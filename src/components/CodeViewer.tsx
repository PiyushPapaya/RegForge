// src/components/CodeViewer.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { codeToHtml } from "shiki";
import { buildZip } from "@/lib/zip";
import { useReducedMotion } from "@/lib/motion/reducedMotion";
import { loadGsap } from "@/lib/motion/gsap";

type GenFile = { name: string; content: string };

export function CodeViewer({ files }: { files: GenFile[] }) {
  const [active, setActive] = useState(0);
  const [html, setHtml] = useState("");
  const reduced = useReducedMotion();
  const codeRef = useRef<HTMLDivElement>(null);
  const file = files[active];

  useEffect(() => {
    if (!file) return;
    let alive = true;
    const lang = file.name.endsWith(".c") || file.name.endsWith(".h") ? "c" : "json";
    codeToHtml(file.content, { lang, theme: "github-dark" }).then((h) => { if (alive) setHtml(h); });
    return () => { alive = false; };
  }, [file]);

  useEffect(() => {
    if (!html || reduced) return;
    let cancelled = false;
    loadGsap().then((gsap) => {
      if (!gsap || cancelled || !codeRef.current) return;
      const lines = codeRef.current.querySelectorAll("pre .line, pre code > span, pre span.line");
      const targets = lines.length ? lines : codeRef.current.querySelectorAll("pre");
      gsap.fromTo(targets, { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.01, ease: "power2.out", overwrite: true });
    });
    return () => { cancelled = true; };
  }, [html, reduced]);

  if (!file) return <div className="font-mono text-sm text-[var(--muted)]">Generated code will appear here.</div>;

  function copy() { navigator.clipboard.writeText(file.content); }
  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([file.content], { type: "text/plain" }));
    a.download = file.name; a.click();
  }
  async function downloadZip() {
    const bytes = await buildZip(files);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/zip" }));
    a.download = "regforge-driver.zip"; a.click();
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
        {files.map((f, i) => (
          <button key={f.name} onClick={() => setActive(i)}
            className={`focusable rounded px-2 py-1 font-mono transition-colors ${
              i === active ? "bg-[var(--accent)] text-black" : "panel text-[var(--muted)] hover:text-[var(--text)]"}`}>
            {f.name}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          <button className="focusable panel px-2 py-1 hover:text-[var(--text)]" onClick={copy}>Copy</button>
          <button className="focusable panel px-2 py-1 hover:text-[var(--text)]" onClick={download}>Download</button>
          <button className="focusable rounded bg-[var(--link)] px-2 py-1 font-medium text-black" onClick={downloadZip}>Download .zip</button>
        </div>
      </div>
      <div
        ref={codeRef}
        key={file.name}
        className={`max-h-[60vh] overflow-auto rounded border border-[var(--border)] text-xs [&_pre]:!bg-[var(--panel)] [&_pre]:p-3 ${reduced ? "" : "assemble"}`}
        dangerouslySetInnerHTML={{ __html: html || `<pre>${file.content.replace(/</g, "&lt;")}</pre>` }}
      />
    </div>
  );
}
