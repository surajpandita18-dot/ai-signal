# AI Signal — Assumption Tracker

> Updated by synthetic-testing skill after each run. Each assumption has a status and evidence trail.

---

## How to read this file

| Status | Meaning |
|---|---|
| `UNTESTED` | No data yet |
| `VALIDATED` | Evidence supports assumption |
| `INVALIDATED` | Evidence contradicts assumption |
| `UNCLEAR` | Mixed or insufficient signal |

---

## Core Assumptions (Phase 1 — MVP)

### A1 — Target user pain is acute enough to drive daily return

**Statement:** Technical founders at seed–Series A AI startups check AI news daily but find existing tools too noisy, too general, or too time-consuming.

**Risk level:** HIGH (entire product bet)

**Status:** `VALIDATED`

**Evidence log:**
- *(synthetic-testing will populate this)*
- **2026-04-21 — Lenny's Podcast transcript (real user data):** Technical founders explicitly describe the pain of high-velocity AI news as a daily forcing-function problem — "there's a high velocity of new AI capabilities every day" and existing sources (Twitter, newsletters) require too much filtering to extract what's actionable. Multiple founders describe checking AI news first thing every morning. Pain is confirmed acute and daily. Status → VALIDATED.

---

### A2 — Builder Takeaway is the differentiating value

**Statement:** The single-sentence actionable takeaway ("TAKEAWAY") is what converts free users to paid — not the What/Why, not the score, not the source list.

**Risk level:** HIGH

**Status:** `VALIDATED`

**Evidence log:**
- **2026-04-21 — Lenny's Podcast transcript (real user data):** Founders describe the gap as not lack of information but lack of synthesis: "I don't need more links — I need to know what this means for what I'm building right now." The specific ask is a single actionable sentence, not a summary or a score. Founders who described switching away from newsletters cited generic summaries as the reason — reinforcing that the TAKEAWAY quality bar (specific, actionable, not generic) is the differentiator. Status → VALIDATED.

---

### A3 — Zone 1 editorial format drives more engagement than card grids

**Statement:** Numbered editorial list (Zone 1) gets more clicks and time-on-page than a card grid of the same signals.

**Risk level:** MEDIUM

**Status:** `UNTESTED`

**Evidence log:**

---

### A4 — Technical founders will return daily without email

**Statement:** The product is sticky enough on its own that a meaningful % returns day 2 and day 7 without email reminders.

**Risk level:** HIGH

**Status:** `UNTESTED`

**Evidence log:**

---

### A5 — UI-level blur is sufficient gate for MVP

**Statement:** Blurring the takeaway is enough friction to drive upgrade intent tracking without server-side enforcement. Technical users who bypass won't significantly distort the upgrade funnel signal.

**Risk level:** LOW (explicitly accepted tradeoff)

**Status:** `UNTESTED`

**Evidence log:**

---

### A6 — 3–5 signals per day is the right volume

**Statement:** Users want depth on 3–5 signals, not breadth across 20–30. More than 5 Zone 1 signals creates cognitive overload.

**Risk level:** MEDIUM

**Status:** `UNTESTED`

**Evidence log:**

---

### A7 — Source credibility matters to users (not just recency)

**Statement:** Users notice and care about which lab or publication a signal comes from. A signal from OpenAI is treated as more trustworthy than one from TechCrunch on the same topic.

**Risk level:** LOW

**Status:** `UNTESTED`

**Evidence log:**

---

### A8 — $49/month is within the pain-to-price threshold

**Statement:** After validating retention (5 consecutive days), $49/month will convert at ≥2% of active free users.

**Risk level:** MEDIUM (deferred — pricing not shown in MVP)

**Status:** `UNTESTED`

**Evidence log:**

---

---

## Assumptions Added from Product Intelligence Session (2026-04-22)

*Source: `.claude/intelligence/product-intelligence-2026-04-21.md` — top 3 gaps converted to testable assumptions.*

---

### A9 — Zone 1 scoring threshold is correctly calibrated to real signal quality

**Statement:** The Zone 1 threshold of `signalScore >= 3.5` reliably identifies signals that a technical founder would consider "high-impact" — i.e., not miscalibrated to the point where zero signals qualify on most days.

**Risk level:** CRITICAL (product promise breaks on empty Zone 1)

**Status:** `INVALIDATED`

**Evidence log:**
- **2026-04-22 — Product Intelligence Session (Agent 2 empirical finding):** `processedSignals.json` examined directly. Maximum signal score in dataset = 3.38. Zone 1 threshold = 3.5. Nine processed signals have valid TAKEAWAYs and current `zone1EligibleUntil` timestamps — all suppressed by the threshold constant. Zone 1 has been empty for every user since launch. Threshold must be lowered to ≤2.8 or Zone 1 logic changed to surface top 3 processed signals when fewer than 3 meet threshold. Status → INVALIDATED.

---

### A10 — Client-side TAKEAWAY blur is sufficient to drive upgrade intent in the technical founder cohort

**Statement:** Blurring the TAKEAWAY via `filter: blur(4px)` with `userSelect: none` creates meaningful upgrade friction for technical founders, and the blur-to-upgrade conversion is measurable.

**Risk level:** HIGH

**Status:** `INVALIDATED`

**Evidence log:**
- **2026-04-22 — Product Intelligence Session (Agent 2 + Agent 3 finding):** TAKEAWAY text is always present in the DOM. Any technical founder — the exact target customer — can remove the blur via browser DevTools in under 10 seconds. This is not a theoretical bypass; `inspect element → remove style attribute` is muscle memory for this cohort. Upgrade CTA built on a bypassable gate is theater, not a product decision. Server-side gate (TAKEAWAY never in API response for free/unauthenticated users) is required. This matches the existing spec in `decision-tool-design.md §3` which states: "takeaway is never sent in the API response to free or unauthed users — not blurred client-side, not sent at all." Status → INVALIDATED. Spec must be implemented.

---

### A11 — The investment mechanic (decision log / signal history) is a post-PMF feature

**Statement:** Users will form a durable daily habit with AI Signal without any investment mechanic — no decision log, no signal history, no personalization accumulation — relying solely on editorial signal quality to re-earn the open each morning.

**Risk level:** HIGH

**Status:** `UNTESTED`

**Evidence log:**
- **2026-04-22 — Product Intelligence Session (Agent 1 Hooked model analysis):** Nir Eyal's Hooked model (trigger → action → variable reward → investment) identifies investment as the phase that creates escalating switching cost and habit durability. Currently the product has zero investment mechanics: no decision log, no signal history, no personalization from GitHub repo data. A user on day 29 has the same product experience as day 1. The Hooked model predicts: without investment, retention after day 7 is governed entirely by daily editorial quality re-earning the open from scratch. This assumption is testable with first cohort: if day 7 retention is below 10% with strong editorial quality, investment mechanics are required. If above 20%, editorial quality alone may be sufficient.

---

## Invalidated Assumptions Archive

*(Moved here when status = INVALIDATED — preserved as learning)*
