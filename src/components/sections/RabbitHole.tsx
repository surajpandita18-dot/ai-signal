import Link from 'next/link'
import type { RabbitHole as RabbitHoleType } from '@/lib/content-model'

type Props = {
  data: RabbitHoleType | null | undefined
  issueSlug: string
}

/**
 * Weekend Rabbit Hole — inline teaser in the issue. Two render modes:
 *  - With `digest`: small teaser card (badge + title + one-liner) that
 *    sends the reader to /rabbit-holes/<slug> for the full Feynman
 *    explanation (analogy + diagram + mechanism + key insight + original
 *    paper link). Mirrors how JobSignal teases the prep brief that lives
 *    on /interviews/<slug>.
 *  - No `digest`: legacy single-link card straight to the resource.
 *
 * The dedicated page is the canonical home of the digest; this inline is
 * the issue-page entrypoint. Keeps the issue page lighter and gives the
 * digest its own sharable URL.
 */
export default function RabbitHole({ data, issueSlug }: Props) {
  if (!data) return null
  const kindLabel = data.kind.toUpperCase()

  if (data.digest)
    return (
      <DigestTeaser data={data} kindLabel={kindLabel} issueSlug={issueSlug} />
    )

  return (
    <div className="sec" id="rabbit">
      <div className="label">
        <span className="nm-lab">Weekend Rabbit Hole</span>
        <span className="hint">
          One curated read that pairs with this week&rsquo;s One Thing. Open on
          Saturday afternoon; thank us by Tuesday.
        </span>
      </div>
      <div>
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '16px 18px',
            border: '1px solid var(--ink)',
            background: 'var(--faint)',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'background-color .15s ease',
          }}
          className="rabbit-card"
        >
          <Meta kindLabel={kindLabel} time={data.time_min} by={data.by} />
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(18px, 2.4vw, 22px)',
              fontWeight: 500,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              marginBottom: 8,
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: 15,
              lineHeight: 1.55,
              color: 'var(--ink)',
              marginBottom: 10,
            }}
            dangerouslySetInnerHTML={{ __html: data.why_html }}
          />
          <div
            style={{
              fontFamily: "'Archivo Narrow', sans-serif",
              fontSize: 12,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            Open the rabbit hole &rarr;
          </div>
        </a>
      </div>
    </div>
  )
}

function DigestTeaser({
  data,
  kindLabel,
  issueSlug,
}: {
  data: RabbitHoleType
  kindLabel: string
  issueSlug: string
}) {
  const d = data.digest!
  return (
    <div className="sec" id="rabbit">
      <div className="label">
        <span className="nm-lab">Weekend Rabbit Hole</span>
        <span className="hint">
          The week&rsquo;s paper, explained ourselves. The full digest
          (analogy, diagram, key insight) lives on its own page.
        </span>
      </div>
      <article
        style={{
          padding: '20px 22px 22px',
          border: '1px solid var(--ink)',
          background: 'var(--faint)',
        }}
        className="rabbit-card"
      >
        <Meta kindLabel={kindLabel} time={data.time_min} by={data.by} />
        <h3
          style={{
            margin: '4px 0 12px',
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(19px, 2.6vw, 24px)',
            fontWeight: 500,
            lineHeight: 1.22,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          {data.title}
        </h3>

        {/* one-liner: the hook */}
        <div
          style={{
            fontFamily: "'Newsreader', serif",
            fontStyle: 'italic',
            fontSize: 16.5,
            lineHeight: 1.55,
            color: 'var(--ink)',
            padding: '10px 14px',
            borderLeft: '3px solid var(--accent)',
            background: '#fff8',
            margin: '4px 0 14px',
          }}
          dangerouslySetInnerHTML={{ __html: d.one_liner_html }}
        />

        {/* Single CTA — same shape as the interview teaser's
            "Read the full prep brief →" footer. */}
        <Link
          href={`/rabbit-holes/${issueSlug}`}
          style={{
            display: 'block',
            marginTop: 6,
            paddingTop: 12,
            borderTop: '1px solid var(--hair)',
            fontFamily: "'Spline Sans Mono', monospace",
            fontSize: 12.5,
            color: 'var(--accent)',
            textDecoration: 'none',
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 700 }}>
            &rarr; Read the full 90-second digest
          </span>
          <span
            style={{
              display: 'block',
              marginTop: 2,
              color: 'var(--grey)',
              fontSize: 11,
              letterSpacing: '.02em',
            }}
          >
            Analogy · diagram · mechanism · key insight · original{' '}
            {data.kind} link at the end
          </span>
        </Link>
      </article>
    </div>
  )
}

function Meta({
  kindLabel,
  time,
  by,
}: {
  kindLabel: string
  time: number
  by: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
        fontFamily: "'Archivo Narrow', sans-serif",
        fontSize: 11,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'var(--grey)',
        flexWrap: 'wrap',
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
      <span>{time} min</span>
      <span style={{ color: 'var(--accent)' }}>·</span>
      <span>{by}</span>
    </div>
  )
}
