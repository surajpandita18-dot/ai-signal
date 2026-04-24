# AI Signal — Intelligence System Master Workflow

**Invocation:** `/intelligence run`
**Cadence:** Weekly (Monday morning, ~45 minutes)
**Output:** `.claude/intelligence/weekly-review-{YYYY-MM-DD}.md`

---

## First Run Checklist (one-time setup)

Before running `/intelligence run` for the first time:

- [ ] Phase 1 complete and verified (`fetch-news.mjs` runs clean)
- [ ] PostHog project created, `NEXT_PUBLIC_POSTHOG_KEY` in `.env.local`
- [ ] All 4 persona files exist in `.claude/personas/`
- [ ] `assumptions.md` has at least 8 assumptions with risk levels
- [ ] `market-gaps.md` exists (even if empty)

If any item is unchecked — run that setup first, then return here.

---

## Before You Run

Check which components have data available:

| Component | Data source | Available when |
|---|---|---|
| Market Intelligence | Web (PH, Reddit, G2) | Any time |
| Synthetic Testing | Persona files + assumptions.md | Phase 1+ complete |
| Analytics Review | PostHog dashboard | Phase 1+ events live |
| Qualitative Feedback | feedback-raw.json or Supabase | Phase 3+ complete |
| Growth Loop Analysis | PostHog + feedback + synthetic | ≥ 2 weeks real data |

If a component has no data, mark it `SKIPPED — no data` in the weekly review. Do not synthesize without data.

---

## Execution Order

Run components in this sequence. Each step depends on the previous.

### Step 1 — Market Intelligence
Invoke: `market-intelligence` skill

Reads competitor landscape, extracts PH/Reddit/Twitter sentiment, scores market gaps.

Output saved to:
- `.claude/intelligence/competition-{date}.md`
- `.claude/intelligence/market-gaps.md` (updated in place)

---

### Step 2 — Synthetic ICP Testing
Invoke: `synthetic-testing` skill

Simulates 3 ICP personas × 3 moments. Tests HIGH-risk assumptions (A1, A2, A4). Red team pass with wrong-user.

Output saved to:
- `.claude/intelligence/synthetic-feedback-{date}.md`
- `.claude/validation/assumptions.md` (appended, never overwritten)

**Phase gate:** Check which phase is complete before simulating. State phase context as first line of simulation output.

---

### Step 3 — Analytics Review

No skill invocation — direct review of PostHog dashboard against thresholds in `.claude/intelligence/analytics-plan.md`.

Fill in the weekly metrics template from analytics-plan.md. Flag any threshold breach.

Output: inline in weekly-review-{date}.md (no separate file).

---

### Step 4 — Qualitative Feedback Digest

Read: `data/feedback-raw.json` (or Supabase `feedback` table after Phase 5)

Filter to last 7 days. Summarize by trigger type. Extract language mining verbatims.

Output saved to: `.claude/intelligence/user-feedback-{date}.md`

**Skip if:** fewer than 3 responses in the past 7 days. Note "insufficient volume" in weekly review.

---

### Step 5 — Growth Loop Analysis
Invoke: `growth-loop-analysis` skill

Scores all three loops. Identifies cross-loop interference. Outputs single highest-leverage action.

Output saved to: `.claude/intelligence/growth-loop-{date}.md`

**Skip if:** fewer than 14 days of real PostHog data AND no prior growth loop analysis to compare against.

---

### Step 6 — Weekly Review Synthesis

Compile outputs from Steps 1–5 into the weekly review file.

**File:** `.claude/intelligence/weekly-review-{YYYY-MM-DD}.md`

```markdown
# AI Signal — Weekly Intelligence Review — {date}

## Phase Context
[What is currently live — reference mvp-plan.md]

## 1. Market Intelligence
*Source: competition-{date}.md*

**Top 3 competitor moves this week:**
1.
2.
3.

**Market gap status changes:** [any gap score changes from last week]

---

## 2. Assumption Status
*Source: synthetic-feedback-{date}.md + assumptions.md*

| Assumption | Status | Change from last week |
|---|---|---|
| A1 — Daily return pain | | |
| A2 — TAKEAWAY differentiator | | |
| A4 — Return without email | | |

**New finding:** [most important thing the simulations revealed]

---

## 3. Analytics vs Thresholds
*Source: PostHog dashboard*

| Metric | This week | Threshold | Status |
|---|---|---|---|
| `aha_activation` rate | | > 25% | |
| `day1_return` rate | | > 30% | |
| `day7_return` rate | | > 10% | |
| `signal_shared` rate | | > 5% | |
| `upgrade_clicked` (zone1_gate) | | highest location | |

**Threshold breaches:** [list or "none"]

**Wrong-user cohort check:** cohort size vs ICP cohort (flag if > 2:1)

---

## 4. User Feedback
*Source: user-feedback-{date}.md*

**Response volume:** [N responses across all triggers]

**Most common upgrade blocker:** [option text]

**Wrong-user signal:** ["I'm not the one who decides" = X%]

**Best language mining verbatim this week:**
> "[quote]"

---

## 5. Growth Loop Health
*Source: growth-loop-{date}.md*

| Loop | Status | Bottleneck |
|---|---|---|
| Signal Quality | | |
| Viral Sharing | | |
| Upgrade Pressure | | |

**This week's lever:** [action from growth loop analysis]

---

## Implementation Plan Recommendations

[0–3 specific changes to .claude/2026-04-20-ai-signal-mvp-plan.md]

Format:
- ADD task: [description] to Phase [N]
- REMOVE task: [task ID] — reason
- REPRIORITIZE: [task ID] above [task ID] — reason

**Constraint:** Only recommend changes supported by evidence from this week's review. No speculative additions.

---

## Next Review Date
[Date + 7 days]
```

---

## Quick Run (Abbreviated Mode)

When time is short, run Steps 3 and 5 only:
- Check PostHog metrics vs thresholds (10 min)
- Score growth loops against last week's baseline (10 min)
- Output abbreviated weekly review with only sections 3 and 5 filled

Mark abbreviated runs clearly: `## Quick Run — Steps 3 + 5 only` at top of file.

---

## File Index

All intelligence outputs live in `.claude/intelligence/`:

| File | Updated by | Cadence |
|---|---|---|
| `market-gaps.md` | market-intelligence skill | Weekly (in place) |
| `competition-{date}.md` | market-intelligence skill | Weekly (new file) |
| `synthetic-feedback-{date}.md` | synthetic-testing skill | Weekly (new file) |
| `growth-loop-{date}.md` | growth-loop-analysis skill | Monthly or on trigger |
| `user-feedback-{date}.md` | manual (feedback-raw.json) | Weekly (new file) |
| `weekly-review-{date}.md` | this workflow | Weekly (new file) |
| `analytics-plan.md` | human review | Updated per phase |
| `feedback-system.md` | human review | Updated per phase |

**`assumptions.md` lives in `.claude/validation/` — updated by synthetic-testing skill (append only).**
