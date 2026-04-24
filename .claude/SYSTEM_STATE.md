# AI Signal — System State
Last updated: 2026-04-25

## Current Goal
Get first 10 real users using product daily.

## Current Design Direction
Rundown AI inspired. Dark editorial. Emoji hooks.
See DESIGN_SYSTEM.md for exact specs.

## What Is Working
- Email capture landing → subscribers.json
- Zone 1: 18/20 signals with TAKEAWAY
- Zone 2: category filter pills, persistent
- Share modal: LinkedIn + Twitter
- Production: ai-signal-eta.vercel.app live
- Pipeline: Gemini primary, Claude fallback
- 24+ sources across 4 tiers

## Current Problems
- ANTHROPIC_API_KEY not in Vercel (pipeline not in prod)
- subscribers.json local only (swap when >20 subs)
- No emoji on signal titles yet (PENDING)
- No thumbnails on Zone 2 cards (FUTURE)
- 0 real users, 0 feedback

## Next Implementation (in order)
1. Add emoji to Zone 1 signal titles — 30 min
2. Make WHY label bolder — 10 min
3. Add ANTHROPIC_API_KEY to Vercel — 5 min
4. DM first 10 CTOs — TODAY

## Future Features (do NOT build yet)
- Thumbnail images on Zone 2 cards
- "What to ignore" section (great differentiator)
- Social proof on landing (need real users first)
- Twitter API social signal layer
- Email digest sending (need >20 subscribers)
- Personalization by role/topic

## Experiments Running
EXP-003: Free tier retention (need real users)
EXP-004: Landing conversion rate (tracking)
EXP-005: Manual DM vs HN launch (TBD)

## Session Notes
(Append after each session)
Format: {date}: [what changed] → [next]
2026-04-25: System files restructured → implement emoji next
