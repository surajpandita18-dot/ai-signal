# AI Signal — System Brain
Last updated: 2026-04-25

## What is AI Signal
Premium daily intelligence briefing for PMs, founders,
and engineers building AI products.
Tagline: 'AI changed overnight. Here's what to build.'
Feel: Rundown AI energy + Linear precision

## User
Primary: CTO / Technical Founder at AI startup
Secondary: PM, researcher, indie builder
Pain: Too much AI noise, no time to filter what matters
Job: Know what changed overnight + what to do about it

## System Philosophy
Move slow to move fast.
Think before coding.
Simple > complex.
One change at a time. Verify. Then next.

## Session Ritual (do this every time)
START:
  mempalace wake-up --wing ai-signal
  Read SYSTEM_STATE.md only
  Pick ONE task

BEFORE any design change:
  Read DESIGN_SYSTEM.md
  Read FEEDBACK_MEMORY.md (last 5 entries)
  Then implement

END:
  mempalace mine .claude/ --wing ai-signal
  Update SYSTEM_STATE.md

Rule: Never load more than 3 files per session.
Rule: Never start coding without reading above 3 files.

## File Roles
CLAUDE.md          — brain, vision, workflow (this file)
DESIGN_SYSTEM.md   — ALL visual decisions (overrides this)
FEEDBACK_MEMORY.md — learning log (append only)
SYSTEM_STATE.md    — current focus + next steps
SOURCES.md         — pipeline source list

Design rule: DESIGN_SYSTEM.md wins over everything.
Memory rule: Use mempalace search before loading any file.

## When User Gives Feedback
If feedback about design:
  1. Add to FEEDBACK_MEMORY.md
  2. Update DESIGN_SYSTEM.md
  3. Implement change

If feedback is "yeh acha nahi":
  1. Ask: what specifically? (if unclear)
  2. Add insight to FEEDBACK_MEMORY.md
  3. Check if pattern repeats 3x → make it a rule

If user shares screenshot:
  1. Extract 3-5 specific patterns
  2. Note what to adopt vs skip (context matters)
  3. Add to DESIGN_SYSTEM.md under dated section
  4. Implement targeted changes only

If user shares competitor:
  1. Add new sources to SOURCES.md
  2. Add design patterns to DESIGN_SYSTEM.md
  3. Add insights to FEEDBACK_MEMORY.md

## Product Principles
1. Fewer signals, more insight
2. Every signal: WHAT + WHY + TAKEAWAY
3. Calm senior-operator voice — no hype
4. Fast to scan — editorial not algorithmic
5. One original layer per signal (from SOP)

## Agent System
One orchestrator (Claude). No rigid sub-agents.
Spawn temporary when needed:
  UI Agent: component + design changes
  Product Agent: strategy + prioritization
  Research Agent: competitor + market
  Pipeline Agent: sources + scoring + LLM

## Flexibility Rule
Never reject changes due to past decisions.
DESIGN_SYSTEM.md can be overwritten anytime.
Adapt always.
