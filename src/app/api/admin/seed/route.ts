// TEMPORARY one-shot bootstrap route — deletes itself after Issue 001 is in.
// Auth: hardcoded ?key= param + idempotent (bails if Issue 001 already exists
// as 'published'). Will be removed in a follow-up commit.
import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { IssueContent } from '@/lib/content-model'

const KEY = 'aibasically-bootstrap-2026-06-12'

export async function POST(req: Request) {
  if (new URL(req.url).searchParams.get('key') !== KEY) {
    return new NextResponse('nope', { status: 401 })
  }

  const file = path.join(process.cwd(), 'content/issues/001.json')
  const c = JSON.parse(await readFile(file, 'utf8')) as IssueContent
  const supabase = createAdminSupabaseClient()

  // Idempotent: if 001 already exists, just bump to published.
  const { data: existing } = await supabase
    .from('issues')
    .select('id, status')
    .eq('slug', c.slug)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'published') {
      return NextResponse.json({ status: 'already_published', id: existing.id })
    }
    const { error } = await supabase
      .from('issues')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('slug', c.slug)
    if (error) {
      return NextResponse.json({ step: 'update', error: error.message }, { status: 500 })
    }
    return NextResponse.json({ status: 'bumped_to_published', id: existing.id })
  }

  const { error: insertErr } = await supabase.from('issues').insert({
    issue_number: c.issue_number,
    slug: c.slug,
    status: 'published',
    published_at: new Date().toISOString(),
    hero_eyebrow: c.hero_eyebrow,
    hero_headline_html: c.hero_headline_html,
    hero_sub_html: c.hero_sub_html,
    date_display: c.date_display,
    read_time_min: c.read_time_min,
    streak_caption: c.streak_caption,
    tldr: c.tldr,
    one_thing: c.one_thing,
    so_what: c.so_what,
    build_notes: c.build_notes,
    job_signal: c.job_signal,
    under_the_hood: c.under_the_hood,
    the_rep: c.the_rep,
    toolbox: c.toolbox,
    reality_check: c.reality_check,
    india_signal: c.india_signal,
    sponsor: c.sponsor,
    closer: c.closer,
    poll: c.poll,
    foot: c.foot,
  })
  if (insertErr) {
    return NextResponse.json({ step: 'insert', error: insertErr.message }, { status: 500 })
  }

  // Subscriber upsert — non-blocking on failure.
  await supabase
    .from('subscribers')
    .upsert(
      { email: 'suraj.pandita18@gmail.com', role: 'builder', source: 'seed' },
      { onConflict: 'email' },
    )

  return NextResponse.json({ status: 'inserted_and_published' })
}
