---
name: Phase 2 Sonnet Prompt Gaps
description: Generation prompt gaps logged during Phase 1C verification — fix in next prompt iteration
type: project
---

## V11 Word Count Reference (Mission 1 output)

Extracted from `docs/design-reference/v11.html`. Word counts use whitespace-split token method, HTML tags stripped. Sections with multiple instances report a range; soft/hard targets derived from those ranges.

| Section | Type | V11 count | Soft target | Hard cap | Note |
|---------|------|-----------|-------------|----------|------|
| **HERO ZONE** | | | | | |
| Hero broadcast tagline | FIXED | 6–12 w | 10 | 14 | Type A editorial only — see note below |
| Hero ticker label (per item) | FIXED | 4–5 w | 5 | 6 | Metric label + timeframe; data-driven slot |
| Hero ticker detail (per item) | FIXED | 4–6 w | 5 | 7 | Context line beneath the value |
| **TL;DR ZONE** | | | | | |
| TL;DR strip body | FIXED | 25 w | 25 | 30 | Two sentences; sets stakes before article |
| **SIGNAL BLOCK** | | | | | |
| Signal block headline | FIXED | 12 w | 12 | 14 | Main article h2; punchy, verb-led |
| Signal block body paragraph | FIXED | 36 w | 36 | 42 | The lede paragraph inside .signal-block |
| **BLOCK 1 — BY THE NUMBERS** | | | | | |
| numbers_headline | FIXED | 4 w | 4 | 6 | Block-title for "By the Numbers"; 3–5 words ideal |
| stat-card label (per card, 3 cards) | FIXED | 1–2 w | 2 | 3 | Ultra-short metric label (e.g. "Input cost") |
| stat-card detail body (per card) | FIXED | 5–8 w | 7 | 10 | One-line context below the value |
| Insights strip text (per cell, 3 cells) | FIXED | 10–14 w | 12 | 17 | Scannable insight nugget; must fit one cell |
| **BLOCK 2 — WHY IT MATTERS** | | | | | |
| matters_headline | FIXED | 6 w | 6 | 8 | Block-title for "Why it matters"; declarative sentence |
| Block 2 prose paragraph 1 | FIXED | 32 w | 32 | 38 | First prose paragraph; opens with consequence |
| Block 2 prose paragraph 2 | FIXED | 38 w | 38 | 46 | Second prose paragraph; follows pull quote |
| Pull quote | FIXED | 20 w | 20 | 24 | Single italic blockquote; see bold marker note below |
| **CASCADE TIMELINE** | | | | | |
| cascade.subtitle | FIXED | 10 w | 10 | 12 | Subtitle under "What ripples next" header |
| Cascade step event text (per step, 4 steps) | FIXED | 8–9 w | 9 | 11 | One declarative sentence per step |
| **STAKEHOLDERS GRID** | | | | | |
| stakeholders.subtitle | FIXED | 8 w | 8 | 10 | Subtitle under "Who's affected" header |
| Stakeholder cell who text (per cell, 4 cells) | FIXED | 3–5 w | 4 | 6 | Role/persona label; noun phrase only |
| Stakeholder cell why text (per cell, 4 cells) | FIXED | 11–18 w | 14 | 22 | 1–2 sentences on impact for that stakeholder |
| **BUILDER BLOCK** | | | | | |
| Builder quote | DYNAMIC | 29 w | 29 | 35 | First-person builder voice; code-floor POV |
| Bet card body (bull case) | DYNAMIC | 32 w | 32 | 38 | Opportunity framing; time-pressured |
| Burn card body (bear case) | DYNAMIC | 39 w | 39 | 47 | Risk framing; contrast with Bet |
| **DECISION AID** | | | | | |
| Decision aid question (per row, 3 rows) | FIXED | 8–10 w | 9 | 12 | Yes/no qualifying question |
| Decision aid pill text (per row) | FIXED | 3–4 w | 3 | 5 | Action pill ("Yes → Go", "Run evals first") |
| Decision aid verdict_text guidance | FIXED | 10 w | 10 | 12 | Measured from v11.html source; one-line synthesis |
| **BLOCK 3 — THREE THINGS TO DO** | | | | | |
| Action body (per action, 3 actions) | FIXED | 20–26 w | 23 | 31 | ~2 sentences; bold opener + context |
| Action type label (per action) | FIXED | 1–2 w | 1 | 2 | "Run" / "Flag" / "Check"; v11 has no time estimate field |
| **COUNTER-BLOCK** | | | | | |
| Counter-block body | FIXED | 53 w | 53 | 62 | Devil's advocate para; 3–4 sentences |
| **REACTIONS** | | | | | |
| Reaction quote (per reaction, 3 reactions) | FIXED | 15–18 w | 17 | 22 | Industry voice; quoted in first-person |
| Reaction attribution (per reaction) | FIXED | 8–10 w | 9 | 12 | Name · role · affiliation |
| **DID YOU KNOW (Notebook Facts)** | | | | | |
| Notebook fact (pool of 12) | FIXED | 11–23 w | 17 | 28 | 1–2 sentences; stat-first; range wide due to number-heavy facts |

### Story zone (not in signal block, but word-count constrained)

| Section | Type | V11 count | Soft target | Hard cap | Note |
|---------|------|-----------|-------------|----------|------|
| Story deck (sub-headline) | FIXED | 24 w | 24 | 29 | Italic serif; two sentences beneath story headline |

---

### Hero broadcast — type scope note

Sonnet generates **Type A only** (3 of 8 phrases). Type B (live counters) and Type C (backstory) are hardcoded in v11.html JS — **DO NOT instruct Sonnet to generate these.**

| Type | Phrases | Source |
|------|---------|--------|
| A — editorial (Sonnet scope) | "Today's signal: [framing]." · "OpenAI quietly cut…" · "If you ship AI products, your [implication]." | Sonnet generates per-article |
| B — live counters (hardcoded) | Token burn counter · water cooling counter · startup counter | JS runtime vars (`liveTokens`, `liveWater`, `liveStartups`) |
| C — backstory (hardcoded) | "Why 06:14 IST?" · "Today's signal cleared X articles…" | Static strings; article-agnostic |

Type A pattern: one editorial sentence, 6–12 words, AI Signal voice, article-specific framing.

---

### Pull quote — bold marker note

V11 reference has plain prose (no bold). Phase 1C added markdown bold markers (`**`) for punch phrase emphasis (e.g., "...your timeline just compressed by **12 months**"). This is a deliberate design improvement over v11 — **Option B adopted**: bold markers allowed, word count excludes markers. Sonnet should use `**bold**` for 1–3 key words per pull quote for emphasis, not for entire phrases.

---

## Observations

**Tightly constrained sections (must hit close to exact):** The hero broadcast tagline (6–12 w), numbers headline (4 w), matters headline (6 w), stat-card labels (1–2 w), cascade event steps (8–9 w), and decision pill text (3–4 w) leave almost no room. Any Sonnet output over hard cap here will visually break the layout — stat labels truncate, broadcast text wraps. These need the strictest prompt constraints with explicit word caps and example-driven formatting.

**Sections with flexibility:** Counter-block body (53 w, cap 62), Block 2 prose paragraphs (32–38 w), and stakeholder why text (11–18 w range across 4 cells) have meaningful variance in v11 itself, which means Sonnet can breathe here. The builder block (bet/burn cards at 32–39 w) is article-type-gated anyway (DYNAMIC), so variation is expected. Action bodies (20–26 w across 3 actions) have the widest intra-section spread — action 3 runs 26 w vs action 2 at 20 w — suggesting sentence-count drives length more than any fixed target.

**Sections where v11 is variable by design:** The notebook fact pool has 12 facts ranging 11–23 words because number-heavy facts naturally run longer. Any prompt constraint should allow 11–25 w and not target a single number. Similarly, stakeholder "why" cells vary 11–18 w because win-cells tend to be more expansive than loss-cells in v11. **Note:** `action time estimate` does not exist as a word-count field in v11 — the action-tag slot contains a type label (Run/Flag/Check, 1 word) rather than a duration string.

---

## SONNET PROMPT GAP 1 — stats field never populated

**Status:** Blocked until Phase 2 prompt work
**Symptom:** `story.stats` always null. "By the Numbers" section hidden defensively.
**Root cause:** `stats` is not in the `extended_data` JSON schema in `generate-signal.ts`. The top-level `stats` column predates `extended_data` and is never written by the current pipeline.

**Fix required in `generate-signal.ts`:**
Add `stats` to `extended_data` prompt schema with article-type-specific examples:

| article_type | stats shape |
|---|---|
| PRODUCT-PRICING | latency delta, cost-per-token change, release tier |
| FUNDING | raise size, runway, comparable round |
| POLICY-REGULATION | deadline, scope (who affected), penalty |
| RESEARCH-BENCHMARK | SOTA metric delta, compute cost, reproducibility |

**How to apply:** After adding to prompt schema, write `extended_data.stats` and also populate the top-level `story.stats` column at upsert time (or read from `extended_data.stats` in the component).

---

## SONNET PROMPT GAP 2 — quote_callout chart schema ambiguous

**Status:** Blocked until Phase 2 prompt work
**Symptom:** Generator outputs `quote_callout` type but writes comparison-row array as `data` instead of `{ quote, attribution }`. Results in empty "Editorial take" section above insights strip.
**Root cause:** Prompt schema for `primary_chart` doesn't enforce shape per `type`. Generator picks `quote_callout` correctly but fills `data` with its default (comparison row) template.

**Fix required in `generate-signal.ts`:**
In the `primary_chart` JSON schema example, add explicit per-type data shapes:
```json
// When type = "quote_callout":
"data": { "quote": "...", "attribution": "AI Signal, [Date]" }

// When type = "comparison":
"data": [{ "label": "...", "value": "...", "width_pct": 80, "fill_color": "signal" }]
```

**Why:** **Do not** use `editorial_take` or `pull_quote` as chart content. Chart quote should be a distinct insight, not a duplicate of existing fields.
