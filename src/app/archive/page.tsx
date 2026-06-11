import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'

type ArchiveRow = {
  slug: string
  issue_number: number
  date_display: string
  hero_headline_html: string
}

export default async function ArchivePage() {
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('aib_ref') !== undefined

  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('issues')
    .select('slug, issue_number, date_display, hero_headline_html')
    .eq('status', 'published')
    .order('issue_number', { ascending: false })

  const issues = (data ?? []) as unknown as ArchiveRow[]

  return (
    <main className="issue">
      <div className="grid">
        <div className="hero">
          <div className="eyebrow">Archive</div>
          <h1>Every past issue.</h1>
          {!unlocked && (
            <p className="sub">
              The archive is open to subscribers who&apos;ve referred at least one friend.
              Refer one — unlock everything. <Link href="/">Back to home →</Link>
            </p>
          )}
          {unlocked && (
            <p className="sub">
              <strong>Unlocked.</strong> Every past issue, searchable.
            </p>
          )}
        </div>

        <div className="sec">
          <div className="label">
            <span className="n">№</span>
            <span className="nm-lab">All issues</span>
            <span className="hint">Newest first.</span>
          </div>
          <div>
            {issues.length === 0 && <p className="lede">No issues yet.</p>}
            {issues.map((it) => {
              const padded = String(it.issue_number).padStart(3, '0')
              const headlineText = it.hero_headline_html
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/<[^>]+>/g, '')
              return (
                <div key={it.slug} className="jobrow">
                  <div className="what">
                    <b>№ {padded}</b> · {it.date_display}
                    <br />
                    {unlocked ? (
                      <Link href={`/i/${it.slug}`}>{headlineText}</Link>
                    ) : (
                      <span>{headlineText}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
