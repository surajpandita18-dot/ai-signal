import { Resend } from 'resend'
import type { ReactElement } from 'react'

/**
 * Configured Resend client.
 * Reads RESEND_API_KEY from env; throws if missing so callers don't silently
 * no-op. Memoised so the weekly blast doesn't instantiate one SDK client per
 * recipient inside Promise.allSettled.
 */
let cached: Resend | null = null
export function resend(): Resend {
  if (cached) return cached
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY env var is not set')
  }
  cached = new Resend(apiKey)
  return cached
}

type SendIssueEmailArgs = {
  to: string[]
  subject: string
  react: ReactElement
  replyTo?: string
}

/**
 * Thin wrapper around resend.emails.send for the weekly issue blast.
 * EMAIL_FROM is required ("Suraj <hello@aibasically.co>" style).
 */
export async function sendIssueEmail({
  to,
  subject,
  react,
  replyTo,
}: SendIssueEmailArgs) {
  const from = process.env.EMAIL_FROM
  if (!from) {
    throw new Error('EMAIL_FROM env var is not set')
  }
  const client = resend()
  return client.emails.send({
    from,
    to,
    subject,
    react,
    replyTo,
  })
}
