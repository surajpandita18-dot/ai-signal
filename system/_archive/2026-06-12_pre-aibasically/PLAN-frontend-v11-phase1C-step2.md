# Phase 1C Step 2 — Thread extended_data to NotebookFacts + SidebarProbablyCard

**Scope:** Prop swaps only. No new components. No CSS. No DB changes.
**STOP signal:** After Step 2 verify, do NOT start Step 3.
**Estimated time:** ~45 min. ~80 lines net change across 5 files.

---

## What Step 2 does

Feeds live `extended_data` fields from the current story into two components that
currently run on hardcoded fallback data:

| Component | Field consumed | Fallback when absent |
|---|---|---|
| `NotebookFacts` | `extended_data.did_you_know_facts` | hardcoded `FACTS` constant |
| `SidebarProbablyCard` | `extended_data.tomorrow_drafts` | hardcoded `FALLBACK_TEASERS` + computed dates |

---

## Type reference (already defined — do not redefine)

```ts
// src/lib/types/extended-data.ts
type DidYouKnowFact = {
  category: 'numbers' | 'trivia' | 'industry';
  text: string;              // plain text, no HTML spans
};

type TomorrowDraft = {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  date: string;              // e.g. "7 May"
  text: string;
  status: 'lead_candidate' | 'sealed';
  status_detail?: string;
};
```

Import path for all 5 files: `import type { DidYouKnowFact, TomorrowDraft } from '@/lib/types/extended-data'`

---

## Null-safety pattern (establish once, reuse everywhere)

```ts
// Cast extended_data jsonb to a typed Record at one callsite
const rawExt = story.extended_data as Record<string, unknown> | null

// Array guard before casting — never trust DB JSON shapes
const didYouKnowFacts = Array.isArray(rawExt?.did_you_know_facts)
  ? (rawExt!.did_you_know_facts as DidYouKnowFact[])
  : undefined

const tomorrowDrafts = Array.isArray(rawExt?.tomorrow_drafts)
  ? (rawExt!.tomorrow_drafts as TomorrowDraft[])
  : undefined
```

This extraction lives in `HomePageClient.tsx` — nowhere else. Downstream
components receive typed props, not raw JSON.

---

## File-by-file changes

### 1. `src/components/HomePageClient.tsx` (~15 lines)

**Current state:**
- Line 29: `teasers?: UpcomingTeaser[]` in `HomePageClientProps`
- Line 94: `<NotebookStrip />` — no props
- Line 104: `<ReadingSidebar readPct={readPct} signalNumber={signalNumber} teasers={teasers} />`

**Changes:**
1. Add import: `import type { DidYouKnowFact, TomorrowDraft } from '@/lib/types/extended-data'`
2. After the `broadcastPhrases` extraction block, add the null-safety extraction (pattern above)
3. Change `<NotebookStrip />` → `<NotebookStrip facts={didYouKnowFacts} />`
4. Add `drafts={tomorrowDrafts}` to `<ReadingSidebar>` (keep `teasers` prop intact as fallback)

**Do NOT:**
- Remove `teasers` from `HomePageClientProps` (page.tsx still passes it)
- Touch `broadcastPhrases`, `HeroZone`, or `StoryArticle`

---

### 2. `src/components/NotebookStrip.tsx` (~6 lines)

**Current state:**
- Line 3: `interface NotebookStripProps { className?: string }`
- Line 22: `<NotebookFacts />` — no props

**Changes:**
1. Add import: `import type { DidYouKnowFact } from '@/lib/types/extended-data'`
2. Add `facts?: DidYouKnowFact[]` to `NotebookStripProps`
3. Destructure `facts` in the component signature
4. Pass `facts={facts}` to `<NotebookFacts />`

---

### 3. `src/components/NotebookFacts.tsx` (~20 lines)

**Current state:**
- Line 7: hardcoded `FACTS` constant (12 items, `{ cat, html }` shape)
- Line 25: `type Fact = { cat: string; html: string }`
- Line 27: `filterFacts()` filters by `cat`
- Line 46: `export function NotebookFacts()` — no props
- Line 166: `dangerouslySetInnerHTML={{ __html: currentFact?.html ?? '' }}`

**Changes:**
1. Add import: `import type { DidYouKnowFact } from '@/lib/types/extended-data'`
2. Add `interface NotebookFactsProps { facts?: DidYouKnowFact[] }` (new, above component)
3. Update component signature: `export function NotebookFacts({ facts }: NotebookFactsProps)`
4. Add normalization immediately after the signature — convert `DidYouKnowFact[]` to internal `Fact[]`:

```ts
const liveFacts: readonly Fact[] | null =
  facts && facts.length > 0
    ? facts.map(f => ({ cat: f.category, html: f.text }))
    : null
```

5. Update `filterFacts()` call to use `liveFacts ?? FACTS` as the source:

```ts
// Old:
const safeFacts = filterFacts(activeCategory)
// New:
const safeFacts = filterFacts(activeCategory, liveFacts ?? FACTS)
```

6. Update `filterFacts` signature:
```ts
function filterFacts(category: Category, source: readonly Fact[] = FACTS): readonly Fact[] {
  if (category === 'all') return source
  const filtered = source.filter(f => f.cat === category)
  return filtered.length > 0 ? filtered : source
}
```

7. Update `factCountRef.current = safeFacts.length` stays as-is (already handles dynamic length)

**Note on HTML:** `DidYouKnowFact.text` is plain text — no `<span class="nb-num">` styling. The
`dangerouslySetInnerHTML` call still works safely because plain text has no tags. The number
highlighting will only appear for the hardcoded FACTS fallback. That's intentional — live facts
are correct, just unstyled. A future step can add span injection to the writer prompt.

**Do NOT:**
- Remove the hardcoded `FACTS` constant (it's the fallback)
- Change the category filter tab behavior

---

### 4. `src/components/ReadingSidebar.tsx` (~8 lines)

**Current state:**
- Line 6: `interface UpcomingTeaser { dayOfWeek, date, text, status }`
- Line 13: `interface ReadingSidebarProps { readPct, signalNumber, teasers? }`
- Line 25: `<SidebarProbablyCard teasers={envelopes} />`

**Changes:**
1. Add import: `import type { TomorrowDraft } from '@/lib/types/extended-data'`
2. Add `drafts?: TomorrowDraft[]` to `ReadingSidebarProps`
3. Destructure `drafts` in component signature
4. Pass `drafts={drafts}` to `<SidebarProbablyCard>`

**Do NOT:**
- Remove `teasers` from props (HomePageClient still passes it)
- Remove `UpcomingTeaser` interface (still in use)

---

### 5. `src/components/SidebarProbablyCard.tsx` (~25 lines)

**Current state:**
- Line 3: `interface Teaser { text: string }`
- Line 7: `interface SidebarProbablyCardProps { teasers?: Teaser[] }`
- Lines 23-30: computes `days` array from `new Date()` offsets
- Line 40: `const teaserText = teasers[i]?.text ?? FALLBACK_TEASERS[i] ?? ''`
- Line 42: `const isLead = i === 0`
- Line 49-50: uses `days[i]?.day` and `days[i]?.date`

**Changes:**
1. Add import: `import type { TomorrowDraft } from '@/lib/types/extended-data'`
2. Add `drafts?: TomorrowDraft[]` to `SidebarProbablyCardProps` (keep `teasers` intact)
3. Destructure `drafts` in component signature
4. Keep the `days` computation as fallback (used when `drafts` is empty)
5. Update the inner map:

```tsx
// Old approach (lines 40-42):
const teaserText = teasers[i]?.text ?? FALLBACK_TEASERS[i] ?? ''
const isLead = i === 0

// New approach — prefer draft data, fall back to teasers + computed dates:
const draft = drafts?.[i]
const teaserText = draft?.text ?? teasers?.[i]?.text ?? FALLBACK_TEASERS[i] ?? ''
const dayLabel   = draft?.day ?? days[i]?.day ?? 'TBD'
const dateLabel  = draft?.date ?? days[i]?.date ?? ''
const isLead     = draft ? draft.status === 'lead_candidate' : i === 0
```

6. Update JSX to use `dayLabel` and `dateLabel` instead of `days[i]?.day` and `days[i]?.date`

**Do NOT:**
- Remove `teasers` prop (ReadingSidebar still passes it)
- Remove `FALLBACK_TEASERS` constant (still the text fallback)
- Remove the `days` computation (still needed when no drafts)

---

## Threading diagram

```
page.tsx
  story.extended_data → (null-safety extraction)
    └─ did_you_know_facts → HomePageClient (new prop: facts)
         └─ NotebookStrip (new prop: facts)
              └─ NotebookFacts (new prop: facts)
    └─ tomorrow_drafts → HomePageClient (new prop: drafts on ReadingSidebar)
         └─ ReadingSidebar (new prop: drafts)
              └─ SidebarProbablyCard (new prop: drafts)
```

`page.tsx` itself does NOT change — extraction happens in `HomePageClient`.

---

## Acceptance criteria

- [ ] `NotebookFacts` shows live facts when `extended_data.did_you_know_facts` is non-empty
- [ ] `NotebookFacts` falls back to hardcoded FACTS when prop is absent
- [ ] Category filter still works for both live and fallback facts (`category` maps to `cat`)
- [ ] `SidebarProbablyCard` shows live `day`/`date`/`text` when `extended_data.tomorrow_drafts` present
- [ ] `SidebarProbablyCard` falls back to computed dates + FALLBACK_TEASERS when prop is absent
- [ ] `isLead` uses `draft.status === 'lead_candidate'` when draft present
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `localhost:3001` renders without crashes
- [ ] V10 structural classes still rendering (hero-zone, notebook, story-wrap, builder, archive)

---

## Smart catch to flag before Step 3

**HIGH confidence — Phase 1B writer prompt delta key collision:**

`generate-signal.ts` lines 477-479 show `extended_data.tickers[i].delta` defined as an object
`{ direction: "down", text: "↓ 10×" }`. The existing `stats[i].delta` field expects `string | null`.
The LLM can blend these shapes. Issue #12 already demonstrated this — the crash we fixed today
in `StoryArticle.tsx` will recur on future pipeline runs.

**Fix (not in Step 2 scope):** In the writer prompt in `generate-signal.ts`, rename
`extended_data.tickers[i].delta` to `extended_data.tickers[i].change` (or `ticker_delta`).
This eliminates the key name collision. Should happen in Step 7 (prompt threading) or sooner
if another pipeline run is triggered before Step 7.
