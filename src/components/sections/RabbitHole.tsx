import type { RabbitHole as RabbitHoleType } from '@/lib/content-model'

type Props = { data: RabbitHoleType | null | undefined }

/**
 * Weekend Rabbit Hole — one curated resource per issue. Sits in the
 * editorial-infrastructure tier (visually consistent with Sponsor / Decoder —
 * not part of the 01-08 spine, unnumbered, restrained). Compounds into a
 * library asset week-over-week.
 *
 * Two render modes:
 *  - No `digest`: card is a single big link straight to the resource (legacy).
 *  - With `digest`: we render OUR Feynman-style explanation (analogy →
 *    mechanism → optional diagram → key insight), with the original link
 *    landing at the END as "Read the original →". For dense papers that
 *    most readers won't open cold; the digest is the on-ramp.
 */
export default function RabbitHole({ data }: Props) {
  if (!data) return null
  const kindLabel = data.kind.toUpperCase()

  if (data.digest) return <DigestCard data={data} kindLabel={kindLabel} />

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

function DigestCard({
  data,
  kindLabel,
}: {
  data: RabbitHoleType
  kindLabel: string
}) {
  const d = data.digest!
  return (
    <div className="sec" id="rabbit">
      <div className="label">
        <span className="nm-lab">Weekend Rabbit Hole</span>
        <span className="hint">
          The week&rsquo;s paper, explained ourselves. Original is heavy;
          this is your 90-second on-ramp.
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
            margin: '4px 0 10px',
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

        {/* one-liner: the answer up front */}
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
            margin: '6px 0 18px',
          }}
          dangerouslySetInnerHTML={{ __html: d.one_liner_html }}
        />

        {/* analogy — the load-bearing explanation */}
        <DigestBlock label="The picture" body_html={d.analogy_html} />

        {/* optional diagram between the analogy and the mechanism */}
        {d.diagram_svg && (
          <div
            style={{
              margin: '14px 0 18px',
              padding: 12,
              background: '#fff',
              border: '1px solid var(--hair)',
            }}
            dangerouslySetInnerHTML={{ __html: d.diagram_svg }}
          />
        )}

        {/* mechanism — the actual thing */}
        <DigestBlock label="What's actually happening" body_html={d.mechanism_html} />

        {/* key insight — what you carry back to work */}
        <div
          style={{
            marginTop: 18,
            padding: '12px 14px',
            background: 'var(--ink)',
            color: '#F4F1E8',
            fontFamily: "'Newsreader', serif",
            fontSize: 15,
            lineHeight: 1.5,
          }}
          dangerouslySetInnerHTML={{ __html: d.key_insight_html }}
        />

        {/* original link at the END — direct, no further commentary */}
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rabbit-original-link"
          style={{
            display: 'inline-block',
            marginTop: 18,
            fontFamily: "'Archivo Narrow', sans-serif",
            fontSize: 12.5,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontWeight: 700,
            textDecoration: 'none',
            borderBottom: '1px solid var(--accent)',
            paddingBottom: 2,
          }}
        >
          Read the original {data.kind === 'paper' ? 'paper' : data.kind} &rarr;
        </a>
        <div
          style={{
            marginTop: 4,
            fontFamily: "'Archivo Narrow', sans-serif",
            fontSize: 11,
            letterSpacing: '.04em',
            color: 'var(--grey)',
          }}
        >
          {data.time_min} min · {data.by}
        </div>
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

function DigestBlock({
  label,
  body_html,
}: {
  label: string
  body_html: string
}) {
  return (
    <div style={{ marginTop: 6 }}>
      <div
        style={{
          fontFamily: "'Archivo Narrow', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Newsreader', serif",
          fontSize: 16,
          lineHeight: 1.6,
          color: 'var(--ink)',
        }}
        dangerouslySetInnerHTML={{ __html: body_html }}
      />
    </div>
  )
}
