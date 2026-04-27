# AI Signal — Agent Workflow

How to use the multi-agent system. Read this before opening any terminal.

---

## 1. Agent flow

```
UI tasks:
  User → ARIA → FORGE → LENS → VEIL → ARIA → User

Schema / API tasks:
  User → ARIA → SEED → LENS → ARIA → User

Frontend + schema together:
  User → ARIA → SEED (first) → FORGE → LENS → VEIL → ARIA → User

Improvements (after task #10):
  ORACLE writes proposal → ARIA auto-applies → ARIA logs in STATE.md
```

---

## 2. Multi-terminal pattern

Open one terminal per active agent. Each terminal runs `claude` in that folder.

| Terminal | Folder | Agent | When open |
|---|---|---|---|
| 1 | `/` (root) | ARIA | Always open |
| 2 | `/src/` | FORGE | When ARIA assigns a frontend/API task |
| 3 | `/db/` | SEED | When ARIA assigns a schema task |
| 4 | `/qa/` | LENS | After FORGE or SEED finishes a task |
| 5 | `/design/` | VEIL | After FORGE ships UI |
| 6 | `/content/` | SAGE | Phase 4+ only |

---

## 3. Task lifecycle for you (the user)

**Step 1.** In Terminal 1 (ARIA): describe what you want to build.

**Step 2.** ARIA classifies the task, writes a brief in `/system/briefs/`, updates `STATE.md`, and tells you which terminal to open.

**Step 3.** Open the specialist's terminal. Say: "Read your brief and execute." The brief path is in ARIA's message.

**Step 4.** Specialist completes work, writes their `IMPLEMENTATION_LOG.md`.

**Step 5.** Open Terminal 4 (LENS). Say: "Review the latest task." LENS reads the brief and log, audits the files, writes a review in `/qa/reviews/`.

**Step 6.** If the task involved UI, also open Terminal 5 (VEIL). Say: "Review the latest UI task." VEIL writes its review in `/design/reviews/`.

**Step 7.** Read the review verdicts. Return to Terminal 1 (ARIA). Say: "All PASS" or "CHANGES_NEEDED — [paste the critical items]."

**Step 8.** ARIA decides next move: mark complete and give you the next task, or write a follow-up brief and route back to the specialist.

---

## 4. File locations

| File type | Location | Notes |
|---|---|---|
| Task briefs | /system/briefs/[YYYY-MM-DD]_[task].md | Written by ARIA before delegating |
| Code reviews | /qa/reviews/[YYYY-MM-DD]_[task]_review.md | Written by LENS |
| Design reviews | /design/reviews/[YYYY-MM-DD]_[task]_review.md | Written by VEIL |
| Implementation logs | /[agent-folder]/IMPLEMENTATION_LOG.md | Overwritten per task — git is the history |
| ORACLE proposals | /system/proposals/ | Active, not yet applied |
| Applied proposals | /system/applied/ | After ARIA applies them |

---

## 5. ORACLE auto-apply policy

ARIA applies ORACLE proposals automatically without asking you. The change is logged in `STATE.md` and the proposal file is moved to `/system/applied/`. If a proposal causes a problem, revert via `git checkout -- [file]` or `git revert`.

---

## 6. When something breaks

1. Stop. Do not run more commands.
2. Go to Terminal 1 (ARIA). Say: "BROKEN — [describe what's wrong]."
3. ARIA classifies it and routes to LENS first (diagnose) before routing to FORGE (fix).
4. Never route a fix before a diagnosis.

---

## 7. Phase gate rules

- Never start Phase N+1 on a broken Phase N.
- A phase is complete only when: LENS review = PASS, VEIL review = PASS (for UI phases), and `git commit` is done.
- ARIA updates `PLAN.md` status column when each phase completes.
- ARIA increments `task_counter` in `STATE.md` on every completed task.
