# RegForge — Portfolio Professionalism & UI Polish (Design Spec)

**Date:** 2026-06-27
**Status:** Approved
**Live demo:** https://reg-forge.vercel.app

## Context

RegForge is a datasheet-PDF → C-driver generator (Next.js 16 / React 19 / Tailwind v4)
with a recently shipped "elite overhaul" (live streaming extraction, visible verify
affordances, responsive cockpit, on-brand code, full a11y pass). The remaining gap is
**presentation and trust**: the README is plain (no live link, no visuals, no badges,
no license, doesn't mention streaming), the repo carries default Next starter clutter,
there's no social preview, and the UI — while strong — still has rough edges and lacks
portfolio-grade finish (no logo lockup, no footer, thin empty states, no in-app trust
explainer). This work makes the project read as a credible, professional portfolio piece
to both recruiters and technical reviewers.

## Goals

- A balanced README: recruiter-friendly top (hero, demo, visuals, highlights) + technical
  second half (architecture, setup, providers, testing, structure).
- Repo professionalism: LICENSE, accurate `package.json` metadata, Open Graph / social
  preview, richer app metadata, removal of unused starter assets.
- A `/impeccable` + `/ui-ux-pro-max` polish pass that elevates finish without redoing the
  overhaul.
- In-app trust signals so first-time visitors believe the output.

## Non-goals (YAGNI)

GitHub Actions CI, a heavy CONTRIBUTING guide, and Storybook are out of scope unless
requested later.

## Track 1 — README & repo professionalism

**README structure (balanced audience):**
1. Hero — name, one-line tagline, badge row (build/tests/license/Next.js·React·TS),
   a prominent **Live Demo** link, hero screenshot.
2. Demo GIF — the extract → verify → generate flow.
3. Highlights — skimmable bullets: live streaming extraction; schema-validated
   **deterministic** codegen (no hallucinated C); page-cited output; multi-provider + BYOK;
   accessible; 50 tests.
4. Screenshot gallery — hero / cockpit / code.
5. How it works — architecture diagram (datasheet → LLM extract → Zod validate →
   deterministic templates → C output) + the trust model.
6. Tech stack.
7. Getting started — setup, env, run (tightened from current).
8. Providers table (kept, updated).
9. Testing & quality — tests, tsc, lint, a11y.
10. Project structure (brief).
11. Roadmap / status.
12. License + credits.

**Repo hygiene:**
- Add `LICENSE` (MIT).
- Fill `package.json`: `description`, `keywords`, `author`, `repository`, `homepage`.
- Open Graph / social preview image (`app/opengraph-image`) + richer `metadata` in
  `layout.tsx` (title template, description, openGraph, twitter, metadataBase).
- Remove unused default Next SVGs in `public/` (file/globe/next/vercel/window).
- Fix stale README copy (provider-agnostic stage 2; mention streaming).
- Store README media under `docs/media/`.

## Track 2 — UI polish pass (`/impeccable` + `/ui-ux-pro-max`)

Builds on the overhaul; does not redo it.
- **Header:** a real wordmark/logo lockup (reuse the `icon.svg` mark) instead of text-only.
- **Footer:** GitHub link, "built by", and a "keys never stored" trust line.
- **Empty states:** branded placeholders for the Code and Init tabs before generation.
- **RegisterTable:** column sizing/density, mobile horizontal-scroll affordance, refined
  hover/focus and edited-state detailing.
- **ExtractProgress:** spacing/micro-detail refinement.
- **System consistency:** radii, shadows, focus-visible everywhere, motion timing.
- Final accessibility + Lighthouse pass (Perf ≥ 90, A11y ≥ 95, Best-Practices ≥ 95).

## Track 3 — In-app trust signals

A compact **"How it stays accurate"** explainer (you verify the extracted map; codegen is
deterministic and every line is cited to a datasheet page), placed where a first-time
visitor will see it (hero secondary content and/or footer).

## Verification

- Capture final screenshots + a short flow GIF from the polished build for the README.
- `npm run lint`, `npx tsc --noEmit`, `npm run test` (50 must stay green — no backend/codegen
  changes), `npm run build`.
- Lighthouse on the deployed build.
- README renders correctly on GitHub (relative media paths resolve).
