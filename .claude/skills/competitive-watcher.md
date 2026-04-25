---
name: competitive-watcher
description: Use when checking competitors for new design patterns or features to incorporate into AI Signal
---

# Competitive Watcher

## Purpose
Weekly check of Rundown AI + Superhuman AI for patterns, features, or signals worth incorporating.

## Steps
1. Search: "Rundown AI new features [month year]" + "Superhuman AI updates [month year]"
2. Extract: new design patterns, new sections, new sources, new CTAs
3. Compare with current AI Signal — identify gaps
4. Add insights to `FEEDBACK_MEMORY.md` under today's date
5. If new patterns → update `DESIGN_SYSTEM.md` under "Inspiration Stack"
6. If new sources → update `SOURCES.md`
7. Add "Competitive Insights" section to `SYSTEM_STATE.md`

## Output Format
```
Rundown AI this week: [what changed]
Superhuman AI this week: [what changed]
AI Signal gap: [specific delta]
Action: [implement now / add to backlog]
```

## Rules
- Only adopt patterns that fit our dark editorial direction
- Don't copy light-theme patterns (we stay dark)
- Add to backlog if uncertain — validate with real users first

## Trigger
`/competitive-watch`
