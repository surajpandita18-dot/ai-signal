---
name: market-intelligence
description: Use when analyzing AI Signal's competitive landscape, finding market gaps, or preparing a weekly competitive review. Run before major product decisions or on a weekly cadence.
---

# Market Intelligence

## Overview

Produces a structured competitive analysis for AI Signal — who the competitors are, what users say about them (loves/hates/missing), and which market gaps AI Signal is best positioned to fill. Saves findings to dated files for trend tracking.

**Output files:**
- `.claude/intelligence/competition-{YYYY-MM-DD}.md` — full competitive analysis
- `.claude/intelligence/market-gaps.md` — running gap tracker (updated in place)

---

## Before You Run

Read these files for context. Do not skip — the analysis must be grounded in AI Signal's specific product direction:

1. `.claude/2026-04-20-ai-signal-decision-tool-design.md` — product spec, target user, value prop
2. `.claude/personas/technical-founder.md` — primary ICP
3. `.claude/intelligence/market-gaps.md` — previous gaps (if it exists)

---

## Step 1: Identify Top 5 Competitors

Search for competitors across these categories. Use web search to find current products.

**Category A — AI news aggregators / signal tools:**
Search: `"AI news" aggregator tool founders site:producthunt.com`
Search: `best AI news tool for developers 2024 2025`

**Category B — Daily briefs for technical founders:**
Search: `daily AI newsletter technical founders site:producthunt.com`
Search: `AI signal newsletter CTO founders`

**Category C — Intelligence/research layers (broader):**
Search: `AI competitive intelligence tool startups`
Search: `AI research digest tool for builders`

**Selection criteria — pick the 5 that are closest to AI Signal's positioning:**
- Targets technical audience (founders, engineers, CTOs)
- Covers AI news/signals specifically (not general tech)
- Has some form of curation, scoring, or signal filtering (not raw RSS)

**For each competitor, record:**
```
name:
url:
tagline:
pricing:
primary_format: (newsletter / web app / Slack bot / API / other)
update_frequency: (daily / weekly / real-time)
```

---

## Step 2: Extract User Sentiment Per Competitor

For each of the 5 competitors, search for real user reactions across 4 sources. Be specific — quote actual users where possible.

### Source A: Product Hunt

Search: `site:producthunt.com "{competitor name}"`

Extract from comments:
- Top-voted positive comments (what users love)
- Top-voted critical comments (what users hate)
- Unanswered requests in comments (what's missing)

### Source B: Reddit

Search: `site:reddit.com "{competitor name}" OR site:reddit.com "AI newsletter" OR "AI signal tool"`

Look in: r/MachineLearning, r/artificial, r/singularity, r/startups, r/Entrepreneur

Extract:
- Recurring complaints ("I wish it would...")
- Comparison threads ("I switched from X to Y because...")
- Feature requests that never got built

### Source C: Twitter / X

Search: `"{competitor name}" site:x.com OR site:twitter.com -filter:retweets lang:en`

Extract:
- Complaints tagged at the product
- Comparison tweets
- "I cancelled because..." or "I stopped using..."

### Source D: App Store / Chrome Store (if applicable)

Search: `"{competitor name}" reviews site:apps.apple.com OR site:chromewebstore.google.com`

Extract:
- 1–3 star review themes
- Most-mentioned feature requests

### Output format per competitor:

```markdown
## Competitor: {Name}

**URL:** 
**Pricing:**
**Format / frequency:**

### What users love
- [quote or paraphrase with source]
- [quote or paraphrase with source]
- [quote or paraphrase with source]

### What users hate
- [quote or paraphrase with source]
- [quote or paraphrase with source]
- [quote or paraphrase with source]

### What's missing (never built)
- [recurring request + source]
- [recurring request + source]
- [recurring request + source]
```

---

## Step 3: Identify Top 3 Market Gaps

From the sentiment patterns across all 5 competitors, identify the 3 most significant unmet needs.

**A gap qualifies if:**
- It appears as a complaint or request across ≥2 competitors
- No competitor has shipped a solution
- AI Signal's current or planned spec addresses it (or could)

**Score each gap on 3 dimensions (1–5):**

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| **Pain intensity** | Occasional annoyance | Regular friction | Deal-breaker for users |
| **Market size** | Niche (<10k potential users) | Meaningful (10k–100k) | Large (100k+) |
| **AI Signal fit** | We'd need major pivot | Partially covered today | Directly in our roadmap |

**Output format:**

```markdown
## Gap 1: {One-line description}

**What users say:** "[Quote that captures the pain]"

**Competitors affected:** [list which competitors have this problem]

**Why no one has solved it:**

**How AI Signal addresses it:** [reference specific spec section]

**Scores:**
- Pain intensity: X/5 — [one-line reasoning]
- Market size: X/5 — [one-line reasoning]  
- AI Signal fit: X/5 — [one-line reasoning]
- **Total: X/15**
```

---

## Step 4: Save Outputs

### File 1: Dated competition file

Save as `.claude/intelligence/competition-{YYYY-MM-DD}.md`:

```markdown
# Competitive Analysis — {date}

## Competitors Analyzed
[list of 5 with URLs]

## Sentiment Summary
[5 competitor sections from Step 2]

## Top 3 Market Gaps
[3 gap sections from Step 3 with scores]

## Key Takeaway
[1–2 sentences: the single most important thing learned from this analysis]

## Recommended Actions
[0–3 specific implementation plan changes to consider]
```

### File 2: Market gaps tracker

Update `.claude/intelligence/market-gaps.md` (create if missing):

```markdown
# AI Signal — Market Gaps Tracker

*Last updated: {date}*

| Gap | Pain (1-5) | Market (1-5) | Fit (1-5) | Total | Status | First seen |
|---|---|---|---|---|---|---|
| {gap name} | X | X | X | X | Active/Addressed/Closed | {date} |
```

If a gap was previously tracked, update its score but preserve the "first seen" date. If a gap has been addressed in the implementation plan since last run, update status to "Addressed".

---

## Common Mistakes

**Don't hallucinate competitor features.** If you can't find a source for a claim, mark it as [unverified] rather than stating it as fact.

**Don't duplicate signal.** If 3 competitors all lack email digests, that's ONE gap, not three.

**Don't score based on assumptions.** Pain intensity = what users actually say, not what seems painful. If no one complained about it, it's not a pain.

**Don't skip the read-back.** Before saving, re-read the gap scores against the product spec. A gap where AI Signal fit = 1 is not worth leading with.
