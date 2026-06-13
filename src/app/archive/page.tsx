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

  // Group adjacent issues by their publication month. The archive grows by one
  // issue a week; once it spans 2+ months, month headers ("June 2026") give
  // readers a chronological orientation at a glance — pattern borrowed from
  // The Pragmatic Engineer / Substack archives. While everything is in one
  // month, the headers would just clutter, so they're suppressed.
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  function monthLabel(dateDisplay: string): string | null {
    const m = /^\d{2}\.(\d{2})\.(\d{4})$/.exec(dateDisplay)
    if (!m) return null
    const idx = Number(m[1]) - 1
    if (idx < 0 || idx > 11) return null
    return `${monthNames[idx]} ${m[2]}`
  }
  const groups: { month: string | null; rows: ArchiveRow[] }[] = []
  for (const it of issues) {
    const month = monthLabel(it.date_display)
    const last = groups[groups.length - 1]
    if (last && last.month === month) last.rows.push(it)
    else groups.push({ month, rows: [it] })
  }
  const showMonthHeaders = groups.length > 1

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
            {issues.length > 0 && (
              <>
                {groups.map((g, gi) => (
                  <div key={g.month ?? `g-${gi}`}>
                    {showMonthHeaders && g.month && (
                      <div
                        style={{
                          fontFamily: "'Archivo Narrow', sans-serif",
                          fontWeight: 600,
                          fontSize: 12,
                          letterSpacing: '.08em',
                          textTransform: 'uppercase',
                          color: 'var(--grey)',
                          margin: gi === 0 ? '0 0 10px' : '24px 0 10px',
                          paddingBottom: 6,
                          borderBottom: '1px solid var(--hair)',
                        }}
                      >
                        {g.month}
                      </div>
                    )}
                    <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {g.rows.map((it) => {
                        const padded = String(it.issue_number).padStart(3, '0')
                        const headlineText = it.hero_headline_html
                          .replace(/<br\s*\/?>/gi, ' ')
                          .replace(/<[^>]+>/g, '')
                        return (
                          <li key={it.slug} className="jobrow">
                            <div className="what">
                              <b>№&nbsp;{padded}</b> · {it.date_display}
                              <br />
                              <Link href={`/i/${it.slug}`}>{headlineText}</Link>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
