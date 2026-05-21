# Fact-Check Layer (Pre-Publish, Triple-Verification)

## Goal
Verify EVERY number, stat, date, company name, and claim
in generated article BEFORE marking status='published'.

## Critical Importance
- Audience: PMs, founders, builders
- ONE wrong stat = credibility loss
- Suraj's explicit requirement: "Triple check, credibility nahi loose honi chahiye"

## Pipeline
Current:  Scout → Write → Cascade → Final Gate → Publish
Proposed: Scout → Write → Cascade → FACT-CHECK → Final Gate → Publish

## Implementation Spec

### Inputs to fact-check function
- Generated article (final draft after cascade)
- Original RSS source content (full text)
- Source URL
- Article metadata (headline, category)

### Sonnet checks
- Numbers/stats: exact match with source
- Company names: spelled correctly
- Dates: accurate
- Percentages: source confirmed
- Quotes: verifiable in source
- Funding rounds: correct amounts
- Tickers/extended_data: source-backed

### Output structure
{
  "verified_claims": [
    { "claim": "...", "status": "verified", "source_quote": "..." }
  ],
  "issues": [
    { "claim": "...", "severity": "high|medium|low", "suggested_fix": "..." }
  ],
  "confidence_score": 0-100,
  "block_publish": boolean
}

### Decision logic
- block_publish=true → DON'T PUBLISH, log critical, alert
- HIGH severity issues → block publish even if block_publish=false
- MEDIUM severity → auto-fix via Sonnet patch pass, log
- LOW severity → publish with warning log

### Logging
[FACT-CHECK] structured log per article with full audit trail.

## Cost
~$0.03 per article (Sonnet call with sources).
Negligible vs credibility value.

## Effort
- Implementation: 1.5-2 hours
- Testing: 30 min on real articles
- Total: ~2-3 hours
