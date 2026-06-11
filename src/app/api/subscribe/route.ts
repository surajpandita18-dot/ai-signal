import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { Lens } from '@/lib/content-model'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_ROLES: ReadonlyArray<Lens> = [
  'builder',
  'product_biz',
  'secure_pro',
  'switcher',
]

// RFC-loose email regex — local-part @ domain.tld
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Body = {
  email?: unknown
  role?: unknown
  source?: unknown
  ref?: unknown
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const role =
    typeof body.role === 'string' && VALID_ROLES.includes(body.role as Lens)
      ? (body.role as Lens)
      : null

  const source = typeof body.source === 'string' && body.source.length > 0 ? body.source : null
  const ref = typeof body.ref === 'string' && body.ref.length > 0 ? body.ref : null

  const supabase = createAdminSupabaseClient()

  const { data: inserted, error } = await supabase
    .from('subscribers')
    .insert({ email, role, source })
    .select('id, referral_code')
    .single()

  if (error) {
    // 23505 = unique_violation (Postgres). Treat as success-ish so the form
    // is idempotent.
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ status: 'already_subscribed' }, { status: 200 })
    }
    return NextResponse.json({ error: 'insert_failed', detail: error.message }, { status: 500 })
  }

  // Attribution: if the caller passed a referral code AND that code maps to
  // a real subscriber, record the referral edge. Best-effort — failure here
  // should not break the subscribe flow.
  if (ref && inserted) {
    const { data: referrer } = await supabase
      .from('subscribers')
      .select('id')
      .eq('referral_code', ref)
      .maybeSingle()

    if (referrer && referrer.id !== inserted.id) {
      await supabase.from('referrals').insert({
        referrer_id: referrer.id,
        referred_id: inserted.id,
      })
    }
  }

  return NextResponse.json({
    status: 'subscribed',
    referral_code: inserted?.referral_code ?? null,
  })
}
