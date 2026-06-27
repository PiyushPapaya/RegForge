// src/components/SourcePane.tsx
"use client";
import { FileTextIcon } from "@/components/icons";

export function SourcePane({ pdfUrl, citePage, fileName }: {
  pdfUrl: string | null; citePage: number | null; fileName?: string;
}) {
  return (
    <div className="panel-recessed flex h-full min-h-[40vh] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2 font-mono text-step--1 text-[var(--muted)]">
        <span>{fileName ? `source · ${fileName}` : "source"}</span>
        {citePage && <span className="text-[var(--link)]">page {citePage}</span>}
      </div>
      {pdfUrl ? (
        <iframe
          // Key by the document only — changing the page is a fragment nav (scroll),
          // not a remount, so citations no longer reload/flash the whole PDF.
          key={pdfUrl}
          className="h-full w-full bg-[var(--bg)]"
          src={citePage ? `${pdfUrl}#page=${citePage}` : pdfUrl}
          title="datasheet source viewer"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2.5 px-6 text-center font-mono text-step--1 text-[var(--muted)]">
          <FileTextIcon className="text-[var(--muted)]" style={{ fontSize: "1.75rem" }} />
          <span className="text-[var(--muted-strong)]">No PDF for this example</span>
          <span>Citations still reference the original datasheet pages.</span>
        </div>
      )}
    </div>
  );
}
