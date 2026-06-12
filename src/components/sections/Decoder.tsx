import Fold from '@/components/interactive/Fold'
import type { Decoder as DecoderType } from '@/lib/content-model'

type DecoderProps = { data: DecoderType }

// Renders as an unnumbered `.sec` wrapper (visually consistent with Sponsor —
// editorial-infrastructure tone, not part of the 01-08 spine). On web, the
// term list is hidden behind a fold so the closed state adds ~80px of vertical
// rhythm only. On email this whole component is bypassed in favour of an
// always-open table layout (see emails/IssueEmail.tsx).
export default function Decoder({ data }: DecoderProps) {
  if (!data) return null
  const count = data.terms.length

  return (
    <div className="sec">
      <div className="label">
        <span className="nm-lab">Decoder</span>
        <span className="hint">
          The jargon that showed up this week. One line each, in plain English.
        </span>
      </div>
      <div>
        <Fold
          buttonClass="foldbtn"
          closedLabel={`▸ Translate the tech (${count} ${count === 1 ? 'term' : 'terms'} · 30 sec)`}
          openLabel="▾ Hide the decoder"
          foldClassName="deepfold"
        >
          <p
            className="lede"
            style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 14 }}
          >
            {data.intro}
          </p>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: 0,
              maxWidth: 600,
            }}
            className="decoder-list"
          >
            {data.terms.map((t) => (
              <div
                key={t.term}
                style={{
                  display: 'contents',
                }}
              >
                <dt
                  style={{
                    fontFamily: "'Archivo Narrow', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: '.04em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    paddingTop: 12,
                    paddingRight: 14,
                    borderTop: '1px solid var(--hair)',
                  }}
                >
                  {t.term}
                </dt>
                <dd
                  style={{
                    fontFamily: "'Newsreader', serif",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: 'var(--ink)',
                    margin: 0,
                    padding: '12px 0',
                    borderTop: '1px solid var(--hair)',
                  }}
                >
                  {t.plain}
                </dd>
              </div>
            ))}
          </dl>
        </Fold>
      </div>
    </div>
  )
}
