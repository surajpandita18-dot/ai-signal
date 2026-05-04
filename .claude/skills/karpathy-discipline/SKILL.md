---
name: karpathy-discipline
description: Use this skill BEFORE writing or editing code for any task that touches more than one file, adds a new feature, refactors existing code, modifies database schema or migrations, changes API routes, edits authentication or freemium gating, modifies caching logic, alters background jobs (Inngest), changes data fetching, or implements anything where Suraj might struggle to debug it later. Also use when Suraj writes vague asks like "fix this", "make it better", "add X feature", "build this", or anything ambiguous. Also triggers on shortcuts "kd", "plan first", "discipline mode", "discipline on". Skip ONLY for: typo fixes, single-line copy changes, color/spacing tweaks, console.log additions, throwaway scripts. When in doubt, use this skill — false positives are cheap, false negatives let Claude over-engineer silently.
---

# Karpathy Discipline Mode (Goal-Driven Execution)

Activate this when the task is bigger than a one-liner. The job here is to
turn a vague ask into a sequence of steps where each step has a *check* —
something Suraj can run or click to confirm it actually worked.

## The rule

Before writing any code, output a plan in this exact shape:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Then execute one step at a time. After each step, state whether the verify
check passed before moving to the next.

## What "verify" means in AI Signal (no test suite yet)

This codebase doesn't have proper unit tests. So `verify` does NOT mean
"write a test and make it pass". It means one of:

- `npm run build` completes without errors
- The dev server (`npm run dev`) loads the page without console errors
- A specific UI element appears / disappears / shows the right text
- A specific API route returns the expected JSON shape (curl or browser)
- The freemium gate behaves correctly: logged-out user does NOT see the
  Builder Takeaway field in network response (check DevTools → Network)
- The 48-hour cache hit/miss is logged correctly in the server console

Pick the cheapest verify check that actually proves the step worked. Don't
invent verification ceremony Suraj can't run.

## Translating common asks

| Vague ask | Goal-driven version |
|---|---|
| "Add a filter for AI news category" | "When I click the 'Models' chip, only model-related signals show. Other chips work the same way." |
| "Fix the cache" | "Write a one-line log of cache HIT or MISS per request. Confirm: same URL within 48h shows HIT on second load." |
| "Make the homepage faster" | "Lighthouse Performance score on `/` improves from X to Y." (Ask Suraj for X first.) |
| "Improve the gating" | STOP. Ask: which user sees what, in which exact field? Don't guess. |

## When the plan exposes a gap

If, while writing the plan, you realize the ask is ambiguous or the verify
step is impossible to define — stop and ask Suraj. A plan with a fake
verify step is worse than no plan, because it gives false confidence.

## Tradeoff

This mode is slower upfront. It's the right tradeoff for anything Suraj
will struggle to debug himself later — which is most of AI Signal.
