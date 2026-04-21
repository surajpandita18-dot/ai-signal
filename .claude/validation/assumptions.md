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

## Invalidated Assumptions Archive

*(Moved here when status = INVALIDATED — preserved as learning)*
