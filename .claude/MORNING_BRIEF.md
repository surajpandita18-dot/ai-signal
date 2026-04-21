# AI Signal Morning Brief
*Generated: 2026-04-21T21:07:42.446Z*

Wake-up text (~792 tokens):
==================================================
## L0 — IDENTITY
No identity configured. Create ~/.mempalace/identity.txt

## L1 — ESSENTIAL STORY

[general]
  - # AI Signal — Decision Tool for Technical Founders ## Product & Engineering Spec **Date:** 2026-04-20   **Status:** Approved for implementation planning   **Target user:** Technical founder / CTO a...  (2026-04-20-ai-signal-decision-tool-design.md)
  - ead first) - Not a research tool (that's a different job-to-be-done)  ### The core value proposition  The builder takeaway is the product. Every other field — title, source, score, what, why — exis...  (2026-04-20-ai-signal-decision-tool-design.md)
  - thing else is noise."**  ### Core mechanic framing  AI Signal is a **forcing function, not a feed.**  A feed is passive — you open it when you remember. A forcing function is structural — it change...  (2026-04-20-ai-signal-decision-tool-design.md)
  - cing what changed overnight and what it means for your decisions."  ### Implications for copy and UI  - All CTAs should reference the morning routine: "Start your day" not "Read more" - Zone 1 head...  (2026-04-20-ai-signal-decision-tool-design.md)
  - ecisions about model choice, infrastructure, and product direction. Expenses tools without friction.  **Pain point:** The cost of missing a signal that makes their current technical approach obsole...  (2026-04-20-ai-signal-decision-tool-design.md)
  - nal — regardless of source (RSS, arXiv, GitHub, Twitter/X) — is stored as a single normalized shape:  ```typescript interface Signal {   // Core identity   id: string                          // sh...  (2026-04-20-ai-signal-decision-tool-design.md)
  - // canonical URL, used as cache key   date: string                        // ISO date    // Scoring   signalScore: number                 // 0.0–5.0, weighted formula (see §5)   impactLevel: "high"...  (2026-04-20-ai-signal-decision-tool-design.md)
  - specific builder action   processed: boolean   processedAt: string | null          // ISO timestamp    // Zone 1 lifecycle   zone1EligibleUntil: string | null   // processedAt + 24hr; null if not Z...  (2026-04-20-ai-signal-decision-tool-design.md)
  - e + source only | not shown | | Paid | full signal incl. `takeaway` | full signal | title + source |  `takeaway` is **never sent in the API response** to free or unauthenticated users — not blurred...  (2026-04-20-ai-signal-decision-tool-design.md)
  - ways unfiltered.  ### Zone 1 — Today's Signals  Full-width numbered editorial list. Not a card grid.  **Visual rules:** - Signal number (`01`, `02`, `03`): large, dim purple — editorial numbering -...  (2026-04-20-ai-signal-decision-tool-design.md)
  - than 3 signals meet `score >= 3.5` AND `age < 24hr`, Zone 1 shows only what qualifies — even 1 or 0.  Message when 0 qualify: > "No high-impact signals today. Check back tomorrow or browse the arch...  (2026-04-20-ai-signal-decision-tool-design.md)
  - ─────────────── ```  ### Zone 2 — Signal Archive  3-column grid (desktop). Compact scannable cards.  **Zone 2 card contains exactly:** - Category pill + source + colored source dot - Signal score b...  (2026-04-20-ai-signal-decision-tool-design.md)
  ... (more in L3 search)
