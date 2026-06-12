import type { ReactNode } from 'react'

type SectionProps = {
  n: string
  label: string
  hint: string
  deep?: boolean
  id?: string                  // override anchor id; default = sec-{n}
  children: ReactNode
}

export default function Section({ n, label, hint, deep, id, children }: SectionProps) {
  const anchorId = id ?? `sec-${n}`
  return (
    <div className={`sec${deep ? ' deep' : ''}`} id={anchorId}>
      <div className="label">
        <span className="n">{n}</span>
        <span className="nm-lab">{label}</span>
        <span className="hint">{hint}</span>
      </div>
      <div>{children}</div>
    </div>
  )
}
