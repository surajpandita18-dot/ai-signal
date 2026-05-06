import type { CascadeData } from '@/lib/types/extended-data'

interface CascadeTimelineProps {
  data: CascadeData
}

export function CascadeTimeline({ data }: CascadeTimelineProps) {
  if (data.steps.length === 0) return null

  return (
    <div className="cascade-grid">
      <div className="cascade-title">{data.title}</div>
      <div className="cascade-subtitle">{data.subtitle}</div>
      <div className="cascade-row">
        {data.steps.map((step, i) => (
          <div key={i} className="cascade-step">
            <div className="cascade-marker">{step.marker}</div>
            <div className="cascade-week">{step.week}</div>
            <div className="cascade-event">{step.event}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
