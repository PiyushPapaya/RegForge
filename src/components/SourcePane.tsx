// src/components/SourcePane.tsx
"use client";

export function SourcePane({ pdfUrl, citePage, fileName }: {
  pdfUrl: string | null; citePage: number | null; fileName?: string;
}) {
  return (
    <div className="panel flex h-[72vh] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2 font-mono text-xs text-[var(--muted)]">
        <span>{fileName ? `source · ${fileName}` : "source"}</span>
        {citePage && <span className="text-[var(--link)]">page {citePage}</span>}
      </div>
      {pdfUrl ? (
        <iframe
          key={citePage ?? 0}
          className="h-full w-full bg-[var(--bg)]"
          src={citePage ? `${pdfUrl}#page=${citePage}` : pdfUrl}
          title="datasheet"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center font-mono text-xs text-[var(--muted)]">
          <span className="text-2xl">▦</span>
          <span>No PDF for this example.</span>
          <span>Citations reference the original datasheet pages.</span>
        </div>
      )}
    </div>
  );
}
