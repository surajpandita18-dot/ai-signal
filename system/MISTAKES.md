# Mistakes Log — what to never repeat

**Purpose.** Suraj has flagged that recurring mistakes (especially in code + design) burn his trust. This file is the running record so future agents (and me) check it before shipping anything in a category that has prior failures.

**Rules for this file.**
- Append-only by category. Don't rewrite history; do mark entries as "RESOLVED" when the underlying gap is structurally fixed (e.g., a check is now in CI).
- Each entry: date · category · what happened · why it happened · the durable lesson · the check that would have caught it.
- Keep entries ≤8 lines each. If a category is bloating, summarise older entries into a single "pattern" line and prune individual ones.
- Prune RESOLVED entries older than 60 days unless the pattern still applies.
- If you make a new mistake during a session, log it BEFORE moving on to the next task. Don't bury it.

---

## Email rendering

### 2026-06-14 · Email "all white" in Gmail/iOS dark mode
- **What:** Suraj opened the cron-sent issue email on his phone — entire email was a blank rectangle. Cream paper background got auto-inverted by Gmail dark mode; ink text went near-white on near-white.
- **Why:** Email Head had zero `color-scheme` declaration. The local audit harness (`scripts/audit-email.cjs`) renders HTML and screenshots in light mode only — dark-mode email-client behaviour was never tested.
- **Lesson:** Every email-template change must include a dark-mode preview test (paid: Litmus / Email-on-Acid; free: iOS Mail or Gmail mobile real account). Local render success ≠ inbox success.
- **Check that would have caught it:** A `prefers-color-scheme: dark` screenshot pass in the audit harness, OR a recurring real-inbox preview ritual after every email touch. **TODO:** wire a Playwright dark-mode pass into `audit-email.cjs`.

## Content drift between JSX and JSON

### 2026-06-14 · "Unpacked from: ▸ unpacked from:" duplicate prefix
- **What:** Iter 16 changed the JSX prefix from `▸ unpacked from:` to `Unpacked from:` in BuildNotes. Iter 17 caught that all three issue JSONs still embedded the literal `▸ unpacked from:` in `paper_ref` — every issue rendered the prefix twice.
- **Why:** Component-side prefix change wasn't paired with a content-side scrub. The JSON was treated as inert data, not as content that already carried the assumption.
- **Lesson:** When you change a component-side prefix/wrapper that historically lived in content data, grep ALL `content/issues/*.json` for the old string and clean. Better: add a defensive `strip` helper (we did, via `stripUnpackedPrefix`).
- **Check:** After any rename in a component that consumes content fields, run `grep -rn "<old-string>" content/issues/` and confirm zero hits.

## Cron / production verification

### 2026-06-14 · Assumed today's Saturday cron fired; didn't verify
- **What:** After publishing issue 001 to `status='published'`, I told Suraj "subscribers ko issue 003 mila hoga" based on cron config — but never checked Vercel function logs or Resend logs.
- **Lesson:** When something is sent to real users, "the config says it will fire" is not a confirmation. Confirmation = Vercel logs say it ran without error AND Resend logs show messages delivered.
- **Check:** After any cron-relevant change, fetch the last 24h of `/api/cron/send` invocations from Vercel logs (or instruct user to). Don't infer from config.

## Git / repo hygiene

### 2026-06-14 · Worktrees committed as submodules
- **What:** A commit accidentally tracked `.claude/worktrees/agent-*` as submodule pointers because `.claude/` wasn't in `.gitignore`.
- **Lesson:** From the first parallel-agent session, ensure `.claude/` is in `.gitignore`. Don't wait for the pollution to show up in `git status`.
- **RESOLVED 2026-06-14:** `.gitignore` now has `.claude/`. Pattern fixed for this repo.

### 2026-06-14 · Parallel content writers both committed directly to main
- **What:** Two content-writer agents launched in parallel via `isolation: "worktree"` both committed to `main` instead of their worktree branches (cwd confusion). One self-corrected by resetting main; the resulting state was fragile.
- **Lesson:** Tighter agent brief: "your commit MUST go on your worktree branch; verify with `git branch --show-current` before committing; never `git checkout main` from inside a worktree."
- **Check:** Spawn agent briefs should include the explicit pre-commit branch check, AND main session should verify each agent's commit landed on its expected branch before cherry-picking.

## Spec-vs-reality drift

### 2026-06-14 · OG image route specced in CLAUDE.md but never built
- **What:** During wave 7 polish, an agent was sent to audit `src/app/og/[issue]/route.tsx` — discovered the file didn't exist. CLAUDE.md architecture diagram included it as if implemented.
- **Lesson:** When CLAUDE.md or a spec lists a file/route/feature, verify it exists before assuming. Spec ≠ reality. Now built and shipped, but the gap could have been weeks of dead reference.
- **Check:** New-session "is everything in CLAUDE.md actually present?" sanity pass. **TODO:** add a tiny script `scripts/audit-claude-md-paths.mjs` that greps CLAUDE.md for file paths and confirms each exists.

## QA harness gaps

### 2026-06-14 · Audit harnesses don't catch what the user actually experiences
- **What:** `scripts/audit-email.cjs` showed 0 overflow offenders. Smoke test passed 78/78. But the email was unreadable to the real reader because nothing tested the actual email-client rendering.
- **Lesson:** The user is the final test surface. When the user catches something, the harness has a gap — log the gap here and either close it (add the check) or document why it can't be closed (e.g., need paid Litmus account).
- **Check pattern:** "if the user catches it, write a test for it." For each entry in this file under a category with "Check:" missing, prioritise building that check.

---

## When to read this file

- Before any change to: email templates, content-model schema, cron route, OG image, parallel-agent worktree setup
- After every user message that contains frustration signal ("kyun nhi check kiya", "yeh basic cheez", "frustrating", "mistake")
- During session compact — preserve this file's purpose in the carryover summary
