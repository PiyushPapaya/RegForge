"use client";
export function PdfPreview({ url, page }: { url: string | null; page: number | null }) {
  if (!url || !page) return <p className="text-neutral-500 text-sm">Click a 📄 citation to preview its page.</p>;
  return <iframe className="h-[480px] w-full rounded border border-neutral-800" src={`${url}#page=${page}`} />;
}
