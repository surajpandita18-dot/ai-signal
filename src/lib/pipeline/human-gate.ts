/**
 * Human-gate — pure functions.
 *
 * Two specific gates we always check before an issue can ship:
 *   1. The One Thing must be human-written (CLAUDE.md hard editorial rule).
 *   2. The rubric must pass.
 *
 * No DB writes, no API calls — orchestrator wires these into the publish flow.
 */

import type { IssueContent } from '../content-model'
import { evaluateIssue } from './rubric'

/**
 * The One Thing is ready when both head and lede are non-empty *and* the
 * lede is at least 100 chars (proxy for "actually written", not a stub).
 */
export function isOneThingReady(content: IssueContent): boolean {
  const ot = content.one_thing
  if (!ot) return false
  if (!ot.head || ot.head.trim().length === 0) return false
  if (!ot.lede_html || ot.lede_html.trim().length < 100) return false
  return true
}

/**
 * Single combined gate. Returns `null` when the issue is ready to publish.
 * Otherwise returns a `{ reason }` describing the first blocker found, in
 * priority order: One Thing → rubric.
 */
export function requiresHumanReview(
  content: IssueContent,
): { reason: string } | null {
  if (!isOneThingReady(content)) {
    return {
      reason:
        'The One Thing isn’t ready. Suraj must hand-write the head + lede (≥ 100 chars).',
    }
  }
  const verdict = evaluateIssue(content)
  if (!verdict.passed) {
    const first = verdict.blockers[0]
    if (first) {
      return {
        reason: `Rubric failed: ${first.section} / ${first.axis} = ${first.score}. ${first.reason}`,
      }
    }
    return {
      reason: `Rubric average ${verdict.avg.toFixed(2)} below 4.0.`,
    }
  }
  return null
}
