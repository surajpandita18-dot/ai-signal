# AI Signal — Project Context

## What it is
Early warning system for technical founders.
Converts AI news into daily decisions.
Not a feed — a forcing function.

## Tagline
"AI changed overnight. Here's what to build."

## Target user
CTO at seed–Series A AI startup, 2–8 engineers, building on LLMs.
Opens AI Signal before HN every morning.
Job-to-be-done: "Tell me if anything shipped in the last 24 hours that
obsoletes a decision I made last week."

## Stack
Next.js 16.2.3, React 19, TypeScript strict, NextAuth v5
GitHub Actions (cron), RSS → scoring → Gemini/Claude → signals
PostHog (free tier, 1M events/month, no autocapture)

## Routes (all working)
/              Landing (unauthed) + Dashboard (authed)
/article/[id]  Signal detail
/upgrade       Early access CTA + PostHog upgrade_clicked
/saved         Personal signal library (aiSignal_saves key)
/digest/[date] SEO brief + shareable URL
/api/news      Signals API — TAKEAWAY stripped server-side for free users
404            "This signal doesn't exist. But today's do."

## Pipeline
RSS feeds → 5-dimension scoring → top signals →
Gemini 1.5 Flash (fallback) / Claude Sonnet+Haiku (primary) →
WHAT + WHY + TAKEAWAY → lib/processedSignals.json → /api/news

## Gate
TAKEAWAY = paid only. Server-side: never in DOM for free users.
Free: WHAT + WHY on signals 1–3, title only on 4+.
takeawayGated: true = real takeaway exists but withheld (shows upgrade CTA).
takeaway: null + no flag = LLM returned SKIP (no false upgrade prompt).

## North star
Day 7 retention > 10%.
Win condition: 10 users open AI Signal before HN every morning.

## Current stage
MVP complete. All 8 routes live. Pre-first-user.

## Key decisions (never re-debate)
- Zone 1 threshold: 2.8 (was 3.5 — miscalibrated above real score range)
- Blur removed: solid gate — never in DOM
- Gemini fallback: when Anthropic key blocked
- MemPalace: 3 wings, 1000 drawers
- No price shown at MVP: validate retention first
- GitHub OAuth only: no magic link (reduces friction for ICP)
- Amber only on TAKEAWAY: purple is chrome, amber is action
- Inter font: no custom font (fast, trusted, Linear/Vercel aesthetic)
