# Claude OS Benchmarks

## Scoring system
1–4: Weak   5–7: Good   8–9: Strong   10: Best-in-class

| Dimension | Score | Target | Gap | Next action |
|-----------|-------|--------|-----|-------------|
| Agent quality | 6 | 9 | -3 | 5 of 12 agents have no skill file yet (marked [CREATE] in AGENTS.md) |
| Memory (MemPalace) | 8 | 9 | -1 | Add mempalace.yaml to dirs so wings don't auto-default |
| Token efficiency | 8 | 8 | 0 | On budget — 3-file default load ~1,500 tokens |
| Research freshness | 6 | 8 | -2 | Lenny indexed but not auto-refreshed; no arXiv/HN feeds in palace |
| Product strategy | 9 | 9 | 0 | 4-agent intelligence run complete, personas calibrated, ICP locked |
| Code review | 6 | 7 | -1 | QA agent skill file not yet written |
| UX review | 8 | 8 | 0 | design-agent.md exists, DECISIVE principle enforced |
| Launch readiness | 5 | 9 | -4 | launch-agent.md not yet written; no CTOs list; 0 users |
| Automation level | 7 | 8 | -1 | GitHub Actions pipeline runs; MemPalace mines weekly; signal monitor not scripted |
| Daily usability | 8 | 9 | -1 | OS_INDEX.md explains system in one read; STATUS.md needs weekly discipline |

**Overall: 71/100**

---

## vs best known systems

### What they do better

ChatPRD / Cursor rules:
  - Single-file system prompt, instant load, zero friction
  - Better agent chaining (multi-step without token overhead)
  - More opinionated defaults (less setup required)

Popular Claude Code setups (.cursorrules files):
  - Version-controlled, auto-loaded on project open
  - Team-shareable without MemPalace dependency
  - Better coverage of edge cases in coding conventions

Notion AI / Superhuman AI:
  - Native memory without external tooling
  - Tighter product loop (AI inside the workflow, not beside it)

### What AI Signal Claude OS does better

  - Domain-specific: every file is AI Signal-specific, not boilerplate
  - Memory architecture: MemPalace 3-wing setup saves ~99% tokens vs loading files
  - Persona depth: 4 calibrated personas + wrong-user guard (most systems skip this)
  - Intelligence layer: 7+ files capturing product decisions, analytics, gaps
  - Git-integrated: every decision traceable to a commit
  - Lenny index: 89 episodes of product/growth research on-demand at ~400 tokens

---

## Top 3 gaps (act on these first)

1. **5 missing agent skill files** — launch-agent, qa-agent, signal-monitor,
   feedback-processor, research-agent all marked [CREATE] in AGENTS.md.
   Blocks: launch prep, QA runs, feedback processing.
   Fix: write skill files one-by-one as each workflow is needed.

2. **0 real users** — all benchmarks are pre-validation.
   The real test of this system is whether it adapts when first users arrive.
   Fix: run /launch-prep, DM first 10 CTOs this week.

3. **Analytics Phase 4 not implemented** — day1/3/7_return, aha_activation,
   signal_clicked, zone1_fully_read are all in the plan but not in code.
   Fix: implement Phase 4 events (see analytics-plan.md) before first user.

## Last updated
2026-04-24
