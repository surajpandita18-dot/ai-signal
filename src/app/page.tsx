import Link from 'next/link'
import SubscribeForm from './subscribe-form'

export default function LandingPage() {
  return (
    <main className="issue">
      <div className="grid">
        <header className="mast">
          <div className="brand">
            <Link
              href="/"
              style={{ textDecoration: 'none' }}
              className="wordmark"
            >
              AI, Basically<span className="dot">.</span>
            </Link>
            <span className="tagline">Explained like a normal person would.</span>
          </div>
          <div className="meta">
            Weekly · Saturday 08:00 IST
          </div>
        </header>

        <section className="hero">
          <div className="eyebrow">Weekly · No hype</div>
          <h1>
            AI changed overnight.<br />
            Here&rsquo;s <em>what it means for your week.</em>
          </h1>
          <p className="sub">
            One curated read every Saturday. The one shift in AI that actually
            mattered this week, in plain language, with the &ldquo;so what do I
            do on Monday&rdquo; spelled out. No hype, no takes, no &ldquo;10
            tools you must try.&rdquo;
          </p>
          <SubscribeForm />
          <p
            style={{
              marginTop: 14,
              fontFamily: "'Archivo Narrow', sans-serif",
              fontSize: 13,
              letterSpacing: '.04em',
              color: 'var(--accent)',
            }}
          >
            Or{' '}
            <Link
              href="/i/001?preview=1"
              style={{ color: 'var(--accent)' }}
            >
              read last Saturday&rsquo;s issue first &rarr;
            </Link>
          </p>
        </section>

        <section className="sec">
          <div className="label">
            <span className="nm-lab">What you get</span>
            <span className="hint">
              Four small promises. Kept every week.
            </span>
          </div>
          <div>
            <ul className="steps" style={{ listStyle: 'none', display: 'grid', gap: 14, fontFamily: "'Newsreader', serif", fontSize: 16, lineHeight: 1.65 }}>
              <li>
                <b style={{ fontWeight: 600 }}>One thing, not ten.</b> The single
                shift in AI this week that&rsquo;s worth your attention.
              </li>
              <li>
                <b style={{ fontWeight: 600 }}>What to actually do.</b> A
                concrete next move, sized for a normal week.
              </li>
              <li>
                <b style={{ fontWeight: 600 }}>Notes from inside production.</b> A
                paper, a code snippet, a metric &mdash; the part most readers
                pay for, free here.
              </li>
              <li>
                <b style={{ fontWeight: 600 }}>India signal.</b> What&rsquo;s
                shipping locally that the global press isn&rsquo;t covering.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}
