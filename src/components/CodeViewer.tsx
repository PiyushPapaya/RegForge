"use client";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { prefersReducedMotion } from "@/components/motion";

export function CodeViewer({ name, content }: { name: string; content: string }) {
  const [html, setHtml] = useState<string>("");
  const assemble = prefersReducedMotion() ? "" : "assemble";
  useEffect(() => {
    let alive = true;
    const lang = name.endsWith(".c") ? "c" : name.endsWith(".h") ? "c" : "json";
    codeToHtml(content, { lang, theme: "github-dark" }).then((h) => { if (alive) setHtml(h); });
    return () => { alive = false; };
  }, [name, content]);

  function copy() { navigator.clipboard.writeText(content); }
  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    a.download = name; a.click();
  }
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="panel px-2 py-1 font-mono text-[var(--muted)]">{name}</span>
        <button className="panel px-2 py-1" onClick={copy}>Copy</button>
        <button className="panel px-2 py-1" onClick={download}>Download</button>
      </div>
      <div key={name} className={`overflow-auto rounded text-xs [&_pre]:!bg-[var(--panel)] [&_pre]:p-3 ${assemble}`}
        dangerouslySetInnerHTML={{ __html: html || `<pre>${content.replace(/</g, "&lt;")}</pre>` }} />
    </div>
  );
}
