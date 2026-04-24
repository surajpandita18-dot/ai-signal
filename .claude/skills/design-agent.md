---
name: design-agent
description: Use when invoked with /design-review to research design DNA from reference products, synthesize a design system for AI Signal, and update CLAUDE.md. Run before any major UI phase.
---

# Design Agent — /design-review

Produces a research-backed design system for AI Signal by extracting design DNA from reference products, synthesizing decisions with tradeoffs, and identifying the single screenshottable WOW moment. Outputs a full CLAUDE.md update for approval.

**Goal:** AI Signal feels like Bloomberg Terminal and Linear had a baby.

---

## Step 1 — Extract Design DNA from Reference Products

Research and document each product. Use screenshots, docs, and design system references where available.

### Products to analyze

1. **Linear.app**
2. **Vercel dashboard**
3. **Bloomberg Terminal**
4. **Raycast**
5. **Perplexity AI**

### For each product, extract

```
### [Product Name]

**Hero design principle:** [one word]

**Color system:**
- Background: [value]
- Accent: [value]
- Text hierarchy: [primary / secondary / muted]

**Typography:**
- Font: [name]
- Weight usage: [headings / body / labels]
- Size scale approach: [tight / spacious / custom]

**Information density:**
- Lines per viewport: [approx]
- Whitespace philosophy: [aggressive / balanced / dense]

**The ONE screenshottable wow moment:**
[Describe the single UI element that makes someone stop scrolling]

**Why technical founders love it:**
[1–2 sentences — specific, not generic]
```

---

## Step 2 — Comparison Matrix

After extracting all five, produce:

| Product | Feel (one word) | Density | Wow Element | Relevance to AI Signal (1–5) |
|---|---|---|---|---|
| Linear | | | | |
| Vercel | | | | |
| Bloomberg | | | | |
| Raycast | | | | |
| Perplexity | | | | |

---

## Step 3 — Synthesize for AI Signal

From the matrix, synthesize a coherent design system. Do not average — pick the strongest element from each reference.

```
### AI Signal Design System

**Hero principle:** [one word — must connect directly to technical-founder.md persona]

**Color tokens:**
[list all --var: value pairs]

**Typography system:**
Font: [name and source]
Headings: [weight, size]
Body: [weight, size]
Labels: [weight, case, letter-spacing]
Scale: [--text-xs through --text-3xl with px values]

**Zone 1 design rules:**
[numbered list — specific, implementable]

**Zone 2 design rules:**
[numbered list — specific, implementable]

**WOW element:**
[Name it. One sentence on what it is. Show implementation code.]
```

---

## Step 4 — Tradeoff Analysis

For every major design decision, present both options with honest pros/cons. Pick one. No "it depends."

Cover these five decisions:

### Decision 1: Accent color
Option A: Purple-only
Option B: Purple + Amber (purple for UI chrome, amber for actionable content)
Recommendation: [clear pick + one sentence reason connecting to technical-founder.md]

### Decision 2: Zone 1 — list vs cards
Option A: Numbered editorial list (full-width rows)
Option B: Card grid
Recommendation: [clear pick]

### Decision 3: Typography — serif vs sans-serif
Option A: Inter (sans-serif, system-trust)
Option B: Tiempos / GT Sectra (editorial serif)
Recommendation: [clear pick]

### Decision 4: Information density
Option A: Spacious (16px+ line height, 24px+ between items)
Option B: Dense (Bloomberg-style, 8px between items, smaller type)
Recommendation: [clear pick with rationale tied to "3 signals every morning" mechanic]

### Decision 5: Animation
Option A: Subtle motion (100–150ms transitions, translateY only)
Option B: No motion (terminal aesthetic, information first)
Recommendation: [clear pick]

---

## Step 5 — Identify Single WOW Moment

The one thing someone screenshots and posts on Twitter. Evaluate these candidates:

1. Animated score bar on Zone 2 card hover
2. TAKEAWAY line with amber left border — the editorial pull quote
3. Numbered signals with oversized dim editorial numbers (01, 02, 03)
4. Blur gate reveal animation on upgrade
5. Zone 1→2 divider with signal count

**For each candidate:**
- Shareability: HIGH / MEDIUM / LOW
- Implementation complexity: HIGH / MEDIUM / LOW
- Connection to core mechanic (forcing function): HIGH / MEDIUM / LOW

**Pick one winner.** Show implementation:

```tsx
// [Component name] — WOW element
// [Filename]
[implementation code]
```

---

## Step 6 — Update CLAUDE.md

Draft the full updated CLAUDE.md with:
- Hero principle section (new)
- Updated color tokens
- Updated typography system
- Zone 1 and Zone 2 specific design rules (new)
- WOW element documentation (new)
- Inspiration References section (new): Linear, Vercel, Bloomberg
- Keep all existing Engineering Rules and Core Features (never remove these)

**Show the full draft for approval before saving. Do not save until approved.**

---

## Calibration Rules

**Be opinionated.** Every recommendation must be a clear pick, not "it depends."

**Connect to persona.** Every design decision must have a stated reason tied to `.claude/personas/technical-founder.md` — what does this CTO see, feel, and trust?

**Goal:** Bloomberg Terminal × Linear. Dense enough to trust. Clean enough to act.

**Amber is action.** Purple is chrome. Never swap them.

**Density is trust.** Technical founders trust tools that treat them as intelligent. Whitespace reads as empty, not calm.

**The TAKEAWAY is the product.** Every design choice either earns the right to show the TAKEAWAY or it doesn't.

---

## Auto-Update Rules (for /design-check)

After running `/design-check`, if violations are found — classify each:

| Occurrence | Action |
|------------|--------|
| First time | Flag for human review only. Do NOT auto-update. |
| 2nd time | MEDIUM confidence — flag + suggest update text |
| 3rd+ time | HIGH confidence — auto-update CLAUDE.md |

**Update format when writing to CLAUDE.md:**
```
## Auto-added {date} — seen {N} times
Never use: [specific violation]
Example of violation: [code/component snippet]
Correct approach: [correct code]
```

After updating CLAUDE.md:
- Add same pattern to this file's checklist section
- So next `/design-check` catches it automatically
- This closes the loop: detect → fix → prevent

**Report at end of /design-check:**
```
DESIGN CRITIC AUTO-UPDATE — {date}
Violations found:        N
Auto-updated CLAUDE.md:  [list or 'none — first occurrence']
Flagged for review:      [list]
Checklist updated:       YES / NO
```
