# Phase 2 Word-Count Enforcement — Layer 4 Audit

**Date:** 2026-05-07
**Branch:** phase2-content-quality
**Test run:** `scripts/phase2-validation-test.mjs`
**Results dir:** `.claude/intelligence/phase-2-test-results/`

---

## Layer 1 — word-count-validator.ts ✓

**File:** `src/lib/word-count-validator.ts`

Created. Exports:
- `WcViolation` — `{ field, words, soft, hard, severity: 'SOFT'|'HARD', excerpt }`
- `ValidationReport` — `{ pass, hard_violations, soft_violations, all_violations }`
- `WcSignalInput` — minimal signal interface, avoids circular import with generate-signal.ts
- `validateWordCounts(signal)` — covers all 25 field types incl. extended_data

TypeScript strict: `npx tsc --noEmit` → **clean**.

---

## Layer 2 — enforceWordCounts integration ✓

**File:** `src/inngest/generate-signal.ts`

Two new functions added before `markIssueFailed`:
- `applyFieldPatch(signal, field, value)` — maps field names (incl. `cascade_step[2]` indexed forms) to nested signal paths
- `enforceWordCounts(signal, client)` — validates, logs, calls Sonnet to regen HARD violations only, rechecks

Splice point: after cascade step, before final validation gate. Original `finalSignal` → `publishSignal`. All downstream references (validation gate, `stories.insert`, `issues.update`) updated.

TypeScript strict: `npx tsc --noEmit` → **clean**.

---

## Layer 3 — Test Results

### PRODUCT-PRICING — 3 HARD + 14 SOFT

| Field | Words | Cap | Verdict |
|-------|-------|-----|---------|
| `counter_view` | **72** | 62 | HARD — enforcer will regen |
| `signal_block_body` | **48** | 42 | HARD — enforcer will regen |
| `block_2_prose` | **49** | 46 | HARD — enforcer will regen |
| `headline` | 13 | 14 | SOFT — within hard cap |
| `summary` | 26 | 38 | SOFT — within hard cap |
| `stat_label[0]` | 3 | 3 | SOFT — at exact hard cap, acceptable |
| reaction_quotes (3 items) | 20-21 | 22 | SOFT — within hard cap |
| did_you_know_facts | 18-25 | 28 | SOFT — all within hard cap |

### FUNDING — 4 HARD + 13 SOFT

| Field | Words | Cap | Verdict |
|-------|-------|-----|---------|
| `signal_block_body` | **43** | 42 | HARD — 1w over, enforcer will regen |
| `block_2_prose` | **50** | 46 | HARD — enforcer will regen |
| `reaction_quote[0]` | **27** | 22 | HARD — enforcer will regen |
| `reaction_quote[1]` | **23** | 22 | HARD — 1w over, enforcer will regen |
| `summary` | 33 | 38 | SOFT — within hard cap |
| `counter_view` | 61 | 62 | SOFT — 1w under hard cap |
| `broadcast_phrase[1]` | 11 | 16 | SOFT — within hard cap |
| ticker_detail (3 items) | 6 | 7 | SOFT — within hard cap |
| did_you_know_facts | 18-22 | 28 | SOFT — all within hard cap |

### POLICY-REGULATION — 3 HARD + 24 SOFT

| Field | Words | Cap | Verdict |
|-------|-------|-----|---------|
| `block_2_prose` | **48** | 46 | HARD — enforcer will regen |
| `stakeholder_who[3]` | **8** | 6 | HARD — "Indian IT services firms with EU AI contracts" |
| `reaction_quote[1]` | **24** | 22 | HARD — enforcer will regen |
| `headline` | 14 | 14 | SOFT — at exact hard cap, acceptable |
| `signal_block_body` | 42 | 42 | SOFT — at exact hard cap, acceptable |
| decision_questions (3) | 10-12 | 12 | SOFT — within hard caps |
| `insight_text[1]` | 15 | 17 | SOFT — within hard cap |
| stakeholder_who items | 5-6 | 6 | SOFT — within hard cap except item 3 |
| reaction_attributions | 10-11 | 12 | SOFT — within hard caps |
| did_you_know_facts | 19-21 | 28 | SOFT — all within hard cap |

---

## Pattern Analysis

### What the enforcer will catch (Layer 2 in production)

All HARD violations — 10 total across 3 article types — are within the enforcer's scope:
- `block_2_prose` overruns in all 3 types → regen will trim to ≤46w
- `counter_view` overrun in PRODUCT-PRICING (72w → 62w) → regen
- `signal_block_body` overruns in 2 types → regen
- `reaction_quote` overruns in 2 types → regen

The `reaction_attribution` soft violations (10-11w vs 9w soft) are composite (name + " · " + role). The enforcer deliberately skips these — they cannot be patched without splitting name/role apart, and they are all within the 12w hard cap.

### Systematic patterns (prompt tuning candidates)

**`block_2_prose` consistently overruns the 42→46w range** (range: 48-50w across 3 types). The enforcer handles it, but this is a recurring cost per generation. The v11 reference was 38w; the 46w cap was already generous. No cap adjustment recommended — the enforcer is the right safety valve here.

**`reaction_quote` above soft target** in all 3 types (range: 20-27w vs 17w soft, 22w hard). 2 of 3 types had HARD violations. Considered raising the cap to 25w but rejected: 22w is already +5w over the v11 baseline of 17w. Enforcer handles breaches.

**`stakeholder_who` in POLICY stories** — "Indian IT services firms with EU AI contracts" is 8w, violating the 6w hard cap. POLICY stakeholder labels tend to require specificity (company type + contract qualifier). This is a real design tension: 6w is V11-derived, but POLICY labels need two qualifiers to be useful. **Recommended cap adjustment: raise `stakeholder_who` hard cap to 8w for next prompt iteration.** Current enforcer will regen it, but the regen may produce something too generic.

**`reaction_attribution` consistently over soft target** (10-11w vs 9w soft). Hard cap is 12w — all within bounds. The 9w soft target is too tight for a useful attribution line (name · role · company with seniority). No action needed — soft violations are logged only.

**`did_you_know_facts` over soft target** — by design. The facts note says "11-23 words, hard cap 28w" and range "wide due to number-heavy facts." All test facts were 17-25w, within hard cap. This is correct behavior.

---

## Enforcer Test — Counterfactual

If `enforceWordCounts` had run against these 3 test outputs:
- **10 HARD violations** would have triggered a Sonnet regen call
- Fields with 1-2 word overruns (`signal_block_body` at 43w, `reaction_quote[1]` at 23w) would regen to clean with minimal edit
- `counter_view` at 72w would need a more aggressive trim (~10w removal)
- `stakeholder_who[3]` at 8w would regen to ≤6w — possibly losing the "EU AI contracts" specificity

Post-regen recheck expected: 0 HARD violations for pricing/funding, 0-1 for policy (if stakeholder_who regen loses precision).

---

## Screenshot

Captured: `.claude/intelligence/screenshots/phase-2-validation-test.png`
Dev server was running at localhost:3000.

---

## Layer 5 Recommendation

**HOLD — one cap adjustment before ship.**

All HARD violations are interceptable by the enforcer. However:

1. The `stakeholder_who` HARD violation in POLICY is a systematic content quality issue, not just a word count issue. When the enforcer regens "Indian IT services firms with EU AI contracts" to ≤6w, it will produce something like "Indian IT exporters" — losing the EU contract specificity. This matters for POLICY articles specifically.

   **Proposed fix before ship:** Raise `stakeholder_who` hard cap from 6 to 8 in both `word-count-validator.ts` and the SYSTEM_PROMPT description. The V11 reference (4-6w) was measured from a PRODUCT-PRICING story; POLICY labels need more words to be specific.

2. `block_2_prose` consistently running 48-50w vs 46w hard cap suggests the prompt instruction ("Hard cap: 46 words") needs stronger enforcement language. Consider adding "COUNT CAREFULLY" emphasis.

If the cap adjustment for `stakeholder_who` is accepted, Layer 5 (ship) is safe. Enforcer handles all remaining HARD violations at runtime.

---

## Files Changed (Layers 1–4)

| File | Type | Change |
|------|------|--------|
| `src/lib/word-count-validator.ts` | NEW | Full CAPS table + validateWordCounts() + interfaces |
| `src/inngest/generate-signal.ts` | EDITED | Import + applyFieldPatch() + enforceWordCounts() + publishSignal splice |
| `scripts/phase2-validation-test.mjs` | NEW | 3-type ESM test script |
| `.claude/intelligence/phase-2-test-results/*.json` | NEW | 3 validation result files |
| `.claude/intelligence/AUDIT.md` | NEW | This document |
