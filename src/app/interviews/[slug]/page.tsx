import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { IssueContent, Interview as BaseInterview } from '@/lib/content-model'
import type { Database } from '../../../../db/types/database'

type IssueRow = Database['public']['Tables']['issues']['Row']

/**
 * Local augmentation of the Interview type. Agent 1's commit extends
 * `Interview` in src/lib/content-model.ts with these optional fields; this
 * worktree may not yet carry that change, so we widen locally to keep the
 * page type-checking either way. Every field below is optional and read
 * defensively — issues 001-003 only carry the teaser shape.
 */
type Interview = BaseInterview & {
  framework_name?: string
  q_html?: string
  why_they_ask_html?: string
  sample_answer_html?: string
  eval_deep_dive_html?: string
  depth_guide_html?: string
  counters?: {
    q: string
    strong_html: string
    weak_html: string
    why_weak_loses_html: string
  }[]
  traps?: { move: string; signal_lost_html: string }[]
  good_vs_great_html?: string
  meta_skill_html?: string
  read_time_min?: number
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibasically-eta.vercel.app'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const content = await loadIssue(slug)
  const question = content?.job_signal?.interview?.q ?? `Issue ${slug}`
  const title = `Interview Prep — ${question}`
  const ogUrl = `${SITE_URL}/og/${slug}`
  const url = `${SITE_URL}/interviews/${slug}`
  return {
    title,
    openGraph: {
      title,
      description: 'AI PM interview prep — the framework, the sample answer, the traps.',
      url,
      siteName: 'AI, Basically.',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      locale: 'en_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'AI PM interview prep — the framework, the sample answer, the traps.',
      images: [ogUrl],
    },
  }
}

async function loadIssue(slug: string): Promise<IssueRow | null> {
  // Mirror src/app/i/[issue]/page.tsx: Supabase first (status=published),
  // JSON fallback for preview / pre-publish.
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('issues')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  // Same pattern as the issue page's decoder + tldr.target fallbacks: when
  // the DB row exists but is missing the deep interview brief fields (the
  // Supabase row was seeded before the rubric-aligned prep brief was
  // authored), patch the interview object from the seed JSON so the page
  // renders the full brief instead of the "coming soon" fallback. Once an
  // ops step copies job_signal from the JSON into the DB row, this becomes
  // a no-op.
  if (data) {
    const interview = data.job_signal?.interview as Interview | undefined
    // Hydrate from seed JSON when ANY of the new fields are missing — DB
    // rows seeded before each field landed only carry the older shape. This
    // covers framework_name/counters (early shape), eval_deep_dive_html,
    // q_html, teaser_q (each added at different times). Once an ops step
    // copies job_signal from JSON into the DB row, this becomes a no-op.
    const briefMissing =
      !interview?.framework_name ||
      !interview?.counters?.length ||
      !interview?.q_html ||
      !interview?.teaser_q
    if (briefMissing) {
      try {
        const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
        const raw = await readFile(file, 'utf8')
        const seed = JSON.parse(raw) as IssueContent
        const seedInterview = seed.job_signal?.interview as Interview | undefined
        if (seedInterview?.framework_name || seedInterview?.counters?.length || seedInterview?.q_html) {
          return {
            ...data,
            job_signal: { ...data.job_signal, interview: seedInterview },
          }
        }
      } catch {
        /* no seed = no patch; renders the coming-soon fallback */
      }
    }
    return data
  }

  try {
    const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
    const raw = await readFile(file, 'utf8')
    const parsed = JSON.parse(raw) as IssueContent
    return {
      ...parsed,
      id: '',
      created_at: '',
      updated_at: '',
      decoder: parsed.decoder ?? null,
    }
  } catch {
    return null
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const content = await loadIssue(slug)
  if (!content) notFound()

  const interview = content.job_signal?.interview as Interview | undefined
  if (!interview) notFound()

  const issueNumber = content.issue_number
  const issueLabel = `Issue ${content.slug}`

  // Determine whether the new deep-brief fields are populated. If not, we
  // render the graceful fallback (teaser + "full brief coming soon" note).
  const hasDeep = Boolean(
    interview.why_they_ask_html ||
      interview.sample_answer_html ||
      interview.depth_guide_html ||
      (interview.counters && interview.counters.length) ||
      (interview.traps && interview.traps.length) ||
      interview.good_vs_great_html
  )

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
            <span className="tagline">Interview Prep</span>
          </div>
          <div className="meta">
            {interview.read_time_min ? `${interview.read_time_min} min read` : 'Prep brief'}
          </div>
        </header>

        <section className="hero">
          <div className="eyebrow">
            {interview.q_label}
          </div>
          <div
            style={{
              fontFamily: "'Archivo Narrow', sans-serif",
              fontSize: 12,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--grey)',
              marginTop: 4,
            }}
          >
            From {issueLabel}
          </div>
          {/* The question is a paragraph-length scenario (60-80 words), not
              a short headline. Render the structured `q_html` (setup +
              trigger + ask, with <ul> for parenthesized items) inside a
              quoted body block — Newsreader serif, oxblood left-rule,
              comfortable line-height. Falls back to plain `q` for legacy
              content. The wrapping h1 is sr-only for SEO/a11y; visible
              structure comes from the inner blocks. */}
          <h1
            className="sr-only-h1"
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            }}
          >
            {interview.q}
          </h1>
          {interview.q_html ? (
            <div
              className="prep-q"
              style={{
                fontFamily: "'Newsreader', serif",
                fontSize: 'clamp(17px, 2vw, 20px)',
                lineHeight: 1.55,
                color: 'var(--ink)',
                margin: '18px 0 0',
                padding: '6px 0 6px 16px',
                borderLeft: '3px solid var(--accent)',
              }}
              dangerouslySetInnerHTML={{ __html: interview.q_html }}
            />
          ) : (
            <p
              style={{
                fontFamily: "'Newsreader', serif",
                fontSize: 'clamp(17px, 2vw, 20px)',
                lineHeight: 1.55,
                color: 'var(--ink)',
                margin: '18px 0 0',
                padding: '6px 0 6px 16px',
                borderLeft: '3px solid var(--accent)',
              }}
            >
              {interview.q}
            </p>
          )}
          {interview.framework_name ? (
            <p
              className="sub"
              style={{ fontSize: 14, lineHeight: 1.5, marginTop: 14 }}
            >
              <strong>Framework:</strong> <em>{interview.framework_name}</em>
            </p>
          ) : null}
        </section>

        {hasDeep ? (
          <nav
            aria-label="In this brief"
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
              In this brief
            </div>
            <ol
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '4px 18px',
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              {interview.why_they_ask_html ? (
                <li>
                  <a href="#prep-why" style={{ display: 'inline-block', padding: '8px 0', color: 'var(--ink)' }}>
                    1 · Why they ask
                  </a>
                </li>
              ) : null}
              {interview.steps?.length ? (
                <li>
                  <a href="#prep-framework" style={{ display: 'inline-block', padding: '8px 0', color: 'var(--ink)' }}>
                    2 · The framework
                  </a>
                </li>
              ) : null}
              {interview.sample_answer_html ? (
                <li>
                  <a href="#prep-sample" style={{ display: 'inline-block', padding: '8px 0', color: 'var(--ink)' }}>
                    3 · Sample answer
                  </a>
                </li>
              ) : null}
              {interview.eval_deep_dive_html ? (
                <li>
                  <a href="#prep-eval" style={{ display: 'inline-block', padding: '8px 0', color: 'var(--accent)' }}>
                    4 · The eval, in detail
                  </a>
                </li>
              ) : null}
              {interview.depth_guide_html ? (
                <li>
                  <a href="#prep-depth" style={{ display: 'inline-block', padding: '8px 0', color: 'var(--ink)' }}>
                    5 · Depth on first pass
                  </a>
                </li>
              ) : null}
              {interview.counters?.length ? (
                <li>
                  <a href="#prep-counters" style={{ display: 'inline-block', padding: '8px 0', color: 'var(--ink)' }}>
                    6 · Counter-questions
                  </a>
                </li>
              ) : null}
              {interview.traps?.length ? (
                <li>
                  <a href="#prep-traps" style={{ display: 'inline-block', padding: '8px 0', color: 'var(--ink)' }}>
                    7 · Traps
                  </a>
                </li>
              ) : null}
              {interview.good_vs_great_html ? (
                <li>
                  <a href="#prep-gvg" style={{ display: 'inline-block', padding: '8px 0', color: 'var(--ink)' }}>
                    8 · Good vs great
                  </a>
                </li>
              ) : null}
            </ol>
          </nav>
        ) : null}

        {!hasDeep ? (
          <section
            className="sec"
            aria-labelledby="prep-coming-soon"
            style={{ background: 'var(--faint)', padding: 18 }}
          >
            <div className="label">
              <h2 id="prep-coming-soon" className="nm-lab">
                Full prep brief coming soon
              </h2>
            </div>
            <div className="lede">
              <p>
                This question shipped as a teaser in {issueLabel}. The full
                8-section prep brief — framework, sample answer, counter-questions,
                traps — is being rewritten to the prep-brief depth. For now,
                here&rsquo;s what was published.
              </p>
            </div>
          </section>
        ) : null}

        {hasDeep && interview.why_they_ask_html ? (
          <section className="sec" aria-labelledby="prep-why">
            <div className="label">
              <h2 id="prep-why" className="nm-lab">
                Why they ask this
              </h2>
            </div>
            <div
              className="lede"
              dangerouslySetInnerHTML={{ __html: interview.why_they_ask_html }}
            />
          </section>
        ) : null}

        <section className="sec" aria-labelledby="prep-framework">
          <div className="label">
            <h2 id="prep-framework" className="nm-lab">
              The framework
            </h2>
          </div>
          <div className="lede">
            {interview.framework_name ? (
              <p style={{ marginBottom: 14 }}>
                <strong>{interview.framework_name}</strong>
              </p>
            ) : null}
            {/* Each step body is ~70-100 words — heavy on mobile. Give them
                generous spacing + a hairline divider so each step reads as
                its own beat, not a run-on list. Bold inside <li> is the
                step label (visible eyebrow per step). */}
            <ol style={{ paddingLeft: 22, listStyleType: 'decimal' }}>
              {interview.steps.map((s, i) => (
                <li
                  key={s.n}
                  style={{
                    marginBottom: 22,
                    paddingBottom: i < interview.steps.length - 1 ? 18 : 0,
                    borderBottom:
                      i < interview.steps.length - 1
                        ? '1px solid var(--hair)'
                        : 'none',
                    lineHeight: 1.7,
                  }}
                  dangerouslySetInnerHTML={{ __html: s.body_html }}
                />
              ))}
            </ol>
            {!hasDeep && interview.tip_html ? (
              <p
                style={{ marginTop: 14 }}
                dangerouslySetInnerHTML={{ __html: interview.tip_html }}
              />
            ) : null}
          </div>
        </section>

        {hasDeep && interview.sample_answer_html ? (
          <section className="sec" aria-labelledby="prep-sample">
            <div className="label">
              <h2 id="prep-sample" className="nm-lab">
                Sample answer
              </h2>
            </div>
            <div
              className="lede"
              dangerouslySetInnerHTML={{ __html: interview.sample_answer_html }}
            />
          </section>
        ) : null}

        {hasDeep && interview.eval_deep_dive_html ? (
          <section className="sec" aria-labelledby="prep-eval">
            <div className="label">
              <h2 id="prep-eval" className="nm-lab">
                The eval, in detail
              </h2>
              <span className="hint">
                What to put in the eval set, how to score, how to read the output.
              </span>
            </div>
            <div
              className="lede"
              dangerouslySetInnerHTML={{ __html: interview.eval_deep_dive_html }}
            />
          </section>
        ) : null}

        {hasDeep && interview.depth_guide_html ? (
          <section className="sec" aria-labelledby="prep-depth">
            <div className="label">
              <h2 id="prep-depth" className="nm-lab">
                How deep on first pass
              </h2>
            </div>
            <div
              className="lede"
              dangerouslySetInnerHTML={{ __html: interview.depth_guide_html }}
            />
          </section>
        ) : null}

        {hasDeep && interview.counters && interview.counters.length ? (
          <section className="sec" aria-labelledby="prep-counters">
            <div className="label">
              <h2 id="prep-counters" className="nm-lab">
                Counter-questions you&rsquo;ll face
              </h2>
            </div>
            <div className="lede">
              {interview.counters.map((c, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 22,
                    paddingBottom: 18,
                    borderBottom:
                      i < interview.counters!.length - 1
                        ? '1px solid var(--hair)'
                        : 'none',
                  }}
                >
                  <p style={{ fontWeight: 600, marginBottom: 10 }}>
                    Q{i + 1}. {c.q}
                  </p>
                  <p style={{ marginBottom: 8 }}>
                    <span
                      style={{
                        fontFamily: "'Archivo Narrow', sans-serif",
                        fontSize: 11.5,
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                        color: 'var(--accent)',
                      }}
                    >
                      Strong
                    </span>
                  </p>
                  <div dangerouslySetInnerHTML={{ __html: c.strong_html }} />
                  <p style={{ marginTop: 12, marginBottom: 8 }}>
                    <span
                      style={{
                        fontFamily: "'Archivo Narrow', sans-serif",
                        fontSize: 11.5,
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                        color: 'var(--grey)',
                      }}
                    >
                      Weak
                    </span>
                  </p>
                  <div dangerouslySetInnerHTML={{ __html: c.weak_html }} />
                  <p style={{ marginTop: 12, marginBottom: 8 }}>
                    <span
                      style={{
                        fontFamily: "'Archivo Narrow', sans-serif",
                        fontSize: 11.5,
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                        color: 'var(--grey)',
                      }}
                    >
                      Why weak loses
                    </span>
                  </p>
                  <div
                    dangerouslySetInnerHTML={{ __html: c.why_weak_loses_html }}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {hasDeep && interview.traps && interview.traps.length ? (
          <section className="sec" aria-labelledby="prep-traps">
            <div className="label">
              <h2 id="prep-traps" className="nm-lab">
                Traps that downlevel
              </h2>
            </div>
            <div className="lede">
              {interview.traps.map((t, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <p style={{ fontWeight: 600, marginBottom: 6 }}>
                    {i + 1}. {t.move}
                  </p>
                  <div
                    style={{ color: 'var(--grey)' }}
                    dangerouslySetInnerHTML={{ __html: t.signal_lost_html }}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {hasDeep && interview.good_vs_great_html ? (
          <section className="sec" aria-labelledby="prep-gvg">
            <div className="label">
              <h2 id="prep-gvg" className="nm-lab">
                Good vs great
              </h2>
            </div>
            <div
              className="lede"
              dangerouslySetInnerHTML={{ __html: interview.good_vs_great_html }}
            />
          </section>
        ) : null}

        <section
          className="sec"
          aria-labelledby="prep-foot"
          style={{ marginTop: 24 }}
        >
          {interview.meta_skill_html ? (
            <>
              <div className="label">
                <h2 id="prep-foot" className="nm-lab">
                  Meta-skill
                </h2>
              </div>
              <div
                className="lede"
                dangerouslySetInnerHTML={{ __html: interview.meta_skill_html }}
              />
            </>
          ) : (
            <h2 id="prep-foot" style={{ display: 'none' }}>
              Footer
            </h2>
          )}
          <p
            style={{
              marginTop: 18,
              fontFamily: "'Archivo Narrow', sans-serif",
              fontSize: 12.5,
              letterSpacing: '.04em',
              color: 'var(--grey)',
            }}
          >
            <Link
              href={`/i/${content.slug}`}
              style={{ color: 'var(--accent)' }}
            >
              &larr; Back to Issue {String(issueNumber).padStart(3, '0')}
            </Link>
            {' · '}
            <Link href="/archive" style={{ color: 'var(--accent)' }}>
              All interviews
            </Link>
            {' · '}
            <Link href="/#subscribe" style={{ color: 'var(--accent)' }}>
              Subscribe Saturday brief
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
