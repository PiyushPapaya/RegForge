# RegForge v2 — Multi-Provider LLM + Cockpit UI Redesign (Design Spec)

**Date:** 2026-06-27
**Status:** Approved design — ready for implementation planning
**Builds on:** v1 (merged to `master`) — see `2026-06-26-regforge-datasheet-driver-design.md`

## Goal

Two additions to the shipped v1 MVP:
1. **Multi-provider LLM support** — let the app use Anthropic, OpenAI, or Google
   Gemini, with `.env` defaults *and* an optional bring-your-own-key (BYOK) field
   in the UI. Gemini's free tier (`gemini-2.5-flash`) makes the app runnable for
   free.
2. **Full UI redesign** — a "lab-instrument" cockpit with a lit stage rail,
   two-pane layout, a refined visual system, and three signature motion beats.

Demo-first ethos continues: the win is an impressive, credible walkthrough.

---

## Part 1 — Multi-Provider Abstraction

### Provider verification (done)
The user's Gemini key was tested live: it is **valid and works on
`gemini-2.5-flash`** (and `gemini-flash-latest`). `gemini-2.0-flash` returns
`429 RESOURCE_EXHAUSTED` with free-tier `limit: 0` for that project, and
`gemini-1.5-flash` is retired (404). **Use `gemini-2.5-flash`.**

### Free-tier landscape (for reference)
- **Gemini** — genuinely free key (AI Studio), native PDF/vision on
  `gemini-2.5-flash`. Best free fit for datasheet reading.
- **Groq / OpenRouter / Mistral / Cerebras** — free text tiers, weak/no native
  PDF; not ideal for extraction.
- **OpenAI API** — paid only (the ChatGPT *product* is free, the *API* is not).
- **Anthropic** — paid, best quality, native PDF (v1 default).

### Architecture
One interface all providers implement; the rest of the app stays
provider-agnostic. This generalizes the existing `TextCaller` / `InitCaller`
seam — `extractRegisterMap` and `buildInitSequence` are unchanged.

```
src/lib/llm/
  types.ts        # LLMProvider interface + shared types
  anthropic.ts    # wraps current Claude calls (claude-sonnet-4-6)
  openai.ts       # gpt-4o (PDF via file/input)
  gemini.ts       # gemini-2.5-flash (native PDF via inlineData base64)
  registry.ts     # name -> provider factory; resolves key + model
```

```ts
export type ProviderName = "anthropic" | "openai" | "gemini";

export interface LLMProvider {
  name: ProviderName;
  /** Send a PDF + prompt, return raw model text (used by extractRegisterMap). */
  extractFromPdf(pdf: Buffer, prompt: string): Promise<string>;
  /** Text-only reasoning (used by buildInitSequence for Layer 4). */
  reasonText(prompt: string): Promise<string>;
}
```

### Key resolution (the "C" decision)
Each request to `/api/extract` and `/api/generate` carries an optional
`{ provider, apiKey }`. The registry resolves the key in priority order:

1. **Request-supplied key (BYOK)** — used for that request only.
2. **`.env` default** for that provider (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
   `GEMINI_API_KEY`).
3. Otherwise → a typed "provider not configured / needs key" error.

**Key hygiene:** BYOK keys are never persisted, never logged, never sent anywhere
but the chosen provider. They travel only on the request the user initiates,
through the existing server route. `.env.local` is gitignored.

### Per-provider model + PDF handling
- **Gemini** → `gemini-2.5-flash`; PDF as `inlineData` (base64,
  `application/pdf`).
- **Anthropic** → `claude-sonnet-4-6`; PDF as a `document` base64 block (v1 path).
- **OpenAI** → `gpt-4o`; PDF via the SDK's file/input mechanism. UI marks it as
  paid.

### Routes
`/api/extract` and `/api/generate` read `provider` + optional `apiKey` from the
request body/form, resolve a provider via the registry, and call its methods.
Response shapes are unchanged — no breaking change to existing logic.

---

## Part 2 — Cockpit UI Redesign

### Layout — three fixed regions

```
┌──────────────────────────────────────────────────────────────┐
│  RegForge   ◉ Upload ─ ○ Extract ─ ○ Verify ─ ○ Generate      │  TOP: brand + lit rail + provider chip
│                                              [ Gemini ▾ ⚙ ]    │
├───────────────────────────────┬──────────────────────────────┤
│  SOURCE PANE (left)           │  WORK PANE (right)             │
│  • empty: dropzone + gallery  │  • verify: register table      │
│  • loaded: PDF viewer,        │  • generate: code tabs         │
│    auto-scrolls to cited page │    (Reg map · .h · .c · Init)  │
└───────────────────────────────┴──────────────────────────────┘
```

### The lit stage rail (top)
Four segments — Upload · Extract · Verify · Generate — as a sequencer readout.
States: dim (pending), pulsing phosphor (active), solid phosphor (done). During
extraction it shows live substatus ("reading 48 pp · 52 regs found").

### Source pane (left)
Starts as dropzone + example gallery. After a PDF loads, becomes the PDF viewer.
Clicking any 📄 citation drives this pane — scrolls to the page + highlight
pulse. Visible cause→effect that makes citations feel real.

### Work pane (right), evolves by stage
- **Verify:** register table — sticky header, monospace, expandable bitfield
  rows, inline-editable cells, low-confidence rows flagged amber. Prominent
  "Generate Driver →" action.
- **Generate:** tab bar (Reg map · `<dev>_regs.h` · `<dev>.c`/`.h` · Init) with a
  **shiki**-highlighted code viewer; copy/download per file + Download .zip.

### Provider control (top-right)
Compact provider dropdown (Anthropic / OpenAI / Gemini) + ⚙ opening a small
popover with the optional BYOK key field and a "needs key" badge when a provider
has neither env nor BYOK key. OpenAI labeled "paid".

### Responsive
Below ~1024px the panes stack (source top, work below); the rail collapses to a
slim progress bar.

---

## Part 3 — Visual Language (lab-instrument + restraint)

**Palette:**
- Base `#0a0b0d`; panel surfaces `#101317`; hairline borders `#1e242b`.
- Phosphor accent `#3ddc91` / `#5ef0a8` — **only** for live/active/done states,
  lit rail, focus rings, primary action.
- Steel-blue `#5aa9e6` — reserved for citations/links (distinct from "active"
  green).
- Amber `#e0a85e` — low-confidence flags only.
- Text `#e6edf3` primary, `#8b97a3` muted.

**Texture:** faint fixed graph-paper grid (~2% opacity) behind panes; panels are
solid surfaces above it.

**Type:** sans for UI (Inter/Geist); mono for all data — addresses, register
names, code, readouts (JetBrains Mono / Geist Mono). Mono-forward data sells
"test equipment."

**Components:** recessed instrument-bay panels (1px hairline border, 6px radius,
subtle inset shadow); segmented rail with thin underglow when lit; quiet
ghost/outline buttons with a phosphor-filled primary; shiki dark theme tuned to
the palette; dense hairline-divided register table with emphasized mono address
column and steel-blue citation chips.

**Restraint rules:** one accent for state; no gradients except a single subtle
radial behind the brand/rail; motion reserved for the three beats below.

---

## Part 4 — Motion (signature beats, calm elsewhere)

Small animation lib (Motion/`framer-motion` or GSAP) for beats 1–2 only.

1. **Registers streaming in (hero):** rows populate one-by-one (~30–50ms
   stagger), each flashing a brief phosphor underglow, while the rail's Extract
   segment pulses and substatus counts up. Time-boxed: accelerates so even a
   200-register chip finishes within ~1.2s. This is the highest-leverage
   animation.
2. **Code assembling on Generate:** work pane transitions to code tabs; the
   active file does a fast line-by-line reveal / typing sweep on the first ~15
   lines, then settles.
3. **Rail handoff:** on each stage transition the completing segment solidifies
   and a thin light sweeps to the next as it begins pulsing (~400ms).

**Ambient (CSS only):** citation click → smooth scroll + highlight pulse; panel
content fade/slide on stage change; button/hover/focus micro-states; active rail
segment breathing pulse.

**Guardrail:** all beats respect `prefers-reduced-motion` (fall back to instant).

---

## Error Handling

- **Bad/empty key** (401/403) → "Gemini rejected this key — check it or pick
  another provider." Never expose raw provider errors or the key.
- **Rate limit / quota** (e.g. the `429 limit:0` seen on gemini-2.0-flash) →
  "Free tier is rate-limited or exhausted — wait, switch provider, or add your
  own key." Surface the provider's retry hint when present.
- **Provider not configured** (no env + no BYOK) → provider chip shows "needs
  key"; submit opens the BYOK popover instead of erroring.
- **PDF call fails on a provider** → clear message + suggest another provider.
- **Existing safeties retained:** schema-validation retry, `device_detected:false`
  redirect, Layer-4 graceful degradation, page/size cap.

## Testing

- **Provider registry** unit tests: key-resolution priority (BYOK → env →
  error), correct model per provider, unknown-provider rejection — fake clients,
  no live calls.
- **Each provider adapter** tested with a mocked SDK/fetch: asserts PDF sent in
  the right shape and text parsed out.
- **Existing 24 tests stay green** (the `TextCaller`/`InitCaller` seam is
  preserved).
- UI: no E2E; manual walkthrough; small prop-driven components. Verify
  `prefers-reduced-motion` falls back to instant.

## Scope

**In scope:** provider abstraction (3 providers) + `.env`/BYOK resolution +
provider UI control; full cockpit redesign (rail, two-pane, lab-instrument visual
system, shiki code viewer); 3 motion beats; provider-aware error states.

**Out of scope (YAGNI):** persisting BYOK keys / user accounts; real
token-by-token streaming from providers (the "streaming rows" beat animates the
final result); per-provider prompt tuning beyond valid-JSON needs; provider
auto-fallback (manual switch only); deferred live Supabase seeding.
