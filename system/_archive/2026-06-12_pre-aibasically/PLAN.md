# AI Signal — Build Plan

Extracted from PRD section 11. One phase at a time. Never start N+1 on a broken N.

**Product pivot 2026-04-27:** Daily single signal, 24h expiry, subscriber-gated archive.
**Creative direction:** Signal numbers (not dates) as slugs and social currency. "No Signal" mechanic. Countdown as hero. Tomorrow tease on expiry.

---

## Build phases

| Phase | Description | Status | Started | Completed |
|---|---|---|---|---|
| Phase 0 | Setup — multi-agent workspace, root files, agent CLAUDE.md files | COMPLETE | 2026-04-27 | 2026-04-27 |
| Phase 1 | Schema + data layer + seed one daily signal | COMPLETE | 2026-04-27 | 2026-04-27 |
| Phase 2 | Story card component with both states (collapsed / expanded) | COMPLETE | 2026-04-27 | 2026-04-27 |
| Phase 3 | Issue page + homepage with Supabase fetch (delivered early by FORGE) | COMPLETE | 2026-04-27 | 2026-04-27 |
| Phase 4 | FOMO homepage — countdown hero, three states, SiteShell, SubscribeInput | IN_PROGRESS | 2026-04-27 | — |
| Phase 5 | Subscribe + onboarding role pick + subscriber archive gate | PENDING | — | — |
| Phase 6 | Admin compose tool — paste → Claude API draft → edit → 9 AM IST publish | PENDING | — | — |
| Phase 7 | Daily email pipeline (Resend/Postmark, 9 AM IST, streak counter in footer) | PENDING | — | — |

---

## Phase success criteria

**Phase 0 done when:** all CLAUDE.md files exist, STATE.md is accurate, VEIL design files populated, folder structure verified.

**Phase 1 done when:** Supabase migration runs cleanly, TypeScript types generated, seed data inserts one published signal (1 story), LENS review passes.

**Phase 2 done when:** StoryCard renders in both collapsed and expanded states with real seed data, dark + light mode verified, LENS and VEIL reviews pass.

**Phase 3 done when:** `/issue/[slug]` renders a signal (story card) from Supabase, homepage fetches latest published signal, LENS and VEIL pass.

**Phase 4 done when:**
- `/` — State A (active): countdown hero (`HH:MM:SS`) visible as hero element below wordmark, signal card renders, SubscribeInput below card
- `/` — State B (expired): headline visible in italic serif, `SIGNAL EXPIRED` label, tomorrow tease one-word, SubscribeInput with urgency copy
- `/` — State C (empty): `FIRST SIGNAL COMING SOON.` in mono, SubscribeInput
- `/` — State D (no signal day): `NO SIGNAL TODAY.` + one-line Suraj note explaining why
- `/signal/[number]` route using signal number as slug (e.g. `/signal/1`, `/signal/247`) — not date
- SiteShell: wordmark, tagline, footer with About + LinkedIn only (no archive link for non-subscribers)
- SignalGate: past signals show headline + drop date + gate CTA — no content, no blur
- LENS and VEIL pass

**Phase 5 done when:** email input → role pick → confirm → subscriber row in Supabase. Subscriber sees full archive at `/archive`. Non-subscriber sees headline list + gate. Streak counter seeded (subscribed_at → calculate streak server-side). LENS and VEIL pass.

**Phase 6 done when:** admin compose tool takes last 24h source newsletter text → Claude API → drafts summary + why-it-matters + three role lenses → editorial edit UI → publish button with 9 AM IST scheduling OR "Publish now". "No Signal Today" publish option with optional one-line note. LENS and VEIL pass.

**Phase 7 done when:** published signal at 9 AM IST triggers daily email to all active subscribers via Resend/Postmark. Email: full signal (headline + summary + why-it-matters + three lenses) + "Signal #N — You've read X signals in a row." in footer. Renders correctly in Gmail and Apple Mail. LENS passes.

---

## Creative mechanics (locked — baked into all briefs)

### Signal numbers, not dates
URL: `/signal/1`, `/signal/247`. Signal number is the primary identifier. Date is secondary metadata. Numbers create community memory ("I've been reading since Signal #1") and social currency ("Signal #247 on Gemini is the best take I've seen today").

### The countdown as hero
Homepage: large mono countdown (`14:32:07`) is the second thing a visitor sees, after the wordmark. Not a badge. The timer creates gravity around the content below it. Feels like a market close or a launch countdown — factual, authoritative, no drama.

### The "No Signal Today" mechanic
When nothing in AI news clears the editorial bar, Suraj publishes a typed "No Signal" — a single database entry with `status: 'no_signal'` and an optional `editor_note`. Homepage renders: `SIGNAL #248 — NO SIGNAL. Nothing cleared the bar today. That's a signal too.` Maintains the daily ritual without compromising on quality. Builds more trust than a weak pick.

### Tomorrow's tease on expiry
When today's signal expires (State B), the homepage shows a one-word category tease for tomorrow below the expired headline: `TOMORROW: MODELS` in mono. One word, category only — not a headline. Creates anticipation without spoiling the pick.

### "You've read N signals in a row" streak
In every email footer and in the subscriber archive, a factual note: `Signal #247 · You've read 12 signals in a row.` Not gamified — no badges, no points. Just a fact. People won't want to break the streak. Drives open rates without any dark pattern.

### Signal number as social currency
LinkedIn share format is pre-optimized: a signal that drops on a big news day gets referenced as "Signal #247 called it early on the Anthropic acquisition." The sequential number creates a citation system. Over time, "which signal was it that called X?" becomes searchable by number.

---

## URL routing (locked)

| Route | Description |
|---|---|
| `/` | Homepage — always today's signal (or expired/empty state) |
| `/signal/[number]` | Individual signal by sequential number |
| `/archive` | Subscriber-only archive — list of all signals |
| `/about` | About page |
| `/admin` | Admin compose tool (Phase 6, auth-gated) |

The old `/issue/[slug]` route stays in code until Phase 5 cleanup.
