# Token Optimization Rules

## Budget
Per session: 15,000 tokens max
Warning at:  12,000 tokens → run /trim
Action:      stop loading new files, complete current task, end session

---

## NEVER load (saves 50,000+ tokens)

| Path | Instead, use |
|------|-------------|
| lennys-podcast-transcripts/ (8.73 MB) | mempalace search "[topic]" --wing lenny-index |
| .claude/intelligence/ (full folder) | mempalace search "[topic]" --wing ai-signal |
| .claude/personas/ (all 4 at once) | Load ONE persona relevant to current task |
| .claude/skills/ (all 6 at once) | Load ONE skill relevant to current task |
| node_modules/ | Never. Ever. |
| .next/ | Never. |
| lib/realNews.json | Use /api/news endpoint or signal-monitor.mjs |

---

## ALWAYS load (session start — ~1,500 tokens total)

| File | Tokens | Why |
|------|--------|-----|
| .claude/claude-os/OS_INDEX.md | ~600 | Workflow map + file index |
| .claude/claude-os/STATUS.md | ~300 | Current blockers + next actions |
| .claude/claude-os/PROJECT_CONTEXT.md | ~400 | Stack + routes + decisions |
| **Total** | **~1,300** | Leaves 13,700 for work |

---

## ON DEMAND (load only when needed)

| File | When to load | Tokens |
|------|-------------|--------|
| CLAUDE.md | UI/design tasks only | ~900 |
| .claude/personas/technical-founder.md | Product/ICP simulation | ~600 |
| .claude/personas/wrong-user.md | Cohort/filter analysis | ~400 |
| .claude/intelligence/analytics-plan.md | Metrics/PostHog work | ~700 |
| .claude/intelligence/product-intelligence-2026-04-21.md | Deep product review | ~2,000 |
| .claude/claude-os/AGENTS.md | When invoking an agent | ~500 |
| .claude/claude-os/DECISIONS.md | Before making a product decision | ~700 |

---

## MemPalace vs direct file (biggest lever)

| Task | Direct load | MemPalace | Savings |
|------|------------|-----------|---------|
| Find Lenny insight on retention | 50,000 tokens | ~400 | 99% |
| Find past product decision | 8,000 tokens | ~300 | 96% |
| Find code pattern in scripts/ | 5,000 tokens | ~250 | 95% |

**Rule:** If you're looking for information from a past session or indexed file,
search MemPalace FIRST. Load the file only if the search snippet isn't enough.

---

## Session end checklist (always)
1. Run: mempalace mine .claude/ --wing ai-signal
2. Update .claude/claude-os/STATUS.md (blockers, next actions, date)
3. Any new code decisions? → add to DECISIONS.md

---

## Token cost per agent (for planning)

| Agent | Tokens | Notes |
|-------|--------|-------|
| Morning brief | ~500 | MemPalace wake-up only |
| Signal monitor | ~500 | Reads processedSignals.json |
| Design check | ~2,000 | Loads CLAUDE.md + component |
| Growth analysis | ~4,000 | analytics-plan + feedback |
| Market intel | ~5,000 | External research + analysis |
| Launch prep | ~6,000 | Personas + ICP + DM templates |
| Synthetic test | ~8,000 | All 4 personas + assumptions |
| Research agent | ~8,000 | Sources + synthesis |
| Full intelligence | ~12,000 | All intelligence files |
| C-Suite review | ~15,000 | Full session budget — plan accordingly |
