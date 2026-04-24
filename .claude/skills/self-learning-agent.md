# Self-Learning Agent

## Purpose
Learn from repeated failures and upskill other agents automatically.
Invoke with: `/learn`

## When to run
- After 7+ days of real user data
- After 3+ QA failures in the same area
- After receiving real user feedback (10+ users)
- Weekly on Mondays (after `/intelligence run`)

⚠️ **Do NOT run with 0 real users — no data = no learning.**
Activate after first 10 users give feedback.

---

## Step 1 — Gather evidence
Read only files that exist:
```bash
ls .claude/intelligence/qa-report-*.md 2>/dev/null | tail -4
ls .claude/intelligence/signal-quality-*.md 2>/dev/null | tail -7
ls .claude/intelligence/feedback-analysis-*.md 2>/dev/null | tail -4
ls .claude/intelligence/synthetic-feedback-*.md 2>/dev/null | tail -2
```
Read each file found. Also read: `.claude/validation/assumptions.md`

If fewer than 3 report files exist of any type → output "INSUFFICIENT DATA" and stop.

---

## Step 2 — Pattern recognition
Only learn from patterns appearing **3+ times**:

```
PATTERN FORMAT:
Issue:          [what went wrong]
Source:         [which reports — min 3]
Frequency:      [how many times]
Root cause:     [why]
Affected skill: [filename]
Fix:            [specific rule to add/change]
Confidence:     HIGH / MEDIUM / LOW
```

Ignore single occurrences — may be noise.

---

## Step 3 — Update skills (HIGH confidence only)
For each HIGH confidence pattern:
- Open affected skill file
- Add specific rule with comment: `# Learned YYYY-MM-DD from N occurrences of [issue]`
- Never delete existing rules
- Never auto-update MEDIUM/LOW confidence — flag for human approval only

---

## Step 4 — CLAUDE.md update
Only update if a design violation appears in **3+ consecutive** qa-reports:
- ADD new explicit rule
- STRENGTHEN vague rule with example
- Mark verified rules: `✅ Verified YYYY-MM-DD`
- Never remove rules based on learning

---

## Step 5 — Update Claude OS
- Append lessons to `.claude/claude-os/CHANGELOG.md`
- Update `.claude/validation/assumptions.md` with confirmed/invalidated assumptions
- Update `.claude/claude-os/STATUS.md`

---

## Step 6 — Report
```
LEARNING REPORT — {date}

Data available: [N qa-reports, N feedback, N synthetic]
Patterns found (3+ occurrences): N
Patterns ignored (< 3): N

Skills updated:        [list or 'none']
CLAUDE.md changes:     [list or 'none']
Human review needed:   [list of MEDIUM confidence patterns]

Recommended: run /learn again in [7/14/30] days
```
