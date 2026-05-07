import type { PreviewCard } from '@/lib/types/extended-data'

interface HeroPreviewStripProps {
  cards: PreviewCard[]
}

export function HeroPreviewStrip({ cards }: HeroPreviewStripProps) {
  if (cards.length === 0) return null

  return (
    <div className="hero-preview-strip anim d5">
      {cards.map((card) => (
        <div key={card.index} className="hero-preview-card">
          <div className="hero-preview-header">
            <div className="hero-preview-icon">{card.index}</div>
            <span className="preview-label">{card.label}</span>
          </div>
          <span className="preview-value">{card.value}</span>
        </div>
      ))}
    </div>
  )
}
