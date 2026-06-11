import type { Closer as CloserType } from '@/lib/content-model'
import ShareCardButton from '@/components/interactive/ShareCardButton'

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

export default function Closer({ format_label, body_html }: CloserType) {
  const plainText = stripHtml(body_html)
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
          <ShareCardButton text={plainText} />
        </div>
      </div>
    </div>
  )
}
