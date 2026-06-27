"use client";
import { Dropzone } from "@/components/Dropzone";
import { ExampleGallery } from "@/components/ExampleGallery";
import type { RegisterMap } from "@/lib/schema/registerMap";

export function SourcePane({
  pdfUrl, citePage, busy, status, onFile, onLoadExample,
}: {
  pdfUrl: string | null; citePage: number | null; busy: boolean; status: string;
  onFile: (f: File) => void; onLoadExample: (m: RegisterMap) => void;
}) {
  if (pdfUrl) {
    const src = citePage ? `${pdfUrl}#page=${citePage}` : pdfUrl;
    return <iframe key={citePage ?? 0} className="panel h-[70vh] w-full" src={src} title="datasheet" />;
  }
  return (
    <div>
      <Dropzone onFile={onFile} busy={busy} status={status} />
      <ExampleGallery onLoad={onLoadExample} />
    </div>
  );
}
