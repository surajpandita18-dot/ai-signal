# IMPLEMENTATION_LOG — FORGE Fix Pass + Distribution Layer

**Date:** 2026-04-27
**Task:** LENS/VEIL/ORACLE fixes + ExpiryBadge redesign + OG meta + robots/sitemap

---

## Files created

- `src/lib/utils.ts` — shared `isWithin24h(publishedAt)` utility
- `src/app/about/page.tsx` — static About page: server component, max-720px centred, Back link, three content paragraphs
- `src/app/api/subscribe/route.ts` — POST subscribe API: email validation, Supabase insert, 23505 duplicate handled as success
- `src/app/robots.ts` — Next.js robots route, allows all, points to sitemap
- `src/app/sitemap.ts` — dynamic sitemap: homepage + about + all published signal pages

## Files edited

- `src/components/ExpiryBadge.tsx` — Removed 48px clock entirely. Now single text line: `SIGNAL #N — EXPIRES IN 14H 32M`. Updates every 60s (not 1s). SSR-safe init with empty string. No visual clock.
- `src/components/SignalExpired.tsx` — `tomorrowCategory` optional prop; tomorrow copy `font-sans 15px` sentence case; category tease line if provided
- `src/components/SignalGate.tsx` — Gate copy updated: "This signal is in the archive. Subscribe to read past signals."
- `src/components/SubscribeInput.tsx` — Real `fetch('/api/subscribe')`; email regex; success: "You're subscribed. First signal at 9 AM IST."; loading/error states; focus rings via state
- `src/components/SiteShell.tsx` — `/about` → Next.js `<Link>`; LinkedIn stays `<a target="_blank">`
- `src/app/page.tsx` — Static `export const metadata` for homepage OG; `isWithin24h` imported from utils; State D (`no_signal`) added; null guards on `published_at`
- `src/app/signal/[number]/page.tsx` — `generateMetadata` expanded with full OG + Twitter cards per signal; `isWithin24h` from utils; `no_signal` handling; null guards
- `db/types/database.ts` — `'no_signal'` added to issues status union (Row/Insert/Update)

## Key decisions

- ExpiryBadge: text-only matches PRD spec and design principles ("no animation, no pulsing"). 60s interval is sufficient for HH MM display.
- OG meta: signal page uses story headline + summary as og:title/description — makes LinkedIn shares self-contained and compelling.
- Sitemap: signal pages get `changeFrequency: 'never'` — once published, content doesn't change.
- robots.ts + sitemap.ts use Next.js 14 built-in Metadata API (no new dependencies).

## Typecheck

`npx tsc --noEmit` — 0 errors
