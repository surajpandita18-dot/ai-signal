# AI Signal

## Product
Daily AI intelligence briefing for builders.
Tagline: "AI changed overnight. Here's what to build."
Live: ai-signal-eta.vercel.app
Stack: Next.js 16, TypeScript, Vercel, Gemini primary / Claude fallback pipeline.

## Users
CTO / Technical Founder at AI startups.
Pain: too much AI noise, no time to filter.
Job: know what changed overnight + what to build next.

## Data flow
RSS sources → lib/realNews.json (raw) → lib/processedSignals.json (LLM processed: what/why/takeaway) → /api/news → UI

## Routes
/ → landing (email capture)
/app → main feed (Zone1 list + Zone2 grid)
/article/[id] → single signal page
/saved → bookmarked signals
/api/subscribe → saves email to subscribers.json

## Design reference
Rundown AI (therundown.ai) — exactly this:
- Dark navbar (black)
- White page background
- Newsletter content structure
- "The Rundown:" / "The details:" / "Why it matters:" labels
- Clean open typography, no card boxes

## Never break
RSS feed · search · source filter · bookmarks · read state · unread toggle · auto-refresh
