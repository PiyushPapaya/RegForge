# RegForge

Drop an I²C/SPI sensor datasheet PDF and RegForge turns it into a working C driver. An LLM reads the PDF and extracts a structured **register map**; you **verify and edit** that map inline (the trust checkpoint); then RegForge generates a C header (`<device>_regs.h`), a driver skeleton (`<device>.c` / `<device>.h`), and a **cited, ordered init sequence** — each step linked back to the datasheet page it came from.

The UI is a two-pane "cockpit": the source datasheet on the left, the work (register table → generated code) on the right, with a lit **Upload · Extract · Verify · Generate** stage rail across the top.

It's tuned for clean, tabular sensor/peripheral chips (IMUs, temp sensors, RTCs, power monitors), not multi-chapter MCU reference manuals.

## The 4 stages

1. **Upload** — drop a datasheet PDF (or pick a pre-extracted example).
2. **Extract** — Claude reads the PDF and returns a strict, schema-validated register-map JSON.
3. **Verify (the checkpoint)** — review the editable register table; expand rows to see bitfields; click a 📄 citation to preview the source page. Fix anything before generating.
4. **Generate** — four layers appear as tabs:
   - **Register map** — the structured table.
   - **C header** (`<device>_regs.h`) — `#define`s for addresses + bitfield masks/shifts.
   - **Driver skeleton** (`<device>.c` / `.h`) — typed read/write helpers, `<device>_init()`, HAL hooks.
   - **Init sequence** — ordered power-on steps, each with its datasheet citation.

   Copy any file, or **Download .zip** to grab them all.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
```

Environment variables (`.env.local`):

- **At least one provider key** — used server-side for PDF extraction and init-sequence reasoning (see **Providers** below):
  - `GEMINI_API_KEY` — Google Gemini (`gemini-2.5-flash`), the **free** path.
  - `ANTHROPIC_API_KEY` — Anthropic (`claude-sonnet-4-6`).
  - `OPENAI_API_KEY` — OpenAI (`gpt-4o`), **paid**.
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **optional**. Enable persistence and the example gallery. Without them the app still works end-to-end; the gallery simply stays empty.

## Providers

RegForge supports three LLM providers behind one interface (`src/lib/llm/`). Pick the active provider from the dropdown in the top-right of the UI.

| Provider  | Model               | Notes                          |
|-----------|---------------------|--------------------------------|
| Gemini    | `gemini-2.5-flash`  | Free tier (low rate limits), native PDF — the recommended demo path. |
| Anthropic | `claude-sonnet-4-6` | Native PDF reading.            |
| OpenAI    | `gpt-4o`            | Paid; base64 PDF file part.    |

**Key resolution** for each request is: your **bring-your-own-key** (if supplied) → the server's `.env` default → a friendly typed error. Open the **⚙** popover next to the provider dropdown to paste your own key; BYOK keys are **never stored or logged** and are sent only to the provider you chose for that one request.

If using Supabase, apply the schema in `supabase/migrations/0001_init.sql` to your project. To seed the example gallery, run an extraction for a few chips, then mark their rows:

```sql
update extractions set is_example = true where device_name in ('BMI270','TMP117','DS3231');
```

## Run

```bash
npm run dev      # http://localhost:3000
npm run test     # vitest suite
npm run build    # production build
```

## Demo script

1. Drop a sensor datasheet (e.g. a BMI270).
2. Review the register table; click a 📄 citation to confirm an address against the source page.
3. Click **Generate Driver →**.
4. Switch tabs to view `<device>_regs.h`, the driver skeleton, and the init sequence.
5. **Download .zip**.

## Architecture

Single Next.js (App Router) app with two server "AI moments":

- `POST /api/extract` — receives the PDF and `{ provider, apiKey? }`, resolves the chosen provider, has it read the PDF, validates the reply against the Zod register-map schema (with one auto-retry), returns the map. Keys stay server-side.
- `POST /api/generate` — receives the **verified** map (plus `{ provider, apiKey? }`), runs deterministic templating for the header + driver (no hallucination), and a second provider call for the init sequence (graceful degradation to raw `init_hints` on failure).

Both routes resolve the provider through `src/lib/llm/registry.ts`, which adapts each provider's `extractFromPdf` / `reasonText` methods onto the existing `TextCaller` / `InitCaller` seam — so `extractRegisterMap` and `buildInitSequence` are provider-agnostic and unchanged.

The Zod schema in `src/lib/schema/registerMap.ts` is the contract between the two routes — generated C is only ever produced from a validated, user-verified map, so it is never silently wrong. Generated C comments and identifiers are sanitized (`src/lib/generate/sanitize.ts`) so extracted text can't break out of a comment or form an invalid macro.

Tech: Next.js 16 · TypeScript · Tailwind v4 · multi-provider LLM (Anthropic SDK · OpenAI SDK · Gemini REST) · shiki · framer-motion · Zod · Supabase · Vitest.
