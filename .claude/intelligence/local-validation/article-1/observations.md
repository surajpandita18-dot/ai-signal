# Article 1 — Observations
Date: 2026-05-07  
Issue: #21 (id: `0a23038b`)  
Story: `3b5a8392`  
Status: **PUBLISHED ✓**  
URL: http://localhost:3001/signal/21

---

## Article Type Confirmed

**Category:** `business`  
**Headline:** Anthropic rents xAI GPUs, lifts Claude usage limits for all users  
**Pick:** Anthropic compute deal with xAI/SpaceX — usage-limit implications for Claude API users  

Not PRODUCT-PRICING or RESEARCH-BENCHMARK as originally targeted, but a strong business/infrastructure story. The pipeline picks based on live news relevance — this was the highest-signal story today.

---

## Validation Summary

**Word count: ✓ PASS — 0 HARD, 25 SOFT**

| Field | Count | Cap | Status |
|-------|-------|-----|--------|
| headline | 11w | 14 hard | PASS |
| summary | 33w | 38 hard | SOFT (over 25 target) |
| pull_quote | 17w | 24 hard | PASS |
| signal_block_body | 41w | 48 hard | SOFT (over 36 target) |
| block_2_prose | 25w | 50 hard | PASS |
| counter_view | 62w | 62 hard | SOFT (at cap edge) |

**Bold count: ✓ PASS**

| Field | Bolds | Min required | Status |
|-------|-------|-------------|--------|
| why_it_matters | 4 (3+1 across paras) | 3 | PASS |
| summary | 2 | 2 | PASS |
| counter_view | 1 | 1 | PASS |

**Article validator: PASS** — no BOLD_COUNT, FORBIDDEN_STAT, or PRESS_RELEASE violations at final gate.

---

## Layered Fix Outcome

**Layer A fired:** NO  
**Layer B fired:** NO  

`enforceWordCounts` found **0 HARD word-count violations** and returned early without calling Sonnet regen. Since no word-count patches were applied to `signal_block_body` or `block_2_prose`, there was no bold regression risk and Layer B had nothing to trigger on.

This is the intended happy path. The layers are safety nets — they don't need to fire on every run. On this run, the initial generation + cascade produced a clean article without needing enforcement.

**Key question for future validation:** We need a run that actually HAS a HARD word-count violation in `signal_block_body`/`block_2_prose` to verify Layers A and B fire correctly. This run confirms the pipeline succeeds end-to-end but doesn't stress-test the regression guards.

---

## Stats Schema

**Stats:** null (0 stats cards shown)  
**Extended data:** present — 13 sections including `primary_chart`, `cascade`, `tickers`, `reactions`, `decision_aid`, `stakeholders`, `did_you_know_facts` (10 items), `standup_messages`

Stats are MANDATORY for PRODUCT-PRICING, FUNDING, POLICY-REGULATION, RESEARCH-BENCHMARK. This story was categorised as `business` (infrastructure/compute deal), so stats are not required. The `primary_chart` in extended_data provides quantitative context instead.

**Note:** The "By the Numbers" section rendered at scroll position ~950px — but since stats are null, that section shows the action strip (WHAT CHANGED / WHO'S AFFECTED / MOVE BY) instead. This is correct fallback behavior.

---

## Visual Quality vs V11 Reference

**Overall: ✓ Clean** — all V11 design sections rendered correctly at 1440px.

- **Hero zone:** headline typography, category badge, expiry timer, THE SIGNAL block — all correct
- **Action strip:** WHAT CHANGED / WHO'S AFFECTED / MOVE BY — 3 cards, correctly formatted
- **Why It Matters:** `matters_headline` renders in display serif, body has 3 bolds in para 0
- **Pull quote:** renders in blockquote style — "When AI company rents GPUs from your competitor's rocket company, 'infrastructure strategy' has left the building" — strong
- **Stakeholders grid (Winners and Losers):** WIN/LOSE badges rendering, 4 cells
- **Decision Aid:** 3 Q rows with verdict chips (REMOVE IT NOW / RUN EVALS FIRST / HOLD — VERIFY FIRST), final verdict box in dark
- **Action items:** RUN / FLAG / CHECK labels — 3 items with bold first phrases
- **Standup messages:** Slack / Email / WhatsApp / LinkedIn tabs rendering in broadcast block
- **Counter view:** 62w — at the exact hard cap edge (SOFT violation)

---

## Anomalies

1. **counter_view at 62w = exactly at hard cap.** No HARD violation but one more word would fail. The 25 SOFT violations are dominated by `did_you_know_facts` (7 of 10 over soft target, all within hard cap). This is expected — facts are verbose by design.

2. **stats: null for a business story.** Correct per spec, but the "By the Numbers" section header (`numbers_headline = "Anthropic's GPU supply just changed hands."`) renders even without stat cards. Need to verify this looks intentional in the UI or if the section header should be suppressed when stats are null.

3. **Layers A and B didn't fire.** They need a run with HARD word-count violations in `why_it_matters`-adjacent fields to be properly validated. Article 2 (FUNDING or POLICY-REGULATION) is more likely to trigger this pattern.

---

## Token Cost

- **Wall clock:** ~2 min 17s (08:26:23 → 08:28:40)
- **Tokens:** not captured (background dev server — no log capture mechanism)
- **Estimated cost:** ~$0.07–0.10

---

## Screenshots (7 files)

| File | Content |
|------|---------|
| `01-full-page.png` | Complete 5749px article |
| `02-hero-zone.png` | Headline, summary, THE SIGNAL block, sidebar |
| `03-by-the-numbers.png` | Action strip + "Why It Matters" top |
| `04-why-it-matters.png` | Full "Why it matters" section + pull quote |
| `05-cascade-timeline.png` | Stakeholders grid + pull quote dark card |
| `06-decision-aid.png` | Decision Aid + start of action items |
| `07-counter-reactions.png` | Action items + standup broadcast block |
