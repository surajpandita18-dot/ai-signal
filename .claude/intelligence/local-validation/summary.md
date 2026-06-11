# Local Validation Summary — Phase 2 Enforcement Stack
Generated: 2026-05-07

## Overview

This run validates the Phase 2 word-count enforcement stack against two existing Phase 1C signals.
The Inngest pipeline was NOT re-run (Anthropic API credits exhausted during validation runs #1–3).
These signals were generated **before** Phase 2's `enforceWordCounts` enforcer was integrated,
so violations represent the pre-enforcer baseline — expected inputs to the enforcement layer.

---

## Signals Tested

| # | Signal ID | Issue | Category | URL |
|---|-----------|-------|----------|-----|
| 15 | `7cfddc7e` | `2e737bcc` | business (FUNDING) | http://localhost:3001/signal/15 |
| 16 | `57b080a3` | `d53b7770` | models | http://localhost:3001/signal/16 |

**Signal 15 headline:** SAP pays $1.16B for 18-month-old German AI lab
**Signal 16 headline:** OpenAI ships GPT-5.5 Instant: smarter, faster, more personalized

---

## Word Count Validation Results

### Signal 15 — business/FUNDING
**Result: ✗ FAIL — 24 HARD + 18 SOFT violations**

Field counts: headline 8w | summary 45w | pull_quote 19w | signal_block 38w | block_2 31w | counter_view 35w

Top HARD violations:
- `summary`: 45w (hard cap 38) — summary is the single largest editorial overage
- `numbers_headline`: 14w (cap 8) — headline for the Numbers section is 75% over cap
- `did_you_know_fact[5,9]`: 40–43w (cap 28) — most extreme violations; facts are 50%+ over
- `decision_question[0–2]`: 14–20w (cap 12) — all 3 questions exceed cap
- `ticker_detail[0–2]`: 9w each (cap 7) — consistent 2w overage across all tickers
- `insight_text[0–1]`: 18–20w (cap 17) — tight; 1–3w over

### Signal 16 — models
**Result: ✗ FAIL — 13 HARD + 22 SOFT violations**

Field counts: headline 8w | summary 33w | pull_quote 20w | signal_block 32w | block_2 20w | counter_view 36w

Top HARD violations:
- `did_you_know_fact[0,2,5,7–9]`: 30–34w (cap 28) — bulk of violations
- `ticker_detail[0–2]`: 9–11w (cap 7) — same pattern as signal-15
- `insight_text[0–1]`: 20–21w (cap 17) — same pattern
- `reaction_quote[1]`: 23w (cap 22) — 1w over
- `reaction_attribution[2]`: 13w (cap 12) — composite attribution overage

---

## Violation Pattern Analysis

| Field group | Pattern | Enforcer coverage |
|-------------|---------|-------------------|
| `did_you_know_fact` | 6–9 of 10 facts violate hard cap; avg 30–35w vs cap 28w | `applyFieldPatch` covers `did_you_know_fact[i]` |
| `ticker_detail` | Consistent 9–11w vs cap 7w (2–4w over) | `applyFieldPatch` covers `ticker_detail[i]` |
| `insight_text` | 18–21w vs cap 17w | `applyFieldPatch` covers `insight_text[i]` |
| `decision_question` | 14–20w vs cap 12w (signal-15 only) | `applyFieldPatch` covers `decision_question[i]` |
| `summary` | 33–45w vs cap 38 (signal-15 only hard) | `applyFieldPatch` covers `summary` |
| `numbers_headline` | 14w vs cap 8w | `applyFieldPatch` covers `numbers_headline` |
| `stakeholder_subtitle` | 13–17w vs cap 14w | `applyFieldPatch` covers `stakeholder_subtitle` |

**Key observation:** `did_you_know_fact` + `ticker_detail` + `insight_text` account for ~70% of all HARD violations.
The enforcer will target these three groups most frequently.

**Fields the enforcer cannot currently patch:**
- `reaction_attribution` — composite field (`name · role`), skipped in `applyFieldPatch`
- `broadcast_phrase` — in SOFT range only for these signals; enforcer handles only HARD

---

## Anomalies Found During Validation Run

Three bugs discovered during validation run attempts (#1 and #2) on issues #17 and #18:

### Bug 1 — summary missing bold instruction (Phase 2 regression)
**File:** `src/inngest/generate-signal.ts` (SYSTEM_PROMPT)
**Cause:** Mission 2 replaced the summary JSON schema description with word-count instructions, but dropped the "Bold 2-4 key phrases" instruction that article-validator.ts requires (MIN_BOLD_PER_FIELD: summary=2).
**Fix applied (uncommitted):** Added "Bold 2+ key phrases with **double asterisks** on specific numbers, named entities, or the key implication" to summary field in SYSTEM_PROMPT.

### Bug 2 — why_it_matters bold minimum not explicit (Phase 2 regression)
**File:** `src/inngest/generate-signal.ts` (SYSTEM_PROMPT)
**Cause:** Prompt said "Bold key phrases with **double asterisks** in both paragraphs" — no explicit count. MIN_BOLD_PER_FIELD for why_it_matters = 3 in article-validator.ts. Models wrote 2.
**Fix applied (uncommitted):** Changed to "Bold at least 3 key phrases with **double asterisks** across both paragraphs — numbers, named entities, or key claims".

### Bug 3 — FORBIDDEN_STAT word-boundary bug (pre-existing)
**File:** `src/lib/article-validator.ts`
**Cause:** `FORBIDDEN_STAT_WORDS` check used `.includes()` substring matching. `"usage".includes("age")` returns `true`, so "Usage limits" (legitimate POLICY stat) was incorrectly blocked by the 'Age' rule.
**Fix applied (uncommitted):**
```typescript
// Before (buggy):
const hasForbiddenWord = FORBIDDEN_STAT_WORDS.some(w =>
  stat.label.toLowerCase().includes(w.toLowerCase())
)
// After (correct — word boundary):
const hasForbiddenWord = FORBIDDEN_STAT_WORDS.some(w =>
  new RegExp(`\\b${w}\\b`, 'i').test(stat.label)
)
```

---

## Screenshots

Taken at 1440px desktop via Playwright. Both signals rendered with no console errors.

```
signal-15-screenshots/
  01-full-page.png        — complete article (88KB)
  02-hero-zone.png        — top 700px including headline + stats bar (37KB)
  03-stats-block.png      — stat cards section
  04-decision-aid.png     — decision aid rows
  05-counter-reactions.png — counter view + reactions

signal-16-screenshots/
  01-full-page.png        — complete article (84KB)
  02-hero-zone.png        — top 700px (36KB)
  03-stats-block.png      — mid-page clip (signal-16 has no stats, selector missed)
  04-decision-aid.png     — decision aid rows
  05-counter-reactions.png — counter view + reactions
```

**Visual quality vs V11:** Both signals render cleanly with V11 design. Hero zone, stat cards, and extended data sections display correctly. Signal-16 has `stats: null` — the stats bar is absent as expected.

---

## Blocker: Anthropic API Credits

Three Inngest pipeline runs were attempted on fresh issues #17 and #18:
- Run 1: Blocked by `summary:BOLD_COUNT` + `stats:FORBIDDEN_STAT` validation failures (fixed during run)
- Run 2: Blocked by `why_it_matters:BOLD_COUNT` (fixed during run)
- Run 3: `400 invalid_request_error — Your credit balance is too low`

**Credits must be replenished before full enforcer stack validation can run end-to-end.**
The 3 hotfixes are staged in the codebase but untested against a live pipeline run.

---

## Recommendations

1. **Commit the 3 hotfixes as Phase 2.1** — all are correct, low-risk fixes. Recommended commit message: `fix(phase2.1): summary bold, why_it_matters bold count, forbidden-stat word boundary`

2. **Replenish API credits** — then trigger 2 fresh Inngest issues (one FUNDING-type, one POLICY-type) to fully validate the enforcer stack end-to-end.

3. **Cap review candidates** — `did_you_know_fact` (cap 28w) is consistently hit; consider raising to 32w, or accepting enforcer will patch ~60% of facts. `ticker_detail` (cap 7w) may need raising to 9w given consistent 2w overage.

4. **`reaction_attribution` enforcement gap** — composite field cannot be patched; monitor whether violations are frequent enough to warrant splitting name/role into separate fields with individual caps.
