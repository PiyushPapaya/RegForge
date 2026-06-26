# RegForge

Drop an I²C/SPI sensor datasheet PDF and RegForge turns it into a working C driver. Claude reads the PDF and extracts a structured **register map**; you **verify and edit** that map inline (the trust checkpoint); then RegForge generates a C header (`<device>_regs.h`), a driver skeleton (`<device>.c` / `<device>.h`), and a **cited, ordered init sequence** — each step linked back to the datasheet page it came from.

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

- `ANTHROPIC_API_KEY` — **required**. Used server-side for PDF extraction and init-sequence reasoning.
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **optional**. Enable persistence and the example gallery. Without them the app still works end-to-end; the gallery simply stays empty.

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

- `POST /api/extract` — receives the PDF, calls Claude (native PDF reading), validates the reply against the Zod register-map schema (with one auto-retry), returns the map. API key stays server-side.
- `POST /api/generate` — receives the **verified** map, runs deterministic templating for the header + driver (no hallucination), and a second Claude call for the init sequence (graceful degradation to raw `init_hints` on failure).

The Zod schema in `src/lib/schema/registerMap.ts` is the contract between the two routes — generated C is only ever produced from a validated, user-verified map, so it is never silently wrong. Generated C comments and identifiers are sanitized (`src/lib/generate/sanitize.ts`) so extracted text can't break out of a comment or form an invalid macro.

Tech: Next.js 16 · TypeScript · Tailwind v4 · Anthropic SDK (Claude) · Zod · Supabase · Vitest.
