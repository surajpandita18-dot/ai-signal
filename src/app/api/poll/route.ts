import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Body = {
  issue_id?: unknown
  choice?: unknown
  email?: unknown
  ip_hash?: unknown
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const issue_id = typeof body.issue_id === 'string' ? body.issue_id : ''
  const choice = typeof body.choice === 'string' ? body.choice.trim() : ''
  const email =
    typeof body.email === 'string' && body.email.length > 0
      ? body.email.trim().toLowerCase()
      : null
  const ip_hash =
    typeof body.ip_hash === 'string' && body.ip_hash.length > 0 ? body.ip_hash : null

  if (!UUID_RE.test(issue_id)) {
    return NextResponse.json({ error: 'invalid_issue_id' }, { status: 400 })
  }
  if (!choice) {
    return NextResponse.json({ error: 'missing_choice' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()

  let subscriber_id: string | null = null
  if (email) {
    const { data: sub } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    subscriber_id = sub?.id ?? null
  }

  const { error } = await supabase.from('poll_responses').insert({
    issue_id,
    subscriber_id,
    choice,
    ip_hash,
  })

  if (error) {
    // 23505 = unique violation against the conditional index on
    // (issue_id, subscriber_id) WHERE subscriber_id IS NOT NULL.
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ status: 'already_voted' }, { status: 200 })
    }
    return NextResponse.json({ error: 'insert_failed', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'recorded' })
}
