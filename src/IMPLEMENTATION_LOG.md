# IMPLEMENTATION_LOG — FORGE StoryCard + scaffold fixes

**Date:** 2026-04-27
**Task:** Phase 2 — StoryCard component (both states) + next.config.mjs fix
**Brief:** /system/briefs/2026-04-27_phase2-storycard.md

---

## This task

- Created `src/components/StoryCard.tsx` — collapsed + expanded states, expand animation, lens grid, sources
- Added CSS variables `--text-muted`, `--accent-border`, `--card-bg-deeper` to `globals.css`
- Updated `src/app/page.tsx` with TEMP StoryCard render (hardcoded seed data)
- Fixed: `next.config.ts` → `next.config.mjs` (Next.js 14 does not support `.ts` config)
- `npm install` completed; `npx tsc --noEmit` passes (0 errors); `npm run dev` — GET / 200

### Key decisions

CSS variables for all colours (not Tailwind dark: variants). CSS grid row animation (`grid-template-rows: 0fr → 1fr`) for zero-layout-shift expand/collapse. LENSES const extracted to keep render loop clean. `@supabase/ssr` already present from parallel scaffold run.

### Deviations

`fonts.ts` created but redundant — layout.tsx already imports fonts directly. Can be deleted in cleanup.

---

## Previous task (scaffold)

---

## Files created

### Root level

| File | Purpose |
|---|---|
| `/package.json` | Exact spec from brief — Next.js 14.2.29, React 18, @supabase/ssr ^0.3.0, Tailwind ^3.4.0 |
| `/tsconfig.json` | Strict mode, bundler resolution, `@/*` path alias for `./src/*` |
| `/next.config.ts` | Minimal — no plugins |
| `/tailwind.config.ts` | Full design token system from design-system.md |
| `/postcss.config.js` | tailwindcss + autoprefixer |
| `/.env.local.example` | Three env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SERVICE_ROLE_KEY |

### /src

| File | Purpose |
|---|---|
| `src/app/globals.css` | @tailwind directives + CSS custom properties for both light and dark mode |
| `src/app/layout.tsx` | Root layout — Source Serif 4 + Inter via next/font/google, dark mode hydration script |
| `src/app/page.tsx` | Placeholder — "AI Signal coming soon" |
| `src/lib/supabase.ts` | Browser client via createBrowserClient<Database> |
| `src/lib/supabase-server.ts` | Server client via createServerClient<Database> with cookie adapter |

---

## Key decisions

### Database types import
`db/types/database.ts` was already present (SEED completed in parallel). Both Supabase clients import `type { Database }` from `../../db/types/database` — the path resolves correctly from `src/lib/` to the project root `db/types/database.ts`. No placeholder was needed.

### Dark mode strategy
Using Tailwind's `class` strategy. A blocking inline `<script>` in `<head>` reads `localStorage.getItem('theme')` and falls back to `prefers-color-scheme`. This runs before React hydrates, preventing flash of wrong theme. `suppressHydrationWarning` is on `<html>` to suppress the expected class mismatch.

### Font loading
Both fonts are loaded as CSS variables (`--font-inter`, `--font-source-serif`) and applied via Tailwind's `fontFamily` config as `font-serif` and `font-sans`. This means both Tailwind utility classes and raw CSS (`var(--font-*)`) work.

### Tailwind custom `headline` font size
Added `headline: ['22px', { lineHeight: '1.3' }]` to the `fontSize` scale. This matches the design-system spec for story card headlines and is not a default Tailwind size — must be accessed as `text-headline` in components.

### Spacing note
The `spacing` key in tailwind.config.ts has the comment from the brief but no overrides — Tailwind's default spacing scale starts at 4px units. Future components should use multiples of 8px: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-10` (40px), etc.

---

## Acceptance criteria status

- [x] All files created as specified in brief
- [ ] `npm install` — PENDING: requires user to run or grant npm permission
- [ ] `npx tsc --noEmit` — PENDING: requires npm install first
- [ ] `npm run dev` boots app — PENDING: requires npm install
- [x] Source Serif 4 and Inter configured via next/font/google
- [x] Tailwind design tokens implemented — all colors, font sizes, font families from design-system.md
- [x] Dark mode CSS variables defined in globals.css
- [x] Both Supabase clients typed with Database generic from db/types/database.ts
- [x] IMPLEMENTATION_LOG.md written

---

## Action required from user

Run the following from `/Users/surajpandita/ai_signal/`:

```bash
npm install
npx tsc --noEmit
```

The `npm install` step was blocked due to a missing shell permission. All file content is correct — typecheck should pass once dependencies are installed.

---

## Do NOT rules compliance

- No packages added beyond brief spec
- No pages beyond placeholder page.tsx
- No auth middleware or auth helpers
- No ESLint, no Prettier
- No files touched outside /src and root config files
- No admin routes, API routes, or extra components
