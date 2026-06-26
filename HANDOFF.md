# RegForge — Handoff (read this first)

**For the next Claude session.** This file is the single entry point: read it,
then read the two specs and the plan referenced below. Working directory:
`C:/Users/anil1/Downloads/Driver` (Windows; PowerShell + Git Bash; Node 24, npm
11). It is its own git repo (root = this folder). Main working branch: `master`.

---

## What RegForge is

A demo-first web app: drop an I²C/SPI sensor datasheet PDF → an LLM extracts a
structured **register map** → the user verifies/edits it → the app generates a C
header (`<dev>_regs.h`), a driver skeleton (`<dev>.c`/`.h`), and a **cited init
sequence**. Built to be an impressive walkthrough ("flex on The Workbench").

Stack: Next.js 16 (App Router, TS), Tailwind v4, Zod, Vitest, Supabase
(optional), Anthropic SDK. Tuned for clean tabular sensor chips, NOT MCU
reference manuals.

---

## Current state — v1 is DONE and merged to `master`

All 17 tasks of the v1 plan are implemented, reviewed, and merged (merge commit
`27c7abd`). Quality gates at merge: **24/24 vitest tests pass, `tsc` clean,
`npm run lint` clean, `npm run build` succeeds (7 routes).**

Verify locally:
```bash
npm install
npm run test     # expect 24 passing
npm run build
npm run dev      # http://localhost:3000
```

**What exists (v1):**
- `src/lib/schema/registerMap.ts` — Zod register-map schema (THE CONTRACT) + types.
- `src/lib/generate/` — `templateHeader.ts` (Layer 2 `.h`), `templateDriver.ts`
  (Layer 3 `.c`/`.h`), `initSequence.ts` (Layer 4, graceful degradation),
  `hex.ts`, `sanitize.ts` (C comment/identifier safety).
- `src/lib/extract/` — `prompt.ts`, `extractRegisterMap.ts` (validation + 1 retry;
  injected `TextCaller`).
- `src/types/anthropic.ts` — Anthropic client + PDF caller (`claude-sonnet-4-6`).
- `src/lib/supabase/` — client + extractions data access. `supabase/migrations/0001_init.sql`.
- `src/lib/zip.ts` — .zip bundler.
- `src/app/api/` — `extract`, `generate`, `examples`, `examples/[id]` routes.
- `src/components/` — Dropzone, RegisterTable, OutputTabs, CodePanel, PdfPreview,
  ExampleGallery. `src/app/page.tsx` wires them.
- Tests under `tests/` (golden fixtures in `tests/fixtures/`, e.g. `bmi270.*`).

**Architecture seam to know:** the AI is injected as `TextCaller`/`InitCaller`
functions into `extractRegisterMap` / `buildInitSequence`. v2 generalizes this
seam into a provider interface — DO NOT rewrite those two functions.

---

## Deferred items (need the user's credentials)

These were intentionally NOT done because no key/DB was available to the agent:
1. **Live API smoke test** of `/api/extract` and `/api/generate` against a real
   LLM with a real datasheet PDF. (`/api/generate`'s deterministic path WAS
   verified live and returns byte-correct C; the AI calls degraded because no key
   was present.)
2. **Supabase**: apply `supabase/migrations/0001_init.sql`, set the Supabase env
   vars, seed examples (`update extractions set is_example=true where ...`). App
   runs fine without it (gallery just stays empty; persistence fails silently).

To run AI locally, create `.env.local` (gitignored) from `.env.local.example` and
add a real key. See key finding below.

---

## What needs to be done next — v2

**Approved design spec:**
`docs/superpowers/specs/2026-06-27-regforge-v2-multiprovider-ui-design.md`
(v1 spec for reference:
`docs/superpowers/specs/2026-06-26-regforge-datasheet-driver-design.md`)

v2 has two parts, both approved by the user:

### Part 1 — Multi-provider LLM (Anthropic / OpenAI / Gemini)
- New `src/lib/llm/` with an `LLMProvider` interface (`extractFromPdf`,
  `reasonText`), adapters for each provider, and a `registry.ts`.
- Key resolution priority: **request BYOK key → `.env` default → typed error.**
- Routes pass `{ provider, apiKey }`; same response shapes.
- Models: Gemini `gemini-2.5-flash` (native PDF, FREE tier), Anthropic
  `claude-sonnet-4-6`, OpenAI `gpt-4o` (paid).
- BYOK keys: never persisted/logged; only sent to the chosen provider.

### Part 2 — Cockpit UI redesign
- Two-pane "cockpit" (source PDF pane | work pane) + a **lit stage rail**
  (Upload·Extract·Verify·Generate).
- Lab-instrument visual language with restraint: near-black base, ONE phosphor
  green accent (`#3ddc91`) for state, steel-blue (`#5aa9e6`) for citations, amber
  for low-confidence, faint graph-paper grid, mono-forward data, shiki code
  viewer. Full palette/type/components in the spec.
- Provider dropdown + ⚙ BYOK popover (top-right).
- 3 motion beats: (1) registers stream into the table on extract [hero,
  time-boxed ~1.2s], (2) code assembles/types on generate, (3) rail handoff on
  stage change. All respect `prefers-reduced-motion`. Calm CSS elsewhere.

### IMMEDIATE NEXT STEP
Run the **writing-plans** skill on the v2 spec to produce
`docs/superpowers/plans/2026-06-27-regforge-v2.md`, then execute it
(subagent-driven-development was used for v1 and worked well: group tightly
coupled tasks, rely on each task's TDD tests as the gate, review diffs).

---

## Verified fact: the user's Gemini API key WORKS

Tested live (2026-06-27). The key is **valid** and works on **`gemini-2.5-flash`**
and `gemini-flash-latest`. It does NOT work on `gemini-2.0-flash` (returns
`429 RESOURCE_EXHAUSTED`, free-tier `limit: 0` for that project) or
`gemini-1.5-flash` (404, retired). **→ Use `gemini-2.5-flash`.** Free tier has
low rate limits (a few req/min), fine for demo. The key itself lives in the prior
chat; the user should place it in `.env.local` as `GEMINI_API_KEY` (do NOT commit
it).

---

## Conventions
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- `.gitattributes` pins LF for `tests/fixtures/*` and `*.c`/`*.h` (golden-file
  byte-stability on Windows) — keep it.
- Keep `AGENTS.md` (real Next.js 16 guidance) and `CLAUDE.md` (`@AGENTS.md`).
- Specs live in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`.
