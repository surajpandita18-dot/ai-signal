import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { IssueContent, RabbitHole } from '@/lib/content-model'
import type { Database } from '../../../db/types/database'

type RowSel = Pick<
  Database['public']['Tables']['issues']['Row'],
  'slug' | 'issue_number' | 'date_display' | 'published_at'
>

type Card = {
  slug: string
  issue_number: number
  date_display: string
  published_at: string | null
  rabbit: RabbitHole
}

const KIND_LABEL: Record<RabbitHole['kind'], string> = {
  paper: 'PAPER',
  blog: 'BLOG',
  video: 'VIDEO',
  repo: 'REPO',
  podcast: 'PODCAST',
  thread: 'THREAD',
}

async function rabbitFromSeed(slug: string): Promise<RabbitHole | null> {
  try {
    const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
    const raw = await readFile(file, 'utf8')
    const parsed = JSON.parse(raw) as IssueContent
    return (parsed.rabbit_hole as RabbitHole | undefined) ?? null
  } catch {
    return null
  }
}

export default async function RabbitHolesIndexPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('issues')
    .select('slug, issue_number, date_display, published_at')
    .eq('status', 'published')
    .order('issue_number', { ascending: false })

  const rows: RowSel[] = data ?? []

  // The rabbit_hole field doesn't live in DB rows yet; always hydrate from
  // JSON. Once a sync step copies rabbit_hole into Supabase, this becomes
  // a cache-miss fallback like the rest of the JSON-hydrated fields.
  const cards: Card[] = (
    await Promise.all(
      rows.map(async (r) => {
        const rabbit = await rabbitFromSeed(r.slug)
        if (!rabbit) return null
        return { ...r, rabbit } as Card
      }),
    )
  ).filter((c): c is Card => c !== null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  function monthLabel(d: string): string | null {
    const m = /^\d{2}\.(\d{2})\.(\d{4})$/.exec(d)
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
            <span className="tagline">Rabbit Holes</span>
          </div>
          <div className="meta">Weekly · Saturday 08:00 IST</div>
        </header>

        <section className="hero">
          <div className="eyebrow">Rabbit Holes</div>
          <h1>Every weekend read. One library.</h1>
          <p className="sub">
            One curated paper, blog, video, or repo per issue — the resource
            we&rsquo;d hand you if you wanted to go deeper on this week&rsquo;s
            One Thing. Already filtered. Open on Saturday afternoon.
          </p>
        </section>

        <section className="sec">
          <div className="label">
            <span className="n">▸</span>
            <span className="nm-lab">All rabbit holes</span>
            <span className="hint">Open. No gate.</span>
          </div>
          <div>
            {cards.length === 0 && <p className="lede">No rabbit holes yet.</p>}
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
                        return (
                          <li key={c.slug} className="jobrow">
                            <div className="what">
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  gap: 10,
                                  marginBottom: 6,
                                  flexWrap: 'wrap',
                                }}
                              >
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
                                  {KIND_LABEL[c.rabbit.kind]}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "'Archivo Narrow', sans-serif",
                                    fontSize: 11.5,
                                    letterSpacing: '.06em',
                                    color: 'var(--grey)',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {c.rabbit.time_min} min · {c.rabbit.by}
                                </span>
                              </div>
                              <a
                                href={c.rabbit.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontFamily: "'Fraunces', serif",
                                  fontSize: 'clamp(17px, 2.2vw, 20px)',
                                  fontWeight: 500,
                                  lineHeight: 1.3,
                                  letterSpacing: '-0.01em',
                                  color: 'var(--ink)',
                                  textDecoration: 'none',
                                }}
                              >
                                {c.rabbit.title}
                              </a>
                              <div
                                style={{
                                  marginTop: 6,
                                  fontFamily: "'Newsreader', serif",
                                  fontSize: 15,
                                  lineHeight: 1.55,
                                  color: 'var(--grey)',
                                }}
                                // When we have a digest, the why_html is just a
                                // pointer to the on-page take; show the digest
                                // one-liner here instead — it's the actual hook.
                                dangerouslySetInnerHTML={{
                                  __html:
                                    c.rabbit.digest?.one_liner_html ??
                                    c.rabbit.why_html,
                                }}
                              />
                              {c.rabbit.digest && (
                                <div
                                  style={{
                                    marginTop: 6,
                                    fontFamily: "'Archivo Narrow', sans-serif",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '.1em',
                                    textTransform: 'uppercase',
                                    color: 'var(--accent)',
                                  }}
                                >
                                  ◆ Our 90-second take inside the issue
                                </div>
                              )}
                              <div
                                style={{
                                  marginTop: 6,
                                  fontFamily: "'Archivo Narrow', sans-serif",
                                  fontSize: 12,
                                  letterSpacing: '.04em',
                                  color: 'var(--grey)',
                                }}
                              >
                                From <Link
                                  href={`/i/${c.slug}`}
                                  style={{ color: 'var(--accent)' }}
                                >
                                  Issue {padded}
                                </Link>{' '}· {c.date_display}
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
