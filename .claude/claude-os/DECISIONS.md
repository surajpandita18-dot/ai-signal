# AI Signal — Decision Log

Format: most recent first. Never delete. Append only.

---

## Decision: Zone 1 threshold lowered 3.5 → 2.8
Date: 2026-04-22
What: Changed ZONE1_MIN_SCORE constant in app/page.tsx
Why: Max signal score in real dataset was 3.38 — threshold of 3.5 left Zone 1
  permanently empty. Product broke silently.
Alternatives rejected:
  - Keep 3.5 and improve scoring formula (slow, risky)
  - Show any processed signal regardless of score (dilutes quality)
Outcome: Zone 1 now populates correctly. Added fallback for < 3 enriched signals.
Commit: 25cb356

---

## Decision: TAKEAWAY gate is server-side, never client-side blur
Date: 2026-04-22
What: Removed filter:blur CSS. API strips takeaway field for non-paid users.
Why: Client-side blur bypassed in 10 seconds via DevTools (found in product
  intelligence session). Server-side gate cannot be bypassed without a valid
  paid session cookie.
Alternatives rejected:
  - Heavier obfuscation (encoding, chunking) — arms race, bad UX
  - Trust-based (blur but honor) — not appropriate for paid feature
Outcome: takeaway: null + takeawayGated: true for non-paid. Upgrade CTA appears.
  Real takeaway never reaches the DOM, never appears in network inspector.
Commits: ef1553e, 3ad690a

---

## Decision: Target user = CTO at Series A AI startup (not indie builder)
Date: 2026-04-21
What: Locked ICP as seed–Series A technical founder, 2–8 engineers, building on LLMs.
Why: Indie builders (Karan/Pieter archetype) have high curiosity but low
  decision budget — they consume AI news for interest, not to make $10k decisions.
  Technical founders open AI Signal before HN because missing a signal costs real money.
  Product intelligence session confirmed wrong-user trap.
Alternatives rejected:
  - Indie builders (high volume, low conversion, low retention signal)
  - Enterprise CTOs (long sales cycle, need procurement, wrong for MVP)
  - AI-adjacent PMs (don't make technical decisions, wrong job-to-be-done)
Outcome: GitHub OAuth required (filters casual users), UI optimized for 5-min
  morning routine, copy assumes decision-making context.
Files: .claude/personas/technical-founder.md, wrong-user.md

---

## Decision: Client-side blur → solid gate (no content in DOM)
Date: 2026-04-22
What: The upgrade surface shows a solid amber button, not blurred text.
Why: Blur is deceptive (implies content exists just out of reach).
  Solid gate is honest and cleaner. Also fixes the DevTools bypass.
  Aligned with DECISIVE design principle — no chrome, only signal.
Alternatives rejected:
  - Keep blur with heavier CSS obfuscation (still bypassed, bad UX)
  - Show truncated takeaway (50% visible) — split-tests later, not MVP
Outcome: isGated = !!signal.takeawayGated. Solid amber button "Unlock takeaway →"

---

## Decision: Gemini fallback added to LLM pipeline
Date: 2026-04-22
What: process-signals.mjs checks GEMINI_API_KEY if ANTHROPIC_API_KEY missing.
  Priority: Anthropic (Sonnet/Haiku) → Gemini 1.5 Flash → exit.
Why: Anthropic API keys get rate-blocked. Pipeline cannot afford downtime.
  Gemini 1.5 Flash is fast, cheap, and good enough for WHAT/WHY/TAKEAWAY.
Alternatives rejected:
  - Single provider only (too fragile for a daily pipeline)
  - Queue and retry (adds complexity, delays signals)
Outcome: Dynamic import based on env var presence. Gemini active during
  Anthropic block periods.
Commit: 3b14150

---

## Decision: MemPalace over custom memory system
Date: 2026-04-22
What: Installed mempalace v3.3.2. 3 wings, 1000 drawers.
  ai-signal / ai-signal-code / lenny-index
Why: Token cost to load Lenny directly: 50,000. Via MemPalace search: ~400.
  99% savings. Existing files preserved — MemPalace wraps, doesn't replace.
Alternatives rejected:
  - Custom vector DB (engineering overhead, not worth it for 1-person project)
  - Just load files directly (hits token budget on complex sessions)
Outcome: Session start costs ~1,300 tokens vs ~50,000+ without MemPalace.
Commit: e05ecc3

---

## Decision: No price shown at MVP
Date: 2026-04-21
What: /upgrade page has mailto CTA instead of a pricing table.
Why: Can't validate price sensitivity before validating Day 7 retention.
  Showing $X/month before anyone has come back on Day 7 is premature.
  Early access framing creates scarcity and personal connection.
Alternatives rejected:
  - Show $20/month upfront (premature — unknown if anyone returns)
  - Free forever (no upgrade intent data, no business)
Outcome: upgrade page says "email to join" — validates interest before pricing.
  Unlock pricing experiment when day7_return > 15% for 2 consecutive weeks.

---

## Decision: GitHub OAuth only (no magic link, no email/password)
Date: 2026-04-21
What: NextAuth v5 with GitHub provider only.
Why: ICP = technical founders. Every ICP has a GitHub account.
  GitHub OAuth signals technical credibility and reduces wrong-user traffic.
  Magic links add email infrastructure complexity for MVP.
Alternatives rejected:
  - Email/password (GDPR complexity, password reset flows — not worth it)
  - Magic link (simpler than OAuth but adds Resend/Postmark dependency)
  - Google OAuth (broader audience but less ICP-specific signal)
Outcome: /api/auth/signin → GitHub. Reduces casual signups automatically.

---

## Decision: Inter font (not custom)
Date: 2026-04-20
What: Google Fonts Inter variable via next/font/google.
Why: Inter is trusted, fast, used by Linear + Vercel — exact reference design.
  Custom fonts add download time and no differentiation for a dense data product.
Alternatives rejected:
  - Söhne / Aktiv Grotesk (paid, adds complexity)
  - System font stack (inconsistent across platforms, not quite right)
Outcome: Inter variable, applied at root layout only via CSS variable --font-inter.

---

## Decision: Amber only on TAKEAWAY, purple is chrome
Date: 2026-04-20
What: #f59e0b amber exclusively for TAKEAWAY and action CTAs.
  #7c3aed purple for brand elements, rank numbers, signal dots.
Why: Color = attention. Amber trains the eye to go directly to the decision.
  Purple is calm, editorial — it's the container, not the content.
  Swapping them dilutes the signal.
Alternatives rejected:
  - Teal/green accents (no association with urgency/action for this ICP)
  - White/neutral CTAs (disappears in dark UI, loses hierarchy)
Outcome: DECISIVE principle enforced. Amber fires once per signal (TAKEAWAY).
File: CLAUDE.md ("Amber is action. Purple is chrome. Never swap them.")

---

## Decision: Zone 1 is an editorial list, not cards
Date: 2026-04-20
What: Zone 1 uses full-width numbered rows. Zone 2 uses cards.
Why: Cards imply equal weight — a news feed. Numbered rows imply ranking
  and editorial judgment — a briefing. The product is a briefing, not a feed.
Alternatives rejected:
  - All cards (looks like every other AI news product)
  - No numbering (loses the "ranked by impact" signal)
Outcome: 01/02/03 in 48px rgba(124,58,237,0.15) — large, dim, editorial.
File: CLAUDE.md Zone 1 section
