# AI Signal — Master Orchestrator
Version: 1.0
Last updated: 2026-04-24

## How to invoke
New session: paste this file content as first message
Or type: `/master`

## Session startup (always run first)
```bash
cat .claude/claude-os/STATUS.md
cat .claude/claude-os/PROJECT_CONTEXT.md
```

Then pick the workflow below based on what STATUS.md says.

## Auto-detection workflow

Run in order. First condition that is true → invoke that agent.

### CHECK 1 — Product health
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/session
node scripts/signal-monitor.mjs 2>/dev/null | tail -5
```
- Auth 500 → fix .env.local first (see .claude/claude-os/ENV_SETUP.md)
- Pipeline RED → `node scripts/process-signals.mjs`

### CHECK 2 — Signal quality (daily)
```bash
ls .claude/intelligence/signal-quality-$(date +%Y-%m-%d).md 2>/dev/null || echo "MISSING"
```
If missing → `node scripts/signal-monitor.mjs`

### CHECK 3 — Incomplete skills
```bash
grep -l "\[CREATE\]\|\[TODO\]" .claude/skills/*.md 2>/dev/null
```
If found → complete those skill files

### CHECK 4 — Weekly intelligence (Mondays)
```bash
date +%u  # 1=Monday
```
If Monday → run `/intelligence run`

### CHECK 5 — Design drift
```bash
git diff --name-only HEAD~5 | grep -E "\.tsx|\.css"
```
If UI files changed → run `/design-check`

### CHECK 6 — Unprocessed feedback
```bash
ls data/feedback-raw.json 2>/dev/null && \
  node -e "const f=require('./data/feedback-raw.json'); \
  console.log(f.filter(x=>!x.processed).length,'unprocessed')" 2>/dev/null
```
If unprocessed > 0 → run `/feedback-run`

## Always at end of every session
```bash
git add -A
git diff --cached --stat
```
Update STATUS.md: what changed, new blockers, next actions.

## Sub-agents (reference)
| Command | Script/File |
|---------|-------------|
| Signal Monitor | `node scripts/signal-monitor.mjs` |
| Market Intel | `/market run` → `.claude/skills/market-intelligence.md` |
| Synthetic Test | `/synthetic run` → `.claude/skills/synthetic-testing.md` |
| Growth Analysis | `/growth run` → `.claude/skills/growth-loop-analysis.md` |
| Design Check | `/design-check` → `.claude/skills/design-agent.md` |
| Self-Learning | `/learn` → `.claude/skills/self-learning-agent.md` |

## Token budget
- Default load: ~1,500 tokens (OS_INDEX + STATUS + PROJECT_CONTEXT)
- Session max: 15,000 tokens
- At 12,000: summarize and continue in fresh context
