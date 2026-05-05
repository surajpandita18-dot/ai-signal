import type { TickerData } from '@/lib/types/extended-data'

interface HeroTickersProps {
  tickers: TickerData[]
}

export function HeroTickers({ tickers }: HeroTickersProps) {
  if (tickers.length === 0) return null

  return (
    <div className="hero-tickers anim d5">
      {tickers.map((ticker, i) => (
        <div key={i} className="hero-ticker">
          <div className="hero-ticker-label">
            <span className="hero-ticker-pip" />
            {ticker.label}
          </div>
          <div className="hero-ticker-value">
            <span className="hero-ticker-val">{ticker.value}</span>
            <span className={`hero-ticker-delta${ticker.change.direction !== 'flat' ? ` ${ticker.change.direction}` : ''}`}>
              {ticker.change.text}
            </span>
          </div>
          <div className="hero-ticker-detail">{ticker.detail}</div>
        </div>
      ))}
    </div>
  )
}
