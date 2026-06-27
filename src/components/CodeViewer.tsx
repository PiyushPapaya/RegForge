// src/components/CodeViewer.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import type { ThemeRegistrationRaw } from "shiki";
import { buildZip } from "@/lib/zip";
import { useReducedMotion } from "@/lib/motion/reducedMotion";
import { loadGsap } from "@/lib/motion/gsap";

type GenFile = { name: string; content: string };

/** Syntax theme keyed to the RegForge palette so generated code looks like the product. */
const REGFORGE_THEME: ThemeRegistrationRaw = {
  name: "regforge",
  type: "dark",
  colors: { "editor.background": "#0e1014", "editor.foreground": "#e6edf3" },
  settings: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#8b97a3", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control"], settings: { foreground: "#3ddc91" } },
    { scope: ["meta.preprocessor", "keyword.control.directive", "punctuation.definition.directive"], settings: { foreground: "#5ef0a8" } },
    { scope: ["string", "string.quoted", "constant.character"], settings: { foreground: "#e0a85e" } },
    { scope: ["constant.numeric", "constant.language", "constant.other"], settings: { foreground: "#6c7cf0" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: "#5aa9e6" } },
    { scope: ["entity.name.type", "support.type", "storage.type.built-in"], settings: { foreground: "#5aa9e6" } },
    { scope: ["support.type.property-name", "meta.structure.dictionary.key", "string.json"], settings: { foreground: "#5aa9e6" } },
    { scope: ["variable", "meta.definition.variable", "entity.name"], settings: { foreground: "#e6edf3" } },
    { scope: ["punctuation", "meta.brace"], settings: { foreground: "#8b97a3" } },
  ],
};

export function CodeViewer({ files }: { files: GenFile[] }) {
  const [active, setActive] = useState(0);
  const [html, setHtml] = useState("");
  const reduced = useReducedMotion();
  const codeRef = useRef<HTMLDivElement>(null);
  const cache = useRef<Map<string, string>>(new Map());
  const animated = useRef<Set<string>>(new Set());
  const file = files[active];

  // A fresh generation replaces the files array — drop caches so new code re-highlights and re-animates once.
  useEffect(() => { cache.current.clear(); animated.current.clear(); }, [files]);

  useEffect(() => {
    if (!file) return;
    const key = file.name;
    const cached = cache.current.get(key);
    if (cached !== undefined) { setHtml(cached); return; }
    let alive = true;
    const lang = file.name.endsWith(".c") || file.name.endsWith(".h") ? "c" : "json";
    // Load shiki on demand — it stays out of the initial bundle until code is viewed.
    import("shiki").then(({ codeToHtml }) =>
      codeToHtml(file.content, { lang, theme: REGFORGE_THEME })
    ).then((h) => {
      if (!alive) return;
      cache.current.set(key, h);
      setHtml(h);
    });
    return () => { alive = false; };
  }, [file]);

  // Assemble each file's lines exactly once per generation — never again on tab re-visits.
  useEffect(() => {
    if (!html || reduced || !file || animated.current.has(file.name)) return;
    animated.current.add(file.name);
    let cancelled = false;
    loadGsap().then((gsap) => {
      if (!gsap || cancelled || !codeRef.current) return;
      const lines = codeRef.current.querySelectorAll("pre .line, pre code > span, pre span.line");
      const targets = lines.length ? lines : codeRef.current.querySelectorAll("pre");
      gsap.fromTo(targets, { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.01, ease: "power2.out", overwrite: true });
    });
    return () => { cancelled = true; };
  }, [html, reduced, file]);

  if (!file) return <div className="font-mono text-step-0 text-[var(--muted)]">Generated code will appear here.</div>;

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
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-step--1">
        {files.map((f, i) => (
          <button key={f.name} onClick={() => setActive(i)}
            aria-pressed={i === active}
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
        className="max-h-[60vh] overflow-auto rounded border border-[var(--border)] text-step--1 [&_pre]:!bg-[var(--panel)] [&_pre]:p-3"
        dangerouslySetInnerHTML={{ __html: html || `<pre>${file.content.replace(/</g, "&lt;")}</pre>` }}
      />
    </div>
  );
}
