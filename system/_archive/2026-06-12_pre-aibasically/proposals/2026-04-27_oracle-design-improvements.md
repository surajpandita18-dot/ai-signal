# ORACLE Proposal — Design Improvements + Missing Phase 4 Items
Date: 2026-04-27

---

## Critical fixes (must ship before Phase 5)

### 1. ExpiryBadge.tsx — countdown aria-hidden is backwards
The large countdown number has `aria-hidden="true"` and the accessible label is on the smaller human-readable line below. This means screen readers announce "Today's signal — expires in 14h 32m" while sighted users get the dominant `14:32:07` visual. Both should be part of one accessible unit, or the aria strategy should be inverted: remove aria-hidden from the countdown, add `aria-live="polite"` so assistive technology tracks the live region, and remove the redundant human-readable duplicate.
- **File:** `src/components/ExpiryBadge.tsx` lines 52–54
- **Fix:** Remove `aria-hidden="true"` from the countdown `<p>`. Add `aria-live="polite"` and `aria-label` directly on that element (e.g. `aria-label="Signal expires in ${h} hours ${m} minutes"`). Remove the second human-readable paragraph entirely — the countdown IS the label.

### 2. page.tsx — State D (No Signal Today) is completely absent
The homepage only handles State A (active), State B (expired), and State C (nothing published). State D — `status: 'no_signal'` — is specified in both PLAN.md Phase 4 success criteria and the PLAN.md creative mechanics section. Currently if a `no_signal` status record exists, it falls through to the State A path and crashes or renders an empty card.
- **File:** `src/app/page.tsx`
- **Fix:** After fetching the latest published issue, check `issue.status === 'no_signal'` before calling `isWithin24h`. Render: `SIGNAL #N — NO SIGNAL.` in mono (11px, uppercase), followed by `issue.editor_note` if present, followed by SubscribeInput. This is also needed in `src/app/signal/[number]/page.tsx` for direct signal URLs.

### 3. SignalExpired.tsx — "Tomorrow's tease" is missing the one-word category
PLAN.md Phase 4 success criteria explicitly requires: "tomorrow tease one-word" in State B. The component renders only "Tomorrow's signal drops at 9 AM IST" — the one-word category tease (`TOMORROW: MODELS`) is completely absent. This is a Phase 4 acceptance criterion, not an enhancement.
- **File:** `src/components/SignalExpired.tsx`
- **Fix:** Add an optional `tomorrowCategory?: string` prop. When present, render above the "Tomorrow's signal drops at 9 AM IST" line: `TOMORROW: {tomorrowCategory.toUpperCase()}` in the same mono style. Pass this from `page.tsx` (can be null until Phase 6 admin tool populates it — that's acceptable, field can be null in the issues table). The issues schema needs a `tomorrow_category` column (coordinate with SEED).

### 4. layout.tsx — metadata description is stale v1 copy
The `description` in metadata reads: "One clean digest of the week's AI news. No overlap. Read in 5 minutes." This is old v1 positioning — AI Signal is not a weekly digest. Incorrect metadata will appear in Google results and social link previews.
- **File:** `src/app/layout.tsx` line 21
- **Fix:** Update to: `"One story. Every day. Gone in 24 hours."` — the locked one-liner from PRD section 1.

### 5. globals.css — `--card-bg-deeper` is used in StoryCard but not defined in design-system.md
`StoryCard.tsx` references `var(--card-bg-deeper)` for the "why it matters" block background. This variable exists in `globals.css` with a value (`#EAE7DF` light / `#131311` dark) but is not documented in `design/design-system.md`. This creates a hidden colour that sits outside the stated three-colour system. The dark mode value `#131311` is visually close to the background and risks the "why it matters" block disappearing in dark mode.
- **File:** `src/app/globals.css` + `design/design-system.md`
- **Fix:** Either (a) remove `--card-bg-deeper` and use `var(--card-bg)` for the why-it-matters block background (the 3px accent left-border is already sufficient differentiation, per design-system.md spec), or (b) formally add `card-bg-deeper` to design-system.md colour table and verify contrast in dark mode. Option (a) is simpler and stays within the three-colour constraint.

---

## Design improvements (ORACLE proposals)

### 6. SiteShell.tsx — wordmark uses font-mono, should use font-serif or be clearly typographically dominant
The wordmark "AI Signal" is rendered in `font-mono` at 13px with `letterSpacing: '0.14em'` — the same treatment as a metadata label. The wordmark is the FIRST thing a visitor sees (per PRD 4.1). At 13px mono it reads as a small nav label, not a publication masthead. Pragmatic Engineer and Stratechery both have clear typographic authority in their wordmarks.
- **File:** `src/components/SiteShell.tsx` lines 14–25
- **Fix:** Increase wordmark to `font-mono` at `17px` or `20px`, `fontWeight: 700`, `letterSpacing: '0.10em'`. Mono is acceptable for the wordmark (it supports the "signal / data / precision" brand voice), but the size needs to be authoritative. The tagline below stays at 11px — this creates appropriate hierarchy: large wordmark → small tagline → large countdown → content.

### 7. StoryCard.tsx — "Why it matters" label uses font-mono, body uses font-sans — label-body pairing is correct but the label text "Why it matters" is sentence-case, not uppercase
Minor inconsistency: every other metadata label in the system is uppercase (`MODELS · 3 MIN READ`, `FOR PMS`, `SOURCES`, etc.) but the "Why it matters" label on line 98 is title-case. The `textTransform: 'uppercase'` CSS already handles this visually, so it's cosmetically fine — but the source text should match convention for maintainability.
- **File:** `src/components/StoryCard.tsx` line 98
- **Fix:** Change string from `Why it matters` to `WHY IT MATTERS` (CSS already uppercases it, but source should match).

### 8. StoryCard.tsx — lens cards use -webkit-line-clamp: 3 which may truncate critical two-line takes
PRD 4.5 specifies "Two-line take per lens." The current implementation clamps at 3 lines which is fine as a max, but the `-webkit-box` + `-webkit-line-clamp` approach only works in WebKit-derived browsers. More importantly, if the lens copy is long it gets silently truncated with no "read more" affordance, which is especially bad for the active (highlighted) user role.
- **File:** `src/components/StoryCard.tsx` lines 186–194
- **Fix:** Remove the `-webkit-line-clamp` entirely from lens cards. The lenses are inside an already-gated expand section; truncation adds no value there. Let the text flow naturally. The constraint on lens copy length should be enforced at the content/admin level (2 sentences max), not via CSS clipping.

### 9. SubscribeInput.tsx — submit handler is a console.log stub with no real API call
The form submission does `console.log('subscribe:', email)` and immediately sets `submitted: true`, giving the user a false "You're in" confirmation with no data written anywhere.
- **File:** `src/components/SubscribeInput.tsx` lines 13–17
- **Fix (Phase 5 prerequisite):** Replace the stub with a call to a `/api/subscribe` route that writes to the `subscribers` table. Until Phase 5 is built, at minimum remove the false "You're in" confirmation — show a neutral "We'll be in touch soon" or keep the button disabled until the API route exists. False confirmation is a trust failure.

### 10. SiteShell.tsx — no signal number displayed in header area
PLAN.md creative mechanics (locked): "Signal numbers as social currency." Currently nowhere in the SiteShell or ExpiryBadge is the signal number surfaced to visitors on State A. The `/signal/[number]` page has it in the browser tab title (via `generateMetadata`), but the visible UI on both homepage and signal page omits it.
- **File:** `src/components/ExpiryBadge.tsx` (or a new wrapper in `SiteShell`)
- **Fix:** Add `signalNumber: number` prop to `ExpiryBadge`. Render `SIGNAL #1` as a small mono label (11px, uppercase) above the large countdown. This is one line, costs nothing, and delivers the signal-as-citation mechanic the product is built on.

### 11. StoryCard.tsx — "Go deeper" button alignment
The expand button is `justifyContent: 'flex-end'` — right-aligned. Left-alignment is more consistent with editorial publications (Pragmatic Engineer, Stratechery). Right-aligned CTAs read as e-commerce (add to cart). This is a minor editorial-feel issue.
- **File:** `src/components/StoryCard.tsx` line 114
- **Fix:** Change `justifyContent: 'flex-end'` to `justifyContent: 'flex-start'`. The button reads naturally as the next action in a top-to-bottom reading flow.

---

## Missing Phase 4 items

### M1 — State D: "No Signal Today" rendering
- **What's missing:** Homepage and signal page have no branch for `issue.status === 'no_signal'`. The PLAN.md spec requires: `SIGNAL #N — NO SIGNAL. Nothing cleared the bar today. That's a signal too.` with optional `editor_note`.
- **Files to create/edit:**
  - `src/app/page.tsx` — add `status === 'no_signal'` branch after issue fetch
  - `src/app/signal/[number]/page.tsx` — same branch
  - `db/migrations/` — verify `issues.status` enum includes `'no_signal'` (check with SEED)

### M2 — Tomorrow's tease: one-word category on State B
- **What's missing:** `SignalExpired.tsx` shows "Tomorrow's signal drops at 9 AM IST" but not `TOMORROW: MODELS`. The PLAN.md Phase 4 success criteria requires this.
- **Files to create/edit:**
  - `src/components/SignalExpired.tsx` — add `tomorrowCategory?: string` prop + conditional render
  - `src/app/page.tsx` — pass `tomorrow_category` from issue data (null safe)
  - `db/migrations/` — `issues` table needs `tomorrow_category text nullable` column (coordinate with SEED)

### M3 — Signal number as social currency in visible UI
- **What's missing:** Signal number is in page `<title>` metadata but not visible anywhere in the rendered UI on the homepage (State A) or the signal page. PLAN.md creative mechanics explicitly state this is a locked mechanic.
- **Files to create/edit:**
  - `src/components/ExpiryBadge.tsx` — add `signalNumber` prop, render `SIGNAL #N` above countdown
  - `src/app/page.tsx` — pass `issue.issue_number` to ExpiryBadge
  - `src/app/signal/[number]/page.tsx` — same

### M4 — /about page does not exist
- **What's missing:** `src/app/about/` directory and `page.tsx` do not exist. The footer links to `/about` (SiteShell.tsx line 53) which currently 404s.
- **Files to create:**
  - `src/app/about/page.tsx` — static server component, SiteShell wrapper, content: why AI Signal exists, how curation works, source newsletters credited, contact. Single column, max 720px, all text — no hero images, no grid. PRD 4.4 defines the content scope.

### M5 — No "SIGNAL EXPIRED" label in State B
- **What's missing:** PRD 4.1 State B explicitly calls for `SIGNAL EXPIRED` in mono as the primary label. `SignalExpired.tsx` renders `Signal #N · [date] · Expired` as the label. The word "Expired" is buried at the end of a metadata string, not treated as the headline status it should be.
- **Files to edit:**
  - `src/components/SignalExpired.tsx` — split into two separate lines: (1) `SIGNAL EXPIRED` at `fontSize: '13px'`, `fontWeight: 600`, `letterSpacing: '0.12em'`, and (2) `SIGNAL #N · {date}` as the secondary metadata line below it.

---

## What's working well (keep)

- **ExpiryBadge.tsx countdown size** — 48px, fontWeight 300 is correctly authoritative without being loud. The weight 300 creates the right "factual readout" tone (like a Bloomberg terminal, not a sale countdown timer). Keep exactly as-is.
- **StoryCard.tsx expand animation** — CSS `grid-template-rows: 0fr → 1fr` with `150ms ease` is the correct no-layout-shift approach. Matches design-system.md spec exactly. Keep.
- **globals.css colour tokens** — all CSS variables match design-system.md values precisely. Light and dark mode both correctly specified. Three-colour constraint honoured (modulo the `card-bg-deeper` issue above).
- **StoryCard.tsx "why it matters" block** — 3px accent left-border, accent background, correct padding 12px. Matches design-system.md component surface rules exactly.
- **SiteShell.tsx footer** — About + LinkedIn only, no archive link. Correct per PRD 4.1. Font mono 11px uppercase is right.
- **layout.tsx font loading** — Source Serif 4 with weights 400/600/700, Inter, both loaded via `next/font/google` with CSS variables. Correct approach, no FOIT risk.
- **SubscribeInput.tsx layout** — single line, no modal, max-width 480px, minimal placeholder. The interaction model is exactly right per PRD 5 and design-system.md. Only the backend stub needs replacing.
- **page.tsx Supabase fetch** — server component, single query, no unnecessary data (only fetches headline for State B, full story for State A). Efficient and correct.
