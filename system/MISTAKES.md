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

### 2026-06-14 · `/scripts/` blanket-ignored — 23 production scripts hidden from git
- **What:** `.gitignore` had `/scripts/` with comment "QA artefacts" — intended for QA output artefacts. But the rule swept up every file in `/scripts/`, meaning `smoke.mjs`, `rubric.mjs`, `audit-email.cjs`, `new-issue.mjs`, `qa-flows.mjs` — 23 production-critical files — were never tracked. Anyone cloning the repo couldn't run any harness.
- **Why:** Earlier author conflated "QA artefact outputs" with "the directory containing QA scripts". An ignore-rule on a *whole* directory needs to be deliberate; the comment didn't match the rule's effect.
- **Lesson:** Same shape as the `.claude/worktrees` submodule pollution — the lesson is `git check-ignore` against any file you THINK should be tracked, periodically. **General rule:** if you add a directory-level ignore, add a `# IGNORED CONTENT: list of file patterns expected here` line in the gitignore comment, so future readers can audit intent vs effect.
- **FIXED 2026-06-14:** commit `2885f4a` — removed the `/scripts/` line; added all 23 scripts to git. QA outputs land in `/tmp/aib-*` and `/tmp/email-*` which are already outside the repo, so no replacement ignore needed.
- **Check:** Periodically `git ls-files | wc -l` vs `find . -type f -not -path '*/node_modules/*' -not -path '*/.next/*' -not -path '*/.git/*' | wc -l` and investigate any large delta.

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

### 2026-06-14 · Built /interviews/<slug>; never opened the live URL before declaring "plumbing complete"
- **What:** Wrote three full prep briefs (1450-1600 words each), shipped the plumbing, said "plumbing complete." Suraj opened the live `/interviews/001` and got the "Full prep brief coming soon" fallback because the Supabase row only has the shallow interview shape; my deep brief content lived in JSON only.
- **Why:** I tested `tsc + smoke pass` and treated that as "user value shipped." Never opened the route in a browser / curl to see what the user would actually see.
- **Lesson:** "Plumbing complete" is a lie until I curl/screenshot the live route and confirm the actual content renders. Same pattern as the email "all white" mistake one row above — assuming harness pass = real-world value.
- **FIXED:** commit `aed7cde` — added JSON fallback in both `src/app/i/[issue]/page.tsx` and `src/app/interviews/[slug]/page.tsx`, mirroring the decoder + tldr.target pattern.
- **Check:** New rule — after any new route or content-rendering change, take a Playwright full-page screenshot of the live URL and visually verify the expected content is present. `scripts/qa-flows.mjs` now exists for this — extend it for any new route.

### 2026-06-14 · Screenshot cache read stale image after deploy
- **What:** Took Playwright screenshot of `/interviews/001` after the fallback fix; image still showed "coming soon". Almost concluded the fix didn't work. Curling the actual HTML showed the new sections WERE there.
- **Lesson:** Playwright's `waitUntil: networkidle` doesn't guarantee post-Vercel-deploy freshness. When verifying a just-pushed fix, curl the raw HTML first to confirm content; screenshot is for visual / layout verification only.
- **Check:** Before screenshotting to verify a deploy, `curl -s URL | grep <distinctive-new-string>` to confirm the deploy is live.

## Git workflow

### 2026-06-14 · Tried to cherry-pick commits that were already on main
- **What:** Suraj said "apply polish changes". I attempted `git cherry-pick e151e26 0b6a786 c785fc1` — got "cherry-pick already in progress" because 2 of the 3 commits had ALREADY landed on main earlier in the session. Wasted time aborting/skipping/retrying.
- **Lesson:** Before cherry-picking by SHA, `git log --oneline | grep <sha>` (or check `git branch --contains <sha>`) to confirm the commit isn't already in the current branch's history.
- **Check:** Standard cherry-pick pre-flight: list commits to be picked, filter out the ones already in `git log`, only pick the remainder.

## Content / editorial

### 2026-06-14 · Same structural template across all 3 interview tip_html — "framework (works for any X)" formula
- **What:** Three issues' `job_signal.interview.tip_html` were structurally identical: opening `<b>The framework (works for any "..." question):</b>` → 4-step framework → `<b>The trap:</b>` → `<b>Winners</b>` → closing `<em>Save this — it answers any X question. The meta-skill it tests at any AI lab interview: can you…</em>`. Only the topic words varied. Same pattern leaked into `meta_skill_html` ("the same shape works for any X, Y, Z, where…").
- **Why:** Wrote brief 001 first, then briefs 002 and 003 silently copied the rhetorical scaffolding. Cross-issue formula check happens at editorial review, not at writing time — and I skipped editorial review because rubric scoring focused on per-brief axes, not cross-brief similarity.
- **Lesson:** CLAUDE.md explicitly bans "lens take, Rep, or tip that would fit the last 4 issues unchanged" — the same applies to interview briefs. After writing any cross-issue editorial field, diff against the last 2-3 issues' equivalent field and check that the RHETORICAL SHAPE differs, not just the topic words.
- **FIXED:** commit `7dc1314` rewrote all 3 tip_html to distinct shapes, plus 001 + 003 meta_skill_html.
- **Check:** Add a `scripts/audit-cross-issue-similarity.mjs` that diffs each editorial field across the last 3 issues and flags >60% structural overlap. **TODO.**

### 2026-06-14 · Oversize h1 on /interviews/<slug> — display weight applied to long-form question
- **What:** The /interviews/[slug] page wrapped the interview question (a 30-80 word production scenario) in `<h1>` inside `<section className="hero">`. The .issue .hero h1 CSS rule applies `clamp(38px, 6vw, 70px)` display weight — appropriate for short headlines, catastrophic for long sentences. Result: 8+ wrapped lines on mobile, unreadable as a heading, missed in QA because the visual harness doesn't flag "h1 is technically big but reads as wallpaper".
- **Why:** Reused the issue page's hero structure for a different content type without re-thinking the typography. Display-weight h1 ≠ long-form question.
- **Lesson:** When reusing a CSS class scoped to "short brand headlines", verify the new content shape is also short. If it isn't, override the size or pick a different class. The semantic h1 is right; the visual treatment isn't.
- **FIXED:** commit `7dc1314` overrode the h1 fontSize to `clamp(22px, 3.4vw, 32px)`.
- **Check:** Visual hierarchy audit pass — for any new route, take a Playwright screenshot at 390px mobile and verify no single block (heading or paragraph) consumes >30% of viewport height. **TODO:** add this check to `scripts/qa-flows.mjs`.

## External fetches

### 2026-06-14 · WebFetch on Substack archives returned empty
- **What:** Tried to WebFetch Aakash Gupta and Lenny's Newsletter posts to extract their PM-interview-prep structure. Substack pages are heavily JS-rendered; WebFetch saw only the header + testimonials, no post content. Retried twice before giving up and pivoting to first-principles rubric.
- **Lesson:** Substack post URLs (and other heavily-JS-rendered editorial sites) usually fail WebFetch. Try once, if empty, pivot. Don't burn 2-3 attempts.
- **Check:** Known-fail list for WebFetch: Substack post bodies, Medium articles behind metering, Twitter/LinkedIn. If the target is one of these, plan an alternative path (RSS feed, archived versions, first-principles synthesis) before the first fetch.

---

## When to read this file

- Before any change to: email templates, content-model schema, cron route, OG image, parallel-agent worktree setup
- After every user message that contains frustration signal ("kyun nhi check kiya", "yeh basic cheez", "frustrating", "mistake")
- During session compact — preserve this file's purpose in the carryover summary
