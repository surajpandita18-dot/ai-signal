interface HeroBridgeProps {
  text?: string
}

export function HeroBridge({ text = "Today's signal" }: HeroBridgeProps) {
  return (
    <div className="hero-bridge anim d5">
      <span className="hero-bridge-text">{text}</span>
      <span className="hero-bridge-line" aria-hidden="true" />
    </div>
  )
}
