// src/components/DropTarget.tsx
"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, type HTMLMotionProps } from "framer-motion";
import { UploadIcon } from "@/components/icons";

export function DropTarget({ onFile, busy, status }: {
  onFile: (f: File) => void; busy: boolean; status: string;
}) {
  const onDrop = useCallback((files: File[]) => { if (files[0]) onFile(files[0]); }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, multiple: false, disabled: busy,
  });

  if (busy) {
    return (
      <div className="panel flex h-72 w-full max-w-xl items-center justify-center font-mono text-sm text-[var(--accent)]">
        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
        {status || "Reading datasheet…"}
      </div>
    );
  }

  return (
    <motion.div
      {...(getRootProps() as unknown as HTMLMotionProps<"div">)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`focusable group relative flex h-72 w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border text-center transition-colors ${
        isDragActive ? "border-[var(--accent)] bg-[rgba(61,220,145,0.06)]" : "border-[var(--border-bright)] bg-[var(--panel)]"
      }`}
    >
      <input {...getInputProps()} aria-label="Upload a datasheet PDF" />
      {/* traced gradient ring on idle, brighter on drag */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-60"
        style={{
          padding: 1,
          background: "linear-gradient(120deg, transparent, rgba(61,220,145,0.35), transparent)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor", maskComposite: "exclude",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ y: isDragActive ? -4 : 0 }}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-bright)] bg-[var(--bg)] text-[var(--accent)] transition-transform group-hover:-translate-y-1"
      ><UploadIcon style={{ fontSize: "1.25rem" }} /></motion.div>
      <div className="text-step-1 text-[var(--text)]">
        {isDragActive ? "Release to extract" : "Drop a datasheet PDF, or click to browse"}
      </div>
      <div className="font-mono text-xs text-[var(--muted)]">PDF · up to ~25MB</div>
    </motion.div>
  );
}
