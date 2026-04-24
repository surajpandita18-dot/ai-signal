---
name: synthetic-testing
description: Use when validating product assumptions before shipping, after completing a phase, or on a weekly cadence. Simulates ICP reactions to the current product state and scores assumption validity using persona-driven journeys.
---

# Synthetic ICP Testing

## Overview

Simulates how each of AI Signal's four personas would react to the current product — at first visit, day 3 return, and upgrade decision moment. Tests all HIGH-risk assumptions from `.claude/validation/assumptions.md`. Includes a red team pass using the wrong-user persona to surface optimization traps. Outputs scored findings and updates assumption statuses.

**Output files:**
- `.claude/intelligence/synthetic-feedback-{YYYY-MM-DD}.md` — full simulation results
- `.claude/validation/assumptions.md` — updated with new status + evidence (appended, never overwritten)

---

## Before You Run

### Phase Gate

**Do NOT run synthetic testing unless at least Phase 1 is complete.**

Simulation quality varies by phase — state the current phase before any simulation begins:

| Phase complete | What you can simulate |
|---|---|
| Phase 1 only | Title + score bar only. No TAKEAWAY, no What, no Why. Blur gate is visible but content behind it is unknown. |
| Phase 2 complete | LLM-generated What/Why/Takeaway fields are populated. Simulate full Zone 1 signal with blur on TAKEAWAY. |
| Phase 4 complete | Full homepage experience — Zone 1 editorial list, Zone 2 grid, FirstVisitTooltip, upgrade CTA wired to `/upgrade`. |

**Current phase context MUST be stated as the first line of every simulation output.** Example:
> *Phase context: Phase 2 complete. LLM fields populated. Auth not yet live (Phase 3). Homepage redesign not yet live (Phase 4).*

If you are unsure which phase is complete, read `.claude/2026-04-20-ai-signal-mvp-plan.md` and check which tasks are marked done before proceeding.

---

Read these files in full. The simulation quality depends entirely on this context:

1. `.claude/2026-04-20-ai-signal-decision-tool-design.md` — product spec + current gate logic
2. `.claude/2026-04-20-ai-signal-mvp-plan.md` — which phase is complete, what's live
3. `.claude/validation/assumptions.md` — current assumption statuses
4. All four persona files:
   - `.claude/personas/technical-founder.md`
   - `.claude/personas/ai-curious-pm.md`
   - `.claude/personas/indie-builder.md`
   - `.claude/personas/wrong-user.md` — RED TEAM ONLY (see Step 3)

---

## Step 1: ICP Persona Simulations (3 personas × 3 moments)

Run simulations for: **technical-founder**, **ai-curious-pm**, **indie-builder**.
(wrong-user is handled separately in Step 3.)

For each persona, simulate three moments. Write in first person as the persona. Be specific — use their verbatim language patterns from the persona files. Do not be generous. Simulate genuine friction, not ideal-case behavior.

### Moment 1: First Visit (Day 1, unknown product)

**Setup:** Persona lands on homepage via a tweet or HN link. No prior context. They have 90 seconds before they decide to stay or leave.

**Simulate:**
- What do they notice first? (visual hierarchy, first text read)
- What question forms in their head in the first 10 seconds?
- Do they scroll past the fold or bounce?
- Do they read a Zone 1 signal? Which one catches their eye?
- Do they click through to an article?
- Do they see the blur gate? What's their reaction?
- Do they stay or leave? Why?

**Output:**
```
### [Persona Name] — First Visit

**Phase context:** [state which phase is live]

**First impression (10 seconds):** "[verbatim thought in their voice]"

**Engagement:** [Bounced / Stayed < 2min / Stayed > 2min / Read article]

**Reaction to blur gate:** [Ignored / Noticed / Frustrated / Curious / Upgrade intent]

**Verdict:** STRONG FIRST IMPRESSION / NEUTRAL / WEAK — [one sentence why]

**Key friction point:** [the single thing most likely to cause bounce]
```

---

### Moment 2: Day 3 Return

**Setup:** Persona returns on their own, without a reminder. They've seen the product twice before. This visit determines if it becomes a habit.

**Simulate:**
- Do they return at all? What would trigger a return? What would prevent it?
- If they return: what do they look for first?
- Do they notice if the signals are different from day 1?
- Do they use the save feature?
- Do they dismiss any signals? Why?
- Is this becoming part of their morning routine, or still "I'll check when I remember"?

**Output:**
```
### [Persona Name] — Day 3 Return

**Phase context:** [state which phase is live]

**Return likelihood:** HIGH / MEDIUM / LOW — [one sentence reasoning]

**What triggers the return:** [specific trigger in their context]

**Behavior change vs Day 1:** [what's different now that they know the product]

**Save/dismiss behavior:** [did they use these? why?]

**Habit formation verdict:** FORMING / UNCERTAIN / NOT FORMING — [why]
```

---

### Moment 3: Upgrade Decision

**Setup:** Persona has used the product for 5–7 days. They've seen the blur gate multiple times. They know what they're missing. The upgrade CTA is visible. They are deciding whether to pay.

**Simulate:**
- What is the exact thought that either pushes them over the upgrade line or stops them?
- Does the blur feel like a fair gate or a dark pattern?
- What information would they need that the current page doesn't give them?
- Do they click "Upgrade for full access"? What happens next in their mind?
- If they don't upgrade: what specifically would need to change for them to?

**Output:**
```
### [Persona Name] — Upgrade Decision

**Phase context:** [state which phase is live]

**Will they upgrade?** YES / NO / MAYBE — [confidence: high/medium/low]

**The deciding thought:** "[verbatim in their voice]"

**Biggest blocker to upgrade:** [specific objection]

**What would tip them over:** [one specific change that would convert them]

**Pricing sensitivity:** [reaction to $49/month when eventually revealed]
```

---

## Step 2: Assumption Testing

After running all 3 persona simulations, evaluate each HIGH-risk assumption from `.claude/validation/assumptions.md` against the simulation evidence.

**Only test HIGH-risk assumptions in this run** (MEDIUM and LOW on quarterly cadence).

Currently HIGH-risk assumptions: A1, A2, A4 (see assumptions.md).

**For each HIGH-risk assumption:**

```
### Assumption [ID]: [Statement]

**Evidence from simulations:**
- technical-founder simulation suggests: [finding]
- ai-curious-pm simulation suggests: [finding]
- indie-builder simulation suggests: [finding]

**Status:** VALIDATED / INVALIDATED / UNCLEAR

**Reasoning:** [2–3 sentences connecting evidence to status]

**Confidence:** HIGH / MEDIUM / LOW

**Recommended action:** [none / monitor / adjust implementation / escalate to human review]
```

**Status definitions:**
- `VALIDATED`: At least 2 of 3 ICP personas show behavior consistent with assumption
- `INVALIDATED`: At least 2 of 3 ICP personas show behavior contradicting assumption
- `UNCLEAR`: Mixed signals — need real user data to resolve

---

## Step 3: Red Team — Wrong User Simulation

**Purpose:** Identify which product decisions would be correct for wrong-user but wrong for ICP. Surface any current features that are accidentally optimized for wrong-user behavior.

**This is NOT a persona you want to retain.** Simulate honestly.

### Red Team Moment 1: First Visit

Run the same first-visit simulation as Step 1 but for wrong-user persona.

**Additional red team question:** What aspects of the current UI or content are *more* appealing to wrong-user than to technical-founder? These are optimization traps.

**Output:**
```
### Wrong User — First Visit

**Phase context:** [state which phase is live]

**Reaction:** [simulate in their voice]

**What they love (danger zones):** [features/content that appeals to wrong-user
  more than ICP — list specifically]

**What they ignore (ICP value):** [what the ICP cares about that wrong-user skips]
```

### Red Team Moment 2: Feedback Trap Analysis

Simulate what feedback wrong-user would submit if given the opportunity.

**Output:**
```
### Wrong User — Feedback They Would Give

**Feature requests they'd make:**
- "[request 1]" — why this would hurt ICP if implemented
- "[request 2]" — why this would hurt ICP if implemented
- "[request 3]" — why this would hurt ICP if implemented

**Complaints they'd make:**
- "[complaint]" — why this complaint should be ignored

**Metrics they'd inflate:** [which PostHog events they'd fire that would mislead
  if not segmented by cohort]
```

### Red Team Verdict

```
### Red Team Verdict

**Current optimization traps (features already too tuned for wrong-user):**
[list or "none identified"]

**At-risk decisions (upcoming plan items that wrong-user would push for):**
[list with reference to plan tasks]

**Cohort tagging urgency:** IMMEDIATE / PHASE 4 AS PLANNED / LOW
[reasoning]
```

---

## Step 4: Save Outputs

### File 1: Dated synthetic feedback

Save as `.claude/intelligence/synthetic-feedback-{YYYY-MM-DD}.md`:

```markdown
# Synthetic ICP Test — {date}

## Phase context
[What is currently live — must match the Phase Gate table above]

## ICP Simulations

### Technical Founder
[3 moment outputs]

### AI-Curious PM
[3 moment outputs]

### Indie Builder
[3 moment outputs]

## Assumption Test Results

[Results for each HIGH-risk assumption]

## Red Team — Wrong User

[Step 3 outputs]

## Top 3 Findings

1. [Most important finding with recommended action]
2.
3.

## Recommended Implementation Plan Changes

[0–3 specific tasks to add, remove, or reprioritize — reference plan task numbers]
```

### File 2: Update assumptions.md

For each assumption tested, append to its Evidence log in `.claude/validation/assumptions.md`:

```markdown
**{date} — Synthetic test (Phase N):** [1–2 sentence finding]. Status → VALIDATED /
INVALIDATED / UNCLEAR.
```

Do NOT overwrite previous evidence entries. Always append. The history is the signal.

---

## Calibration Rules

**Be harsh, not helpful.** The point of synthetic testing is to find failure modes, not to validate the product. If a persona would bounce, say they bounce. If the blur gate feels manipulative, say so.

**Personas are not fans.** They don't know about the product's vision. They only react to what they see in front of them.

**Don't simulate features that aren't shipped.** If the TAKEAWAY field is null (LLM pipeline not yet run), the simulation must account for the product as it actually exists — titles and scores only in Zone 1.

**Wrong-user feedback is not product feedback.** When writing the red team section, explicitly label every feature request wrong-user would make as something that should NOT be acted on.

**Flag real-data gaps.** If an assumption cannot be tested synthetically (e.g., A8 pricing sensitivity requires real willingness-to-pay data), mark it as `UNCLEAR — requires real user data` and do not force a synthetic verdict.
