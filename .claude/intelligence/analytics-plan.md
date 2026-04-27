# AI Signal — PostHog Analytics Plan

**Status:** Implementation target — Phase 4 (homepage redesign + auth live)
**PostHog tier:** Free (1M events/month)
**Instrumentation constraint:** No autocapture. Every event is intentional.

---

## Event Taxonomy

### Naming convention

`{noun}_{verb}` — lowercase, underscore-separated.
Never use vague verbs: ~~viewed~~, ~~interacted~~, ~~engaged~~.
Use specific verbs: `read`, `clicked`, `saved`, `dismissed`, `subscribed`, `shared`.

### Already implemented (Phase 1)

These 3 events are live in `lib/analytics.ts`. Do not add new events without updating this plan and the spec.

| Event | Properties | Trigger |
|---|---|---|
| `signal_saved` | `signal_id` | User clicks ♡ on Zone 1 signal |
| `signal_dismissed` | `signal_id` | User clicks ✕ on Zone 1 signal |
| `upgrade_clicked` | `location: "nav" \| "zone1_gate" \| "article"` | Any upgrade CTA click |

---

## Phase 4 Events to Implement

### Acquisition

| Event | Properties | Trigger | Why it matters |
|---|---|---|---|
| `page_viewed` | `page: "home" \| "article" \| "upgrade" \| "saved"` | Route change (client-side) | Funnel entry tracking — where users land |
| `signal_clicked` | `signal_id`, `zone: "zone1" \| "zone2"`, `position: number`, `impact_level: string` | Click on any signal title or "Read →" | Zone 1 vs Zone 2 engagement ratio; position decay curve |
| `signal_shared` | `signal_id`, `zone: "zone1" \| "zone2"`, `method: "copy_link" \| "tweet"` | User copies link or clicks share | Viral loop tracking — technical founders share on Twitter/X |

### Activation

| Event | Properties | Trigger | Why it matters |
|---|---|---|---|
| `first_signal_read` | `signal_id`, `time_to_first_click_seconds: number` | First `signal_clicked` in a session, first-ever visit only | Measures time-to-value; activation speed |
| `zone1_fully_read` | `signals_visible: number` | User scrolls past all Zone 1 signals (intersection observer on last signal) | Proxy for "got the full brief" — deeper activation |
| `digest_subscribed` | `email_domain` (domain only, not full email) | Email form submit on digest page | Email channel activation |

### Retention

| Event | Properties | Trigger | Why it matters |
|---|---|---|---|
| `day1_return` | `hours_since_first_visit: number` | Second session within 24hr of first | Early retention signal |
| `day3_return` | `days_since_first_visit: number` | Session on day 2 or 3 | Habit formation proxy |
| `day7_return` | `days_since_first_visit: number` | Session on day 6 or 7 | Retained user confirmation |

**Implementation note:** `day1/3/7_return` events are fired client-side by checking `localStorage.getItem("aiSignal_firstVisit")` timestamp on session start. No server-side session tracking needed for MVP.

---

## Aha Moment Definition

**Aha moment = user has understood the product's core value.**

AI Signal has two aha moment proxies:

### Aha 1 — Activation: Signal depth

> User reads 3 Zone 1 signals in a single session
> = they trusted the curation enough to go deep, not just skim

**Implementation:** Count `signal_clicked` events where `zone = "zone1"` in a single session. Fire `aha_activation` when count reaches 3.

```
Event: aha_activation
Properties:
  - signals_read: number
  - session_duration_seconds: number
  - had_takeaway_visible: boolean (were LLM fields populated?)
```

### Aha 2 — Retention: Day 2 return

> User returns without being reminded
> = product earned a place in their routine

**Implementation:** When `day1_return` fires, also fire `aha_retained`.

```
Event: aha_retained
Properties:
  - hours_since_first_visit: number
  - signals_saved_count: number (from localStorage)
  - upgrade_clicked_ever: boolean
```

---

## Cohorts

### ICP cohort (optimize for)

**Cohort name:** `icp-cohort`

Conditions (ANY match):
- `upgrade_clicked` fired at least once
- `signal_saved` fired 3+ times
- `day3_return` fired

**Use for:** All A/B tests. Conversion analysis. Pricing experiments.

### Wrong-user cohort (exclude from optimization)

**Cohort name:** `wrong-user-cohort`

*(Full definition in `.claude/personas/wrong-user.md`)*

Conditions (ALL match):
- `session_duration > 480s`
- `signal_saved = 0`
- `upgrade_clicked = 0`
- `return_visit_count < 3` in 30 days

**Use for:** Content signal analysis only. Never for A/B tests or product decisions.

---

## Weekly Metrics Review Template

Run every Monday morning. Takes ~15 minutes.

### 1. Acquisition (answer: are the right people finding us?)

| Metric | This week | Last week | Threshold | Action if below |
|---|---|---|---|---|
| New visitors | | | — | — |
| `page_viewed` — home | | | — | — |
| `first_signal_read` median (seconds) | | | < 120s | Improve Zone 1 signal quality or title clarity |
| Bounce rate (home, no `signal_clicked`) | | | < 60% | Zone 1 first signal not compelling |
| `signal_shared` rate (% of `signal_clicked`) | | | > 5% | Signals not share-worthy — quality or framing issue |

### 2. Activation (answer: do users understand the product in one session?)

| Metric | This week | Last week | Threshold | Action if below |
|---|---|---|---|---|
| `aha_activation` rate (% of new visitors) | | | > 25% | Zone 1 signals too low-quality or LLM fields not populated |
| `zone1_fully_read` rate | | | > 40% of visitors who scroll | Too many Zone 1 signals OR weak signal #3–5 |
| `first_signal_read` → `signal_saved` conversion | | | > 10% | TAKEAWAY quality or blur gate too aggressive |

### 3. Retention (answer: is the product earning a daily habit?)

| Metric | This week | Last week | Threshold | Action if below |
|---|---|---|---|---|
| `day1_return` rate | | | > 30% | No email hook yet (Phase 5), increase signal quality |
| `day3_return` rate | | | > 20% | Habit not forming — check if Zone 1 refreshes daily |
| `day7_return` rate | | | > 10% | Target for email digest launch trigger |
| `aha_retained` rate | | | > 15% of new visitors | |

### 4. Revenue signals (answer: is free→paid intent building?)

| Metric | This week | Last week | Threshold | Action if below |
|---|---|---|---|---|
| `upgrade_clicked` total | | | — | — |
| `upgrade_clicked` by location | nav / zone1_gate / article | | `zone1_gate` should be highest | If nav > zone1_gate: blur gate not driving intent |
| `signal_saved` per ICP-cohort user | | | > 3 saves/user/week | Save feature not sticky — improve saved page |

### 5. Wrong-user hygiene (answer: are we accidentally optimizing for the wrong user?)

- `wrong-user-cohort` size vs `icp-cohort` size (should be < 2:1)
- Any A/B test accidentally run on wrong-user cohort? → exclude and re-run
- Any feature request spikes in session recordings from wrong-user? → discard

---

## Threshold Actions Reference

| Threshold breach | Immediate action |
|---|---|
| Bounce rate > 70% for 3 consecutive days | Escalate to product review — Zone 1 signal quality crisis |
| `day7_return` > 15% for 2 consecutive weeks | Launch pricing experiment (unlock Phase 6 pricing) |
| `upgrade_clicked` → 0 for 5 days | Check blur gate still rendering; check `/upgrade` page live |
| `aha_activation` < 10% | LLM pipeline may have failed — check `processedSignals.json` freshness |
| `wrong-user-cohort` > 3× `icp-cohort` | Stop all A/B tests; review acquisition channels |
| `signal_shared` rate < 1% for 2 weeks | Signals lack shareability — review TAKEAWAY quality and titles |

---

## Implementation Checklist (Phase 4)

- [ ] Add `page_viewed` to all route entry points (client-side `useEffect`)
- [ ] Add `signal_clicked` to `Zone1Signal.tsx` title click and `Zone2Card.tsx` "Read →" click
- [ ] Add `signal_shared` to `Zone1Signal.tsx` share action (copy link + tweet button)
- [ ] Add `first_signal_read` to `app/page.tsx` — fire on first `signal_clicked` per `localStorage` flag `aiSignal_firstReadFired`
- [ ] Add `zone1_fully_read` — IntersectionObserver on last Zone 1 signal row
- [ ] Add `day1_return`, `day3_return`, `day7_return` to session-start logic in `app/page.tsx`
- [ ] Add `aha_activation` counter in `app/page.tsx` — count zone1 clicks per session
- [ ] Add `aha_retained` alongside `day1_return`
- [ ] Create PostHog cohorts: `icp-cohort`, `wrong-user-cohort`
- [ ] Verify `lib/analytics.ts` has all Phase 1 events + new Phase 4 events, all with SSR guard
- [ ] Add all new events to `lib/analytics.ts` following existing SSR-guard pattern
- [ ] Update `trackUpgradeClicked` location union type to include any new CTA locations
