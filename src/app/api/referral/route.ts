import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { unlockTier } from '@/lib/referral'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Mirror the format contract enforced by /r/[code]/route.ts so callers can't
// shovel arbitrary strings (or oversized payloads) at Supabase via this API.
const REF_CODE_RE = /^[A-Za-z0-9_-]{4,32}$/

// GET /api/referral?code=XXXX → { count, tier }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.trim()
  if (!code) {
    return NextResponse.json({ error: 'missing_code' }, { status: 400 })
  }
  if (!REF_CODE_RE.test(code)) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()

  const { data: referrer, error: lookupErr } = await supabase
    .from('subscribers')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle()

  if (lookupErr) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 })
  }
  if (!referrer) {
    return NextResponse.json({ count: 0, tier: unlockTier(0) })
  }

  const { count, error: countErr } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', referrer.id)

  if (countErr) {
    return NextResponse.json({ error: 'count_failed' }, { status: 500 })
  }

  const n = count ?? 0
  return NextResponse.json({ count: n, tier: unlockTier(n) })
}

type PostBody = {
  email?: unknown
  action?: unknown
}

// POST /api/referral { email, action: 'unlock_check' } → { tier }
export async function POST(req: Request) {
  let body: PostBody
  try {
    body = (await req.json()) as PostBody
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const action = body.action
  if (!email) {
    return NextResponse.json({ error: 'missing_email' }, { status: 400 })
  }
  if (action !== 'unlock_check') {
    return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()

  const { data: sub } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({ tier: unlockTier(0), count: 0 })
  }

  const { count } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', sub.id)

  const n = count ?? 0
  return NextResponse.json({ tier: unlockTier(n), count: n })
}
