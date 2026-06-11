# Brief — Phase 4: FOMO Homepage + Site Layout

**Assigned to:** FORGE (/src/)
**Date:** 2026-04-27
**Phase:** 4 of 7

---

## Context — product pivot

The product is now a **daily single-story signal with a 24-hour expiry**. One story per day, gone after 24 hours, non-subscribers hit a gate on past signals. This phase builds the homepage FOMO mechanic and the global site shell. The `/issue/[slug]` route is being renamed to `/signal/[slug]` in this phase.

---

## Task

Redesign the homepage (`/`) with three possible states (active signal, expired, empty). Build the site shell (wordmark, tagline, footer). Rename the issue route to `/signal/[slug]`. Add the `ExpiryBadge` client component with live countdown.

---

## Files to create/edit

```
src/app/page.tsx                        (rewrite — FOMO homepage, three states)
src/app/signal/[slug]/page.tsx          (rename from issue/[slug]/page.tsx — copy, adjust)
src/app/signal/[slug]/not-found.tsx     (rename from issue/[slug]/not-found.tsx)
src/components/ExpiryBadge.tsx          (new — live countdown client component)
src/components/SignalExpired.tsx        (new — expired state)
src/components/SignalGate.tsx           (new — gated past signal for non-subscribers)
src/components/SiteShell.tsx            (new — wordmark + tagline + footer wrapper)
src/components/SubscribeInput.tsx       (new — email subscribe input, reusable)
src/IMPLEMENTATION_LOG.md               (overwrite)
```

Keep the old `/issue/[slug]` files — do not delete them yet. Just add the `/signal/[slug]` route as the new canonical path.

---

## Homepage states

### State A — active signal (within 24h window)

Logic: `latestSignal.published_at + 24h > now()`.

Layout (max-width 720px, centered, padding 48px 24px):

```
<SiteShell>
  <ExpiryBadge publishedAt={signal.published_at} />
  <StoryCard story={stories[0]} position={1} />
  <SubscribeInput label="Get tomorrow's signal in your inbox." />
</SiteShell>
```

### State B — between signals (past 24h, no new signal)

Logic: `latestSignal` exists but `published_at + 24h <= now()`.

```
<SiteShell>
  <SignalExpired headline={signal.stories[0].headline} publishedAt={signal.published_at} />
  <SubscribeInput label="Tomorrow's signal drops at 9 AM IST. Subscribe to be first." />
</SiteShell>
```

### State C — no signal published yet

Logic: `latestSignal` is null.

```
<SiteShell>
  <p className="font-mono" style={{ fontSize: '11px', ... }}>FIRST SIGNAL COMING SOON.</p>
  <SubscribeInput label="Be first when we launch." />
</SiteShell>
```

---

## SiteShell component

```typescript
// src/components/SiteShell.tsx
// Server component — no 'use client'

interface SiteShellProps {
  children: React.ReactNode
}
```

Layout:

```
<div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '48px 24px' }}>
  <div style={{ maxWidth: '720px', margin: '0 auto' }}>

    {/* Wordmark + tagline */}
    <div style={{ marginBottom: '40px' }}>
      <p className="font-mono" style={{
        fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '8px'
      }}>
        AI Signal
      </p>
      <p className="font-mono" style={{
        fontSize: '11px', fontWeight: 400, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--text-secondary)'
      }}>
        One story. Every day. Gone in 24 hours.
      </p>
    </div>

    {/* Page content */}
    {children}

    {/* Footer */}
    <footer style={{ marginTop: '64px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: '24px' }}>
        <a href="/about" className="font-mono" style={{
          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--text-secondary)', textDecoration: 'none'
        }}>About</a>
        <a href="https://linkedin.com/in/surajpandita" target="_blank" rel="noopener noreferrer"
          className="font-mono" style={{
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em',
            color: 'var(--text-secondary)', textDecoration: 'none'
          }}>LinkedIn ↗</a>
      </div>
    </footer>

  </div>
</div>
```

---

## ExpiryBadge component

```typescript
// 'use client' — uses setInterval for live countdown
'use client'
import { useState, useEffect } from 'react'

interface ExpiryBadgeProps {
  publishedAt: string  // ISO string
}
```

Logic:
- `expiresAt = new Date(publishedAt).getTime() + 24 * 60 * 60 * 1000`
- `remaining = expiresAt - Date.now()`
- Format as `HH H MM M` (e.g. `14H 32M`)
- Update every 60 seconds via `setInterval`
- If `remaining <= 0`, show nothing (parent will switch to SignalExpired state via server)

Rendered text: `TODAY'S SIGNAL — EXPIRES IN 14H 32M`

Styles:
```
font-mono, fontSize: '11px', fontWeight: 500, textTransform: 'uppercase',
letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '32px'
```

No animation. No color change. No pulsing. `aria-hidden="true"` on the countdown span — parent `<p>` has `aria-label="Today's signal"`.

---

## SignalExpired component

```typescript
// Server component
interface SignalExpiredProps {
  headline: string
  publishedAt: string
}
```

Layout:
```
<div style={{ marginBottom: '32px' }}>
  <p className="font-mono" style={{ fontSize: '11px', ...uppercase, text-secondary, marginBottom: '12px' }}>
    Signal Expired · {formattedDate}
  </p>
  <p className="font-serif" style={{ fontSize: '22px', lineHeight: 1.3, fontStyle: 'italic', color: 'var(--text-primary)' }}>
    {headline}
  </p>
</div>
```

No link on the headline for non-subscribers. No card. No border. Inline on page background.

---

## SubscribeInput component

```typescript
// 'use client' — handles form submission
'use client'
interface SubscribeInputProps {
  label: string
}
```

Layout:
```
<form style={{ marginTop: '32px' }} onSubmit={handleSubmit}>
  <p className="font-sans" style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
    {label}
  </p>
  <div style={{ display: 'flex', gap: '8px', maxWidth: '480px' }}>
    <input
      type="email"
      placeholder="your@email.com"
      required
      style={{
        flex: 1, border: '1px solid var(--border)', backgroundColor: 'var(--background)',
        color: 'var(--text-primary)', fontSize: '15px', padding: '8px 12px',
        borderRadius: '4px', outline: 'none'
      }}
    />
    <button type="submit" style={{
      border: '1px solid var(--border)', backgroundColor: 'transparent',
      color: 'var(--text-primary)', fontSize: '13px', padding: '8px 16px',
      borderRadius: '4px', cursor: 'pointer'
    }}>
      Subscribe
    </button>
  </div>
</form>
```

Phase 4: `handleSubmit` logs to console and shows a "You're in — check your inbox." text. Real Supabase write comes in Phase 5.

Focus ring: `onFocus`/`onBlur` on input and button sets `boxShadow: '0 0 0 2px var(--accent)'` / `'none'`.

---

## Signal page (/signal/[slug])

Copy `/src/app/issue/[slug]/page.tsx` to `/src/app/signal/[slug]/page.tsx`. Change:
- Import path for database types (already correct)
- Route used in `not-found.tsx` (`/signal/[slug]`)
- Wrap content in `<SiteShell>` instead of raw `<main>`
- Add `<ExpiryBadge publishedAt={issue.published_at!} />` above the StoryCard if within 24h
- Remove the `AI Signal · Issue #N` monoline — that's now in SiteShell wordmark
- Remove `<IssueHeader>` — for Phase 4 the signal page shows ExpiryBadge + StoryCard only (clean, minimal)
- Remove `<LongRead>` footer — deferred for now (daily single story has no "long read of the week" concept)

Expiry check: within `/signal/[slug]/page.tsx`:
```typescript
const now = Date.now()
const expiresAt = new Date(issue.published_at!).getTime() + 24 * 60 * 60 * 1000
const isActive = expiresAt > now
```
If `!isActive` and no subscriber session: render `<SignalGate>` instead of StoryCard.

---

## SignalGate component (Phase 4 stub)

```typescript
// Server component
interface SignalGateProps {
  headline: string
  publishedAt: string
}
```

Layout:
```
<div style={{ marginBottom: '32px' }}>
  <p className="font-mono" style={{ fontSize: '11px', ...uppercase, text-secondary, marginBottom: '12px' }}>
    Signal · {formattedDate}
  </p>
  <p className="font-serif" style={{ fontSize: '22px', lineHeight: 1.3, color: 'var(--text-primary)', marginBottom: '24px' }}>
    {headline}
  </p>
  <p className="font-sans" style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
    This signal has expired. Subscribers can access the full archive.
  </p>
  <SubscribeInput label="Join to access the archive." />
</div>
```

No card treatment. No blur effect on hidden content. No content is rendered and then hidden — it is simply not fetched.

---

## Expiry computation helper

Create a simple utility (not a separate file — inline in page.tsx):

```typescript
function isWithin24h(publishedAt: string): boolean {
  return Date.now() < new Date(publishedAt).getTime() + 24 * 60 * 60 * 1000
}
```

---

## Acceptance criteria

- [ ] Homepage State A: ExpiryBadge visible with countdown, StoryCard renders, SubscribeInput below
- [ ] Homepage State B: SignalExpired renders correctly when signal is > 24h old (test by passing old date to seed)
- [ ] Homepage State C: "FIRST SIGNAL COMING SOON." renders when no published signal
- [ ] `/signal/[slug]`: renders signal within 24h window with ExpiryBadge
- [ ] `/signal/[slug]`: renders SignalGate for expired signal (non-subscriber path)
- [ ] SiteShell: wordmark, tagline, footer with About + LinkedIn links
- [ ] Footer: no archive link, no nav menu
- [ ] ExpiryBadge: countdown live-updates (verify with DevTools — interval fires)
- [ ] SubscribeInput: focus ring visible on input and button; console.log on submit (Phase 4 stub)
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] No hard-coded colors anywhere — all CSS variables
- [ ] IMPLEMENTATION_LOG.md written

---

## Do NOT

- Do not delete `/src/app/issue/[slug]/` — keep it for now, just add the new `/signal/[slug]/` route
- Do not add navigation header (hamburger menu, nav links) — wordmark + footer only
- Do not add a subscribe modal, popup, or exit intent
- Do not implement real Supabase writes for the subscribe form — Phase 5
- Do not add loading.tsx or Suspense — not needed
- Do not add ISR or revalidation
- Do not add any new npm dependencies
- Do not put the archive link in the footer — subscriber-only, Phase 5
- Do not add `<IssueHeader>` or `<LongRead>` to the signal page — those are removed in this pivot
- Do not use `transition: all` — targeted transitions only
- Do not add animation to ExpiryBadge — it is static text that changes value, not animated
