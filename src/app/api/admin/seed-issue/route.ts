/**
 * One-shot seed/refresh route — upserts an issue from content/issues/<slug>.json
 * into Supabase. Temp; deleted in the next commit after re-seed completes.
 * POST /api/admin/seed-issue?slug=001
 */
import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { IssueContent } from '@/lib/content-model'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  if (!slug || !/^\d{3}$/.test(slug)) {
    return NextResponse.json({ ok: false, error: 'bad-slug' }, { status: 400 })
  }
  let parsed: IssueContent
  try {
    const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
    parsed = JSON.parse(await readFile(file, 'utf8')) as IssueContent
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: 'read-fail', detail: message }, { status: 500 })
  }
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('issues')
    .upsert(
      {
        issue_number: parsed.issue_number,
        slug: parsed.slug,
        date_display: parsed.date_display,
        read_time_min: parsed.read_time_min,
        streak_caption: parsed.streak_caption,
        hero_eyebrow: parsed.hero_eyebrow,
        hero_headline_html: parsed.hero_headline_html,
        hero_sub_html: parsed.hero_sub_html,
        tldr: parsed.tldr,
        one_thing: parsed.one_thing,
        so_what: parsed.so_what,
        build_notes: parsed.build_notes,
        job_signal: parsed.job_signal,
        under_the_hood: parsed.under_the_hood,
        the_rep: parsed.the_rep,
        toolbox: parsed.toolbox,
        reality_check: parsed.reality_check,
        india_signal: parsed.india_signal,
        sponsor: parsed.sponsor,
        decoder: parsed.decoder ?? null,
        closer: parsed.closer,
        poll: parsed.poll,
        foot: parsed.foot,
      },
      { onConflict: 'slug' },
    )
    .select('slug, status, published_at')
    .single()
  if (error) {
    return NextResponse.json({ ok: false, error: 'upsert-fail', detail: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, row: data })
}
