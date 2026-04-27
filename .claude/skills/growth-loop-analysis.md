---
name: growth-loop-analysis
description: Use when evaluating whether AI Signal's growth loops are compounding or stalling — run after 2+ weeks of PostHog data, after a major feature ships, or when acquisition/retention metrics diverge unexpectedly.
---

# Growth Loop Analysis

## Overview

Maps the three latent growth loops in AI Signal, scores each loop's health against PostHog data, and surfaces the single highest-leverage lever to pull this week. Not a funnel analysis — loops are circular, not linear.

**Run cadence:** Monthly. Or immediately when `day7_return` drops > 5 percentage points week-over-week.

---

## The Three Loops

### Loop 1 — Signal Quality Loop (Retention flywheel)
```
Better signals → more saves → save rate as quality signal →
LLM pipeline tuning → better signals
```
**Metrics that indicate loop is spinning:**
- `signal_saved` per session increasing week-over-week
- `zone1_fully_read` rate > 40%
- ICP cohort `signal_saved` > 3/week/user

**Metrics that indicate loop is stalling:**
- `signal_dismissed` rate rising (signals feel irrelevant)
- `aha_activation` rate < 10% (LLM fields may be null)
- Save rate flat despite growing visitor count

---

### Loop 2 — Viral Sharing Loop (Acquisition flywheel)
```
Technical founder reads TAKEAWAY → shares on Twitter/X →
new technical founders land → some save → some return
```
**Metrics that indicate loop is spinning:**
- `signal_shared` rate > 5% of `signal_clicked`
- New visitor source = Twitter/X or direct (not paid)
- `first_signal_read` median < 90 seconds (fast time-to-value = shareable moment)

**Metrics that indicate loop is stalling:**
- `signal_shared` < 1% for 2 consecutive weeks
- New visitor share from social declining
- `first_signal_read` median > 150 seconds (too slow to trigger share impulse)

---

### Loop 3 — Upgrade Pressure Loop (Revenue flywheel)
```
Blur gate friction → upgrade CTA click → upgrade consideration →
(convert OR) intent signal fed back to TAKEAWAY quality improvement
```
**Metrics that indicate loop is spinning:**
- `upgrade_clicked` by `zone1_gate` location is highest
- Non-converter feedback: "I need to see more value" (not "lower price")
- ICP cohort upgrade click rate > 15%

**Metrics that indicate loop is stalling:**
- `upgrade_clicked` = 0 for 5+ days (check blur gate rendering)
- Nav > zone1_gate in upgrade click breakdown (gate not creating friction)
- Non-converter feedback: "I'm not the one who decides" > 20% (wrong-user false positives clicking)

---

## Analysis Steps

### Step 1: Read Current Data

Before running analysis, read these files in full:
1. `.claude/intelligence/analytics-plan.md` — metric thresholds and definitions
2. Latest `.claude/intelligence/user-feedback-{date}.md` — qualitative signal
3. Latest `.claude/intelligence/synthetic-feedback-{date}.md` — simulated loop behavior

State which PostHog data you have access to (real or synthetic). If synthetic only, label all loop health scores as SIMULATED.

---

### Step 2: Score Each Loop

For each loop, output:

```
### Loop [N]: [Name]

**Status:** SPINNING / STALLING / UNKNOWN (no data yet)

**Evidence:**
- [Metric name]: [value] — [above/below threshold]
- [Metric name]: [value] — [above/below threshold]

**Bottleneck:** [The single step in the loop where output is leaking]

**Compounding signal:** [Is the loop accelerating, flat, or decelerating? One sentence.]
```

**Status definitions:**
- `SPINNING`: ≥ 2 of 3 loop metrics above threshold
- `STALLING`: ≥ 2 of 3 loop metrics below threshold
- `UNKNOWN`: < 2 metrics available (state what data is needed)

---

### Step 3: Cross-Loop Interference Check

Some actions that fix one loop break another. Check these known conflicts:

| Action | Helps | Hurts |
|---|---|---|
| More Zone 2 signals | Loop 2 (more shareable content) | Loop 3 (less blur gate pressure) |
| Stricter blur gate | Loop 3 (more upgrade pressure) | Loop 2 (reduces shareability of gated content) |
| Lower price | Loop 3 (conversion rate) | Loop 1 (perceived value of saved signals) |
| More sources / topics | Loop 2 (broader audience) | Loop 1 (dilutes curation signal) |
| Email digest launch | Loop 3 (retention drives upgrade intent) | Loop 2 (less urgency to share — "I'll just wait for email") |

Flag any recommended action that has a known cross-loop conflict.

---

### Step 4: Single Highest-Leverage Action

Output one recommendation only. Not three. Not a list. One.

```
## This Week's Lever

**Loop:** [which loop]
**Action:** [specific, implementable change — reference plan task if applicable]
**Expected impact:** [which metric moves, by how much, in what timeframe]
**Cross-loop risk:** [none / [specific conflict from Step 3]]
**Confidence:** HIGH / MEDIUM / LOW — [one sentence reason]
```

**Constraints on the recommendation:**
- Must be implementable in the current phase (don't recommend Phase 6 features during Phase 3)
- Must affect ICP cohort, not wrong-user cohort
- Must not require a new dependency or team member

---

### Step 5: Save Output

Save as `.claude/intelligence/growth-loop-{YYYY-MM-DD}.md`:

```markdown
# Growth Loop Analysis — {date}

## Data source
[Real PostHog data / Synthetic simulation — state which]

## Phase context
[What is currently live]

## Loop 1: Signal Quality Loop
[Step 2 output]

## Loop 2: Viral Sharing Loop
[Step 2 output]

## Loop 3: Upgrade Pressure Loop
[Step 2 output]

## Cross-Loop Interference
[Step 3 output — conflicts identified or "none identified"]

## This Week's Lever
[Step 4 output]
```

Do NOT save if all three loops are UNKNOWN. State what data is needed first.

---

## Calibration Rules

**Loops are not independent.** A stalling Loop 2 means Loop 1 gets no new users to compound. Always read loop health in sequence: acquisition → activation → retention.

**Wrong-user cohort inflates Loop 2 metrics.** `signal_shared` from wrong-user has low downstream conversion. If sharing rate is high but `day3_return` is low, check cohort breakdown before celebrating.

**Loop 3 is a pressure valve, not a metric.** Low upgrade click rate might mean the product isn't valuable enough (fix Loop 1) or the gate isn't visible (UI bug). Distinguish before acting.

**Don't run this analysis with < 2 weeks of real data.** Synthetic simulation is labeled, not acted on for loop health. Run real analysis when PostHog has ≥ 14 days of `signal_clicked` events.
