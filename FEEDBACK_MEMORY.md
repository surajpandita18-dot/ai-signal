# AI Signal — Feedback Memory
Rule: Append a session summary after every meaningful conversation.
Rule: If same feedback appears 3x → promote to Active Rule + update DESIGN_SYSTEM.md.
Rule: Never delete entries — edit status to SUPERSEDED if outdated.

## How to append a session summary
At end of session, add under ## Interaction Log:
```
### YYYY-MM-DD — [one line: what we worked on]
Did: [what changed]
Why: [user's reason or feedback]
Result: [what worked / didn't]
Rule promoted?: [yes → RULE N / no]
```

---

## Pattern Tracker
(Track recurring themes — 3x = rule)
- "bland/generic" feel: 2x → approaching rule
- "friction too high": 3x → RULE 1 applied
- "too much complexity/files": 3x → RULE 5 applied
- "not like Rundown": 2x → approaching rule

---

## Active Rules (from repeated feedback)

RULE 1: Remove friction before monetization
  Origin: GitHub OAuth barrier + paywall complaints
  Applied: Email only signup, TAKEAWAY free

RULE 2: Premium feel = editorial not dashboard
  Origin: "homepage bland", "not like Rundown"
  Applied: Editorial rows, colored dots, amber TAKEAWAY

RULE 3: Design evolves from references not constraints
  Origin: CLAUDE.md was locking design decisions
  Applied: DESIGN_SYSTEM.md is flexible, overrides all

RULE 4: Sources determine signal quality
  Origin: "sources bland hain"
  Applied: 24+ sources, tiered authority system

RULE 5: Simple system > complex agent network
  Origin: "move slow to move fast", repeated complaints about .claude complexity
  Applied: Single CLAUDE.md at root, flat file structure, no sub-agents

---

## Design Feedback Log

### 2026-04-20
Feedback: "homepage feels cluttered, too much text in cards"
Insight: Info overload — cards showing too much
Action: Zone 1 editorial list, Zone 2 compact cards
Status: APPLIED

### 2026-04-21
Feedback: "GitHub har kisi ke paas nahi hota"
Insight: GitHub OAuth = barrier for non-devs
Action: Email-only landing, no auth wall
Status: APPLIED

### 2026-04-24
Feedback: "pehle free rakho, user use karein"
Insight: Paywall before habit = no users
Action: Everything free, waitlist page
Status: APPLIED

### 2026-04-24
Feedback: "homepage bland, Rundown jaisa chahiye"
Insight: Dark cards = developer tool, not briefing
Action: Editorial rows, colored dots
Status: APPLIED

### 2026-04-25
Feedback: Rundown AI + Superhuman AI reference shared
Insight:
  - Emoji hooks = instant scanability
  - Category left border = identity signal (Superhuman)
  - "Why it matters" needs bold label
  - Landing value prop needs more punch
Action: Zone1Signal — emoji prefix, category pills, bolder WHAT/WHY labels. Zone2 — category left border. Landing — overhaul.
Status: APPLIED

### 2026-04-25
Feedback: "move slow to move fast — system simple rakho"
Insight: Complexity kills iteration speed
Action: Flat file structure, single CLAUDE.md, no .claude/ folder
Status: APPLIED

---

## Interaction Log

### 2026-04-25 — Design research synthesis + missing skills created
Did: Created .claude/skills/design-implementer.md + competitive-watcher.md. Updated DESIGN_SYSTEM.md with exact Rundown/Superhuman patterns (dark vs light theme distinction, inline bold labels, emoji prefix, category pill). Confirmed Zone1Signal + Zone2Card already implement all patterns correctly.
Why: User ran deep competitive analysis — Rundown (dark) vs Superhuman (light). Needed explicit rules on what to borrow from each.
Result: Design system now precisely documents what to copy vs skip from each competitor. Skills enable repeatable process for future design sessions.
Rule promoted?: No — RULE 2 reinforced (editorial not dashboard)

### 2026-04-25 — Workflow simplification + full system cleanup
Did: Deleted .claude/ folder entirely. Moved DESIGN_SYSTEM, FEEDBACK_MEMORY, SYSTEM_STATE, SOURCES to root. Single CLAUDE.md. Deleted ~6k lines of dead weight (claude-os, personas, intelligence, validation, 5 unused skills).
Why: User said multiple files/folders cause confusion, want one brain file.
Result: Clean flat structure — 5 files, all at root.
Rule promoted?: RULE 5 (simple system > complex agent network)

### 2026-04-25 — Rundown + Superhuman UI overhaul
Did: Zone1Signal — emoji prefix from tags[], category color pill, bolder WHAT/WHY labels (weight 700, #71717a). Zone2 — category left border (Superhuman style). LandingPage — stronger hero. App page — editorial header with H1 + signal count badge.
Why: User wants newsletter to look like Rundown AI / Superhuman AI.
Result: Zone1 feels editorial. Zone2 has category identity. Landing more premium.
Rule promoted?: No new rule — RULE 2 reinforced (editorial not dashboard)

---

## UX Issues Log

### 2026-04-21
Issue: macOS TCC blocks .env.local writes
Fix: Use VS Code Claude Code extension for file writes
Status: RESOLVED

---

## What Worked
- Editorial numbered rows (01, 02, 03) — premium feel
- Emoji prefix on Zone1 titles — instant scanability
- Category color pills on Zone1 — fast category scan
- Amber TAKEAWAY left border — screenshottable
- Email-only signup — zero friction
- "Browse signals" secondary CTA — skip email option
- Persistent Z2 filter — survives page refresh
- Flat file structure — single CLAUDE.md, no nested folders

## What Did NOT Work
- GitHub OAuth on landing — friction
- Blur gate on TAKEAWAY — kills habit
- Generic RSS sources — bland signals
- Dark cards with summaries — information overload
- Complex .claude/ folder with 50+ files — confusion, token waste
- Two CLAUDE.md files — conflicting instructions

## Pending Observations
(Not yet confirmed as rules — watch these)
- Thumbnails on Zone 2 cards may improve engagement (validate with real users)
- Emoji hooks may feel too informal for some CTOs (watch feedback)
- Category left borders on Zone2 — does it scan better? (pending real user data)
