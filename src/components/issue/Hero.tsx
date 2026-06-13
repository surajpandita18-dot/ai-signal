import type { TldrRow } from '@/lib/content-model'

type HeroProps = {
  eyebrow: string
  headlineHtml: string
  subHtml: string
  tldr: TldrRow[]
}

function targetHref(target?: string): string | null {
  if (!target) return null
  if (/^0[1-8]$/.test(target)) return `#sec-${target}`
  if (target === 'bn' || target === 'decoder' || target === 'closer') {
    return `#${target}`
  }
  return null
}

export default function Hero({ eyebrow, headlineHtml, subHtml, tldr }: HeroProps) {
  return (
    <div className="hero">
      <div className="eyebrow">{eyebrow}</div>
      <h1
        style={{ overflowWrap: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: headlineHtml }}
      />
      <p className="sub" dangerouslySetInnerHTML={{ __html: subHtml }} />
      <div className="tldr">
        <div className="t-lab">In This Issue</div>
        <ul>
          {tldr.map((item, i) => {
            const href = targetHref(item.target)
            const inner = (
              <>
                <b>{item.label}</b>
                <span>{item.body}</span>
              </>
            )
            return (
              <li key={i}>
                {href ? (
                  <a
                    href={href}
                    style={{
                      display: 'contents',
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
