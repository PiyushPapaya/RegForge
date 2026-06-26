"use client";
export function CodePanel({ name, content }: { name: string; content: string }) {
  function copy() { navigator.clipboard.writeText(content); }
  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    a.download = name; a.click();
  }
  return (
    <div>
      <div className="mb-2 flex gap-2 text-xs">
        <button className="rounded bg-neutral-800 px-2 py-1" onClick={copy}>Copy</button>
        <button className="rounded bg-neutral-800 px-2 py-1" onClick={download}>Download</button>
      </div>
      <pre className="overflow-auto rounded bg-neutral-950 p-3 font-mono text-xs">{content}</pre>
    </div>
  );
}
