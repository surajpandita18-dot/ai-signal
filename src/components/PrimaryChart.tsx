import type { ComparisonChart, ComparisonRow, TrajectoryPoint, CapFlowNode, QuoteCallout } from '@/lib/types/extended-data'

interface PrimaryChartProps {
  chart: ComparisonChart
}

function ComparisonVariant({ data }: { data: ComparisonRow[] }) {
  return (
    <>
      {data.map((row, i) => (
        <div key={i} className="compare-row">
          <div className="compare-label">{row.label}</div>
          <div className="compare-bar-track">
            <div
              className={`compare-bar-fill ${row.fill_color}`}
              style={{
                width: `${row.width_pct}%`,
                ...(row.opacity !== undefined ? { opacity: row.opacity } : {}),
              }}
            />
          </div>
          <div className="compare-value">{row.value}</div>
        </div>
      ))}
    </>
  )
}

function TrajectoryVariant({ data }: { data: TrajectoryPoint[] }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((point, i) => (
        <div key={i} className="compare-row">
          <div className="compare-label" style={{ fontVariantNumeric: 'tabular-nums' }}>{point.date}</div>
          <div className="compare-bar-track" style={{ alignSelf: 'center' }}>
            <div className="compare-bar-fill signal" style={{ width: `${Math.round((point.value / maxVal) * 100)}%` }} />
          </div>
          <div className="compare-value">{point.value}{point.label ? ` ${point.label}` : ''}</div>
        </div>
      ))}
    </div>
  )
}

function CapFlowVariant({ data }: { data: CapFlowNode[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((node, i) => (
        <div key={i} className="compare-row">
          <div className="compare-label">{node.from}</div>
          <div className="compare-bar-track" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.04em' }}>
              → {node.amount} →
            </span>
          </div>
          <div className="compare-value" style={{ textAlign: 'left' }}>{node.to}</div>
        </div>
      ))}
    </div>
  )
}

function QuoteCalloutVariant({ data }: { data: QuoteCallout }) {
  return (
    <div className="editorial-quote" style={{ marginTop: 0 }}>
      <span className="quote-glyph">&ldquo;</span>
      <p>{data.quote}</p>
      <div className="quote-attr">— {data.attribution}</div>
    </div>
  )
}

export function PrimaryChart({ chart }: PrimaryChartProps) {
  if (chart.type === 'quote_callout' && Array.isArray(chart.data)) return null
  return (
    <div className="compare-chart">
      <div className="compare-title">{chart.title}</div>
      <div className="compare-subtitle">{chart.subtitle}</div>

      {chart.type === 'comparison' && (
        <ComparisonVariant data={chart.data as ComparisonRow[]} />
      )}
      {chart.type === 'trajectory' && (
        <TrajectoryVariant data={chart.data as TrajectoryPoint[]} />
      )}
      {chart.type === 'cap_flow' && (
        <CapFlowVariant data={chart.data as CapFlowNode[]} />
      )}
      {chart.type === 'quote_callout' && (
        <QuoteCalloutVariant data={chart.data as QuoteCallout} />
      )}
    </div>
  )
}
