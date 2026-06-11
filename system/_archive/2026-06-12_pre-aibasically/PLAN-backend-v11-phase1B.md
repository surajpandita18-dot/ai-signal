# AI Signal V11 — Backend Phase 1B Implementation Plan

**Goal:** Update writer + validator + DB so writer outputs all 22 universal sections. Frontend wiring happens in Phase 1C.

**Branch:** `backend-v11` (NEW, branched from `main`, NOT from `design-v11`)
**Schema strategy:** Single `extended_data jsonb` column (Option 2 — flexible, future-proof)
**Estimated time:** 2.5–3 hours, sequentially gated
**Production safety:** Branch isolated. DB migration applied only after testing.

---

## 🚨 ROOT CAUSES TO PREVENT (Karpathy Discipline)

| # | Mistake | Prevention |
|---|---|---|
| 1 | Big-bang prompt rewrite | Update prompts.ts in steps — schema first, then sections incrementally |
| 2 | Apply DB migration before testing | Apply migration LAST after prompt + validator tested locally |
| 3 | Skip validator hardening | Validator must reject incomplete output; trigger regeneration |
| 4 | Sub-agent parallel work | Single-threaded. One file at a time. |
| 5 | Touch frontend during this phase | DO NOT modify any src/components or src/app — frontend is Phase 1C |
| 6 | Push to main before testing | Branch stays local until full verify |

---

## 📂 FILE INVENTORY

### Files to MODIFY:
```
src/lib/prompts.ts                        (137 lines → ~280 lines)
src/lib/article-validator.ts              (292 lines → ~450 lines)
src/lib/journalist-agent.ts               (482 lines, minor updates ~30 lines)
src/inngest/generate-signal.ts            (verify it persists extended_data correctly, ~10 line update)
```

### Files to CREATE:
```
db/migrations/001_add_extended_data.sql   (new migration file)
db/migrations/README.md                   (migration order docs)
src/lib/types/extended-data.ts            (TypeScript type for the new field)
```

### Files NOT TO TOUCH:
```
src/components/                           (frontend — Phase 1C)
src/app/                                  (frontend — Phase 1C)
src/app/globals.css                       (CSS — Phase 1A still WIP on design-v11)
db/seed.sql                               (don't modify, just learn from it)
package.json                              (no new deps)
```

---

## 🎯 THE EXTENDED_DATA SCHEMA

This is the SHAPE that writer must output and validator must enforce.

```typescript
// src/lib/types/extended-data.ts

export type TickerData = {
  label: string;          // "GPT-5 Mini · per 1M"
  value: string;          // "$0.04"
  delta: {
    direction: 'up' | 'down' | 'flat';
    text: string;         // "↓ 10×" or "↑ 18%"
  };
  detail: string;         // "Down from $0.40 · 24h ago"
};

export type PreviewCard = {
  index: '01' | '02' | '03';
  label: 'By the numbers' | 'Why it matters' | 'The move' | 'The fact';
  value: string;          // "$0.04 per 1M tokens"
};

export type ComparisonChart = {
  type: 'comparison' | 'trajectory' | 'cap_flow' | 'quote_callout';
  title: string;          // "The data shifted overnight"
  subtitle: string;       // "Per 1M tokens, log scale"
  data: ComparisonRow[] | TrajectoryPoint[] | CapFlowNode[] | QuoteCallout;
};

export type ComparisonRow = {
  label: string;          // "GPT-5 Mini"
  value: string;          // "$0.04"
  width_pct: number;      // 5 to 100
  fill_color: 'signal' | 'warm' | 'mute';
  opacity?: number;       // 0.5 if dimmed
};

export type TrajectoryPoint = {
  date: string;           // "Jan 2024"
  value: number;          // for chart
  label?: string;         // optional point label
};

export type CapFlowNode = {
  from: string;
  to: string;
  amount: string;         // "$25B"
};

export type QuoteCallout = {
  quote: string;
  attribution: string;
};

export type InsightCell = {
  icon: '→' | '◐' | '⚡';
  label: 'What changed' | "Who's affected" | 'Move by';
  text: string;           // can include <span class="highlight">key phrase</span> for emphasis
};

export type CascadeStep = {
  marker: number;         // 1, 2, 3, 4
  week: string;           // "This week", "Week 2", "Week 3", "Week 4"
  event: string;          // 1-line description of what happens
};

export type CascadeData = {
  direction: 'forecast' | 'history';
  title: string;          // "What ripples next" / "How we got here"
  subtitle: string;
  steps: CascadeStep[];   // exactly 4
};

export type StakeholderCell = {
  type: 'win' | 'lose' | 'evidence_strong' | 'evidence_weak' | 'open_question' | 'before' | 'after';
  who: string;            // "Cost-sensitive SaaS builders"
  why: string;            // can include <strong>key phrase</strong>
};

export type StakeholdersData = {
  frame: 'win_lose' | 'evidence_grid' | 'before_after';
  title: string;
  subtitle: string;
  cells: StakeholderCell[];   // exactly 4
};

export type DecisionRow = {
  q_num: string;          // "Q1", "Q2", "Q3"
  question: string;
  verdict: 'go' | 'wait' | 'no' | 'segment_a' | 'segment_b' | 'segment_c';
  verdict_text: string;   // "Yes → Go" / "Run evals first" / "Wait — no urgency"
};

export type DecisionAid = {
  frame: 'yes_no' | 'segment_impact';
  title: string;
  question: string;       // "Should you switch this week?"
  rows: DecisionRow[];    // exactly 3
  final_verdict: string;  // 1-line summary
};

export type Reaction = {
  quote: string;
  name: string;           // "Anonymous VC"
  role: string;           // "Tier-1 fund · AI thesis"
};

export type DidYouKnowFact = {
  category: 'numbers' | 'trivia' | 'industry';
  text: string;
};

export type StandupMessages = {
  slack: string;          // pre-formatted with markdown bold/italic
  email: string;
  whatsapp: string;
  linkedin: string;
};

export type TomorrowDraft = {
  day: 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' | 'MON';
  date: string;           // "28 Apr"
  text: string;           // headline of upcoming draft
  status: 'lead_candidate' | 'sealed';
  status_detail?: string; // "Lead candidate · 06:14 IST"
};

export type ExtendedData = {
  // Hero zone — ALWAYS REQUIRED
  tickers: TickerData[];                      // exactly 3
  preview_cards: PreviewCard[];               // exactly 3
  broadcast_phrases: string[];                // exactly 6 (typewriter cycle)

  // Notebook — ALWAYS REQUIRED
  did_you_know_facts: DidYouKnowFact[];       // 8-12 facts

  // Article body — ALWAYS REQUIRED
  primary_chart: ComparisonChart;             // type-determined data
  insights_strip: InsightCell[];              // exactly 3

  // Forecast — ALWAYS REQUIRED
  cascade: CascadeData;

  // Impact — ALWAYS REQUIRED
  stakeholders: StakeholdersData;

  // Decision — ALWAYS REQUIRED
  decision_aid: DecisionAid;

  // External voices — ALWAYS REQUIRED
  reactions: Reaction[];                       // exactly 3

  // Standup — ALWAYS REQUIRED
  standup_messages: StandupMessages;

  // Sidebar — ALWAYS REQUIRED
  tomorrow_drafts: TomorrowDraft[];            // exactly 3
};
```

**Total: 12 root-level fields, ~50 sub-fields.**

---

## 🛡️ SMART FALLBACK RULES (for writer prompt)

When article data is thin, writer must NOT skip — instead use softer-quality content with same structure.

| Section | Hard data available | Soft fallback |
|---|---|---|
| `preview_cards[0].label` | "By the numbers" + numeric value | "The fact" + qualitative |
| `primary_chart.type` | `comparison` if 3+ entities to compare | `quote_callout` (large editorial pull quote) |
| `cascade.direction` | `forecast` if future events knowable | `history` if "how we got here" |
| `stakeholders.frame` | `win_lose` if zero-sum | `evidence_grid` (research) or `before_after` (timeline) |
| `decision_aid.frame` | `yes_no` if reader has decision | `segment_impact` (different reader segments) |
| `reactions` | 3 named voices | 3 anonymous archetypes (VC / CTO / Researcher) |

---

## 🔧 SEQUENTIAL EXECUTION STEPS

After EVERY step, verify before proceeding. Karpathy discipline.

---

### STEP 0: Branch setup (3 min)

```bash
cd /Users/surajpandita/ai_signal
git status                          # confirm on design-v11 with clean tree
git checkout main                    # back to safe base
git pull origin main
git checkout -b backend-v11          # NEW branch for backend work
git status
```

**STOP. Confirm:** "On `backend-v11` branch, clean working tree."

---

### STEP 1: Read all relevant files (10 min)

Read in this order:
1. `db/seed.sql` — current schema
2. `src/lib/prompts.ts` — current writer prompt (137 lines)
3. `src/lib/article-validator.ts` — current validation (292 lines)
4. `src/lib/journalist-agent.ts` — agent flow (482 lines)
5. `src/inngest/generate-signal.ts` — Inngest function (702 lines)

**Action:** Output a one-paragraph summary of:
- Current schema fields in `stories` table
- How writer prompt is structured (system + user, JSON output expectations)
- How validator currently checks output
- How journalist-agent transforms data
- Where in generate-signal.ts the data is persisted

**STOP. Confirm:** "Read all files. Here's the current flow: [summary]. Ready to design changes."

---

### STEP 2: Create extended-data type (10 min)

Create `src/lib/types/extended-data.ts` with the full TypeScript types from "THE EXTENDED_DATA SCHEMA" section above.

**DO:**
- Copy types verbatim from this plan
- Export every type
- Add JSDoc comments for each exported type

**DON'T:**
- Add runtime code
- Import anything (pure types file)

**Verify:**
```bash
mkdir -p src/lib/types
npx tsc --noEmit
```

**STOP. Confirm:** "extended-data.ts created. tsc passes."

---

### STEP 3: Update prompts.ts — append schema doc (30 min)

Open `src/lib/prompts.ts`. Find the JSON schema section (around line 65 — "Return valid JSON matching this schema exactly").

**Action:** Add to the existing schema description ALL the new `extended_data` fields with examples.

**Critical:** Do NOT delete existing fields. ADD `extended_data` as a top-level field in the JSON output schema.

**Pattern:**
```
... (existing schema)

extended_data: {
  tickers: [3 objects with label, value, delta, detail],
  preview_cards: [3 objects with index, label, value],
  broadcast_phrases: [6 strings — typewriter rotation; numbers in <num>X</num> markup],
  did_you_know_facts: [8-12 objects with category, text],
  primary_chart: { type, title, subtitle, data },
  insights_strip: [3 objects with icon, label, text],
  cascade: { direction, title, subtitle, steps: [4 objects] },
  stakeholders: { frame, title, subtitle, cells: [4 objects] },
  decision_aid: { frame, title, question, rows: [3 objects], final_verdict },
  reactions: [3 objects with quote, name, role],
  standup_messages: { slack, email, whatsapp, linkedin },
  tomorrow_drafts: [3 objects]
}
```

**For each section, add a CONCRETE EXAMPLE in the prompt** based on the GPT-5 Mini reference (from `db/seed.sql` and `docs/design-reference/v11.html`).

**Smart fallback rules** also go into prompt as guidance:
- "If no clean comparison data, use primary_chart.type='quote_callout' with a strong editorial pull quote"
- "If reader has no decision to make, use decision_aid.frame='segment_impact' instead"
- etc.

**Verify:**
```bash
wc -l src/lib/prompts.ts                   # expect grew from 137 to ~280
grep -c "extended_data" src/lib/prompts.ts # expect ≥ 5
```

**STOP. Confirm:** "Prompt updated. Schema doc complete. Ready for validator."

---

### STEP 4: Update article-validator.ts (30 min)

Open `src/lib/article-validator.ts`.

**Action:** Add validation for `extended_data`:

1. Import the types from `src/lib/types/extended-data.ts`
2. Add a function `validateExtendedData(data: any): ValidationResult` that checks:
   - `tickers` array length === 3, each has label/value/delta/detail
   - `preview_cards` array length === 3, labels match enum
   - `broadcast_phrases` array length === 6, each is non-empty string
   - `did_you_know_facts` length 8-12, each has category enum + text
   - `primary_chart.type` matches enum, data shape matches type
   - `insights_strip` length === 3, each has icon enum + label + text
   - `cascade.direction` enum, `cascade.steps` length === 4
   - `stakeholders.frame` enum, `cells` length === 4
   - `decision_aid.frame` enum, `rows` length === 3
   - `reactions` length === 3
   - `standup_messages` has all 4 platform keys, all non-empty
   - `tomorrow_drafts` length === 3
3. Call this from the main validator. Empty/missing fields → soft error (logged but doesn't block). Invalid shapes → hard error (regenerate).

**DO:**
- Use existing validator pattern (don't restructure file)
- Add logging for which checks fail
- Soft-fail vs hard-fail clearly distinguished

**DON'T:**
- Delete existing validation rules
- Make all checks hard-fail (would block production on minor issues)

**Verify:**
```bash
wc -l src/lib/article-validator.ts         # expect grew from 292 to ~450
npx tsc --noEmit
```

**STOP. Confirm:** "Validator updated. Compile passes."

---

### STEP 5: Update journalist-agent.ts + generate-signal.ts (15 min)

Open `src/lib/journalist-agent.ts` and `src/inngest/generate-signal.ts`.

**Action:**
1. In `journalist-agent.ts`: ensure the agent's output type includes `extended_data` field (line ~30 where output schema is defined). Add type to result.
2. In `generate-signal.ts`: when persisting story to DB, include `extended_data` in the insert/update payload.

**Find the persistence call** (search for `insert into stories` or `.from('stories').insert`). Add `extended_data: parsedOutput.extended_data` to the column list.

**DO:**
- Minimal change — just thread the field through
- Don't restructure agent flow

**DON'T:**
- Change the agent prompt logic
- Add new agent steps

**Verify:**
```bash
npx tsc --noEmit
grep -c "extended_data" src/lib/journalist-agent.ts src/inngest/generate-signal.ts
# expect ≥ 2
```

**STOP. Confirm:** "Agent + Inngest updated. Compile passes."

---

### STEP 6: Create DB migration file (10 min)

Create `db/migrations/001_add_extended_data.sql`:

```sql
-- Migration: Add extended_data column to stories
-- Date: 2026-05-05
-- Purpose: Enable V11 universal article structure (12 new sections in single jsonb)
-- Rollback: ALTER TABLE stories DROP COLUMN extended_data;

ALTER TABLE stories
ADD COLUMN extended_data jsonb;

-- Add index for future querying
CREATE INDEX IF NOT EXISTS idx_stories_extended_data_type
ON stories USING gin (extended_data);

-- Backfill existing stories with empty object (so reads don't break)
UPDATE stories
SET extended_data = '{}'::jsonb
WHERE extended_data IS NULL;
```

Also create `db/migrations/README.md`:
```markdown
# DB Migrations

Migrations run in order. Apply manually via Supabase SQL editor or psql.

## 001_add_extended_data.sql
Adds `extended_data jsonb` to stories table for V11 universal sections.
Applied: [DATE TBD]
```

**STOP. Confirm:** "Migration file created. NOT applied yet."

---

### STEP 7: Apply migration to Supabase (10 min)

⚠️ **THIS IS THE FIRST PRODUCTION-AFFECTING STEP.**

1. Open Supabase dashboard → SQL Editor
2. Paste contents of `db/migrations/001_add_extended_data.sql`
3. Click "Run"
4. Verify: `SELECT column_name FROM information_schema.columns WHERE table_name = 'stories';`
5. Should see `extended_data` in list

**Critical:** This adds a new nullable column. Existing articles unaffected. New articles will have it populated. Frontend Phase 1A still works (frontend doesn't read `extended_data` until Phase 1C).

**Rollback if needed:** `ALTER TABLE stories DROP COLUMN extended_data;`

**STOP. Confirm:** "Migration applied. extended_data column exists. Existing articles unaffected."

---

### STEP 8: Test regenerate one article (30-45 min)

This is the validation step. Plan must work end-to-end.

1. **Find Inngest dashboard URL** (likely `localhost:3001/api/inngest` or `inngest.com` cloud)
2. **Trigger `generate-signal` function manually** with a test issue
3. **Watch logs** — check:
   - Writer prompt sent (with new schema doc)
   - Writer output received (JSON with `extended_data`)
   - Validator runs (any soft warnings logged)
   - DB write happens (no errors)
4. **Query DB** to verify:
   ```sql
   SELECT id, headline, extended_data FROM stories ORDER BY created_at DESC LIMIT 1;
   ```
   - `extended_data` should be a populated JSON object
   - All 12 fields should be present
5. **Inspect the populated data:**
   - Are tickers populated with real-feeling data?
   - Is primary_chart type set correctly?
   - Are stakeholders well-categorized?

**If output is incomplete:**
- Iterate on prompts.ts — make instruction more explicit
- Add more concrete examples
- Re-run

**Common iteration loop (expect 2-3 cycles):**
- Run → check output → field X is bad → tighten prompt → re-run

**STOP. Confirm:** "Test article regenerated. extended_data populated correctly. Validator passes."

---

### STEP 9: Commit + push branch (5 min)

```bash
git add db/migrations/
git add src/lib/types/extended-data.ts
git add src/lib/prompts.ts
git add src/lib/article-validator.ts
git add src/lib/journalist-agent.ts
git add src/inngest/generate-signal.ts
git status

git commit -m "backend: phase 1B — extended_data jsonb for V11 universal sections

Add support for 12 new universal article sections:
- tickers, preview_cards, broadcast_phrases (hero)
- did_you_know_facts (notebook)
- primary_chart, insights_strip (article body)
- cascade, stakeholders, decision_aid (analysis)
- reactions, standup_messages (engagement)
- tomorrow_drafts (sidebar)

Schema: single extended_data jsonb column on stories table.
Smart fallback rules in prompt for thin-data articles.
Validator enforces array lengths, type enums, required fields.

DB migration applied 2026-05-05.
Frontend wiring deferred to Phase 1C (design-v11 branch).
"

git push origin backend-v11
```

**STOP. Tell user:** "Backend branch committed and pushed. NOT merged to main. Tomorrow: Phase 1C (frontend wiring on design-v11)."

---

## 🛑 ROLLBACK PLAN

If anything breaks:

**Code-side:**
```bash
git checkout main
git branch -D backend-v11
```

**DB-side:**
```sql
ALTER TABLE stories DROP COLUMN extended_data;
DROP INDEX IF EXISTS idx_stories_extended_data_type;
```

Production unaffected. Existing article generation continues working.

---

## ✅ SUCCESS CRITERIA

Phase 1B COMPLETE when ALL TRUE:

- [ ] Branch `backend-v11` exists with commit
- [ ] `src/lib/types/extended-data.ts` created
- [ ] `src/lib/prompts.ts` includes `extended_data` schema (lines grew ~140)
- [ ] `src/lib/article-validator.ts` includes extended-data validation (lines grew ~150)
- [ ] `journalist-agent.ts` + `generate-signal.ts` thread the field through
- [ ] `db/migrations/001_add_extended_data.sql` exists
- [ ] Migration applied to Supabase production DB
- [ ] At least one new article generated with populated `extended_data`
- [ ] All 12 fields in `extended_data` are non-empty
- [ ] Validator runs without hard-failing
- [ ] `npx tsc --noEmit` passes

---

## 🎯 PHASE 1C SCOPE (NEXT, NOT THIS SESSION)

After Phase 1B is verified and merged:

1. Switch back to `design-v11` branch
2. Create 9 frontend components for missing sections
3. Wire each component to read `story.extended_data.X`
4. Visual verify each section
5. Merge `design-v11` to main

---

## 📞 IF STUCK

1. Check root cause table at top
2. Check what `seed.sql` shows for current schema
3. Ask: "Stuck at Step N because X. The current schema looks like Y. Should I do Z?"

**DON'T improvise. DON'T skip steps. DON'T touch frontend.**

If a step needs more time than estimated, that's normal. Don't rush. Better to ship correctly in 4 hours than break in 2.

---

**End of plan. Execute sequentially. Verify each step.**
