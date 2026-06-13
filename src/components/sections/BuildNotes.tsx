import type { BuildNotes as BuildNotesType } from '@/lib/content-model'
import Fold from '@/components/interactive/Fold'
import CodeCopy from '@/components/interactive/CodeCopy'

// If the link is missing / '#' / empty, render label as plain text instead of
// pretending it links somewhere. Voice rule: no placeholder hrefs in prod.
function maybeLink(
  href: string | undefined,
  text: string,
  style: React.CSSProperties = {},
) {
  if (!href || href === '#' || href.trim() === '') {
    return <span style={style}>{text}</span>
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
      {text}
    </a>
  )
}

export default function BuildNotes({
  title,
  paper_ref,
  paper_link,
  eval_link,
  skim_html,
  struggle_html,
  finding_html,
  metric_html,
  ship_this_week_html,
  code,
  diagram_svg,
}: BuildNotesType) {
  const hasPaper = paper_link && paper_link !== '#'
  const hasEval = eval_link && eval_link !== '#'

  return (
    <div className="buildnotes" id="bn">
      <div className="grid">
        <div className="bn-top">
          Build Notes <span className="tag">Nerd Lane · non-tech? skip to §4, no guilt</span>
        </div>
        <h2>{title}</h2>
        <div className="paper">
          ▸ unpacked from: {paper_ref}
          {hasPaper ? (
            <>
              {' '}·{' '}
              {maybeLink(paper_link, 'paper + eval ↓', { color: '#C6DCC9' })}
            </>
          ) : null}
        </div>
        <p className="bn-skim" dangerouslySetInnerHTML={{ __html: skim_html }} />
        <Fold
          buttonClass="bn-foldbtn"
          closedLabel="▸ Open the full breakdown + diagram"
          openLabel="▾ Collapse breakdown"
          foldClassName="bn-fold"
        >
          <div className="bn-grid">
            <div className="bn-box">
              <div className="h">The struggle you know</div>
              <p dangerouslySetInnerHTML={{ __html: struggle_html }} />
            </div>
            <div className="bn-box">
              <div className="h">What the paper found</div>
              <p dangerouslySetInnerHTML={{ __html: finding_html }} />
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: diagram_svg }} />
          <div className="bn-takeaway">
            <b>The fix that actually shipped</b>
            <span dangerouslySetInnerHTML={{ __html: metric_html }} />
          </div>
          <div className="bn-takeaway" style={{ borderTop: 'none', paddingTop: 6 }}>
            <b>Ship this week · copy-paste this</b>
            <span dangerouslySetInnerHTML={{ __html: ship_this_week_html }} />
            <div className="codeblock">
              <CodeCopy code={code.body} />
              <pre
                tabIndex={0}
                aria-label={`${code.lang ?? 'code'} snippet`}
              >
                {code.body}
              </pre>
            </div>
          </div>
          {(hasPaper || hasEval) && (
            <div className="bn-link">
              {hasPaper ? <>▸ {maybeLink(paper_link, 'read the paper')}</> : null}
              {hasPaper && hasEval ? '  ·  ' : null}
              {hasEval ? <>▸ {maybeLink(eval_link, 'full eval harness')}</> : null}
            </div>
          )}
        </Fold>
      </div>
    </div>
  )
}
