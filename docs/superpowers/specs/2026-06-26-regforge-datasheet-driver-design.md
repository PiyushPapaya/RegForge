# RegForge — Datasheet → Driver Playground (Design Spec)

**Date:** 2026-06-26
**Status:** Approved design — ready for implementation planning
**Working name:** RegForge (placeholder)

## One-liner

Drop a sensor/peripheral datasheet PDF → Claude extracts a structured register
map → the user verifies/edits it → the app generates a C header, driver
skeleton, and a cited init sequence.

## Goal & Positioning

Demo-first, but architected so it can grow into a real tool (decision: "C").
The win is the *wow* of a 2-minute walkthrough — drop a real datasheet, watch
register maps + C skeleton appear — without architecting into a corner. The
defensible wedge is the rare hardware + ML combination: reasoning about
datasheet prose (init sequences), not just scraping tables.

## Target Input (MVP scope)

I²C/SPI **sensor & peripheral chips** — e.g. IMUs (BMI270), temp sensors
(TMP117), RTCs (DS3231), power monitors. Clean tabular register maps, typically
20–80 pages. This is the category where "drop PDF → get working driver" holds up
under a live demo. MCU reference manuals are an explicit non-goal for v1.

## Output — Four Layers

1. **Register map** (structured): every register — address, name, access
   (RW/RO/WO), reset value, bitfield breakdown. The extraction proof and hero
   of the UI.
2. **C header** (`device_regs.h`): `#define` register addresses + bitfield
   masks/shifts, generated deterministically from Layer 1.
3. **Driver skeleton** (`device.c` / `device.h`): typed read/write helpers, a
   `device_init()` with a sensible init sequence, per-feature stub functions
   (e.g. `bmi270_read_accel()`). Bus access abstracted behind
   `hal_i2c_read/write` the user wires to their MCU.
4. **Init-sequence reasoning**: a human-readable, ordered list of power-on/config
   steps (soft reset → set mode → enable → configure ODR…), each citing the
   datasheet page/section it came from. The "rare ML" flex.

## Interaction Model — Pipeline with a Checkpoint (decision "B")

```
[1] Upload          [2] Extract           [3] Verify            [4] Generate
PDF in browser  →   Claude reads PDF  →   user reviews/edits →  templated C +
                    → strict JSON         register table         Claude init-seq
                      register map         (the checkpoint)       reasoning
```

The verify step turns the hallucination weakness into the product's trust story:
the AI extracts, the user verifies, then the app writes correct code. The
checkpoint is also where Layer 4's page citations shine (click a row → see its
datasheet source).

## Architecture — Single Next.js App, Three Server Boundaries

- **`/` — Workbench UI** (client): upload dropzone, register-map table editor,
  code/output panels, example gallery.
- **Route handler `POST /api/extract`** (server): receives the PDF, calls the
  Anthropic API with the PDF + extraction prompt, validates the response against
  a Zod schema, returns register-map JSON. API key stays server-side.
- **Route handler `POST /api/generate`** (server): receives the *verified*
  register-map JSON → deterministic templating for Layers 2–3 → second Claude
  call for Layer 4 (init sequence) → returns all generated artifacts.
- **Supabase** (minimal): `datasheets` + `extractions` tables + a storage bucket
  for PDFs. Powers the example gallery and shareable links.

**Extraction engine:** Claude (Claude 4) reads the PDF natively (text + rendered
page images), so it sees actual register tables — no brittle pdfplumber/regex
pipeline. Layers 2–3 are deterministic templating off the verified JSON
(reliable, no hallucination). Layer 4 is a second Claude call over the relevant
sections. The verified JSON is the contract between the two server routes, so
generated C is never silently wrong.

## Data Model

### Register-map JSON (returned by `/api/extract`, validated by Zod)

```jsonc
{
  "device": {
    "name": "BMI270",
    "vendor": "Bosch",
    "bus": "I2C",              // "I2C" | "SPI"
    "i2c_addresses": ["0x68", "0x69"],
    "word_size_bits": 8
  },
  "registers": [
    {
      "name": "PWR_CTRL",
      "address": "0x7D",
      "access": "RW",          // "RW" | "RO" | "WO"
      "reset_value": "0x00",
      "description": "Enables sensors",
      "source": { "page": 42, "section": "5.3.16" },   // citation
      "fields": [
        {
          "name": "acc_en",
          "bits": "2",         // "2" or "5:3" for ranges
          "access": "RW",
          "reset": "0",
          "description": "Accelerometer enable",
          "enums": [ { "value": "0x1", "name": "ENABLED" } ]  // optional
        }
      ]
    }
  ],
  "init_hints": [ "Soft reset via CMD=0xB6", "Load config file" ]
}
```

**Design points:**
- Every register and field carries a `source` citation (page + section) — drives
  the trust feature and differentiates from a generic chatbot.
- Addresses/values stay as hex strings, not numbers — avoids precision/formatting
  loss and matches how datasheets read.
- `init_hints` is a scratchpad Claude fills during extraction (reset commands,
  required sequences it noticed), fed into the Layer 4 call so it reasons from
  grounded clues.

### Supabase tables (tiny)

- `extractions` — `id`, `device_name`, `vendor`, `register_map` (jsonb),
  `created_at`, `is_example` (bool, for the curated gallery).
- `datasheets` — `id`, `filename`, `storage_path`, `extraction_id`. PDF in a
  storage bucket.

No auth for the MVP — public gallery + ephemeral uploads. Architected so auth
could slot in later without reshaping this.

## UI / Screens

Single-screen "workbench" that morphs through the 4 stages — no page navigation,
so a demo flows in one continuous motion.

```
┌─────────────────────────────────────────────────────────┐
│  RegForge          [ Example Gallery ▾ ]   [ + New ]      │  ← top bar
├──────────────┬──────────────────────────────────────────┤
│  LEFT        │   RIGHT (tabs appear after generate)       │
│  Register    │   ┌─ Reg Map │ device_regs.h │ driver.c    │
│  Map Table   │   │           │ init seq      ┐            │
│  (editable)  │   │   code / output panel                  │
│  + PDF page  │   │   (syntax highlighted, copy btn)       │
│  preview     │   └─────────────────────────────────────── │
└──────────────┴──────────────────────────────────────────┘
```

**Stage-by-stage:**
1. **Empty state** — big dropzone + example gallery (3–4 pre-extracted chips as
   clickable cards: BMI270, TMP117, DS3231). Demo insurance.
2. **Extracting** — dropzone collapses to a progress strip with live status
   ("Reading 48 pages… found 52 registers…"). Streamed if feasible,
   faked-but-honest if not.
3. **Verify (checkpoint)** — left fills with the editable register table:
   expandable rows → bitfields. Each row has a 📄 citation chip → click opens the
   PDF page preview scrolled to that page. Cells inline-editable; an "unverified"
   badge clears as confirmed. Big "Generate Driver →" button.
4. **Generate** — right panel tabs populate: Reg Map (read-only) · `device_regs.h`
   · `device.c`/`.h` · Init Sequence (numbered steps, each cited). Copy +
   download per panel; "Download .zip" grabs all files.

**Feel:** developer-tool aesthetic — dark, monospace for code, dense but calm.
The wow comes from content appearing, not animation.

## Error Handling & Demo-Resilience

**Extraction failures:**
- Schema validation fails → one automatic retry with a "fix your JSON to match
  this schema" follow-up prompt. Fails twice → clear "couldn't produce a clean
  map — try a different PDF or pick an example" state, never a stack trace.
- Wrong datasheet type (MCU manual / non-datasheet) → Claude returns
  `device_detected: false`; UI shows a friendly redirect instead of garbage.
- Partial extraction → still render the table; mark low-confidence rows so the
  verify step naturally catches them (weakness → workflow).

**Generation failures:**
- Layers 2–3 deterministic → effectively can't fail if JSON validated. A
  malformed field becomes a clearly-commented stub, not a crash.
- Layer 4 fails/times out → still ship Layers 1–3; init panel shows "couldn't
  synthesize init sequence — here are the raw hints" from `init_hints`.

**Operational guardrails:**
- Page/size cap (~120 pages) rejected up front with a clear message — protects
  against runaway token cost and the slow-demo trap.
- Every Anthropic call wrapped with a timeout; example gallery is the
  always-works fallback path.

Throughline: nothing the user sees is ever a raw error or silently-wrong C — it's
trusted output, a clearly-flagged uncertainty, or a friendly redirect.

## Testing Strategy

- **Schema as test surface:** unit-test the Zod register-map schema against
  fixtures (valid map, missing reset value, bad bit range) to prove validation +
  auto-retry without burning API calls.
- **Golden-file tests for code generation:** fixed register-map JSON → assert
  generated `device_regs.h` / `device.c` match committed golden files.
- **Real-chip smoke set:** BMI270, TMP117, DS3231 — these double as the example
  gallery seeds *and* the manual eval set; re-run after prompt changes and eyeball
  register counts/addresses against the real datasheet.
- **No E2E browser automation** for the MVP — manual walkthrough covers it.

## Scope

**In scope (MVP):**
- I²C/SPI sensor & peripheral datasheets (≤ ~120 pages)
- Extract → verify/edit → generate all 4 layers
- Citations, example gallery, copy/download/.zip
- Supabase persistence for gallery + shareable extraction links

**Explicit non-goals (YAGNI for v1):**
- MCU reference manuals / multi-chapter register maps (future path)
- User accounts / auth
- Compiling or running the generated driver in-browser
- Multi-bus chips beyond simple I²C/SPI (no CAN/UART configs)
- Editing bitfield *structure* in the UI (edit values/names yes; restructuring no)
- Vendor HAL integrations (output stays MCU-agnostic behind `hal_i2c_read/write`)

## Tech Stack

- Next.js (App Router) — frontend + server route handlers
- Anthropic API (Claude 4) — native PDF extraction + init-sequence reasoning
- Zod — register-map schema validation (the contract)
- Supabase — Postgres (`datasheets`, `extractions`) + storage bucket for PDFs
- Deterministic templating for C header + driver skeleton generation
