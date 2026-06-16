import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { IssueContent, Interview as BaseInterview } from '@/lib/content-model'
import type { Database } from '../../../db/types/database'

/**
 * Local augmentation of the Interview type. Main has just extended
 * `Interview` in src/lib/content-model.ts with these optional fields; this
 * worktree may not yet carry that change, so we widen locally to keep the
 * page type-checking either way. Every added field is optional and read
 * defensively. Mirrors the pattern used in /interviews/[slug]/page.tsx.
 */
type Interview = BaseInterview & {
  framework_name?: string
}

type InterviewRow = Pick<
  Database['public']['Tables']['issues']['Row'],
  'slug' | 'issue_number' | 'date_display' | 'published_at' | 'job_signal'
>

type Card = {
  slug: string
  issue_number: number
  date_display: string
  published_at: string | null
  interview: Interview
}

export default async function InterviewsIndexPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('issues')
    .select('slug, issue_number, date_display, published_at, job_signal')
    .eq('status', 'published')
    .order('issue_number', { ascending: false })

  const rows: InterviewRow[] = data ?? []

  // JSON fallback for the deep brief fields. Mirror the pattern in
  // src/app/i/[issue]/page.tsx + src/app/interviews/[slug]/page.tsx: when the
  // Supabase row was seeded before the prep-brief rewrite, the interview only
  // carries the teaser shape (q, q_label, steps, tip_html) — the deep brief
  // (debug-shaped question, framework_name, etc.) lives in content/issues/
  // <slug>.json. Without this fallback, library cards show stale text while
  // the brief pages they link to show fresh content. Once an ops step
  // copies job_signal from JSON into the DB rows, this becomes a no-op.
  const interviewFromSeed = async (slug: string): Promise<Interview | null> => {
    try {
      const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
      const raw = await readFile(file, 'utf8')
      const parsed = JSON.parse(raw) as IssueContent
      return (parsed.job_signal?.interview as Interview | undefined) ?? null
    } catch {
      return null
    }
  }

  // Defensively skip rows where the interview teaser is missing or empty —
  // legacy issues from before the prep-brief contract may not carry one.
  const cards: Card[] = (
    await Promise.all(
      rows.map(async (r) => {
        let interview = r.job_signal?.interview as Interview | undefined
        const briefMissing =
          !interview?.framework_name && !interview?.q?.toLowerCase().includes('walk me through')
        if (briefMissing) {
          const seed = await interviewFromSeed(r.slug)
          if (seed && (seed.framework_name || seed.q)) interview = seed
        }
        if (!interview || !interview.q || !interview.q.trim()) return null
        return {
          slug: r.slug,
          issue_number: r.issue_number,
          date_display: r.date_display,
          published_at: r.published_at,
          interview,
        } as Card
      }),
    )
  ).filter((c): c is Card => c !== null)

  // Mirror /archive: group adjacent cards by the publication month of the
  // underlying issue. While everything is in one month, suppress headers.
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
  const groups: { month: string | null; cards: Card[] }[] = []
  for (const c of cards) {
    const month = monthLabel(c.date_display)
    const last = groups[groups.length - 1]
    if (last && last.month === month) last.cards.push(c)
    else groups.push({ month, cards: [c] })
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
            <span className="tagline">Interviews</span>
          </div>
          <div className="meta">Weekly · Saturday 08:00 IST</div>
        </header>

        <section className="hero">
          <div className="eyebrow">Interviews</div>
          <h1>Every prep brief. One library.</h1>
          <p className="sub">
            Anthropic, OpenAI, and India-stack interview questions — broken
            down with frameworks, sample answers, and the moves that separate
            hire from strong-hire.
          </p>
        </section>

        <section className="sec">
          <div className="label">
            <span className="n">№</span>
            <span className="nm-lab">All prep briefs</span>
            <span className="hint">Open. No gate.</span>
          </div>
          <div>
            {cards.length === 0 && <p className="lede">No prep briefs yet.</p>}
            {cards.length > 0 && (
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
                      {g.cards.map((c) => {
                        const padded = String(c.issue_number).padStart(3, '0')
                        const q = c.interview.q
                        // Word-boundary truncation so the ellipsis lands on
                        // a clean break instead of mid-word.
                        let qDisplay = q
                        if (q.length > 160) {
                          const wb = q.lastIndexOf(' ', 157)
                          qDisplay =
                            (wb === -1 ? q.slice(0, 157) : q.slice(0, wb)).trimEnd() + '…'
                        }
                        // Extract a 1-word "shape" tag from q_label so the
                        // library card scans at a glance. q_label convention:
                        // "<domain> · <shape>" e.g. "RAG · production debug"
                        // → shape = "DEBUG". Falls back to no tag if q_label
                        // doesn't split, so future shape conventions don't
                        // break the render.
                        const lastSeg = c.interview.q_label.split('·').pop()?.trim() ?? ''
                        const shapeTag = lastSeg.split(/\s+/).pop()?.toUpperCase() ?? ''
                        return (
                          <li key={c.slug} className="jobrow">
                            <div className="what">
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  gap: 8,
                                  marginBottom: 6,
                                  flexWrap: 'wrap',
                                }}
                              >
                                {shapeTag && (
                                  <span
                                    style={{
                                      fontFamily: "'Archivo Narrow', sans-serif",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      letterSpacing: '.1em',
                                      padding: '2px 7px',
                                      background: 'var(--ink)',
                                      color: '#fff',
                                      borderRadius: 2,
                                    }}
                                  >
                                    {shapeTag}
                                  </span>
                                )}
                                <span
                                  style={{
                                    fontFamily: "'Archivo Narrow', sans-serif",
                                    fontSize: 11.5,
                                    letterSpacing: '.08em',
                                    textTransform: 'uppercase',
                                    color: 'var(--accent)',
                                  }}
                                >
                                  {c.interview.q_label}
                                </span>
                              </div>
                              <Link href={`/interviews/${c.slug}`}>{qDisplay}</Link>
                              {c.interview.framework_name && (
                                <div
                                  style={{
                                    marginTop: 6,
                                    fontFamily: "'Newsreader', serif",
                                    fontStyle: 'italic',
                                    fontSize: 15,
                                    lineHeight: 1.5,
                                    color: 'var(--accent)',
                                  }}
                                >
                                  {c.interview.framework_name}
                                </div>
                              )}
                              <div
                                style={{
                                  marginTop: 8,
                                  fontFamily: "'Archivo Narrow', sans-serif",
                                  fontSize: 12,
                                  letterSpacing: '.04em',
                                  color: 'var(--grey)',
                                }}
                              >
                                From Issue {padded} · {c.date_display}
                              </div>
                              <div style={{ marginTop: 6 }}>
                                <Link
                                  href={`/interviews/${c.slug}`}
                                  style={{
                                    fontFamily: "'Archivo Narrow', sans-serif",
                                    fontSize: 12.5,
                                    letterSpacing: '.04em',
                                    color: 'var(--accent)',
                                    display: 'inline-block',
                                    padding: '10px 0',
                                  }}
                                >
                                  Read the full prep brief &rarr;
                                </Link>
                              </div>
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
