# AI Signal — System State
Last updated: 2026-04-25

## Current Goal
Get first 10 real users using product daily.

## Current Design Direction
Rundown AI × Superhuman AI inspired. Dark editorial. Emoji hooks. Category left borders.
See DESIGN_SYSTEM.md for exact specs.

## What Is Working
- Email capture landing → subscribers.json
- Zone 1: emoji prefix + category pills + bold WHAT/WHY labels ✅
- Zone 1: 18/20 signals with TAKEAWAY
- Zone 2: category filter pills, persistent
- Share modal: LinkedIn + Twitter
- Production: ai-signal-eta.vercel.app live
- Pipeline: Gemini primary, Claude fallback
- 24+ sources across 4 tiers
- System files: flat at root, single CLAUDE.md brain

## Current Problems
- ANTHROPIC_API_KEY not in Vercel (pipeline not running in prod)
- subscribers.json local only (swap when >20 subs)
- Zone 2 cards missing category left border (Superhuman style) — PENDING
- No thumbnails on Zone 2 cards — FUTURE
- 0 real users, 0 feedback

## Next Implementation (in order)
1. Zone 2 left border by category color — 20 min
2. Landing page overhaul — Rundown/Superhuman feel — 45 min
3. Add ANTHROPIC_API_KEY to Vercel dashboard — 5 min
4. DM first 10 CTOs — TODAY

## Future Features (do NOT build yet)
- Thumbnail images on Zone 2 cards (validate with real users first)
- "What to ignore" section — great differentiator vs Rundown AI
- Social proof on landing (need real users first)
- Twitter API social signal layer
- Email digest sending (need >20 subscribers)
- Personalization by role/topic

## Experiments Running
EXP-003: Free tier retention (need real users)
EXP-004: Landing conversion rate (tracking)
EXP-005: Manual DM vs HN launch (TBD)

## Session Notes
2026-04-25: System files restructured + emoji implemented → Zone 2 border next
2026-04-25: Deleted .claude/ folder, all files at root, full UI cleanup done
