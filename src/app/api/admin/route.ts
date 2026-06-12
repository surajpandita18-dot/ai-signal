// TEMPORARY admin route — patches existing issue rows with their decoder
// content from the JSON files. Prereq: the `decoder jsonb` column must
// already exist on issues (one-line ALTER TABLE statement Suraj runs once
// in the Supabase SQL editor — no wrap risk since the statement is ~60
// chars). Deleted in the very next commit once it has done its work.
import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { IssueContent } from '@/lib/content-model'

const KEY = 'aibasically-decoder-2026-06-12'

async function readIssue(slug: string): Promise<IssueContent> {
  const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
  return JSON.parse(await readFile(file, 'utf8')) as IssueContent
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== KEY) {
    return new NextResponse('nope', { status: 401 })
  }
  const action = url.searchParams.get('action')

  try {
    if (action?.startsWith('patch-decoder-')) {
      const slug = action.replace('patch-decoder-', '')
      const c = await readIssue(slug)
      if (!c.decoder) {
        return NextResponse.json(
          { error: 'no_decoder_in_json', slug },
          { status: 400 },
        )
      }
      const supabase = createAdminSupabaseClient()
      const { error } = await supabase
        .from('issues')
        .update({ decoder: c.decoder })
        .eq('slug', slug)
      if (error) {
        return NextResponse.json(
          { error: 'update_failed', slug, detail: error.message },
          { status: 500 },
        )
      }
      return NextResponse.json({
        status: 'patched',
        slug,
        term_count: c.decoder.terms.length,
      })
    }

    return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json(
      {
        error: 'admin_failed',
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    )
  }
}
