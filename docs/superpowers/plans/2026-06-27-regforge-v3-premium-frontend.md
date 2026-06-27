# RegForge v3 — Premium Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild RegForge's front end into a "modern dev-tool premium" single-screen experience — a hero that morphs into the two-pane cockpit, with tasteful framer-motion micro-motion and GSAP signature beats — without touching the backend.

**Architecture:** Front-end-only rebuild. `page.tsx` keeps its exact state machine + fetch handlers; only the rendered tree, styling, and motion change. New component tree under `src/components/`, a design-token layer in `globals.css`, and a `src/lib/motion/` layer (reduced-motion guard, lazy GSAP loader, shared variants). The proven backend seam (`api/*`, `lib/llm/*`, `lib/generate/*`, `lib/extract/*`, schema, `lib/stages.ts`) is **not** modified, so all 45 tests stay green.

**Tech Stack:** Next.js 16 (App Router, TS) · Tailwind v4 · framer-motion (installed) · **gsap** (to install, client-only/lazy) · shiki (installed) · Geist + Geist Mono (installed).

**Spec:** `docs/superpowers/specs/2026-06-27-regforge-v3-premium-frontend-design.md`
**Prereqs:** v2 merged to `master`, 45 tests pass. **Work on a branch** `feat/regforge-v3`.

**HARD boundary — do NOT modify:** `src/app/api/**`, `src/lib/llm/**`, `src/lib/generate/**`, `src/lib/extract/**`, `src/lib/schema/**`, `src/lib/stages.ts`. Heed `AGENTS.md` (Next.js 16 has breaking changes; consult `node_modules/next/dist/docs/` if a Next API surprises you).

---

## File Structure

```
src/app/globals.css        # MODIFY: v3 tokens, fading grid, glow, keyframes
src/app/layout.tsx         # MODIFY: metadata title; keep Geist fonts
src/app/page.tsx           # MODIFY: same state/handlers, render <AppShell/>

src/lib/motion/
  reducedMotion.ts         # prefersReducedMotion() + useReducedMotion() hook
  variants.ts              # shared framer-motion variants (stagger, riseIn, fade)
  gsap.ts                  # lazy client-only GSAP loader: loadGsap()

src/components/
  SiteHeader.tsx           # logo · StageRail · ProviderControl (persistent)
  StageRail.tsx            # REBUILD: filling-track progress instrument
  ProviderControl.tsx      # REBUILD: premium select + glass BYOK popover
  Hero.tsx                 # empty state: eyebrow/headline/subhead/stats
  DropTarget.tsx           # large dropzone (wraps react-dropzone)
  ExampleChips.tsx         # restyled ExampleGallery (chips)
  Cockpit.tsx              # two-pane working shell
  SourcePane.tsx           # REBUILD: PDF viewer + cited-page scroll
  WorkPane.tsx             # segmented Registers/Code/Init + Generate CTA
  RegisterTable.tsx        # REBUILD: premium table + stream-in beat
  CodeViewer.tsx           # REBUILD: shiki tabs + copy/dl + zip + assemble
  InitTimeline.tsx         # cited init sequence timeline
  AppShell.tsx             # hero↔cockpit morph (AnimatePresence) + header

REMOVE after rewire (superseded): src/components/OutputTabs.tsx, src/components/Dropzone.tsx
KEEP (reused): src/components/ExampleGallery.tsx logic folded into ExampleChips (then remove ExampleGallery.tsx)
tests/lib/motion/reducedMotion.test.ts, tests/lib/motion/variants.test.ts
```

**Reused backend/lib (import, never edit):** `@/lib/schema/registerMap` (`RegisterMap`, `Register`), `@/lib/generate/initSequence` (`InitResult`, `InitStep`), `@/lib/stages` (`STAGES`, `stageState`, `Stage`), `@/lib/llm/types` (`PROVIDER_NAMES`, `ProviderName`), `@/lib/zip` (`buildZip`).

---

## Phase 0 — Branch + deps

### Task 1: Branch and install gsap

**Files:** none (setup)

- [ ] **Step 1: Branch off master**

```bash
cd "C:/Users/anil1/Downloads/Driver"
git checkout master
git checkout -b feat/regforge-v3
```

- [ ] **Step 2: Install gsap**

```bash
npm install gsap
```

- [ ] **Step 3: Confirm baseline green**

Run: `npx vitest run`
Expected: 45 passed.
Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: branch + install gsap for v3 frontend"
```

---

## Phase 1 — Foundation (tokens + motion layer)

### Task 2: Design tokens, fading grid, glow, keyframes

**Files:**
- Modify: `src/app/globals.css` (replace entire file)
- Modify: `src/app/layout.tsx` (metadata only)

- [ ] **Step 1: Replace `src/app/globals.css`**

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  --bg: #08090b;
  --panel: #0e1014;
  --panel-2: #111418;
  --border: #20262e;
  --border-bright: #2c3742;
  --accent: #3ddc91;
  --accent-bright: #5ef0a8;
  --link: #5aa9e6;
  --indigo: #6c7cf0;
  --warn: #e0a85e;
  --error: #f0656c;
  --text: #e6edf3;
  --muted: #8b97a3;
  --radius: 8px;
}

html, body { height: 100%; }

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-sans), system-ui, sans-serif;
  /* Dotted field, brightest center, fading outward via radial mask. */
  background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 24px 24px;
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 32%, #000 35%, transparent 100%);
          mask-image: radial-gradient(ellipse 80% 60% at 50% 32%, #000 35%, transparent 100%);
}

/* Soft brand glow placed behind the hero. */
.glow {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(40% 35% at 50% 28%, rgba(61,220,145,0.16), transparent 70%),
    radial-gradient(45% 40% at 62% 40%, rgba(90,169,230,0.12), transparent 70%);
  filter: blur(8px);
}

.panel {
  background: linear-gradient(180deg, var(--panel-2), var(--panel));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 30px -18px rgba(0,0,0,0.8);
}

.gradient-text {
  background: linear-gradient(90deg, var(--accent), var(--link));
  -webkit-background-clip: text;
          background-clip: text;
  color: transparent;
}

.focusable:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Code-assemble fallback (used when GSAP/JS unavailable). */
@keyframes assemble { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.assemble { animation: assemble 220ms ease-out; }

@media (prefers-reduced-motion: reduce) {
  .assemble { animation: none; }
  .glow { filter: none; }
}
```

- [ ] **Step 2: Update `src/app/layout.tsx` metadata**

Change only the `metadata` object (keep the Geist font wiring and `<html>`/`<body>` exactly as they are):

```tsx
export const metadata: Metadata = {
  title: "RegForge — datasheet → C driver",
  description: "Turn a sensor datasheet PDF into a working, cited C driver.",
};
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: v3 design tokens, fading grid, brand glow, keyframes"
```

---

### Task 3: Motion layer (reduced-motion, variants, lazy GSAP)

**Files:**
- Create: `src/lib/motion/reducedMotion.ts`
- Create: `src/lib/motion/variants.ts`
- Create: `src/lib/motion/gsap.ts`
- Test: `tests/lib/motion/reducedMotion.test.ts`, `tests/lib/motion/variants.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/lib/motion/reducedMotion.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { prefersReducedMotion } from "@/lib/motion/reducedMotion";

afterEach(() => { vi.unstubAllGlobals(); });

describe("prefersReducedMotion", () => {
  it("returns false when matchMedia is unavailable (SSR)", () => {
    vi.stubGlobal("window", undefined);
    expect(prefersReducedMotion()).toBe(false);
  });
  it("reflects the media query match", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: true }) });
    expect(prefersReducedMotion()).toBe(true);
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) });
    expect(prefersReducedMotion()).toBe(false);
  });
});
```

```ts
// tests/lib/motion/variants.test.ts
import { describe, it, expect } from "vitest";
import { rowDelay } from "@/lib/motion/variants";

describe("rowDelay", () => {
  it("returns 0 for the first row", () => {
    expect(rowDelay(0, 30, false)).toBe(0);
  });
  it("is time-boxed: last row <= 1.2s for large maps", () => {
    expect(rowDelay(199, 200, false)).toBeLessThanOrEqual(1.2);
  });
  it("returns 0 for every row when reduced motion", () => {
    expect(rowDelay(10, 30, true)).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/motion`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/motion/reducedMotion.ts
"use client";
import { useEffect, useState } from "react";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches === true;
}

/** Reactive hook variant for components. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
```

```ts
// src/lib/motion/variants.ts
import type { Variants } from "framer-motion";

/** Container that staggers its children upward on mount. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** A single child rising into place. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

/** Per-row stream-in delay (seconds), time-boxed so large maps finish ~1.2s. */
export function rowDelay(index: number, total: number, reduced: boolean): number {
  if (reduced || total <= 0) return 0;
  const budget = 1.2;
  return Math.min(index * 0.04, (index / total) * budget);
}
```

```ts
// src/lib/motion/gsap.ts
"use client";
import type { gsap as GsapType } from "gsap";

let cached: typeof GsapType | null = null;

/** Lazily import GSAP on the client only. Returns null during SSR. */
export async function loadGsap(): Promise<typeof GsapType | null> {
  if (typeof window === "undefined") return null;
  if (cached) return cached;
  const mod = await import("gsap");
  cached = mod.gsap ?? mod.default;
  return cached;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib/motion`
Expected: PASS (5 tests).

- [ ] **Step 5: Verify build + commit**

Run: `npm run build` → success.

```bash
git add src/lib/motion tests/lib/motion
git commit -m "feat: motion layer (reduced-motion guard, variants, lazy gsap)"
```

---

## Phase 2 — Header (StageRail + ProviderControl)

### Task 4: StageRail (filling-track progress instrument)

**Files:**
- Modify: `src/components/StageRail.tsx` (replace entire file)

Reuses `@/lib/stages` (`STAGES`, `stageState`, `Stage`) — do not modify that file.

- [ ] **Step 1: Replace `src/components/StageRail.tsx`**

```tsx
// src/components/StageRail.tsx
"use client";
import { motion } from "framer-motion";
import { STAGES, stageState, type Stage } from "@/lib/stages";
import { useReducedMotion } from "@/lib/motion/reducedMotion";

const LABEL: Record<Stage, string> = { upload: "Upload", extract: "Extract", verify: "Verify", generate: "Generate" };

export function StageRail({ current, substatus }: { current: Stage; substatus?: string }) {
  const reduced = useReducedMotion();
  const idx = STAGES.indexOf(current);
  const fillPct = STAGES.length > 1 ? (idx / (STAGES.length - 1)) * 100 : 0;

  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <div className="relative flex items-center" style={{ width: 320 }}>
        {/* track */}
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[var(--border)]" />
        {/* fill */}
        <motion.div
          className="absolute left-0 top-1/2 h-px -translate-y-1/2"
          style={{ background: "linear-gradient(90deg, var(--accent), var(--link))" }}
          initial={false}
          animate={{ width: `${fillPct}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="relative flex w-full justify-between">
          {STAGES.map((s) => {
            const st = stageState(current, s);
            const dot =
              st === "done" ? "bg-[var(--accent)] border-[var(--accent)]"
              : st === "active" ? "bg-[var(--accent-bright)] border-[var(--accent-bright)]"
              : "bg-[var(--bg)] border-[var(--border)]";
            const txt =
              st === "pending" ? "text-[var(--muted)]" : "text-[var(--text)]";
            return (
              <div key={s} className="flex flex-col items-center gap-1">
                <span className={`relative h-2.5 w-2.5 rounded-full border ${dot}`}>
                  {st === "active" && !reduced && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: "0 0 0 0 var(--accent-bright)" }}
                      animate={{ boxShadow: ["0 0 0 0 rgba(94,240,168,0.5)", "0 0 0 6px rgba(94,240,168,0)"] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
                </span>
                <span className={`absolute mt-4 ${txt}`} style={{ transform: "translateY(2px)" }}>{LABEL[s]}</span>
              </div>
            );
          })}
        </div>
      </div>
      {substatus && <span className="ml-2 text-[var(--muted)]">{substatus}</span>}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build` → success. `npx vitest run` → 50 pass (45 + 5 motion).

- [ ] **Step 3: Commit**

```bash
git add src/components/StageRail.tsx
git commit -m "feat: stage rail as a filling-track progress instrument"
```

---

### Task 5: ProviderControl (premium select + glass BYOK popover)

**Files:**
- Modify: `src/components/ProviderControl.tsx` (replace entire file)

Reuses `@/lib/llm/types` (`PROVIDER_NAMES`, `ProviderName`).

- [ ] **Step 1: Replace `src/components/ProviderControl.tsx`**

```tsx
// src/components/ProviderControl.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROVIDER_NAMES, type ProviderName } from "@/lib/llm/types";

const LABEL: Record<ProviderName, string> = { anthropic: "Anthropic", openai: "OpenAI (paid)", gemini: "Gemini (free)" };

export function ProviderControl({
  provider, apiKey, onProvider, onKey,
}: {
  provider: ProviderName; apiKey: string;
  onProvider: (p: ProviderName) => void; onKey: (k: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center gap-2 font-mono text-xs">
      <div className="panel flex items-center gap-2 px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        <select
          value={provider}
          onChange={(e) => onProvider(e.target.value as ProviderName)}
          className="focusable cursor-pointer bg-transparent pr-1 text-[var(--text)] outline-none"
        >
          {PROVIDER_NAMES.map((p) => <option key={p} value={p} className="bg-[var(--panel)]">{LABEL[p]}</option>)}
        </select>
      </div>
      <button
        className="focusable panel px-2 py-1.5 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        onClick={() => setOpen((v) => !v)}
        aria-label="API key settings"
      >⚙</button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="panel absolute right-0 top-11 z-20 w-72 p-3"
          >
            <label className="mb-1 block text-[var(--muted)]">Your {LABEL[provider]} API key (optional)</label>
            <input
              type="password" value={apiKey} onChange={(e) => onKey(e.target.value)}
              placeholder="Leave blank to use server default"
              className="focusable w-full rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-[var(--text)] outline-none"
            />
            <p className="mt-2 text-[var(--muted)]">Never stored — sent only with your request.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/ProviderControl.tsx
git commit -m "feat: premium provider control with glass BYOK popover"
```

---

### Task 6: SiteHeader

**Files:**
- Create: `src/components/SiteHeader.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/SiteHeader.tsx
"use client";
import { StageRail } from "@/components/StageRail";
import { ProviderControl } from "@/components/ProviderControl";
import type { Stage } from "@/lib/stages";
import type { ProviderName } from "@/lib/llm/types";

export function SiteHeader({
  stage, substatus, inCockpit, provider, apiKey, onProvider, onKey,
}: {
  stage: Stage; substatus?: string; inCockpit: boolean;
  provider: ProviderName; apiKey: string;
  onProvider: (p: ProviderName) => void; onKey: (k: string) => void;
}) {
  return (
    <header
      className={`sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 px-6 py-3 transition-colors ${
        inCockpit ? "border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <div className="flex items-center gap-6">
        <span className="font-mono text-base font-semibold tracking-tight">
          Reg<span className="gradient-text">Forge</span>
        </span>
        <div className="hidden sm:block"><StageRail current={stage} substatus={substatus} /></div>
      </div>
      <ProviderControl provider={provider} apiKey={apiKey} onProvider={onProvider} onKey={onKey} />
    </header>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/SiteHeader.tsx
git commit -m "feat: persistent site header (logo, rail, provider)"
```

---

## Phase 3 — Hero (empty state)

### Task 7: DropTarget

**Files:**
- Create: `src/components/DropTarget.tsx`

Wraps `react-dropzone` (already a dependency, used by the old `Dropzone`).

- [ ] **Step 1: Implement**

```tsx
// src/components/DropTarget.tsx
"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

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
      {...getRootProps()}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`focusable group relative flex h-72 w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border text-center transition-colors ${
        isDragActive ? "border-[var(--accent)] bg-[rgba(61,220,145,0.06)]" : "border-[var(--border-bright)] bg-[var(--panel)]"
      }`}
    >
      <input {...getInputProps()} />
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
        animate={{ y: isDragActive ? -4 : 0 }}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-bright)] bg-[var(--bg)] text-xl text-[var(--accent)] transition-transform group-hover:-translate-y-1"
      >↑</motion.div>
      <div className="text-[var(--text)]">
        {isDragActive ? "Release to extract" : "Drop a datasheet PDF, or click to browse"}
      </div>
      <div className="font-mono text-xs text-[var(--muted)]">PDF · up to ~25MB</div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/DropTarget.tsx
git commit -m "feat: large inviting drop target with drag-ignite"
```

---

### Task 8: ExampleChips

**Files:**
- Create: `src/components/ExampleChips.tsx`

Folds in the old `ExampleGallery` fetch logic (`GET /api/examples`, `GET /api/examples/[id]`). The list item shape is `{ id, device_name, vendor }`.

- [ ] **Step 1: Implement**

```tsx
// src/components/ExampleChips.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { RegisterMap } from "@/lib/schema/registerMap";

type Item = { id: string; device_name: string; vendor: string };

export function ExampleChips({ onLoad }: { onLoad: (m: RegisterMap) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    fetch("/api/examples").then((r) => r.json()).then((d) => setItems(d.examples ?? [])).catch(() => {});
  }, []);
  async function load(id: string) {
    const d = await (await fetch(`/api/examples/${id}`)).json();
    if (d.map) onLoad(d.map);
  }
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-xs text-[var(--muted)]">or try an example</p>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((it, i) => (
          <motion.button
            key={it.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -2 }}
            onClick={() => load(it.id)}
            className="focusable panel px-3 py-1.5 text-left transition-colors hover:border-[var(--accent)]"
          >
            <span className="font-mono text-xs text-[var(--text)]">{it.device_name}</span>
            <span className="ml-2 font-mono text-[10px] text-[var(--muted)]">{it.vendor}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/ExampleChips.tsx
git commit -m "feat: example chips (folds in gallery fetch logic)"
```

---

### Task 9: Hero

**Files:**
- Create: `src/components/Hero.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/Hero.tsx
"use client";
import { motion } from "framer-motion";
import { DropTarget } from "@/components/DropTarget";
import { ExampleChips } from "@/components/ExampleChips";
import { staggerContainer, riseIn } from "@/lib/motion/variants";
import type { RegisterMap } from "@/lib/schema/registerMap";

export function Hero({ busy, status, onFile, onLoadExample }: {
  busy: boolean; status: string;
  onFile: (f: File) => void; onLoadExample: (m: RegisterMap) => void;
}) {
  return (
    <motion.section
      variants={staggerContainer} initial="hidden" animate="show"
      className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-[8vh] text-center"
    >
      <motion.p variants={riseIn} className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        Datasheet → C Driver
      </motion.p>
      <motion.h1 variants={riseIn} className="max-w-2xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Turn a sensor datasheet into a <span className="gradient-text">working C driver</span>.
      </motion.h1>
      <motion.p variants={riseIn} className="max-w-xl text-[var(--muted)]">
        Drop a PDF. RegForge extracts a verified register map, then generates the header, driver, and a cited init sequence.
      </motion.p>
      <motion.div variants={riseIn} className="w-full">
        <div className="flex justify-center">
          <DropTarget onFile={onFile} busy={busy} status={status} />
        </div>
      </motion.div>
      <motion.div variants={riseIn}><ExampleChips onLoad={onLoadExample} /></motion.div>
      <motion.div variants={riseIn} className="flex flex-wrap justify-center gap-x-6 gap-y-1 font-mono text-xs text-[var(--muted)]">
        <span>4 layers generated</span><span>·</span><span>cited to the page</span><span>·</span><span>schema-validated</span>
      </motion.div>
    </motion.section>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/Hero.tsx
git commit -m "feat: hero empty state (headline, drop target, chips, stats)"
```

---

## Phase 4 — Cockpit (working state)

### Task 10: SourcePane

**Files:**
- Modify: `src/components/SourcePane.tsx` (replace entire file)

- [ ] **Step 1: Replace `src/components/SourcePane.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/SourcePane.tsx
git commit -m "feat: premium source pane with labeled header"
```

---

### Task 11: RegisterTable (premium + stream-in)

**Files:**
- Modify: `src/components/RegisterTable.tsx` (replace entire file)

Reuses `RegisterMap`, `Register` types and `rowDelay`/`useReducedMotion`.

- [ ] **Step 1: Replace `src/components/RegisterTable.tsx`**

```tsx
// src/components/RegisterTable.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { rowDelay } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/reducedMotion";
import type { RegisterMap, Register } from "@/lib/schema/registerMap";

export function RegisterTable({ map, onChange, onCite }: {
  map: RegisterMap; onChange: (m: RegisterMap) => void; onCite: (page: number) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const total = map.registers.length;
  function editReg(i: number, patch: Partial<Register>) {
    onChange({ ...map, registers: map.registers.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  }
  function cells(r: Register, i: number) {
    return (
      <>
        <td className="px-3 py-2">
          <input
            className="focusable w-20 rounded bg-transparent font-mono text-[var(--accent)] outline-none focus:bg-[var(--bg)]"
            value={r.address} onChange={(e) => editReg(i, { address: e.target.value })}
          />
        </td>
        <td className="px-3 py-2">
          <button className="text-left text-[var(--text)] transition-colors hover:text-[var(--accent-bright)]"
            onClick={() => setOpen(open === i ? null : i)}>{r.name}</button>
          {open === i && (
            <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-[var(--muted)]">
              {r.fields.map((f, j) => <li key={j}><span className="text-[var(--link)]">{f.bits}</span> {f.name}</li>)}
            </ul>
          )}
        </td>
        <td className="px-3 py-2 font-mono text-[var(--muted)]">{r.access}</td>
        <td className="px-3 py-2 font-mono">{r.reset_value}</td>
        <td className="px-3 py-2">
          <button className="font-mono text-[var(--link)] transition-colors hover:text-[var(--accent)]"
            onClick={() => onCite(r.source.page)}>p{r.source.page}</button>
        </td>
      </>
    );
  }
  return (
    <div className="panel overflow-auto">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-[var(--panel)]/95 backdrop-blur">
          <tr className="text-left font-mono text-[var(--muted)]">
            <th className="px-3 py-2 font-normal">Addr</th>
            <th className="px-3 py-2 font-normal">Name</th>
            <th className="px-3 py-2 font-normal">Acc</th>
            <th className="px-3 py-2 font-normal">Reset</th>
            <th className="px-3 py-2 font-normal">Src</th>
          </tr>
        </thead>
        <tbody>
          {map.registers.map((r, i) =>
            reduced ? (
              <tr key={i} className="border-t border-[var(--border)] align-top transition-colors hover:bg-[var(--panel-2)]">{cells(r, i)}</tr>
            ) : (
              <motion.tr key={i}
                className="border-t border-[var(--border)] align-top transition-colors hover:bg-[var(--panel-2)]"
                initial={{ opacity: 0, y: 6, boxShadow: "inset 2px 0 0 rgba(61,220,145,0.6)" }}
                animate={{ opacity: 1, y: 0, boxShadow: "inset 0 0 0 rgba(61,220,145,0)" }}
                transition={{ delay: rowDelay(i, total, false), duration: 0.25 }}>
                {cells(r, i)}
              </motion.tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success. `npx vitest run` → 50 pass.

```bash
git add src/components/RegisterTable.tsx
git commit -m "feat: premium register table with stream-in beat"
```

---

### Task 12: CodeViewer (shiki tabs + copy/dl + zip + assemble)

**Files:**
- Modify: `src/components/CodeViewer.tsx` (replace entire file)

This component now owns the file tabs + zip download (folding in OutputTabs' file responsibilities). Reuses `@/lib/zip` (`buildZip`).

- [ ] **Step 1: Replace `src/components/CodeViewer.tsx`**

```tsx
// src/components/CodeViewer.tsx
"use client";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { buildZip } from "@/lib/zip";
import { useReducedMotion } from "@/lib/motion/reducedMotion";

type GenFile = { name: string; content: string };

export function CodeViewer({ files }: { files: GenFile[] }) {
  const [active, setActive] = useState(0);
  const [html, setHtml] = useState("");
  const reduced = useReducedMotion();
  const file = files[active];

  useEffect(() => {
    if (!file) return;
    let alive = true;
    const lang = file.name.endsWith(".c") || file.name.endsWith(".h") ? "c" : "json";
    codeToHtml(file.content, { lang, theme: "github-dark" }).then((h) => { if (alive) setHtml(h); });
    return () => { alive = false; };
  }, [file]);

  if (!file) return <div className="font-mono text-sm text-[var(--muted)]">Generated code will appear here.</div>;

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
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
        {files.map((f, i) => (
          <button key={f.name} onClick={() => setActive(i)}
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
        key={file.name}
        className={`max-h-[60vh] overflow-auto rounded border border-[var(--border)] text-xs [&_pre]:!bg-[var(--panel)] [&_pre]:p-3 ${reduced ? "" : "assemble"}`}
        dangerouslySetInnerHTML={{ __html: html || `<pre>${file.content.replace(/</g, "&lt;")}</pre>` }}
      />
    </div>
  );
}
```

Note: shiki escapes the code it highlights and the fallback `<pre>` escapes `<` — content is our own server-generated C/JSON, never untrusted free text.

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/CodeViewer.tsx
git commit -m "feat: code viewer with file tabs, copy/download, zip, assemble"
```

---

### Task 13: InitTimeline

**Files:**
- Create: `src/components/InitTimeline.tsx`

Reuses `InitResult` from `@/lib/generate/initSequence`.

- [ ] **Step 1: Implement**

```tsx
// src/components/InitTimeline.tsx
"use client";
import { motion } from "framer-motion";
import type { InitResult } from "@/lib/generate/initSequence";

export function InitTimeline({ init }: { init: InitResult | null }) {
  if (!init) return <div className="font-mono text-sm text-[var(--muted)]">Init sequence will appear here.</div>;
  return (
    <div>
      {init.degraded && (
        <p className="mb-3 rounded border border-[var(--warn)] bg-[rgba(224,168,94,0.08)] px-3 py-2 text-xs text-[var(--warn)]">
          Init reasoning unavailable — showing raw hints from the datasheet.
        </p>
      )}
      <ol className="relative ml-3 space-y-3 border-l border-[var(--border)] pl-5">
        {init.steps.map((s, i) => (
          <motion.li key={s.order}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="relative">
            <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--bg)] font-mono text-[10px] text-[var(--accent)]">
              {s.order}
            </span>
            <div className="text-sm text-[var(--text)]">{s.action}</div>
            {s.detail && <div className="mt-0.5 text-xs text-[var(--muted)]">{s.detail}</div>}
            {s.source && <span className="mt-1 inline-block font-mono text-[11px] text-[var(--link)]">p{s.source.page}</span>}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/InitTimeline.tsx
git commit -m "feat: cited init sequence timeline"
```

---

### Task 14: WorkPane (segmented Registers/Code/Init + Generate CTA)

**Files:**
- Create: `src/components/WorkPane.tsx`

Reuses `RegisterMap`, `InitResult`. `GenFile = { name: string; content: string }`.

- [ ] **Step 1: Implement**

```tsx
// src/components/WorkPane.tsx
"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RegisterTable } from "@/components/RegisterTable";
import { CodeViewer } from "@/components/CodeViewer";
import { InitTimeline } from "@/components/InitTimeline";
import type { RegisterMap } from "@/lib/schema/registerMap";
import type { InitResult } from "@/lib/generate/initSequence";

type GenFile = { name: string; content: string };
type Tab = "registers" | "code" | "init";

export function WorkPane({
  map, files, init, busy, onChange, onCite, onGenerate,
}: {
  map: RegisterMap; files: GenFile[]; init: InitResult | null; busy: boolean;
  onChange: (m: RegisterMap) => void; onCite: (page: number) => void; onGenerate: () => void;
}) {
  const generated = files.length > 0;
  const [tab, setTab] = useState<Tab>("registers");
  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "registers", label: "Registers" },
    { id: "code", label: "Code", disabled: !generated },
    { id: "init", label: "Init", disabled: !generated },
  ];

  return (
    <div className="panel flex h-[72vh] flex-col overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3 py-2">
        {tabs.map((t) => (
          <button key={t.id} disabled={t.disabled} onClick={() => setTab(t.id)}
            className={`focusable rounded px-2.5 py-1 font-mono text-xs transition-colors disabled:opacity-40 ${
              tab === t.id ? "bg-[var(--panel-2)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
            {t.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-[var(--muted)]">
          {map.device.name} · {map.registers.length} regs
        </span>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}>
            {tab === "registers" && <RegisterTable map={map} onChange={onChange} onCite={onCite} />}
            {tab === "code" && <CodeViewer files={files} />}
            {tab === "init" && <InitTimeline init={init} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {tab === "registers" && (
        <div className="border-t border-[var(--border)] p-3">
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={onGenerate} disabled={busy}
            className="focusable w-full rounded-lg px-4 py-2.5 font-medium text-black transition-shadow disabled:opacity-50"
            style={{
              background: "linear-gradient(90deg, var(--accent), var(--accent-bright))",
              boxShadow: "0 0 0 1px rgba(61,220,145,0.4), 0 8px 24px -10px rgba(61,220,145,0.5)",
            }}>
            {busy ? "Generating…" : generated ? "Re-generate Driver →" : "Generate Driver →"}
          </motion.button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/WorkPane.tsx
git commit -m "feat: work pane (segmented registers/code/init + generate CTA)"
```

---

### Task 15: Cockpit (two-pane shell)

**Files:**
- Modify: `src/components/Cockpit.tsx` (replace entire file)

- [ ] **Step 1: Replace `src/components/Cockpit.tsx`**

```tsx
// src/components/Cockpit.tsx
"use client";
import { motion } from "framer-motion";

export function Cockpit({ source, work }: { source: React.ReactNode; work: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 py-4 lg:grid-cols-2"
    >
      <section className="min-w-0">{source}</section>
      <section className="min-w-0">{work}</section>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/Cockpit.tsx
git commit -m "feat: two-pane cockpit shell with entrance"
```

---

## Phase 5 — Shell + page rewire

### Task 16: AppShell (hero↔cockpit morph)

**Files:**
- Create: `src/components/AppShell.tsx`

Reuses `RegisterMap`, `InitResult`, `Stage`, `ProviderName`. `GenFile = { name: string; content: string }`.

- [ ] **Step 1: Implement**

```tsx
// src/components/AppShell.tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { Cockpit } from "@/components/Cockpit";
import { SourcePane } from "@/components/SourcePane";
import { WorkPane } from "@/components/WorkPane";
import type { RegisterMap } from "@/lib/schema/registerMap";
import type { InitResult } from "@/lib/generate/initSequence";
import type { Stage } from "@/lib/stages";
import type { ProviderName } from "@/lib/llm/types";

type GenFile = { name: string; content: string };

export function AppShell(props: {
  stage: Stage; map: RegisterMap | null; busy: boolean; status: string; error: string;
  files: GenFile[]; init: InitResult | null; citePage: number | null; pdfUrl: string | null;
  fileName?: string; provider: ProviderName; apiKey: string;
  onProvider: (p: ProviderName) => void; onKey: (k: string) => void;
  onFile: (f: File) => void; onLoadExample: (m: RegisterMap) => void;
  onChange: (m: RegisterMap) => void; onCite: (page: number) => void; onGenerate: () => void;
}) {
  const inCockpit = props.map != null;
  return (
    <main className="min-h-screen">
      <div className="glow" aria-hidden />
      <SiteHeader
        stage={props.stage} substatus={props.busy ? props.status : undefined} inCockpit={inCockpit}
        provider={props.provider} apiKey={props.apiKey} onProvider={props.onProvider} onKey={props.onKey}
      />
      {props.error && (
        <div className="mx-auto mt-3 max-w-3xl px-6">
          <p className="panel border-[var(--error)] px-3 py-2 text-sm text-[var(--error)]">{props.error}</p>
        </div>
      )}
      <AnimatePresence mode="wait">
        {!inCockpit ? (
          <motion.div key="hero"
            exit={{ opacity: 0, y: -24, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <Hero busy={props.busy} status={props.status} onFile={props.onFile} onLoadExample={props.onLoadExample} />
          </motion.div>
        ) : (
          <Cockpit key="cockpit"
            source={<SourcePane pdfUrl={props.pdfUrl} citePage={props.citePage} fileName={props.fileName} />}
            work={<WorkPane map={props.map!} files={props.files} init={props.init} busy={props.busy}
              onChange={props.onChange} onCite={props.onCite} onGenerate={props.onGenerate} />}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build` → success.

```bash
git add src/components/AppShell.tsx
git commit -m "feat: app shell with hero->cockpit morph"
```

---

### Task 17: Rewire page.tsx + remove superseded files

**Files:**
- Modify: `src/app/page.tsx` (replace entire file)
- Delete: `src/components/OutputTabs.tsx`, `src/components/Dropzone.tsx`, `src/components/ExampleGallery.tsx`

The state machine and fetch handlers are functionally identical to the current `page.tsx`; only rendering changes. Adds `fileName` tracking for the SourcePane header.

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
// src/app/page.tsx
"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import type { RegisterMap } from "@/lib/schema/registerMap";
import type { InitResult } from "@/lib/generate/initSequence";
import type { Stage } from "@/lib/stages";
import type { ProviderName } from "@/lib/llm/types";

type GenFile = { name: string; content: string };

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [map, setMap] = useState<RegisterMap | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<GenFile[]>([]);
  const [init, setInit] = useState<InitResult | null>(null);
  const [citePage, setCitePage] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [provider, setProvider] = useState<ProviderName>("gemini");
  const [apiKey, setApiKey] = useState("");

  async function handleFile(f: File) {
    setBusy(true); setError(""); setStage("extract"); setStatus(`Reading ${f.name}…`);
    setPdfUrl(URL.createObjectURL(f)); setFileName(f.name);
    const fd = new FormData();
    fd.append("pdf", f); fd.append("provider", provider); if (apiKey) fd.append("apiKey", apiKey);
    try {
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Extraction failed."); setStage("upload"); return; }
      setMap(data.map); setStage("verify");
    } catch { setError("Network error during extraction."); setStage("upload"); }
    finally { setBusy(false); }
  }

  function loadExample(m: RegisterMap) {
    setMap(m); setStage("verify"); setPdfUrl(null); setFileName(undefined);
    setFiles([]); setInit(null);
  }

  async function generate() {
    if (!map) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map, provider, apiKey: apiKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Generation failed."); return; }
      setFiles(data.files); setInit(data.init); setStage("generate");
    } catch { setError("Network error during generation."); }
    finally { setBusy(false); }
  }

  return (
    <AppShell
      stage={stage} map={map} busy={busy} status={status} error={error}
      files={files} init={init} citePage={citePage} pdfUrl={pdfUrl} fileName={fileName}
      provider={provider} apiKey={apiKey} onProvider={setProvider} onKey={setApiKey}
      onFile={handleFile} onLoadExample={loadExample}
      onChange={setMap} onCite={setCitePage} onGenerate={generate}
    />
  );
}
```

- [ ] **Step 2: Delete superseded files**

```bash
git rm src/components/OutputTabs.tsx src/components/Dropzone.tsx src/components/ExampleGallery.tsx
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` → clean. If anything still imports the deleted files, fix it (nothing should).
Run: `npx vitest run` → 50 pass.
Run: `npm run lint` → 0 errors.
Run: `npm run build` → success.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rewire page to AppShell; remove superseded components"
```

---

## Phase 6 — GSAP signature beats

### Task 18: Code-assemble beat (GSAP) + ambient glow drift

**Files:**
- Modify: `src/components/CodeViewer.tsx` (enhance assemble with GSAP)
- Modify: `src/components/AppShell.tsx` (glow drift)

- [ ] **Step 1: Enhance CodeViewer assemble with GSAP**

In `src/components/CodeViewer.tsx`, after the existing `useEffect` that sets `html`, add a second effect that, once `html` is set and not reduced-motion, runs a GSAP timeline over the rendered code lines (a scanline-style staggered reveal). Add this import at the top:

```tsx
import { useRef } from "react";
import { loadGsap } from "@/lib/motion/gsap";
```

Add a ref on the code container and the effect. Replace the code container `<div ... dangerouslySetInnerHTML />` with a ref'd version:

```tsx
  const codeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!html || reduced) return;
    let cancelled = false;
    loadGsap().then((gsap) => {
      if (!gsap || cancelled || !codeRef.current) return;
      const lines = codeRef.current.querySelectorAll("pre .line, pre code > span, pre span.line");
      const targets = lines.length ? lines : codeRef.current.querySelectorAll("pre");
      gsap.fromTo(targets, { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.01, ease: "power2.out", overwrite: true });
    });
    return () => { cancelled = true; };
  }, [html, reduced]);
```

```tsx
      <div
        ref={codeRef}
        key={file.name}
        className={`max-h-[60vh] overflow-auto rounded border border-[var(--border)] text-xs [&_pre]:!bg-[var(--panel)] [&_pre]:p-3 ${reduced ? "" : "assemble"}`}
        dangerouslySetInnerHTML={{ __html: html || `<pre>${file.content.replace(/</g, "&lt;")}</pre>` }}
      />
```

- [ ] **Step 2: Add ambient glow drift to AppShell**

In `src/components/AppShell.tsx`, add an effect that gently drifts the `.glow` element with GSAP unless reduced-motion. Add imports:

```tsx
import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reducedMotion";
```

Add inside `AppShell`, before `return`:

```tsx
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let tween: { kill: () => void } | null = null;
    loadGsap().then((gsap) => {
      if (!gsap || !glowRef.current) return;
      tween = gsap.to(glowRef.current, {
        backgroundPosition: "60% 40%", scale: 1.06, opacity: 0.85,
        duration: 8, yoyo: true, repeat: -1, ease: "sine.inOut",
      });
    });
    return () => { tween?.kill(); };
  }, []);
```

And attach the ref: `<div className="glow" aria-hidden ref={glowRef} />`.

- [ ] **Step 3: Verify**

Run: `npm run build` → success. `npx vitest run` → 50 pass. `npm run lint` → 0 errors.
Manual: generate code → lines reveal in a stagger; hero glow drifts; toggle OS reduced-motion → both static.

- [ ] **Step 4: Commit**

```bash
git add src/components/CodeViewer.tsx src/components/AppShell.tsx
git commit -m "feat: GSAP code-assemble beat + ambient hero glow drift"
```

---

## Phase 7 — Final

### Task 19: Full gates, live visual pass, merge

**Files:** none (verification) + possible small fixes

- [ ] **Step 1: Full gates**

Run: `npx vitest run` → 50 pass (45 backend/lib + 5 motion).
Run: `npx tsc --noEmit` → clean.
Run: `npm run lint` → 0 errors (1 pre-existing intentional `_body` warning in `errors.ts` is acceptable).
Run: `npm run build` → success.

- [ ] **Step 2: Live visual pass**

Start `npm run dev`. Verify:
- Hero loads with staggered rise, gradient headline, fading grid + drifting glow.
- Drag a PDF over the drop target → it ignites green; drop → hero morphs out, cockpit morphs in.
- Registers stream into the table; click a `pXX` citation → SourcePane scrolls to that page.
- Generate → Code/Init tabs unlock; code assembles in; Download .zip works.
- Provider dropdown + ⚙ popover work (BYOK key field).
- Toggle OS "reduce motion" → animations degrade to instant fades; no loops.

Record any issues and fix them (front-end only).

- [ ] **Step 3: Finish the branch**

Use the **finishing-a-development-branch** skill to merge `feat/regforge-v3` → `master` (verify gates on the merge result first).

---

## Self-Review Notes (addressed)

- **Spec coverage:** structure/hero+cockpit morph (T9, T15, T16) · visual tokens/palette/grid/glow/type (T2) · StageRail filling track (T4) · ProviderControl premium (T5) · DropTarget ignite (T7) · ExampleChips (T8) · SourcePane cited scroll (T10) · RegisterTable premium + stream-in beat (T11) · CodeViewer tabs/copy/dl/zip/assemble (T12, T18) · InitTimeline (T13) · WorkPane segmented + Generate CTA (T14) · motion layer + reduced-motion (T3) · GSAP beats: register stream (T11), code assemble (T18), rail handoff (T4), glow drift (T18), hero morph (T16 via framer-motion AnimatePresence — see note) · data flow unchanged (T17) · error/edge states (T16 banner, T13 degraded) · gates+live (T19). All spec sections mapped.
- **Morph implementation note:** the spec lists the hero→cockpit morph as a "GSAP beat," but it is implemented with framer-motion `AnimatePresence` (exit/enter), which is the robust, idiomatic way to animate React mount/unmount. GSAP drives the other four beats (register stream via framer-motion stagger, code assemble, rail fill, glow drift). This satisfies the spec's intent (a dramatic morph + signature motion) with lower risk; flagged for transparency.
- **Boundary preserved:** no task touches `api/*`, `lib/llm/*`, `lib/generate/*`, `lib/extract/*`, schema, or `lib/stages.ts`. The 45 existing tests remain green; 5 new motion tests added (50 total).
- **Type consistency:** `GenFile = { name; content }` used identically in CodeViewer/WorkPane/AppShell/page. `RegisterMap`/`Register`/`InitResult`/`Stage`/`ProviderName` imported from their existing modules. Handler names (`handleFile`, `loadExample`, `generate`) and props (`onFile`/`onLoadExample`/`onChange`/`onCite`/`onGenerate`) match between `page.tsx` → `AppShell` → panes.
- **Placeholders:** none — every component step contains complete code.
- **No-leak/security:** CodeViewer `dangerouslySetInnerHTML` only renders shiki-escaped output of our own generated code (documented), consistent with v2.
