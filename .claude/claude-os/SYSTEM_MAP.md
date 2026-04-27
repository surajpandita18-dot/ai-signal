# AI Signal — System Map

## Data Pipeline
```
RSS feeds
  → scripts/fetch-news.mjs
  → lib/realNews.json
  → lib/scoring.ts
      5 dimensions: relevance, novelty, threat, authority, recency
      weighted formula → signalScore 0.0–5.0
  → top 15% by score
  → scripts/process-signals.mjs
      Priority 1: Anthropic Claude Sonnet (rank 1–3) / Haiku (rank 4–25)
      Priority 2: Gemini 1.5 Flash (when ANTHROPIC_API_KEY missing/blocked)
      Priority 3: both missing → exit 1
      Cache: SHA256(title+source+date) → 48hr TTL
      Output fields: what, why, takeaway (or null if LLM returns SKIP)
  → lib/processedSignals.json
  → app/api/news/route.ts
      auth(): session → isPaid check
      free/unauthed: takeaway=null, takeawayGated=true (when real takeaway exists)
      paid: full signal including takeaway
      cache: 2min in-memory module cache
  → Zone 1 (score≥2.8, enriched, sort by signalScore)
  → Zone 2 (all remaining signals, archive grid)
```

## Frontend Routes
```
/                  LandingPage (unauthed) / Dashboard (authed)
                     LandingPage: live demo signal, GitHub OAuth CTA
                     Dashboard: Zone 1 editorial list + Zone 2 grid
/article/[id]      Signal detail — WHAT/WHY/TAKEAWAY + related
/upgrade           Early access CTA + blurred TAKEAWAY demo + mailto
/saved             Personal signal library (localStorage aiSignal_saves)
/digest/[date]     Server-rendered SEO brief — shareable URL
/api/news          Signals API (TAKEAWAY stripped server-side)
/api/auth/[...]    NextAuth v5 GitHub OAuth
404                'This signal doesn't exist. But today's do.'
```

## Auth Flow
```
GitHub OAuth App
  → /api/auth/signin → GitHub → /api/auth/callback/github
  → NextAuth v5 (lib/auth.ts)
      secret: NEXTAUTH_SECRET env ?? hardcoded dev fallback
  → JWT token: plan = "free" | "paid" (default: "free" at MVP)
  → useSession() hook → status: loading | authenticated | unauthenticated
  → useUserPlan() hook → "free" | "paid"
  → app/page.tsx: unauthenticated → <LandingPage />, authenticated → dashboard
```

## Gate Logic
```
/api/news response:
  isPaid = session?.user?.plan === "paid"
  if isPaid:
    return signal as-is (takeaway included)
  else:
    takeaway: null
    takeawayGated: true    ← only if takeaway existed (upgrade CTA shown)
    (no flag if LLM returned SKIP — no false upgrade prompt)

Zone1Signal.tsx:
  hasLLM = processed && !!takeaway       → show full amber TAKEAWAY
  isGated = !!takeawayGated              → show "Unlock takeaway →" button
  neither                                → show tags fallback
```

## Intelligence System
```
.claude/skills/          invokable skill files (6 exist, 5 need creation)
.claude/personas/        4 ICP definitions (technical-founder, indie-builder,
                         ai-curious-pm, wrong-user)
.claude/intelligence/    output files from agent runs (weekly)
.claude/validation/      assumption tracking
.claude/claude-os/       system brain — 16 files
~/.mempalace/palace      semantic memory (1,000+ drawers, 3 wings)
```

## GitHub Actions Automation
```
5:00am daily:
  fetch-news → process-signals → LLM enrichment → processedSignals.json

Monday 4:00am UTC:
  mempalace mine .claude/ → ai-signal wing
  mempalace mine scripts/ lib/ → ai-signal-code wing
  mempalace wake-up → .claude/MORNING_BRIEF.md
  git commit MORNING_BRIEF.md [skip ci]

On push to .claude/ or scripts/ or lib/:
  memory palace mine + MORNING_BRIEF update
```

## File Load Rules
```
ALWAYS (~1,300 tokens):
  .claude/claude-os/OS_INDEX.md
  .claude/claude-os/STATUS.md
  .claude/claude-os/PROJECT_CONTEXT.md

ON DEMAND:
  CLAUDE.md (root)               UI/design tasks only
  .claude/personas/[one].md      product decisions (load ONE)
  .claude/skills/[one].md        when invoking that skill (load ONE)
  .claude/intelligence/[one].md  load SPECIFIC file needed

NEVER load directly:
  lennys-podcast-transcripts/    → mempalace search --wing lenny-index
  node_modules/ .next/           → never ever
  .claude/intelligence/ all      → mempalace search --wing ai-signal
  lib/realNews.json              → /api/news endpoint or signal-monitor.mjs
```
