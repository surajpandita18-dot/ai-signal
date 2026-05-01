import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { inngest } from '@/inngest/client'

// Thin trigger only — heavy pipeline lives in src/inngest/generate-signal.ts
// Each Inngest step is a separate Vercel invocation; 10s is plenty for DB + send.
export const maxDuration = 30

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const force = url.searchParams.get('force') === 'true'

  const supabase = createAdminSupabaseClient()

  // Skip if today's issue + story already published
  // en-CA locale gives YYYY-MM-DD — correct for any server timezone
  const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  const { data: existing } = await supabase
    .from('issues')
    .select('id, issue_number, stories(id)')
    .gte('published_at', `${todayIST}T00:00:00+05:30`)
    .lt('published_at', `${todayIST}T23:59:59+05:30`)
    .maybeSingle()

  if (!force && existing && (existing.stories as unknown[]).length > 0) {
    return NextResponse.json({ ok: true, skipped: true, issue_number: existing.issue_number })
  }

  // Delete partial published issue (no stories — redo cleanly)
  if (existing && (existing.stories as unknown[]).length === 0) {
    await supabase.from('issues').delete().eq('id', existing.id)
  }

  // Cleanup stale pending rows (>30 min old) leaked from crashed runs
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  await supabase.from('issues').delete().eq('status', 'pending').lt('created_at', thirtyMinAgo)

  // Skip if a fresh pipeline is already in flight
  if (!force) {
    const { data: inFlight } = await supabase
      .from('issues')
      .select('id, issue_number')
      .eq('status', 'pending')
      .maybeSingle()

    if (inFlight) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'pipeline_in_flight',
        issue_number: inFlight.issue_number,
      })
    }
  }

  // Next issue number
  const { data: last } = await supabase
    .from('issues')
    .select('issue_number')
    .order('issue_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = (last?.issue_number ?? 0) + 1

  // Insert placeholder row — Inngest pipeline updates it as it progresses
  const { data: issue, error: issueErr } = await supabase
    .from('issues')
    .insert({
      issue_number: nextNumber,
      slug: `signal-${nextNumber}`,
      status: 'pending',
    })
    .select('id')
    .single()

  if (issueErr || !issue) {
    return NextResponse.json({ error: issueErr?.message ?? 'Issue insert failed' }, { status: 500 })
  }

  // Fire background event — pipeline runs outside this request
  await inngest.send({
    name: 'signal/daily.trigger',
    data: { issueId: issue.id, issueNumber: nextNumber },
  })

  return NextResponse.json({ ok: true, pending: true, issueId: issue.id, issueNumber: nextNumber })
}
