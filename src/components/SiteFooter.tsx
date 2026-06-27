// src/components/SiteFooter.tsx
import { ShieldCheckIcon, GithubIcon } from "@/components/icons";

const REPO = "https://github.com/PiyushPapaya/RegForge";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-8 max-w-7xl px-6 py-6">
      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 text-step--1 text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2">
          <ShieldCheckIcon className="shrink-0 text-[var(--accent)]" style={{ fontSize: "1rem" }} />
          <span>BYOK API keys are never stored or logged — sent only with your own request.</span>
        </p>
        <div className="flex items-center gap-4 font-mono">
          <a href={REPO} target="_blank" rel="noopener noreferrer"
            className="focusable flex items-center gap-1.5 rounded text-[var(--muted)] transition-colors hover:text-[var(--text)]">
            <GithubIcon style={{ fontSize: "1rem" }} /> Source
          </a>
          <span aria-hidden className="text-[var(--border-bright)]">·</span>
          <span>Schema-validated · deterministic codegen</span>
        </div>
      </div>
    </footer>
  );
}
