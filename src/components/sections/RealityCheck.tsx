import type { RealityCheck as RealityCheckType } from '@/lib/content-model'

export default function RealityCheck({
  harm_tag,
  h3,
  body_html,
  honest_html,
  source,
}: RealityCheckType) {
  return (
    <div className="reality">
      <div className="rc-top">
        The part the hype skips ·{' '}
        <span className="harm-tag">this week: {harm_tag}</span>{' '}
        <span className="harm-rot">(rotating: labor · bias · privacy · power)</span>
      </div>
      <h3>{h3}</h3>
      <p dangerouslySetInnerHTML={{ __html: body_html }} />
      <p className="honest" dangerouslySetInnerHTML={{ __html: honest_html }} />
      <div className="src">{source}</div>
    </div>
  )
}
