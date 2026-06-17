import type { RabbitHole as RabbitHoleType } from '@/lib/content-model'

type Props = { data: RabbitHoleType | null | undefined }

/**
 * Weekend Rabbit Hole — one curated resource per issue. Sits in the
 * editorial-infrastructure tier (visually consistent with Sponsor / Decoder —
 * not part of the 01-08 spine, unnumbered, restrained). Compounds into a
 * library asset week-over-week.
 */
export default function RabbitHole({ data }: Props) {
  if (!data) return null
  const kindLabel = data.kind.toUpperCase()

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
            <span>{data.time_min} min</span>
            <span style={{ color: 'var(--accent)' }}>·</span>
            <span>{data.by}</span>
          </div>
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
