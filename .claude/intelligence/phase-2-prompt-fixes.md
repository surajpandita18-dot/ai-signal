---
name: Phase 2 Sonnet Prompt Gaps
description: Generation prompt gaps logged during Phase 1C verification — fix in next prompt iteration
type: project
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
