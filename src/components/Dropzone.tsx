"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function Dropzone({ onFile, busy, status }: {
  onFile: (f: File) => void; busy: boolean; status: string;
}) {
  const onDrop = useCallback((files: File[]) => { if (files[0]) onFile(files[0]); }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, multiple: false, disabled: busy,
  });

  if (busy) {
    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4 font-mono text-sm text-emerald-400">
        {status || "Reading datasheet…"}
      </div>
    );
  }
  return (
    <div {...getRootProps()}
      className={`flex h-64 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed ${
        isDragActive ? "border-emerald-400 bg-neutral-900" : "border-neutral-700"
      }`}>
      <input {...getInputProps()} />
      <p className="text-neutral-400">Drop a sensor datasheet PDF, or click to browse</p>
    </div>
  );
}
