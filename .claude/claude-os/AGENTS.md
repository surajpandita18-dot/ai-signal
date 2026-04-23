# AI Signal — Agent Directory

## How agents work
Each agent = a skill file in .claude/skills/
Load ONLY the skill you need. Never load all skills at once.
Token cost shown per agent — stay under 15,000/session.

---

## PRODUCT AGENTS

Lenny CPO Agent
  File:        .claude/skills/lenny-cpo-agent.md  [CREATE — references lenny-index wing]
  Invoke:      /lenny [question]
  Use when:    Product decision, strategy question, pricing, retention
  Reads:       mempalace search "[question]" --wing lenny-index
  Token cost:  ~400 (mempalace only — never loads transcripts directly)
  Example:     /lenny "how do developer tools get their first 100 users?"

Synthetic Testing Agent
  File:        .claude/skills/synthetic-testing.md  [EXISTS]
  Invoke:      /synthetic run
  Use when:    Validating assumptions, testing personas against product
  Reads:       .claude/personas/technical-founder.md + assumptions.md
  Token cost:  ~8,000
  Output:      .claude/intelligence/synthetic-test-{date}.md

Market Intelligence Agent
  File:        .claude/skills/market-intelligence.md  [EXISTS]
  Invoke:      /market run
  Use when:    Competitor analysis, gap analysis, positioning check
  Output:      .claude/intelligence/competition-{date}.md
  Token cost:  ~5,000

Growth Loop Agent
  File:        .claude/skills/growth-loop-analysis.md  [EXISTS]
  Invoke:      /growth run
  Use when:    Metrics diverge, sharing drops, retention stalls
  Reads:       analytics-plan.md + latest feedback data
  Token cost:  ~4,000

Launch Agent
  File:        .claude/skills/launch-agent.md  [CREATE]
  Invoke:      /launch-prep
  Use when:    Preparing for user acquisition, DM campaigns
  Output:      .claude/intelligence/launch-plan-{date}.md
  Token cost:  ~6,000

---

## ENGINEERING AGENTS

QA Agent
  File:        .claude/skills/qa-agent.md  [CREATE]
  Invoke:      /qa-run
  Use when:    Before any release, after route changes
  Reads:       All app/ route files
  Token cost:  ~4,000
  Checks:      TAKEAWAY gate, mobile 390px, auth flow, empty states

Signal Monitor
  File:        .claude/skills/signal-monitor.md  [CREATE]
  Invoke:      node scripts/signal-monitor.mjs
  Use when:    Daily pipeline check, before user sessions
  Reads:       lib/processedSignals.json
  Token cost:  ~500
  Output:      .claude/intelligence/signal-quality-{date}.md

Design Critic
  File:        .claude/skills/design-agent.md  [EXISTS]
  Invoke:      /design-check
  Use when:    UI changes, new components, copy review
  Reads:       CLAUDE.md (design tokens only)
  Token cost:  ~2,000
  Enforces:    DECISIVE principle — amber=action, purple=chrome, no blur

---

## INTELLIGENCE AGENTS

Feedback Processor
  File:        .claude/skills/feedback-processor.md  [CREATE]
  Invoke:      /feedback-run
  Use when:    After getting real user feedback, PostHog session review
  Reads:       data/feedback-raw.json + PostHog metrics
  Token cost:  ~5,000
  Output:      .claude/intelligence/feedback-{date}.md

Memory Agent (MemPalace)
  System:      ~/.mempalace/palace
  Wings:       ai-signal · ai-signal-code · lenny-index
  Commands:
    mempalace wake-up --wing ai-signal              (session start)
    mempalace search "[query]" --wing [wing]         (on demand)
    mempalace mine .claude/ --wing ai-signal         (session end)
  Token saving: ~99% vs loading files directly (400 tokens vs 50,000+)

Research Agent
  File:        .claude/skills/research-agent.md  [CREATE]
  Invoke:      /research
  Use when:    Weekly, or when new technique/framework found
  Output:      .claude/intelligence/research-{date}.md
  Token cost:  ~8,000

Frontend Design Agent
  File:        .claude/skills/frontend-design.md  [EXISTS]
  Invoke:      /design
  Use when:    New UI component, full page implementation
  Reads:       CLAUDE.md
  Token cost:  ~3,000

---

## C-SUITE REVIEW (weekly — use full 15k budget)
Run all 5 together once per week. Uses full session budget.
Command: paste C-Suite prompt from COMMANDS.md

  Creative Director + Copy — brand + all surface copy
  User Psychologist — habit loop + onboarding emotions
  CTO — production risks + technical debt
  Product Director — user journey + retention loop
  Growth Agent — distribution + viral coefficient

Output: .claude/intelligence/csuite-{date}.md

---

## Agent status legend
[EXISTS]  — skill file present in .claude/skills/
[CREATE]  — skill file does not exist yet, needs writing
