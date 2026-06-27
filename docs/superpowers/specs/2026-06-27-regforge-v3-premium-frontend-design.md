# RegForge v3 — Premium Frontend Redesign (Design Spec)

**Status:** Approved (brainstorm complete, awaiting spec review)
**Date:** 2026-06-27
**Scope:** Front-end only. Ground-up rebuild of the UI into a "modern dev-tool premium" (Linear/Vercel-grade) single-screen experience with a hero that morphs into the working cockpit, signature GSAP motion beats, and tasteful micro-motion throughout.

---

## 1. Goal & boundary

Transform RegForge's barren current UI (a thin dashed dropzone stranded in a black void) into a beautiful, confident, animated single-screen product. This is a **front-end-only** redesign.

**HARD boundary — do NOT touch (behavior must stay identical, all 45 tests stay green):**
- `src/app/api/**` (extract, generate, examples routes)
- `src/lib/llm/**` (provider interface, adapters, registry, errors)
- `src/lib/generate/**`, `src/lib/extract/**`, `src/lib/schema/**`
- `src/lib/stages.ts` (reused as-is — it is unit-tested)

**Rebuild / add (front-end):**
- `src/app/page.tsx` — keep the exact state machine + fetch handlers; render the new shell.
- `src/app/globals.css`, `src/app/layout.tsx` — new design tokens, fonts, background field.
- `src/components/**` — new component tree (below).
- `src/lib/motion/**` — reduced-motion guard, lazy GSAP client loader, shared framer-motion variants.
- New dependency: `gsap` (client-only, lazily imported).

**Non-goals:** no separate marketing site / landing pages, no new routes, no backend or schema changes, no component unit tests (consistent with the current codebase; gates are tsc/lint/build/vitest + a live visual pass).

---

## 2. Structure: two states that morph

A single screen with two states sharing one persistent header.

### Empty state — "Hero" (centered ~720px column, vertically centered)
- Eyebrow: `DATASHEET → C DRIVER` (mono, muted, letter-spaced).
- Display headline (~clamp 40–60px, tight tracking, 2 lines): **"Turn a sensor datasheet into a working C driver."** — the final words rendered in the green→steel-blue gradient.
- One-line muted subhead.
- **DropTarget** centerpiece (~520×280): large rounded glass panel, animated gradient/dashed border that gently traces on idle and **ignites green** on drag-over; upload glyph that lifts on hover; prompt text; "PDF · up to ~25MB" hint.
- **ExampleChips** row beneath: chip per pre-extracted example (name + I²C/SPI bus badge); click loads that map (existing `ExampleGallery` behavior).
- Three trust stats (e.g. "4 layers generated · cited to the page · schema-validated").

### Working state — "Cockpit" (two panes)
Once a map loads, the hero **lifts/fades up and out** while the two-pane workspace **expands in**.
- **Left · Source:** PDF viewer with cited-page scroll preserved (header shows filename + page; citation clicks re-scroll). Tidy placeholder for the example (no-PDF) case.
- **Right · Work (`WorkPane`):** segmented header **Registers / Code / Init**:
  - **Registers:** editable table — sticky glass header, hairline rows, monospace addresses in green, hover highlight, expandable bitfield drawer, steel-blue 📄 page chip, amber left-edge for any low-confidence row. Prominent gradient **"Generate Driver →"** CTA docked at bottom.
  - **Code:** upgraded shiki viewer — file tabs (`<slug>_regs.h` / `<slug>.h` / `<slug>.c`), per-file copy + download, primary **Download .zip**, line numbers, assemble animation.
  - **Init:** cited init sequence as a numbered timeline; each step shows its page chip; degraded state shows the amber note.

### Header (persistent in both states)
- Logo (RegForge) · **StageRail** · **ProviderControl** (dropdown + ⚙ BYOK popover).
- Transparent/minimal over the hero; gains backdrop-blur + bottom hairline once in the cockpit.

---

## 3. Visual system

**Palette (near-black; green primary, steel-blue/indigo secondary):**
| Token | Value | Use |
|---|---|---|
| `--bg` | `#08090b` | page base |
| `--panel` / `--panel-2` | `#0e1014` / `#111418` | glass panels |
| `--border` | `#20262e` | hairlines |
| `--accent` / `--accent-bright` | `#3ddc91` / `#5ef0a8` | go/compiled/success: active stage, CTA, key data |
| `--link` / `--indigo` | `#5aa9e6` / `#6c7cf0` | citations, links, gradient partner |
| `--warn` | `#e0a85e` | low-confidence / degraded |
| `--error` | soft red | errors |
| `--text` / `--muted` | `#e6edf3` / `#8b97a3` | text |

- **Signature gradient:** green→steel-blue, used sparingly (headline accent words, active-CTA glow ring, stage-rail fill).
- **Depth & texture (kills the flat void):** dotted/grid field brightest near the hero, fading outward via radial mask; one large soft green→blue radial glow behind the hero that slowly drifts (reduced-motion aware); panels get top-edge highlight + soft shadow + 1px inner border ("glass-on-black").
- **Type:** Geist Sans (UI) + Geist Mono (all data/code). True display size for the hero; clear step-down to labels/body; mono wherever data lives.
- **Polish:** 8px radius rhythm, 150–250ms easing on interactive states, green `focus-visible` rings (a11y).

---

## 4. Motion

**Micro (framer-motion), tasteful, everywhere:**
- Page-load stagger: header + hero (eyebrow → headline → subhead → DropTarget → chips).
- Buttons/chips: springy hover/press; CTA grows a soft glow ring on hover.
- Tab/state changes: cross-fade + slight slide; layout shifts animate without jank.
- Hero gradient words: slow shimmer sweep on load.

**Signature beats (GSAP, client-only/lazy) — 5:**
1. **Hero → cockpit morph** — hero scales/fades up and out; the two panes expand in from center with staggered reveal. The hero moment.
2. **Registers stream in** — rows cascade with a brief green underglow that settles; time-boxed ~1.2s for large maps.
3. **Code assembles** — on Generate, code panel "types/assembles" in, line numbers count up, a scanline sweep, then settles to static highlighted code.
4. **Stage-rail handoff** — green fill animates along the track to the new stage; node "locks in" with a small pulse.
5. **Ambient hero glow drift** — soft radial glow slowly breathes/drifts.

**All gated by `prefers-reduced-motion`:** reduced mode = instant fades only, no transforms/loops. GSAP imported lazily on the client so it never enters the server bundle.

---

## 5. Component architecture

`page.tsx` keeps its exact state (`stage`, `map`, `busy`, `status`, `error`, `files`, `init`, `citePage`, `pdfUrl`, `provider`, `apiKey`) and handlers (`handleFile`, `loadExample`, `generate`) — only the rendered tree changes.

```
AppShell                 // hero↔cockpit morph (AnimatePresence) + persistent header
  SiteHeader             // logo · StageRail · ProviderControl
  Hero                   // empty state
    DropTarget           // wraps existing react-dropzone logic
    ExampleChips         // restyled ExampleGallery
  Cockpit                // two-pane working state
    SourcePane           // PDF viewer + cited-page scroll
    WorkPane             // segmented Registers / Code / Init
      RegisterTable      // restyled + stream-in beat
      CodeViewer         // upgraded shiki (tabs, copy/dl, zip, assemble beat)
      InitTimeline       // cited init sequence
StageRail                // filling-track progress instrument
ProviderControl          // premium dropdown + glass BYOK popover
src/lib/motion/
  reducedMotion.ts       // prefersReducedMotion()
  gsap.ts                // lazy client-only GSAP loader
  variants.ts            // shared framer-motion variants
```

Each unit has one purpose, takes props (no shared globals beyond CSS tokens), and can be reasoned about in isolation. `StageRail`/`ProviderControl`/`SourcePane`/`CodeViewer`/`RegisterTable`/`OutputTabs` from v2 are superseded by these rebuilds (the v2 OutputTabs logic — tabs + zip — folds into `WorkPane`/`CodeViewer`).

---

## 6. Data flow (unchanged)

- Drop/select PDF → `handleFile` → `POST /api/extract` (FormData: pdf, provider, apiKey?) → set map, stage=verify.
- Example chip → `loadExample(map)` → stage=verify, no PDF.
- Generate → `POST /api/generate` (JSON: map, provider, apiKey?) → set files+init, stage=generate.
- Citation click → `setCitePage` → SourcePane re-scrolls the PDF iframe.
- All request/response shapes, error handling, and provider resolution are exactly as today.

---

## 7. Error & edge states
- Network/provider errors: surfaced via the existing `error` string, shown as a styled inline banner (amber/red) in both hero and cockpit.
- `device_detected: false` / 422: friendly inline message; stage returns to upload.
- Degraded init (Gemini graceful fallback): amber note in the Init timeline.
- Empty example gallery (no Supabase): chips section simply hidden (existing behavior).
- Reduced motion: all beats degrade to instant fades.
- Loading/busy: DropTarget shows a "Reading <file>…" state; StageRail shows substatus.

---

## 8. Testing & quality gates
- Existing **45 vitest tests stay green** (no touched libs).
- Gates: `npx vitest run` · `npx tsc --noEmit` · `npm run lint` (0 errors) · `npm run build` (success).
- Live visual pass in the browser: hero load, drag-over ignite, example load → morph, register stream, generate → code assemble, citation re-scroll, reduced-motion check.

---

## 9. Out of scope / future
- Marketing/landing pages, multi-route site.
- Component unit/visual regression tests.
- Backend, schema, or provider changes.
- Light mode (dark-only).
