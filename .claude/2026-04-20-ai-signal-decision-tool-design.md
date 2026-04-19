# AI Signal — Decision Tool for Technical Founders
## Product & Engineering Spec
**Date:** 2026-04-20  
**Status:** Approved for implementation planning  
**Target user:** Technical founder / CTO at early-stage AI startup

---

## 1. Product Direction

### What this product is

AI Signal is a daily decision-making tool for technical founders building AI products. It answers one question every morning:

> "Of everything that dropped in AI in the last 24 hours, what is actually real — and what does it mean for what I'm building?"

### What it is not

- Not an aggregator (those show everything; this shows what matters)
- Not a newsletter (those are read later; this is read first)
- Not a research tool (that's a different job-to-be-done)

### The core value proposition

The builder takeaway is the product. Every other field — title, source, score, what, why — exists to earn the right to deliver one specific, actionable sentence to a technical founder who has 3 minutes before standup.

Generic takeaways are worse than no takeaway. The quality bar: if a senior engineer couldn't act on it, rewrite it or skip it.

---

## 2. Target User

**Primary:** Technical founder (solo CTO or technical co-founder) at a seed-to-Series A AI startup. Actively building. Makes daily decisions about model choice, infrastructure, and product direction. Expenses tools without friction.

**Pain point:** The cost of missing a signal that makes their current technical approach obsolete is measured in months of wasted engineering time. They don't have time to read everything — they need someone (or something) to tell them what changed that matters for *their specific stack*.

**Willingness to pay:** $29–49/month individual, $150–300/month team. Enterprise/API pricing later.

**Acquisition:** GitHub OAuth on signup creates trust immediately. Public repo and star data enables future personalization (v2 moat).

---

## 3. Content Model

Every signal — regardless of source (RSS, arXiv, GitHub, Twitter/X) — is stored as a single normalized shape:

```typescript
interface Signal {
  // Core identity
  id: string                          // sha256(link).slice(0, 32)
  title: string                       // original headline / paper title / repo name
  source: string                      // "Hugging Face", "arXiv", "GitHub"
  sourceType: "rss" | "arxiv" | "github" | "twitter"
  sourceCategory: "official" | "research" | "media" | "community" | "substack"
  link: string                        // canonical URL, used as cache key
  date: string                        // ISO date

  // Scoring
  signalScore: number                 // 0.0–5.0, weighted formula (see §5)
  impactLevel: "high" | "medium" | "low"
  tags: string[]                      // 2–3 topic tags: ["LLM", "infra", "funding"]

  // LLM-generated (top 15% by score only, cached 48hr)
  what: string | null                 // 1 sentence, factual
  why: string | null                  // 1 sentence, market/competitive context
  takeaway: string | null             // 1 sentence, specific builder action
  processed: boolean
  processedAt: string | null          // ISO timestamp

  // Zone 1 lifecycle
  zone1EligibleUntil: string | null   // processedAt + 24hr; null if not Zone 1
  developingStory: boolean            // true if 3+ follow-up signals in 48hr

  // Feedback loop
  saveCount: number
  dismissCount: number
  clickCount: number
  saveRate: number                    // computed weekly: saves / (saves + dismisses)
}
```

### Gate logic

| User state | Signals #1–3 | Signals #4–25 | Signal #26+ |
|---|---|---|---|
| Unauthenticated | `what` + `why` only | title + source only | not shown |
| Free (GitHub auth) | `what` + `why` only | title + source only | not shown |
| Paid | full signal incl. `takeaway` | full signal | title + source |

`takeaway` is **never sent in the API response** to free or unauthenticated users — not blurred client-side, not sent at all.

---

## 4. Homepage Structure

### Zone 0 — Navbar (sticky)

```
[● AI SIGNAL]    [Today's Brief ↓]    [Saved]    [Sign in with GitHub / Upgrade]
```

No filter pills in navbar. Zone 1 is always unfiltered.

### Zone 1 — Today's Signals

Full-width numbered editorial list. Not a card grid.

**Visual rules:**
- Signal number (`01`, `02`, `03`): large, dim purple — editorial numbering
- Title: largest text on the page, white, tight leading
- `WHAT` / `WHY`: violet micro-caps label, `--text-secondary` content
- `TAKEAWAY`: amber label — amber-200 for signal #1, amber-100 for signals #2–3
- Dividers: 1px subtle line, not bordered cards

**Paid gate for signals #4–5:**
```
04  [title]
    [source] · [date]
    ████████████████████████████████  Unlock with Pro →
```
Solid surface overlay, single CTA. Not a blur.

**Low-signal day behaviour:**
If fewer than 3 signals meet `score >= 3.5` AND `age < 24hr`, Zone 1 shows only what qualifies — even 1 or 0.

Message when 0 qualify:
> "No high-impact signals today. Check back tomorrow or browse the archive."

**Signal aging:**
- Zone 1 signals expire after 24hr from `processedAt`
- Exception: `developingStory = true` → one additional 24hr cycle

**Developing story detection:**
3+ new signals with Jaccard similarity > 0.5 against a Zone 1 signal within 48hr → `developingStory = true`, add `[DEVELOPING]` tag.

### Zone 1 → Zone 2 Transition

```
─────────────── More signals · 47 today ───────────────
```

### Zone 2 — Signal Archive

3-column grid (desktop). Compact scannable cards.

**Zone 2 card contains exactly:**
- Category pill + source + colored source dot
- Signal score bar (emerald ≥4.0, violet ≥3.5, indigo <3.5)
- Title (1–2 lines)
- 2 tags
- `Read →` link

**Zone 2 cards do NOT contain:** summaries, what/why/takeaway, "Why it matters."

### Article Page (card vs. page split)

| Field | Zone 1 card | Zone 2 card | Article page |
|---|---|---|---|
| Title | ✅ | ✅ | ✅ |
| Source + date | ✅ | ✅ | ✅ |
| Tags | ✅ (2) | ✅ (2) | ✅ (all) |
| Signal score | ✅ bar | ✅ bar | ✅ number + bar |
| What | ✅ | ❌ | ✅ |
| Why | ✅ | ❌ | ✅ |
| Takeaway | ✅ paid | ❌ | ✅ paid |
| Full summary | ❌ | ❌ | ✅ |
| Original link | ❌ | ❌ | ✅ (primary CTA) |
| Related signals | ❌ | ❌ | ✅ (same tags) |
| Bookmark | ✅ icon | ✅ icon | ✅ button |

---

## 5. Signal Scoring System

### Formula

```
score = (
  0.30 × builder_relevance   +
  0.25 × novelty             +
  0.20 × competitive_threat  +
  0.15 × source_authority    +
  0.10 × recency
) × 5

impactLevel:
  score >= 4.0  →  "high"
  score >= 3.0  →  "medium"
  score <  3.0  →  "low"

Zone 1 threshold: score >= 3.5 AND age < 24hr
```

### Dimension 1 — Builder Relevance (30%)

`builder_relevance = max(model_capability, infra_tooling, funding_market, agent_workflow)`

Each sub-score: 0.9 if ≥2 keyword matches, 0.6 if 1 match, 0.0 if none.

```
model_capability keywords:
  "model", "context window", "benchmark", "reasoning", "multimodal",
  "fine-tuning", "weights released", "eval"

infra_tooling keywords:
  "SDK", "API", "latency", "pricing", "rate limit", "self-hosted",
  "open source", "framework", "inference"

funding_market keywords (max 0.8):
  "raises", "acquires", "series", "billion", "million", "shuts down",
  "pivots", "enterprise deal"

agent_workflow keywords (max 0.85):
  "agent", "autonomous", "tool use", "function calling", "orchestration",
  "pipeline", "workflow"
```

### Dimension 2 — Novelty (25%)

Jaccard similarity on normalized title token sets vs. all signals in last 72hr (MVP). Embedding cosine similarity is v2.

```
similarity < 0.25   →  1.0
similarity 0.25–0.5 →  0.7
similarity 0.5–0.75 →  0.3
similarity > 0.75   →  0.05
```

### Dimension 3 — Competitive Threat (20%)

```
Obsolescence (+0.3 each): "built-in", "native support", "no longer need",
  "replaces", "deprecated", "sunset", "free tier", "open sourced"

Capability jump (+0.25 each): "10x", "100x", "state of the art", "beats",
  "surpasses", "new record", "outperforms", "best in class"

Market displacement (+0.2 each): "acquires", "shuts down", "pivots away from",
  "drops support", "price cut", "free for", "launches competing"

competitive_threat_raw = min(sum, 1.0)
```

**Confidence modifier (Gap 1):**
If `source_authority < 0.7` AND any competitive_threat keywords matched:
```
competitive_threat = competitive_threat_raw × 0.7
```
A startup claiming "10x better" does not score the same as OpenAI announcing it.

### Dimension 4 — Source Authority (15%)

```
1.0   Official lab (OpenAI, Anthropic, Google DeepMind, Meta AI, Mistral)
0.90  Research primary source (arXiv, academic paper)
0.85  High-trust research blog (Hugging Face, Google Research)
0.75  Tier 1 media (MIT Tech Review, The Verge, Reuters)
0.70  Developer community (GitHub trending, HN front page)
0.65  Tier 2 media (VentureBeat, TechCrunch, Wired)
0.60  Newsletter / Substack (Latent Space, Ben Evans)
0.40  Social / Twitter/X
0.30  Unknown / scraped
```

### Dimension 5 — Recency (10%)

```
age < 6hr     →  1.0
age 6–24hr    →  0.85
age 24–48hr   →  0.65
age 48–72hr   →  0.40
age 72–168hr  →  0.20
age > 168hr   →  0.05
```

---

## 6. Data Sources

### Current (RSS)

OpenAI, Anthropic, Google DeepMind, Meta AI, Hugging Face, Google Research,
arXiv cs.AI/cs.LG/cs.CL, VentureBeat AI, TechCrunch AI, MIT Tech Review AI,
Latent Space, Ben Evans.

### Pre-publication (v2 moat — arrive 24–72hr before media coverage)

GitHub Trending (AI/ML), HuggingFace new model uploads, arXiv cs.AI/cs.LG/cs.CL,
Curated Twitter/X lists.

**Source-agnostic design requirement:** The LLM pipeline receives only
`{title, body, source, date}`. It has no knowledge of `sourceType`. GitHub release
notes, arXiv abstracts, and RSS articles are identical inputs at the prompt layer.

---

## 7. LLM Pipeline

### Stage 1 — Input Normalization

```typescript
interface NormalizedInput {
  title: string      // truncated to 200 chars
  body: string       // truncated to 800 tokens
  source: string
  link: string       // cache key
  date: string
  signalScore: number
}
```

### Stage 2 — Selection Gate

```
1. Sort all incoming signals by signalScore descending
2. threshold = score at 85th percentile of today's batch
3. Select where signalScore >= threshold
4. Enforce: min 5, max 25
5. Cache check: sha256(link).slice(0, 32), TTL 48hr
6. Cache hit → use cached output, skip API call
7. Cache miss → proceed to LLM
```

### Stage 3 — Model Routing

```
Signals #1–3:  Claude Sonnet  (quality matters most)
Signals #4–25: Claude Haiku   (cost optimization)
Same system prompt for both.
```

### Stage 4 — System Prompt

```
You are an intelligence analyst writing for technical founders at early-stage AI startups.
Produce exactly three sentences — no more, no less.

Rules:
- What: One factual sentence. What shipped, happened, or was announced. No opinions.
- Why it matters: One sentence on market or competitive context.
- Builder takeaway: One specific, actionable sentence. What a technical founder should
  do, reconsider, or watch. Never generic. If you cannot write a specific takeaway,
  output SKIP.

Output format (exactly this, no extra text):
WHAT: [sentence]
WHY: [sentence]
TAKEAWAY: [sentence]

If input is not a meaningful signal (job listing, opinion with no new info, duplicate),
output only: SKIP
```

### Stage 5 — Output Validation

```
if response === "SKIP" → processed=true, nulls, exclude from Zone 1
if missing field → retry once → if retry fails → nulls, log
if TAKEAWAY contains blocked phrases → treat as SKIP:
  "could impact", "broadly", "across the industry", "worth watching",
  "may affect", "signals a shift", "important development", "worth noting",
  "could be significant", "players in this space"
```

### Stage 6 — Run Schedule

```
Primary:  GitHub Actions cron 05:00am UTC daily
Fallback: POST /api/process?force=true&secret={ADMIN_SECRET}
```

### Cost Model

```
Per run:
  #1–3 Sonnet:  3 × 1,200 tokens ≈ $0.018
  #4–25 Haiku:  22 × 1,000 tokens ≈ $0.022
  Total:        ≈ $0.04/run

Monthly (30 runs, 40% cache hit rate): ≈ $0.72

At 1,000 paid users × $39/month = $39,000 MRR
Pipeline cost = 0.002% of revenue
```

---

## 8. Email Digest

### Subject line

```
"{n} signal{s}: {signal #1 title ≤60 chars} + {n} more"
Zero signals: "No high-impact signals today — browse the archive"
```

### Structure

```
AI SIGNAL · Daily Brief · {date}

━━━━━━━━━━━━━━━━━━━━━━━━

01  {title}
    {source} · {category} · {date}

    WHAT      {what}
    WHY       {why}
    TAKEAWAY  {takeaway}         ← paid only
              [Unlock takeaways →]  ← free users see this instead

    [{tag}] [{tag}]     → Read signal

━━━━━━━━━━━━━━━━━━━━━━━━

+ {n} more in today's archive →

Unsubscribe · Preferences · /digest/{date}
```

**Key decisions:**
- Plain text structure, memo aesthetic — memos get read, newsletters get archived
- `takeaway` never in email body for free users — server omits it
- Footer links to `/digest/{YYYY-MM-DD}` — web-hosted, shareable, Google-indexed

### Delivery Stack (MVP)

```
Service:   Resend (free tier: 3,000 emails/month)
Storage:   Vercel KV or Supabase (email, plan, preferences, githubId)
Trigger:   GitHub Actions cron 06:55am UTC → POST /api/send-digest
```

### Onboarding Personalization

On signup, 2 questions (reorders digest, does not filter):

**Q1: Primary stack**
- LLM infrastructure (embeddings, vector DBs, inference)
- Agent tooling (orchestration, tool use, multi-agent)
- Full-stack AI app (product built on top of models)

**Q2: Biggest current concern**
- Model selection
- Cost / inference pricing
- Competition (what's been shipped that affects my product)
- Tooling (what should I be using)

---

## 9. Feedback Loop

**Events logged per signal:** save, dismiss, click

**Weekly metric:**
```
saveRate = saveCount / (saveCount + dismissCount)
computed every Sunday per signal and per category
```

**Weekly manual review (no ML needed for v1):**
- Top 10 by saveRate: what patterns do they share?
- Bottom 10 (high score, low saves): where is scoring wrong?
- Adjust keyword lists and dimension weights manually

**Dismiss UI:** Subtle `✕` on Zone 1 signals. Click logs dismiss. No confirmation. Signal stays visible. Frequent dismissers are the highest-quality feedback signal.

---

## 10. Auth & Access Control

### GitHub OAuth Flow

```
1. User clicks "Sign in with GitHub"
2. GitHub OAuth → access_token
3. Fetch: id, login, email, public_repos, starred (first page)
4. Upsert users table: githubId, email, login, plan="free", preferences=null
5. Issue session (NextAuth / Auth.js)
6. New user → /onboarding (2-question form)
7. Returning user → /
```

### Plans

```
free:
  Zone 1 #1–3: what + why (no takeaway)
  Zone 2: title + source only beyond #3
  Email: what + why, upgrade CTA

pro ($39/month):
  Zone 1 #1–5: full 3-part
  Zone 2: full cards
  Email: full 3-part incl. takeaway
  Personalized ordering

team ($149/month, 5 seats):
  Everything in pro + shared saved signals + weekly team digest

api (v2): JSON feed, webhooks, custom source filters
```

---

## 11. Phased Implementation Roadmap

### Phase 1 — Foundation (Week 1–2)
- [ ] Weighted scoring formula replacing keyword heuristics
- [ ] Signal data shape: add `tags`, `impactLevel`, `zone1EligibleUntil`, `developingStory`, feedback counters
- [ ] 48hr summary cache (URL-hash key)
- [ ] Source-agnostic input normalization layer
- [ ] Zone 1 age-out logic (24hr hard limit, developingStory extension)

### Phase 2 — LLM Pipeline (Week 2–3)
- [ ] Selection gate (top 15%, min 5, max 25)
- [ ] System prompt + output validation + blocked phrases gate
- [ ] Model routing: Sonnet #1–3, Haiku #4–25
- [ ] GitHub Actions cron 05:00am UTC
- [ ] Admin manual trigger endpoint

### Phase 3 — Homepage Redesign (Week 3–4)
- [ ] Zone 1 editorial list (numbered, full-width, not card grid)
- [ ] Signal row hierarchy: number → title → what/why/takeaway
- [ ] Amber accent system (amber-200 for #1, amber-100 for #2–3)
- [ ] Low-signal-day honest empty state
- [ ] Zone 1→2 divider with count
- [ ] Zone 2 compact cards (score bar + title + tags only, no summaries)
- [ ] Paid gate UI (solid overlay + single CTA)
- [ ] Dismiss `✕` event logging

### Phase 4 — Auth & Monetization (Week 4–5)
- [ ] GitHub OAuth (NextAuth/Auth.js)
- [ ] Users table (Supabase)
- [ ] Onboarding 2-question form + preference storage
- [ ] Server-side plan gating (`takeaway` never sent to free/unauthed)
- [ ] Stripe integration ($39/month pro)
- [ ] Upgrade flow from gate UI

### Phase 5 — Email Digest (Week 5–6)
- [ ] Resend integration
- [ ] Digest email template (plain text + HTML)
- [ ] `/digest/{date}` static page
- [ ] 06:55am UTC GitHub Actions send trigger
- [ ] Free vs paid content gating in email
- [ ] Personalized signal ordering by preferences

### Phase 6 — Feedback Loop (Week 6–7)
- [ ] Save/dismiss/click event logging
- [ ] Weekly saveRate computation
- [ ] Manual review dashboard
- [ ] First scoring recalibration after 4 weeks of data

### Phase 7 — Pre-publication Sources (v2)
- [ ] GitHub Trending scraper
- [ ] HuggingFace model upload watcher
- [ ] arXiv full integration with scoring
- [ ] Twitter/X curated list reader
- [ ] Embedding-based semantic deduplication
- [ ] LLM-based competitive threat scoring

---

## 12. Open Questions (Deferred)

- Push notifications for `impactLevel = "high"` — channel TBD (browser push, Slack, email alert)
- Team shared signals UX — collaborative bookmarking not yet designed
- API v2 pricing — deferred until 100+ paid users
- Mobile layout — Zone 1 editorial list needs its own mobile design pass
- Embedding model for dedup — OpenAI `text-embedding-3-small` vs `nomic-embed-text` self-hosted
