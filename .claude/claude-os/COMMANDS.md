# AI Signal — Commands

## Daily
Morning signal check:   node scripts/signal-monitor.mjs
Morning brief:          mempalace wake-up --wing ai-signal
Session end:            mempalace mine .claude/ --wing ai-signal

## Weekly
Intelligence run:       /intelligence run
Research upgrade:       /research
Product review:         /weekly
C-Suite review:         [paste prompt below]

## On demand
Lenny question:         /lenny [question]
Synthetic test:         /synthetic run
Market intel:           /market run
Growth analysis:        /growth run
Feedback processing:    /feedback-run
Design check:           /design-check
QA test:                /qa-run
Launch prep:            /launch-prep
Signal quality check:   /signal-check

## System
Session start:          mempalace wake-up --wing ai-signal
Session end:            mempalace mine .claude/ --wing ai-signal
Token trim:             /trim
Auto-improve OS:        [paste prompt below]

## Search MemPalace
Product decisions:      mempalace search "[topic]" --wing ai-signal
Lenny insight:          mempalace search "[topic]" --wing lenny-index
Code pattern:           mempalace search "[topic]" --wing ai-signal-code

---

## C-Suite Review Prompt (paste for weekly review)

"Run a full C-Suite review of AI Signal. You are 5 experts in sequence:

1. CREATIVE DIRECTOR + COPY: Review all user-facing copy across every route
   (/, /upgrade, /digest/[date], /saved, /article/[id], 404). Is every word
   decisive? Does it speak to a CTO making a technical decision at 6:30am?
   What copy kills the product immediately?

2. USER PSYCHOLOGIST (BJ Fogg × Nir Eyal): Map the habit loop.
   Trigger → Action → Variable Reward → Investment. Where does it break?
   What is the emotional state of our ICP at each touchpoint?

3. CTO (technical risk auditor): What in the current stack will embarrass us
   at 1000 users? What breaks at 10x load? What security holes exist?
   Check: server-side TAKEAWAY gate, auth flow, API caching.

4. PRODUCT DIRECTOR (retention focus): Trace the user journey from first
   landing to Day 7 return. Where does it break? What is the single most
   important thing to fix before acquiring user #1?

5. GROWTH AGENT: How does this product grow? What is the viral coefficient?
   How does a technical founder share a TAKEAWAY with their team?
   What is the distribution strategy for first 100 users?

Context files to read:
- .claude/claude-os/PROJECT_CONTEXT.md
- .claude/claude-os/STATUS.md
- .claude/personas/technical-founder.md
- .claude/intelligence/analytics-plan.md

Output: one synthesis per expert, then a ranked list of top 5 actions.
Save to: .claude/intelligence/csuite-{today}.md"

---

## Auto-Improve OS Prompt

"Audit all files in .claude/claude-os/.
For each file:
  1. Is it still accurate? (check against current codebase state)
  2. Are there gaps? (missing decisions, outdated commands)
  3. Are there duplicates? (same info in multiple files)
  4. Token efficiency: is any file bloated?

Compare against: Cursor rules best practices, popular .clinerules setups.
What do they have that we don't?

Apply safe changes (no deletions).
Update CHANGELOG.md with what changed.
Update STATUS.md last-updated date.
Report: what was changed, what was left alone, what needs a human decision."

---

## Launch Prep Prompt

"Run /launch-prep for AI Signal.

Context:
- Product: .claude/claude-os/PROJECT_CONTEXT.md
- ICP: .claude/personas/technical-founder.md
- Status: .claude/claude-os/STATUS.md

Deliverables:
1. List of 20 specific people to DM (CTOs at seed–Series A AI startups,
   2–8 engineers, building on LLMs — use Twitter/LinkedIn search queries)
2. DM script (under 100 words, specific to technical founder pain)
3. Where to post (communities, Slack groups, HN threads)
4. Personal outreach plan (not mass — 1:1 first 10)
5. Anti-goals (what not to do — PH launch, paid ads, mass email)

Save to: .claude/intelligence/launch-plan-{today}.md"
