# AI Signal

Weekly AI newsletter that de-duplicates the best AI newsletters into one digest. One clean signal. No overlap. With a role lens for PMs, Founders, and Builders.

## Current status

Phase 0 — setup complete. Phase 1 (schema + seed data) is next.

## How the agent system works

This repo uses a multi-agent workspace. Each folder (`/src`, `/db`, `/qa`, `/design`, `/content`, `/system`) is owned by a specialist agent with its own `CLAUDE.md`. The root `CLAUDE.md` is ARIA, the orchestrator. Open each folder in its own Claude Code terminal when that agent is active.

- Full product spec: [PRD.md](PRD.md)
- Build phases and status: [PLAN.md](PLAN.md)
- Current state and active agents: [STATE.md](STATE.md)
- Agent workflow and terminal pattern: [system/WORKFLOW.md](system/WORKFLOW.md)
