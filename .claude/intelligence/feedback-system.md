# AI Signal — Qualitative Feedback System

**Type:** Implementation plan (no code — Phase 3 scope addition + Phase 5+ UI)
**Purpose:** Capture qualitative signal at three high-intent moments. Complement PostHog event data with language that can't be inferred from clicks.

---

## Philosophy

PostHog tells you **what** users do. This system tells you **why**.

Three rules:
1. Ask only when the user has demonstrated enough product context to give a meaningful answer
2. One question per trigger — not a survey form
3. Every response feeds back into the weekly intelligence review

---

## Trigger 1 — Day 3 Return: Habit Friction Survey

**When:** User's 3rd session (tracked via `localStorage.getItem("aiSignal_visitCount") >= 3`)
**Where:** Bottom of Zone 1, after signals load — not a modal, not a gate
**Timing:** Fire once per user, never repeat

**Question:**
> "What almost stopped you from coming back?"

**Options (single select):**
- "Wasn't sure the signals would be different"
- "Forgot it existed — no reminder"
- (free text): "Something else..."

**Why these two options:**
They test assumptions A4 (return without email) and the signal freshness concern. Both map to specific product decisions. Free text captures the unknown unknowns.

**Dismiss behavior:** "Skip" link below. Dismiss = still recorded as `{response: null, dismissed: true}`.

---

## Trigger 2 — Post Upgrade CTA (Non-Converters): Willingness-to-Pay Survey

**When:** User clicks any upgrade CTA but does NOT complete upgrade (detected by return navigation from `/upgrade` without plan change in localStorage)
**Where:** Subtle bottom-of-screen bar when they land back on home — not a popup
**Timing:** Fire once per user, only on first non-convert bounce from upgrade page

**Question:**
> "What would make you upgrade?"

**Options (single select):**
- "Lower price"
- "I need to see more value first"
- "I'm not the one who decides this"
- (free text): "Something else..."

**Why these three options:**
Tests pricing sensitivity vs. value perception vs. wrong-user false positive (budget authority). Third option is a wrong-user identifier.

---

## Trigger 3 — Day 7 Retention: NPS + Language Mining

**When:** User's 7th+ session, first session on or after day 7 since first visit
**Where:** Inline card at bottom of page, after Zone 2 grid
**Timing:** Fire once per user

**Question 1 (NPS):**
> "How likely are you to recommend AI Signal to another technical founder? (0–10)"

**Question 2 (language mining — shown after NPS regardless of score):**
> "How do you describe what AI Signal does to someone who hasn't seen it?"

Free text only. No options. This is the most valuable question in the system — the user's answer IS the copy for future marketing and Zone 1 framing.

---

## Storage Schema (Supabase — see MVP alternative below)

**Table: `feedback`**

```sql
CREATE TABLE feedback (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  trigger     TEXT NOT NULL,        -- 'day3_return' | 'upgrade_bounce' | 'day7_nps'
  user_id     TEXT,                 -- PostHog distinct_id (no PII)
  response    TEXT,                 -- selected option text or free text
  dismissed   BOOLEAN DEFAULT false,
  nps_score   INTEGER,             -- only for day7_nps trigger
  metadata    JSONB                 -- e.g. { visit_count, signals_saved, plan }
);
```

**No email, no name, no IP.** `user_id` is PostHog's anonymous distinct_id only. GDPR-friendly by design.

---

## MVP Storage Alternative (if Supabase deferred)

Store feedback as append-only JSON: `/data/feedback-raw.json`

Same schema as Supabase table but local. Each entry is a JSON object appended to the array on every `POST /api/feedback` write. No dashboard, manual review only — `cat data/feedback-raw.json | jq` is sufficient for first 50 responses.

```json
[
  {
    "id": "uuid-v4",
    "created_at": "2026-04-20T08:12:00Z",
    "trigger": "day3_return",
    "user_id": "ph_distinct_id",
    "response": "Forgot it existed — no reminder",
    "dismissed": false,
    "nps_score": null,
    "metadata": { "visit_count": 3, "signals_saved": 2, "plan": "free" }
  }
]
```

`POST /api/feedback` reads the file, pushes new entry, writes back — same pattern as `realNews.json`. No external dependency.

**Migration path:** When Phase 5 introduces Supabase for user plan storage, run a one-time script to bulk-insert `feedback-raw.json` into the `feedback` table. Schema is identical — zero transformation needed.

**Tradeoff:** No real-time dashboard, no SQL queries across entries. Acceptable for first 50 responses. Manual weekly review is sufficient at MVP scale.

**Recommended phase plan:**
- Phase 3: NextAuth only. No Supabase. Feedback API writes to `feedback-raw.json`.
- Phase 5: Introduce Supabase for user plans. Migrate feedback table at the same time.
- Phase 5+ UI: Triggers 1 and 2 ship with article page polish.
- Phase 6: Trigger 3 (NPS) ships with upgrade CTA phase.

---

## Weekly Digest Output

**File:** `.claude/intelligence/user-feedback-{YYYY-MM-DD}.md`

Generated manually (or by `/intelligence run`) by reading `feedback-raw.json` (or Supabase after Phase 5) for the past 7 days.

```markdown
# User Feedback — {date}

## Response Volume
- Day 3 friction: N responses (X% response rate, Y% dismissed)
- Upgrade bounce: N responses (X% response rate)
- Day 7 NPS: N responses — median score: X

## Trigger 1: Day 3 Friction Themes
[Top 2 options selected + any free-text patterns]

## Trigger 2: Upgrade Blocker Themes
[Option breakdown — flag if "I'm not the one who decides" > 20% (wrong-user signal)]

## Trigger 3: NPS
Score: [median] — Promoters: X% / Passives: X% / Detractors: X%

## Trigger 3: Language Mining (verbatim)
> "[most interesting response 1]"
> "[most interesting response 2]"
> "[most interesting response 3]"
— Copy these into Zone 1 framing review if they outperform current titles

## ICP vs Wrong-User Signal
- "I'm not the one who decides" selections: X (flag if > 20%)
- Upgrade bouncers who also have 0 saves: X (likely wrong-user false positive upgrades)

## Recommended Actions
[0–2 specific actions based on this week's data]
```

---

## Implementation Checklist

**Phase 3 (Auth only — no Supabase):**
- [ ] Create `data/feedback-raw.json` with empty array `[]`
- [ ] Create `POST /api/feedback` route — appends to `feedback-raw.json`
- [ ] Route accepts: trigger, response, dismissed, nps_score, metadata (all optional except trigger)

**Phase 5 (Article page + Supabase migration):**
- [ ] Create Supabase `feedback` table with schema above
- [ ] Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env.local`
- [ ] Migrate `data/feedback-raw.json` → Supabase (one-time script)
- [ ] Update `POST /api/feedback` to write to Supabase instead of JSON file
- [ ] Add Day 3 Return survey component to `app/page.tsx` — renders below Zone 1 when visit count ≥ 3, flag `aiSignal_feedbackFired_day3` in localStorage after first fire
- [ ] Add Upgrade Bounce bar — detect return from `/upgrade` without plan change, show once, flag `aiSignal_feedbackFired_upgrade`

**Phase 6 (Upgrade CTA phase):**
- [ ] Add Day 7 NPS inline card to `app/page.tsx` — renders after Zone 2, flag `aiSignal_feedbackFired_nps`
- [ ] NPS card shows question 2 (language mining) after question 1 submits

**All phases:** Never block content. All survey components render after signal content loads. Dismiss always available.

---

## What NOT to Build

- No modal overlays (breaks session context, inflates bounce)
- No email collection at any survey point (wrong phase, wrong trust level)
- No conditional question logic (one question per trigger, period)
- No aggregate display back to users ("X% of users said...") — this is internal signal only
- No Intercom / Typeform / third-party survey tools — all data stays in local JSON or Supabase

---

## Connection to Intelligence System

The weekly feedback digest feeds directly into `weekly-review-{date}.md` under:
- **User feedback themes** section (replaces "no data yet" placeholder)
- **Assumption validation:** Trigger 2 option 3 ("I'm not the one who decides") is a real-data test of wrong-user cohort accuracy
- **Copy mining:** Language Mining responses are the highest-signal input for Zone 1 title rewriting
