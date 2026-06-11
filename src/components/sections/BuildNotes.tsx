import type { BuildNotes as BuildNotesType } from '@/lib/content-model'

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
  return (
    <div className="buildnotes">
      <div className="grid">
        <div className="bn-top">
          Build Notes <span className="tag">Nerd Lane · non-tech? skip to §4, no guilt</span>
        </div>
        <h2>{title}</h2>
        <div className="paper">
          ▸ unpacked from: {paper_ref} ·{' '}
          <a href={paper_link} style={{ color: '#C6DCC9' }}>
            paper + 12-line eval script ↓
          </a>
        </div>
        <p className="bn-skim" dangerouslySetInnerHTML={{ __html: skim_html }} />
        <button className="bn-foldbtn" aria-expanded="false">
          ▸ Open the full breakdown + diagram
        </button>
        <div className="bn-fold">
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
              <button className="codecopy" aria-label="Copy">
                ⧉ copy
              </button>
              <pre>{code.body}</pre>
            </div>
          </div>
          <div className="bn-link">
            ▸ <a href={paper_link}>read the paper</a> &nbsp;·&nbsp; ▸{' '}
            <a href={eval_link}>full eval harness</a>
          </div>
        </div>
      </div>
    </div>
  )
}
