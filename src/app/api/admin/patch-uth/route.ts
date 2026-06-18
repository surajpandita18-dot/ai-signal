/**
 * One-shot surgical patch — copies under_the_hood from
 * content/issues/<slug>.json to the matching Supabase row.
 * Used to ship the dark-box-invisible-text SVG fix.
 * Temp; deleted in the next commit.
 *
 * POST /api/admin/patch-uth?slug=001
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
    const m = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: 'read-fail', detail: m }, { status: 500 })
  }
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('issues')
    .update({ under_the_hood: parsed.under_the_hood })
    .eq('slug', slug)
    .select('slug, status')
    .single()
  if (error) {
    return NextResponse.json({ ok: false, error: 'update-fail', detail: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, row: data })
}
