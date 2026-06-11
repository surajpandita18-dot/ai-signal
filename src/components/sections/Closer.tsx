import type { Closer as CloserType } from '@/lib/content-model'

export default function Closer({ format_label, body_html }: CloserType) {
  return (
    <div className="closer-band">
      <div className="grid">
        <div className="lab">
          One Last Thing{' '}
          <span className="cc-rot">
            (format rotates: dark joke · absurd-but-true · provocation)
          </span>
        </div>
        <div className="cc-single">
          <div className="cc-tag">{format_label}</div>
          <p className="joke" dangerouslySetInnerHTML={{ __html: body_html }} />
          <button className="share-card">⧉ Copy as share card</button>
        </div>
      </div>
    </div>
  )
}
