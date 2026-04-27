# AI Signal — Build Plan

Extracted from PRD section 11. One phase at a time. Never start N+1 on a broken N.

| Phase | Description | Status | Started | Completed |
|---|---|---|---|---|
| Phase 0 | Setup — multi-agent workspace, root files, agent CLAUDE.md files | COMPLETE | 2026-04-27 | 2026-04-27 |
| Phase 1 | Schema + data layer + seed one fake issue | COMPLETE | 2026-04-27 | 2026-04-27 |
| Phase 2 | Story card component with both states (collapsed / expanded) | COMPLETE | 2026-04-27 | 2026-04-27 |
| Phase 3 | Issue page (`/issue/[slug]`) that renders one issue end-to-end | IN_PROGRESS | 2026-04-27 | — |
| Phase 4 | Homepage (latest issue inline) + archive page | PENDING | — | — |
| Phase 5 | Subscribe form + onboarding role pick (email → role card → confirm) | PENDING | — | — |
| Phase 6 | Admin compose tool (paste → draft → edit → publish) | PENDING | — | — |
| Phase 7 | Email rendering + send pipeline (Resend/Postmark) | PENDING | — | — |

## Phase success criteria

**Phase 0 done when:** all CLAUDE.md files exist, STATE.md is accurate, VEIL design files populated, folder structure verified.

**Phase 1 done when:** Supabase migration runs cleanly, TypeScript types generated, seed data inserts one fake published issue with 3+ stories, LENS review passes.

**Phase 2 done when:** StoryCard renders in both collapsed and expanded states with real seed data, dark + light mode verified, LENS and VEIL reviews pass.

**Phase 3 done when:** `/issue/[slug]` renders a full issue (header + 5–7 story cards) from Supabase, no layout shift on expand, LENS and VEIL pass.

**Phase 4 done when:** `/` shows latest published issue, `/archive` lists all issues in reverse chronological order, LENS and VEIL pass.

**Phase 5 done when:** email subscription flow works end-to-end (email input → role pick → confirm screen → subscriber row in Supabase), LENS and VEIL pass.

**Phase 6 done when:** admin compose tool can take raw newsletter text → Claude API → draft summaries with lenses → editorial edit UI → publish to Supabase, LENS and VEIL pass.

**Phase 7 done when:** published issue triggers email send to all active subscribers via Resend/Postmark, email renders correctly in Gmail and Apple Mail, LENS passes.
