// agents/sender.ts
// Single responsibility: dispatch formatted email to Beehiiv and schedule send.
// No Claude API call — external service calls only.
// Gracefully skips when BEEHIIV_API_KEY / BEEHIIV_PUBLICATION_ID are not set.

import { createDraft, scheduleSend, getSubscriberCount } from "@/lib/beehiiv";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SenderResult {
  skipped: boolean;
  reason?: string;
  postId?: string;
  scheduledAt?: string;
  subscriberCount?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns the next 6 AM IST (00:30 UTC) that is at least 10 minutes away.
function nextSendAt(briefDate: string): Date {
  // Start from 00:30 UTC on the brief date (= 6:00 AM IST)
  const candidate = new Date(`${briefDate}T00:30:00.000Z`);
  const tenMinutesFromNow = Date.now() + 10 * 60 * 1000;

  if (candidate.getTime() >= tenMinutesFromNow) {
    return candidate;
  }

  // Already past — push to next calendar day's 00:30 UTC
  candidate.setUTCDate(candidate.getUTCDate() + 1);
  return candidate;
}

function buildSubject(topHeadline: string, date: string): string {
  const headline = topHeadline.slice(0, 80);
  return `AI Signal — ${date}: ${headline}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function runSender(
  emailHtml: string,
  topHeadline: string,
  date: string
): Promise<SenderResult> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !pubId) {
    return {
      skipped: true,
      reason: "no credentials — set BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID to activate",
    };
  }

  const subject = buildSubject(topHeadline, date);
  const sendAt = nextSendAt(date);

  // Create draft
  const postId = await createDraft(subject, emailHtml);
  if (!postId) {
    return { skipped: true, reason: "createDraft returned null" };
  }

  // Schedule send
  await scheduleSend(postId, sendAt);

  // Fetch subscriber count for logging
  const subscriberCount = await getSubscriberCount();

  return {
    skipped: false,
    postId,
    scheduledAt: sendAt.toISOString(),
    subscriberCount,
  };
}
