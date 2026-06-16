/**
 * Referral helpers — pure functions, no I/O.
 *
 * - mintCode():      8-char base64-ish slug for subscribers.referral_code.
 *                    (Default is set in SQL; this is the JS-side fallback
 *                    used by code paths that mint codes before insert.)
 * - unlockTier():    maps a referral count to a reward tier.
 * - buildInviteUrl(): full referral URL — `${base}/r/${code}`.
 */

import { randomBytes } from 'crypto'

export type ReferralTier = 'none' | 'archive' | 'prompt_pack' | 'deep_dive'

const SAFE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function mintCode(): string {
  // 8 characters drawn uniformly from a URL-safe alphabet using crypto-grade
  // entropy. Matches the spirit of the SQL default
  // (substr(encode(gen_random_bytes(6),'base64'),1,8)) without dragging
  // base64 padding characters into the URL.
  const bytes = randomBytes(8)
  let out = ''
  for (let i = 0; i < 8; i++) {
    out += SAFE_ALPHABET[bytes[i] % SAFE_ALPHABET.length]
  }
  return out
}

export function unlockTier(refCount: number): ReferralTier {
  if (!Number.isFinite(refCount) || refCount < 1) return 'none'
  if (refCount <= 2) return 'archive'
  if (refCount <= 4) return 'prompt_pack'
  return 'deep_dive'
}

export function buildInviteUrl(code: string, base?: string): string {
  const root =
    base ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'https://aibasically-eta.vercel.app'
  // Trim a trailing slash so we don't end up with "//r/".
  const trimmed = root.replace(/\/+$/, '')
  return `${trimmed}/r/${code}`
}
