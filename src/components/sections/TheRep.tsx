import type { TheRep as TheRepType } from '@/lib/content-model'

export default function TheRep({
  type,
  lite_html,
  full_html,
  done,
  reader_win,
}: TheRepType) {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
  return (
    <div className="repbox">
      <div className="rep-type">
        This week&apos;s type: <b>{typeLabel}</b>{' '}
        <span>(rotates: build · audit · compare · break-it)</span>
      </div>
      <div className="rep-tier">
        <span className="rt-lab">⚡ Lite · 2 min</span>
        <p dangerouslySetInnerHTML={{ __html: lite_html }} />
      </div>
      <div className="rep-tier">
        <span className="rt-lab">🔨 Full · 15 min</span>
        <p dangerouslySetInnerHTML={{ __html: full_html }} />
      </div>
      <p className="done">{done}</p>
      <div className="result">
        {reader_win.quote}
        <span>
          {reader_win.by} · last week&apos;s Rep ·{' '}
          <a href={reader_win.link}>shared with permission</a>
        </span>
      </div>
    </div>
  )
}
