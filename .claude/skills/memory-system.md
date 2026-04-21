---
name: memory-system
description: Use when starting or ending any AI Signal session — loads project memory at session start, saves new knowledge at session end. Use mempalace search instead of reading large files directly.
---

# AI Signal Memory System

## Overview

MemPalace (v3.3.2) gives persistent memory across Claude sessions without burning context on large files. Three wings store all project knowledge. Total token budget: 15,000 per session max.

## Palace Structure

```
Palace: ~/.mempalace/palace   (default, writable — not project root)

Wing: ai-signal               ← mined from .claude/
  Content: product decisions, personas, intelligence reports, assumptions,
           MVP plan, design spec, validation data

Wing: lenny-index             ← mined from ~/lennys-podcast-transcripts/index/
  Content: 89 episodes indexed — growth, retention, pricing, early users,
           habit formation, B2B SaaS, founder psychology

Wing: ai-signal-code          ← mined from scripts/ + lib/
  Content: pipeline code, scoring logic, cache, auth, analytics wrappers
```

## SESSION START — always run

```bash
/Users/surajpandita/Library/Python/3.9/bin/mempalace wake-up --wing ai-signal
```

Outputs ~800 tokens of L0+L1 context: current product state, key decisions, open questions.

## SESSION END — always run

```bash
/Users/surajpandita/Library/Python/3.9/bin/mempalace mine /Users/surajpandita/Documents/projects/ai_signal/.claude/ --wing ai-signal
/Users/surajpandita/Library/Python/3.9/bin/mempalace mine /Users/surajpandita/Documents/projects/ai_signal/scripts/ --wing ai-signal-code
/Users/surajpandita/Library/Python/3.9/bin/mempalace mine /Users/surajpandita/Documents/projects/ai_signal/lib/ --wing ai-signal-code
```

## SEARCH — use instead of reading files

```bash
# Find product decisions
/Users/surajpandita/Library/Python/3.9/bin/mempalace search "TAKEAWAY gate server-side" --wing ai-signal

# Find Lenny research
/Users/surajpandita/Library/Python/3.9/bin/mempalace search "daily habit morning routine" --wing lenny-index
/Users/surajpandita/Library/Python/3.9/bin/mempalace search "retention Day 7 churn" --wing lenny-index

# Find code decisions
/Users/surajpandita/Library/Python/3.9/bin/mempalace search "Zone 1 threshold scoring" --wing ai-signal-code
```

## NEVER load directly (token killers)

| Forbidden | Use instead |
|-----------|-------------|
| `~/lennys-podcast-transcripts/` (8.73 MB) | `mempalace search "[query]" --wing lenny-index` |
| `.claude/intelligence/` full folder | `mempalace search "[topic]" --wing ai-signal` |
| `.claude/2026-04-20-ai-signal-mvp-plan.md` (large) | `mempalace search "[task]" --wing ai-signal` |
| `node_modules/`, `.next/` | never |

## Token Budget

| Operation | ~Tokens |
|-----------|---------|
| `wake-up --wing ai-signal` | ~800 |
| `search` result (top 3) | ~400 |
| Reading `.claude/intelligence/` folder directly | ~8,000+ |
| Reading Lenny transcripts directly | ~50,000+ |
| **Budget per session** | **15,000 max** |

## Hook Scripts

```bash
# Session start
bash /Users/surajpandita/Documents/projects/ai_signal/scripts/hooks/pre-session.sh

# Session end
bash /Users/surajpandita/Documents/projects/ai_signal/scripts/hooks/post-session.sh
```

## Re-mining (when to run)

Run `post-session.sh` after:
- Any new `.claude/` file is created
- Any intelligence session completes
- Any major product decision is documented
- End of each working session

Mine is idempotent — safe to run multiple times. Already-filed content is skipped.

## MCP Integration (optional)

```bash
/Users/surajpandita/Library/Python/3.9/bin/mempalace mcp
```

Outputs the Claude Desktop MCP config to connect MemPalace as a persistent memory tool.
