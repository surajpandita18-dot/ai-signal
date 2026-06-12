import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

type ArchiveRow = {
  slug: string
  issue_number: number
  date_display: string
  hero_headline_html: string
}

export default async function ArchivePage() {
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
        <header className="mast">
          <div className="brand">
            <Link
              href="/"
              style={{ textDecoration: 'none' }}
              className="wordmark"
            >
              AI, Basically<span className="dot">.</span>
            </Link>
            <span className="tagline">Archive</span>
          </div>
          <div className="meta">Weekly · Saturday 08:00 IST</div>
        </header>

        <section className="hero">
          <div className="eyebrow">Archive</div>
          <h1>Every past issue.</h1>
          <p className="sub">
            Newest first. Click any issue to read the whole thing — Decoder,
            Build Notes and all. {issues.length > 0 ? `${issues.length} so far.` : ''}
          </p>
        </section>

        <section className="sec">
          <div className="label">
            <span className="n">№</span>
            <span className="nm-lab">All issues</span>
            <span className="hint">Open. No gate.</span>
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
                    <Link href={`/i/${it.slug}`}>{headlineText}</Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
