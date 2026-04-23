# AI Signal — Claude OS
Version: 1.0
Last updated: 2026-04-24

## What this system does
Converts raw AI news into daily builder decisions for technical founders.
Every workflow, agent, and file in this system exists to answer one question:
"What changed overnight and what should I build differently today?"

## How to start any session
Step 1: mempalace wake-up --wing ai-signal
Step 2: Read .claude/claude-os/STATUS.md
Step 3: Pick workflow below

---

## Workflows

DAILY (every morning):
─────────────────────
1. Morning Signal Check
   Command: node scripts/signal-monitor.mjs
   Reads:   lib/processedSignals.json
   Output:  .claude/intelligence/signal-quality-{date}.md
   Time:    2 min

2. Morning Brief
   Command: mempalace wake-up --wing ai-signal
   Output:  .claude/MORNING_BRIEF.md
   Time:    30 sec

WEEKLY (every Monday):
──────────────────────
3. Full Intelligence Run
   Command: /intelligence run
   Reads:   all .claude/intelligence/ files
   Output:  .claude/intelligence/weekly-review-{date}.md
   Time:    45 min

4. Research Upgrade
   Command: /research
   Reads:   .claude/claude-os/RESEARCH_INTELLIGENCE.md
   Output:  .claude/intelligence/research-{date}.md
   Time:    20 min

5. C-Suite Product Review
   Command: paste C-Suite prompt from COMMANDS.md
   Reads:   all personas + spec + analytics
   Output:  .claude/intelligence/csuite-{date}.md
   Time:    30 min

LAUNCH (run now):
─────────────────
6. Launch Prep
   Command: /launch-prep
   Output:  .claude/intelligence/launch-plan-{date}.md
   Time:    20 min

7. Production Verify
   Command: check ai-signal-eta.vercel.app
   Checklist: see .claude/claude-os/BENCHMARKS.md
   Time:    15 min

ON DEMAND:
──────────
8.  Lenny CPO Question:  /lenny [question]
9.  Synthetic Test:      /synthetic run
10. Market Intel:        /market run
11. Growth Analysis:     /growth run
12. User Feedback:       /feedback-run
13. Design Check:        /design-check
14. QA Test:             /qa-run
15. Signal Monitor:      /signal-check

SYSTEM:
───────
16. Session Start:  mempalace wake-up --wing ai-signal
17. Session End:    mempalace mine .claude/ --wing ai-signal
18. Token Trim:     /trim
19. Auto-Improve:   audit all .claude/claude-os/ files, find gaps, update

---

## Files to load by default (every session)
- .claude/claude-os/OS_INDEX.md        (this file)
- .claude/claude-os/STATUS.md
- .claude/claude-os/PROJECT_CONTEXT.md

## Files to load ON DEMAND only
- CLAUDE.md                            When: UI/design tasks
- .claude/skills/[specific].md         When: invoking that skill only
- .claude/personas/[specific].md       When: product simulation tasks
- .claude/intelligence/[specific].md   When: that topic specifically
- lennys-podcast-transcripts/          NEVER — use mempalace search instead
- node_modules/, .next/                NEVER

## Token budget
15,000 tokens per session max
Warning at 12,000 → run /trim
Default load cost: ~1,500 tokens (3 files above)
