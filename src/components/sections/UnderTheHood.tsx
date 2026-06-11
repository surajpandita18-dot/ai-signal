import type { UnderTheHood as UnderTheHoodType } from '@/lib/content-model'
import Fold from '@/components/interactive/Fold'

export default function UnderTheHood({
  question_html,
  diagram_svg,
  steps,
  source,
}: UnderTheHoodType) {
  return (
    <div className="hood">
      <p className="q" dangerouslySetInnerHTML={{ __html: question_html }} />
      <div dangerouslySetInnerHTML={{ __html: diagram_svg }} />
      <Fold
        buttonClass="foldbtn"
        closedLabel="▸ Read deeper — the 3 steps (adds ~2 min)"
        openLabel="▾ Hide the deep dive"
        foldClassName="deepfold"
      >
        <div className="hood-steps">
          {steps.map((s) => (
            <div key={s.n} className="hstep">
              <span className="hn">{s.n}</span>
              <div>
                <b>{s.title}</b>
                <p dangerouslySetInnerHTML={{ __html: s.body_html }} />
              </div>
            </div>
          ))}
        </div>
      </Fold>
      <p className="souse">
        {source.text} · <a href={source.link}>read the paper →</a>
      </p>
    </div>
  )
}
