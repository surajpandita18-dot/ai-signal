# Code Review — Phase 4 FOMO Homepage — 2026-04-27

## Verdict
CHANGES_NEEDED

## Critical (bugs / type errors / security)

- **SubscribeInput.tsx:14** — Email validation is insufficient. `type="email"` + HTML `required` catches gross malformations on the client but the `handleSubmit` guard only checks `if (!email)`. The current code calls `console.log('subscribe:', email)` and sets `submitted = true` without ever hitting an API route. The subscribe form is completely non-functional (no POST to `/api/subscribe` or any Supabase insert). This is a functional bug: users who submit their email silently get "You're in — check your inbox" with nothing actually recorded. Fix: either wire to a real API route, or make it explicit that this is a stub (but per FORGE hard rules, no placeholder/stub code is permitted).

- **SignalGate.tsx:58-59** — Gate copy is logically incorrect. The component is rendered when a signal **is still active** but the visitor is not a subscriber (per the component name and usage in `signal/[number]/page.tsx:62`). However the gate message reads "This signal has expired. Subscribers can access the full archive." The word "expired" is wrong — the signal is live but paywalled. This is a content/logic bug. Additionally the gate provides no actual access check — any visitor sees only the headline and a subscribe form, but there is no mechanism to show the full story to confirmed subscribers. If subscriber gating is deferred to a later phase, the misleading copy must still be corrected now.

- **page.tsx:79** — Unsafe cast `as Story | null`. `storiesData?.[0]` is typed by Supabase as the stories `Row` type already. The explicit cast to `Story | null` hides a potential mismatch if the select shape ever diverges. This same pattern repeats at `signal/[number]/page.tsx:35`. Use the generated type directly or type the variable at declaration rather than casting the value.

- **page.tsx:46** — Non-null assertion `issue.published_at!` on a column typed `string | null` (see `database.ts:17`). If a published issue somehow has a null `published_at`, `isWithin24h` calls `new Date(null).getTime()` which returns `0` (epoch), making the issue always appear expired. This same unsafe `!` appears at `page.tsx:63`, `signal/[number]/page.tsx:59`, `signal/[number]/page.tsx:77`. Fix: add an explicit guard `if (!issue.published_at) { /* handle */ }` after fetching the issue, before calling `isWithin24h`.

## Important (correctness / best practices)

- **ExpiryBadge.tsx:35** — When `remaining` is `null` (signal expired), the component returns `null` and renders nothing. However both `page.tsx` and `signal/[number]/page.tsx` render `<ExpiryBadge>` unconditionally in the active-signal branch. This is fine — but there is an SSR/hydration edge case: the server renders the initial `remaining` as `null` (initial state) until the `useEffect` fires. During the first paint the countdown is invisible, causing a layout shift. Fix: initialise state as `getRemaining(publishedAt)` inside a lazy initialiser, or accept the flash and add `suppressHydrationWarning` on the parent element.

- **ExpiryBadge.tsx:44** — `aria-hidden="true"` on the large countdown clock means screen readers skip the decorative number, which is intentional. However the label element at line 60 uses `aria-label="Today's signal — time remaining"` on a `<p>` tag, which has no implicit ARIA role. Screen readers will not announce this label. Use `<p role="status" aria-live="polite">` instead so updates are announced, or at minimum remove `aria-label` from the `<p>` (it is a no-op there) and rely on visible text.

- **SignalExpired.tsx** — No `'use client'` directive, which is correct (pure rendering, no hooks). However `new Intl.DateTimeFormat(...)` called at module scope (line 7) runs once on the server and is shared across all requests. This is safe for a static locale but will produce server-vs-client locale mismatches if the user's browser locale differs from the server locale. Not a blocker for Phase 4, but worth noting.

- **SignalGate.tsx** — Same `Intl.DateTimeFormat` at module scope note as above. Also: `SignalGate` imports `SubscribeInput` which is `'use client'`. Next.js handles this correctly (client component inside a server component), but the file itself has no directive comment. Adding `// Server Component` (comment, not a directive) improves readability for future engineers.

- **SiteShell.tsx** — No `'use client'` directive (correct — it is a server component). The `<a href="/about">` link should be `<Link href="/about">` from `next/link` for client-side navigation and prefetching. Using a plain `<a>` causes a full page reload on every footer click.

- **signal/[number]/page.tsx:53** — After `parseInt`, `isNaN(n)` check calls `notFound()` but TypeScript's control-flow does not narrow `n` as non-NaN after this point. This is safe at runtime, but the call to `fetchSignal(n)` at line 55 could technically receive `NaN` if the control-flow narrowing is ever refactored. A minor correctness note, not a blocker.

- **page.tsx and signal/[number]/page.tsx** — `isWithin24h` is defined identically in both files (verbatim duplication). Extract to a shared utility, e.g. `src/lib/signal-utils.ts`.

- **SubscribeInput.tsx:13-16** — `handleSubmit` only checks `if (!email)` before proceeding. The `type="email"` input with `required` provides browser-level validation but `e.preventDefault()` runs before any native validation fires in all major browsers. If JavaScript submits the form programmatically this guard is the only safety net. Add a simple regex check (e.g. `/.+@.+\..+/.test(email)`) as a belt-and-suspenders guard. More importantly: see Critical item — the form does nothing with the email.

## Nice to have (cleanup)

- **ExpiryBadge.tsx** — The `useEffect` dependency array `[publishedAt]` is correct. Good.
- **ExpiryBadge.tsx** — `setInterval` is properly cleaned up via `clearInterval(id)` in the return. No memory leak. Good.
- **database.ts** — Type file is clean, no `any` types, domain types are well separated. Good.
- **not-found.tsx** — Not wrapped in `SiteShell`. The layout (padding, max-width, background) is hand-duplicated. Consider wrapping in `SiteShell` for consistency.
- **SiteShell.tsx** — Inline styles are used throughout instead of Tailwind classes. This is consistent with the design system pattern used elsewhere in the codebase but diverges from the FORGE CLAUDE.md which references Tailwind CSS as the styling primitive. Acceptable for now but worth standardising.
- **SubscribeInput.tsx:67,84** — Inline `onFocus`/`onBlur` style mutations (direct DOM style assignment) are React anti-patterns. Prefer CSS `:focus-visible` or a state variable. Minor.

## Missing files

- `src/app/about/page.tsx` — The footer in `SiteShell.tsx` links to `/about`. This route does not exist. Visiting `/about` will hit the Next.js 404 page. Must be created before Phase 4 is considered complete.
- `src/app/api/subscribe/route.ts` — `SubscribeInput` has no API target. Without this route, the subscribe form silently swallows emails (they are never stored). This is the most user-facing gap in Phase 4.
