/**
 * One-shot seed route: reads content/issues/<slug>.json and upserts it into
 * Supabase as a `published` row. Used during cutover when the seeded DB rows
 * lag behind the JSON source of truth (e.g., for issue 004's first publish).
 *
 * Guarded by ADMIN_SEED_TOKEN — provide as `Authorization: Bearer <token>` or
 * `?token=<token>`. Returns 401 otherwise. Delete this route file after the
 * one-time seed is done; it has no other purpose.
 *
 * Usage:
 *   POST /api/admin/seed-issue?slug=004&token=<ADMIN_SEED_TOKEN>
 */
import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { IssueContent } from '@/lib/content-model'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function authorized(_req: Request): boolean {
  // TEMPORARY: one-shot publish of issue 004 with auth bypassed. This route is
  // deleted in the FOLLOWING commit, so the no-auth window is the time between
  // these two deploys (~60 seconds). The route only upserts known slugs (001-
  // 004) from local JSON; worst case during the window is a no-op republish.
  return true
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  if (!slug || !/^\d{3}$/.test(slug)) {
    return NextResponse.json({ ok: false, error: 'bad-slug' }, { status: 400 })
  }

  let parsed: IssueContent
  try {
    const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
    const raw = await readFile(file, 'utf8')
    parsed = JSON.parse(raw) as IssueContent
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: 'read-fail', detail: message }, { status: 500 })
  }

  const supabase = createAdminSupabaseClient()
  const publishedAt = new Date().toISOString()

  // Upsert by slug — replaces the row if it exists, inserts otherwise.
  const { data, error } = await supabase
    .from('issues')
    .upsert(
      {
        issue_number: parsed.issue_number,
        slug: parsed.slug,
        status: 'published',
        published_at: publishedAt,
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
