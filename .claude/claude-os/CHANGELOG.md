# AI Signal — Changelog

Most recent first.

---

## Claude OS v1.0
Date: 2026-04-24
Files: .claude/claude-os/ (10 files)
- OS_INDEX.md: master control panel
- PROJECT_CONTEXT.md: stack, routes, decisions (~400 tokens)
- STATUS.md: phase, blockers, next actions
- AGENTS.md: all 12 agents with invocation + token cost
- RESEARCH_INTELLIGENCE.md: sources, Lenny insights, validated findings
- BENCHMARKS.md: honest scores (71/100), gaps, comparison vs other systems
- TOKEN_OPTIMIZATION.md: budget, never-load list, MemPalace vs direct
- DECISIONS.md: 10 key decisions with why + alternatives rejected
- CHANGELOG.md: this file
- COMMANDS.md: every reusable command in one place

---

## 9-Task Launch Sprint
Date: 2026-04-24
Commits: 9746d5a → 11496e9

- 9746d5a  feat: landing page — live signal demo, GitHub OAuth CTA for unauthed
- af7b034  feat: empty states — Zone 1 processing, API error+retry, Zone 2, Saved
- a110498  feat: /digest/[date] — shareable server-rendered brief, SEO meta, TAKEAWAY gate
- 8b1d93d  feat: saved page rewrite — correct localStorage key, design tokens, save date badge
- 88b3d8d  feat: mobile fixes 390px, 404 page, error.tsx + global-error.tsx
- 2b8a20f  feat: 3-step onboarding overlay — progress bar, TAKEAWAY demo, GitHub CTA
- 11496e9  feat: launch-ready — all 8 routes verified, TypeScript clean

---

## Phase 6b — Fix Before First User
Date: 2026-04-22
Commits: 25cb356 → b9f2baa

- 25cb356  fix: Zone 1 threshold 3.5 → 2.8, fallback to top processed signals
- ef1553e  fix: server-side TAKEAWAY gate — never in DOM for free/unauthed
- 3ad690a  fix: takeawayGated flag — distinguishes gated vs LLM SKIP
- b9f2baa  fix: unauthenticated auth gate — signal #1 preview, OAuth prompt for #2+

---

## Infrastructure — MemPalace + Gemini Fallback
Date: 2026-04-22
Commits: 3b14150, e05ecc3

- 3b14150  feat: Gemini 1.5 Flash fallback in process-signals.mjs
- e05ecc3  feat: MemPalace memory system — 3 wings, 1000 drawers, weekly GH Action

---

## Product Intelligence Session
Date: 2026-04-21
Commit: af3337f (should be af3367f)

- 4-agent analysis: User Psychologist, Brutal UX Editor, Revenue Pragmatist, Competitive Assassin
- 3 structured debates
- Synthesis: wrong-user trap identified, threshold miscalibration found, blur gate vulnerability
- Output: .claude/intelligence/product-intelligence-2026-04-21.md

---

## Phase 6 — Upgrade CTA
Date: 2026-04-21
Commit: e75406d

- feat: /upgrade page — early access framing, amber mailto CTA, PostHog upgrade_clicked

---

## Phase 5 — Article Page
Date: 2026-04-21
Commit: 3cd5a22

- feat: /article/[id] — flat header, WHAT/WHY/TAKEAWAY, blur gate, related signals

---

## Phase 4 — Homepage Redesign (DECISIVE)
Date: 2026-04-20
Commits: 408d8d6, 60822f7, 733cec5, 700a584

- 408d8d6  feat: homepage — Zone 1 editorial list + Zone 2 grid + sticky nav
- 60822f7  feat: Zone2Card — compact card, score bar, 6px radius
- 733cec5  feat: Zone1Signal — amber TAKEAWAY pull quote, save/dismiss
- 700a584  feat: FirstVisitTooltip (later replaced by OnboardingOverlay)

---

## Phase 3 — Auth
Date: 2026-04-20
Commit: 8846798

- feat: GitHub OAuth via NextAuth v5, useUserPlan hook, SessionProvider

---

## Phase 2 — LLM Pipeline
Date: 2026-04-17 → 2026-04-20
Commits: 737fb0e, 7708648, 777264f, 1b39eda, 1508423

- 737fb0e  feat: nightly LLM pipeline (Sonnet #1-3, Haiku #4-25, 48hr cache)
- 7708648  feat: @anthropic-ai/sdk
- 777264f  feat: 48hr summary cache for LLM outputs
- 1508423  feat: API route serves Signal shape, merges processedSignals
- 13b63cc  feat: GitHub Actions cron — nightly LLM processing 05:00 UTC

---

## Phase 1 — Foundation + Analytics + Scoring
Date: 2026-04-14 → 2026-04-17
Commits: e9089b7, 4713d2c, fad29f8, 5fd7845, de78838

- e9089b7  feat: PostHog provider — signal_saved, signal_dismissed, upgrade_clicked
- 4713d2c  feat: 5-dimension signal scoring formula
- fad29f8  feat: replace heuristic scoring with formula
- 5fd7845  feat: Signal type definition
- de78838  docs: product & engineering spec approved
- 9b22c90  feat: initial dark intelligence dashboard
