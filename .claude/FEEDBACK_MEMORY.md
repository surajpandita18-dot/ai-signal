# AI Signal — Feedback Memory
Rule: Always append. Never delete.
Rule: If same feedback appears 3x → convert to rule.

## Pattern Tracker
(Track recurring themes — 3x = rule)
- "bland/generic" feel: 2x → approaching rule
- "friction too high": 3x → RULE: remove friction first
- "too much text": 2x → approaching rule

## Active Rules (from repeated feedback)
RULE 1: Remove friction before monetization
  Origin: GitHub OAuth barrier + paywall complaints
  Applied: Email only signup, TAKEAWAY free

RULE 2: Premium feel = editorial not dashboard
  Origin: "homepage bland", "not like Rundown"
  Applied: Editorial rows, colored dots, amber TAKEAWAY

RULE 3: Design evolves from references not constraints
  Origin: CLAUDE.md was locking design decisions
  Applied: DESIGN_SYSTEM.md is now flexible, overrides all

RULE 4: Sources determine signal quality
  Origin: "sources bland hain"
  Applied: 24+ sources, tiered authority system

RULE 5: Simple system > complex agent network
  Origin: "move slow to move fast"
  Applied: 5 core files, 3-file session limit

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
Feedback: Rundown AI screenshots + SOP doc shared
Insight:
  - Emoji hooks = instant scanability
  - Thumbnail images = visual personality
  - "Why it matters" needs bold label
  - Landing value prop needs punch
Action: DESIGN_SYSTEM.md updated with Rundown patterns
Status: PENDING IMPLEMENTATION

### 2026-04-25
Feedback: "move slow to move fast — system simple rakho"
Insight: Complexity kills iteration speed
Action: 5 files max, 3-file session rule, session ritual
Status: APPLIED

## UX Issues Log

### 2026-04-21
Issue: macOS TCC blocks .env.local writes
Fix: Use VS Code Claude Code extension for file writes
Status: RESOLVED

## What Worked
- Editorial numbered rows (01, 02, 03) — premium feel
- Amber TAKEAWAY left border — screenshottable
- Email-only signup — zero friction
- "Browse signals" secondary CTA — skip email option
- Category colored dots — fast scanning
- Persistent Z2 filter — survives page refresh

## What Did NOT Work
- GitHub OAuth on landing — friction
- Blur gate on TAKEAWAY — kills habit
- Generic RSS sources — bland signals
- Dark cards with summaries — information overload
- Complex multi-agent system — too rigid

## Pending Observations
(Not yet confirmed as rules — watch these)
- Thumbnails on Zone 2 cards may improve engagement
- Emoji hooks may feel too informal for CTOs
- Landing social proof may not be credible without users
