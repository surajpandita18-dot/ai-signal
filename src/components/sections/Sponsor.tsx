import type { Sponsor as SponsorType } from '@/lib/content-model'

export default function Sponsor({ data }: { data: SponsorType }) {
  if (!data) return null
  return (
    <div className="sec sponsor">
      <div className="label">
        <span className="nm-lab" style={{ color: 'var(--grey)' }}>
          Partner
        </span>
        <span className="hint">
          One sponsor per issue. Clearly marked. Never disguised as editorial.
        </span>
      </div>
      <div>
        <div className="sponsor-box">
          <div className="sp-tag">{data.brand_tag}</div>
          <p className="sp-copy" dangerouslySetInnerHTML={{ __html: data.copy_html }} />
          <a href={data.cta_url} className="sp-cta">
            {data.cta} →
          </a>
        </div>
      </div>
    </div>
  )
}
