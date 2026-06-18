import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { IssueContent, RabbitHole } from '@/lib/content-model'
import type { Database } from '../../../../db/types/database'

type IssueRow = Database['public']['Tables']['issues']['Row']

type Loaded = {
  slug: string
  issue_number: number
  date_display: string
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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibasically-eta.vercel.app'

/**
 * rabbit_hole is JSON-only right now (no DB column), so this loader uses
 * Supabase only to confirm the issue exists + grab metadata, then always
 * reads rabbit_hole from content/issues/<slug>.json. Mirrors the fallback
 * pattern in /i/[issue]/page.tsx.
 */
async function loadRabbit(slug: string): Promise<Loaded | null> {
  // Try Supabase for metadata
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('issues')
    .select('slug, issue_number, date_display, status')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  let issueMeta: { issue_number: number; date_display: string } | null = data
    ? { issue_number: data.issue_number, date_display: data.date_display }
    : null

  // Always read rabbit_hole from JSON
  let rabbit: RabbitHole | null = null
  try {
    const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
    const parsed = JSON.parse(await readFile(file, 'utf8')) as IssueContent
    rabbit = (parsed.rabbit_hole as RabbitHole | undefined) ?? null
    // If Supabase missed (preview / pre-publish), fall back to JSON for meta.
    if (!issueMeta) {
      issueMeta = {
        issue_number: parsed.issue_number,
        date_display: parsed.date_display,
      }
    }
  } catch {
    return null
  }

  if (!rabbit || !issueMeta) return null

  return {
    slug,
    issue_number: issueMeta.issue_number,
    date_display: issueMeta.date_display,
    rabbit,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadRabbit(slug)
  const title = loaded
    ? `${loaded.rabbit.title} — Rabbit Hole`
    : `Rabbit Hole — Issue ${slug}`
  const description = loaded
    ? loaded.rabbit.digest?.one_liner_html?.replace(/<[^>]+>/g, '') ??
      loaded.rabbit.why_html?.replace(/<[^>]+>/g, '') ??
      'A research paper, explained ourselves.'
    : 'AI, Basically. — Weekend Rabbit Hole.'
  const url = `${SITE_URL}/rabbit-holes/${slug}`
  const ogUrl = `${SITE_URL}/og/${slug}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'AI, Basically.',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      locale: 'en_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl],
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const loaded = await loadRabbit(slug)
  if (!loaded) notFound()

  const { rabbit, issue_number, date_display } = loaded
  const padded = String(issue_number).padStart(3, '0')
  const digest = rabbit.digest
  const kindLabel = KIND_LABEL[rabbit.kind]
  const linkLabel = rabbit.kind === 'paper' ? 'paper' : rabbit.kind

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
            <span className="tagline">Rabbit Hole</span>
          </div>
          <div className="meta">
            {rabbit.time_min} min · {rabbit.by}
          </div>
        </header>

        <section className="hero">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
              flexWrap: 'wrap',
              fontFamily: "'Archivo Narrow', sans-serif",
              fontSize: 11,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--grey)',
            }}
          >
            <span
              style={{
                background: 'var(--ink)',
                color: '#fff',
                padding: '2px 7px',
                fontWeight: 700,
                letterSpacing: '.08em',
              }}
            >
              {kindLabel}
            </span>
            <span>{rabbit.time_min} min</span>
            <span style={{ color: 'var(--accent)' }}>·</span>
            <span>{rabbit.by}</span>
          </div>

          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(26px, 4.4vw, 42px)',
              fontWeight: 500,
              lineHeight: 1.12,
              letterSpacing: '-0.015em',
              color: 'var(--ink)',
              margin: '6px 0 12px',
            }}
          >
            {rabbit.title}
          </h1>

          <div
            style={{
              fontFamily: "'Archivo Narrow', sans-serif",
              fontSize: 12,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--grey)',
              marginBottom: 18,
            }}
          >
            From{' '}
            <Link href={`/i/${slug}`} style={{ color: 'var(--accent)' }}>
              Issue {padded}
            </Link>{' '}
            · {date_display}
          </div>

          {digest?.one_liner_html ? (
            <div
              style={{
                fontFamily: "'Newsreader', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(18px, 2.1vw, 21px)',
                lineHeight: 1.55,
                color: 'var(--ink)',
                padding: '10px 0 10px 18px',
                borderLeft: '3px solid var(--accent)',
                margin: '4px 0 0',
              }}
              dangerouslySetInnerHTML={{ __html: digest.one_liner_html }}
            />
          ) : rabbit.why_html ? (
            <div
              style={{
                fontFamily: "'Newsreader', serif",
                fontSize: 18,
                lineHeight: 1.6,
                color: 'var(--ink)',
                margin: '4px 0 0',
              }}
              dangerouslySetInnerHTML={{ __html: rabbit.why_html }}
            />
          ) : null}
        </section>

        {/* Table of contents — only when there's a full digest. Pulls in
            optional extended sections; renumber dynamically so the reader's
            "1 · …, 2 · …" matches what they actually land on. */}
        {digest
          ? (() => {
              const items: { href: string; label: string }[] = []
              if (digest.context_html)
                items.push({ href: '#rh-context', label: 'Why this matters' })
              items.push({ href: '#rh-picture', label: 'The picture' })
              items.push({
                href: '#rh-mechanism',
                label: "What's actually happening",
              })
              if (digest.example_html)
                items.push({ href: '#rh-example', label: 'A worked example' })
              if (digest.surprises_html)
                items.push({
                  href: '#rh-surprises',
                  label: 'What surprised the authors',
                })
              if (digest.monday_html)
                items.push({
                  href: '#rh-monday',
                  label: 'What it means Monday',
                })
              if (digest.limits_html)
                items.push({
                  href: '#rh-limits',
                  label: "What it doesn't solve",
                })
              items.push({ href: '#rh-insight', label: 'Carry this back' })
              items.push({ href: '#rh-original', label: 'Read the original' })
              return (
                <nav
                  aria-label="In this digest"
                  style={{
                    borderTop: '1px solid var(--hair)',
                    borderBottom: '1px solid var(--hair)',
                    padding: '14px 0',
                    margin: '4px 0 0',
                    fontFamily: "'Archivo Narrow', sans-serif",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      color: 'var(--grey)',
                      marginBottom: 8,
                    }}
                  >
                    In this digest · {rabbit.time_min} min read
                  </div>
                  <ol
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '4px 18px',
                      fontSize: 13.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {items.map((it, i) => (
                      <li key={it.href}>
                        <a
                          href={it.href}
                          style={{
                            display: 'inline-block',
                            padding: '8px 0',
                            color:
                              it.href === '#rh-original'
                                ? 'var(--accent)'
                                : 'var(--ink)',
                          }}
                        >
                          {i + 1} · {it.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )
            })()
          : null}

        {/* Digest body */}
        {digest ? (
          <>
            {digest.context_html ? (
              <section className="sec" aria-labelledby="rh-context">
                <div className="label">
                  <h2 id="rh-context" className="nm-lab">
                    Why this matters
                  </h2>
                  <span className="hint">
                    What was broken in the world before this paper.
                  </span>
                </div>
                <div
                  className="lede"
                  dangerouslySetInnerHTML={{ __html: digest.context_html }}
                />
              </section>
            ) : null}

            <section className="sec" aria-labelledby="rh-picture">
              <div className="label">
                <h2 id="rh-picture" className="nm-lab">
                  The picture
                </h2>
                <span className="hint">The analogy that does the work.</span>
              </div>
              <div
                className="lede"
                dangerouslySetInnerHTML={{ __html: digest.analogy_html }}
              />
              {digest.diagram_svg ? (
                <figure
                  style={{
                    margin: '18px 0 0',
                    padding: 14,
                    background: '#fff',
                    border: '1px solid var(--hair)',
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: digest.diagram_svg }}
                  />
                </figure>
              ) : null}
              {digest.second_analogy_html ? (
                <div
                  className="lede"
                  style={{ marginTop: 18 }}
                  dangerouslySetInnerHTML={{
                    __html: digest.second_analogy_html,
                  }}
                />
              ) : null}
              {digest.second_diagram_svg ? (
                <figure
                  style={{
                    margin: '18px 0 0',
                    padding: 14,
                    background: '#fff',
                    border: '1px solid var(--hair)',
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: digest.second_diagram_svg,
                    }}
                  />
                </figure>
              ) : null}
            </section>

            <section className="sec" aria-labelledby="rh-mechanism">
              <div className="label">
                <h2 id="rh-mechanism" className="nm-lab">
                  What&rsquo;s actually happening
                </h2>
                <span className="hint">
                  The mechanism, in the paper&rsquo;s own numbers.
                </span>
              </div>
              <div
                className="lede"
                dangerouslySetInnerHTML={{ __html: digest.mechanism_html }}
              />
            </section>

            {digest.example_html ? (
              <section className="sec" aria-labelledby="rh-example">
                <div className="label">
                  <h2 id="rh-example" className="nm-lab">
                    A worked example
                  </h2>
                  <span className="hint">
                    One concrete case from the paper, with the actual numbers.
                  </span>
                </div>
                <div
                  className="lede"
                  dangerouslySetInnerHTML={{ __html: digest.example_html }}
                />
              </section>
            ) : null}

            {digest.surprises_html ? (
              <section className="sec" aria-labelledby="rh-surprises">
                <div className="label">
                  <h2 id="rh-surprises" className="nm-lab">
                    What surprised the authors
                  </h2>
                  <span className="hint">
                    The result the hypothesis didn&rsquo;t predict.
                  </span>
                </div>
                <div
                  className="lede"
                  dangerouslySetInnerHTML={{ __html: digest.surprises_html }}
                />
              </section>
            ) : null}

            {digest.monday_html ? (
              <section className="sec" aria-labelledby="rh-monday">
                <div className="label">
                  <h2 id="rh-monday" className="nm-lab">
                    What it means Monday
                  </h2>
                  <span className="hint">
                    The concrete change to how you work this week.
                  </span>
                </div>
                <div
                  className="lede"
                  dangerouslySetInnerHTML={{ __html: digest.monday_html }}
                />
              </section>
            ) : null}

            {digest.limits_html ? (
              <section className="sec" aria-labelledby="rh-limits">
                <div className="label">
                  <h2 id="rh-limits" className="nm-lab">
                    What it doesn&rsquo;t solve
                  </h2>
                  <span className="hint">
                    Honest limits. The paper isn&rsquo;t a finish line.
                  </span>
                </div>
                <div
                  className="lede"
                  dangerouslySetInnerHTML={{ __html: digest.limits_html }}
                />
              </section>
            ) : null}

            <section className="sec" aria-labelledby="rh-insight">
              <div className="label">
                <h2 id="rh-insight" className="nm-lab">
                  Carry this back
                </h2>
                <span className="hint">
                  The one line that should change how you work Monday.
                </span>
              </div>
              <div
                style={{
                  padding: '18px 22px',
                  background: 'var(--ink)',
                  color: '#F4F1E8',
                  fontFamily: "'Newsreader', serif",
                  fontSize: 'clamp(16px, 1.9vw, 18px)',
                  lineHeight: 1.55,
                  borderLeft: '4px solid var(--accent)',
                }}
                dangerouslySetInnerHTML={{ __html: digest.key_insight_html }}
              />
            </section>
          </>
        ) : null}

        {/* Original link — always last, going direct */}
        <section className="sec" aria-labelledby="rh-original">
          <div className="label">
            <h2 id="rh-original" className="nm-lab">
              Read the original
            </h2>
            <span className="hint">
              Direct to the source. {digest ? 'You already know what to look for.' : ''}
            </span>
          </div>
          <div>
            <a
              href={rabbit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rabbit-original-link"
              style={{
                display: 'inline-block',
                fontFamily: "'Archivo Narrow', sans-serif",
                fontSize: 14,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                fontWeight: 700,
                textDecoration: 'none',
                borderBottom: '1px solid var(--accent)',
                paddingBottom: 3,
              }}
            >
              Open the {linkLabel} &rarr;
            </a>
            <div
              style={{
                marginTop: 8,
                fontFamily: "'Archivo Narrow', sans-serif",
                fontSize: 12,
                letterSpacing: '.04em',
                color: 'var(--grey)',
              }}
            >
              {rabbit.time_min} min · {rabbit.by}
            </div>
          </div>
        </section>

        {/* Library back-link */}
        <section className="sec">
          <div className="label">
            <span className="nm-lab">More weekend reads</span>
          </div>
          <div>
            <Link
              href="/rabbit-holes"
              style={{
                fontFamily: "'Archivo Narrow', sans-serif",
                fontSize: 13,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              &larr; All Rabbit Holes
            </Link>
            {' · '}
            <Link
              href={`/i/${slug}`}
              style={{
                fontFamily: "'Archivo Narrow', sans-serif",
                fontSize: 13,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: 'var(--grey)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Back to Issue {padded}
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
