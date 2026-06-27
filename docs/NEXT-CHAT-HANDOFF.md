# RegForge — Handoff for the next chat (v3 frontend redesign)

**Paste this whole file into the new chat as your first message.**

## Who/where
- Project: **RegForge** — a Next.js 16 web app that turns a sensor datasheet PDF into a working C driver (extract register map → verify → generate header/driver/cited init sequence).
- Working dir: `C:/Users/anil1/Downloads/Driver` (Windows, PowerShell + Git Bash, Node 24). Own git repo, main branch `master`.
- Read `AGENTS.md` first — this is **Next.js 16 with breaking changes**; consult `node_modules/next/dist/docs/` before using unfamiliar Next APIs.

## Infra (DONE)
- **GitHub:** connected. Remote `origin` = **https://github.com/PiyushPapaya/RegForge** (public). `master` is pushed. Pushing `feat/regforge-v3` later will go to the same remote. `gh` is authenticated as `PiyushPapaya`.
- **Vercel:** the user imports `PiyushPapaya/RegForge` at vercel.com/new and sets env vars in the Vercel UI (`GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Auto-deploys on push to `master`. **`@vercel/analytics` is already installed and `<Analytics/>` is in `src/app/layout.tsx`** — preserve it through the v3 redesign.

## Current state (all committed + pushed on `master`)
- **v1** (datasheet→driver MVP) and **v2** (multi-provider LLM Anthropic/OpenAI/Gemini + cockpit UI) are DONE and merged.
- **45 vitest tests pass · `tsc` clean · `npm run lint` 0 errors · `npm run build` succeeds.**
- `.env.local` (gitignored) already has a working **`GEMINI_API_KEY`** (model `gemini-2.5-flash`) and **Supabase** fully wired (`extractions` table exists, connection verified). Example gallery is empty until rows are marked `is_example=true`.

## YOUR TASK: build v3 (premium frontend redesign)
- **Approved spec:** `docs/superpowers/specs/2026-06-27-regforge-v3-premium-frontend-design.md`
- **Implementation plan (19 tasks, full code in each):** `docs/superpowers/plans/2026-06-27-regforge-v3-premium-frontend.md`
- **Execute it with the `subagent-driven-development` skill** (fresh subagent per task/group, review the committed diff between groups, rely on each task's gate). This is how v1/v2 were built.

### Hard rules for v3
1. **Frontend ONLY.** Do NOT modify `src/app/api/**`, `src/lib/llm/**`, `src/lib/generate/**`, `src/lib/extract/**`, `src/lib/schema/**`, or `src/lib/stages.ts`. The 45 existing tests must stay green.
2. Work on a NEW branch **`feat/regforge-v3`** (plan Task 1 creates it + installs `gsap`). Do NOT work on `master`.
3. **Preserve `<Analytics/>`** in `src/app/layout.tsx` when restyling (plan Task 2 only edits the `metadata` object — keep the `@vercel/analytics/next` import + component).
4. Go task by task in order; group tightly-coupled tasks into focused subagents; review the diff between groups.
5. v3 = modern dev-tool-premium look (near-black, phosphor-green primary + steel-blue secondary), a **hero that morphs into the two-pane cockpit**, framer-motion micro-motion + GSAP signature beats, all `prefers-reduced-motion` guarded.
6. Commit messages end with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

### Finish (plan Task 19)
Run full gates, do a live visual pass with `npm run dev` (drop a real datasheet PDF — Gemini free tier is rate-limited/flaky, retry on 429/503), then merge `feat/regforge-v3` → `master` via the `finishing-a-development-branch` skill. Pushing `master` will auto-deploy to Vercel.

## Reminders for the user (mention, don't block on)
- **Rotate the `sb_secret_...` Supabase key** — it was shared in plaintext in an earlier chat — then update `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` AND in Vercel.
- Repo is **public**; flip to private with `gh repo edit --visibility private` if desired (no secrets are tracked).
- Optional Claude plugin the user may add themselves: `npx plugins add vercel/vercel-plugin`.

## First moves in the new chat
1. Read `AGENTS.md`, the v3 spec, and the v3 plan.
2. Invoke the `subagent-driven-development` skill.
3. Start at plan Task 1 (branch `feat/regforge-v3` + `npm install gsap`).
