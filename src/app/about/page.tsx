import Link from 'next/link'

export const metadata = {
  title: 'About — AI, Basically.',
  description:
    'Who writes this, why it exists, and how the curation works.',
}

export default function AboutPage() {
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
            <span className="tagline">About</span>
          </div>
          <div className="meta">Weekly · Saturday 08:00 IST</div>
        </header>

        <section className="hero">
          <div className="eyebrow">About</div>
          <h1>
            One newsletter,<br />
            written like a <em>normal person.</em>
          </h1>
          <p className="sub">
            Most AI writing is for the people who already know. This one is
            for the rest of us &mdash; builders, PMs, switchers, anyone who
            wants to know what changed this week without reading twenty
            threads to figure it out.
          </p>
        </section>

        <section className="sec">
          <div className="label">
            <span className="nm-lab">Why this exists</span>
          </div>
          <div className="lede">
            <p>
              Every week, AI moves fast enough that a few of the moves
              actually matter and most of them don&rsquo;t. I write down the
              one that did, what it means in plain language, and what to
              actually do about it on Monday morning.
            </p>
          </div>
        </section>

        <section className="sec">
          <div className="label">
            <span className="nm-lab">Who&rsquo;s behind it</span>
          </div>
          <div className="lede">
            <p>
              <b>Suraj Pandita.</b> Product manager by day, this newsletter
              by Saturday morning. Eight years building products &mdash;{' '}
              <b>ex-Zomato, ex-BluSmart, ex-Gnani.ai</b> &mdash; now building{' '}
              <em>AI, Basically.</em> solo. I&rsquo;m not a researcher and I
              don&rsquo;t pretend to be. I read a lot, talk to people who
              actually ship AI to production, and write the version of this
              brief I wish someone had sent me when I was figuring it out
              myself.
            </p>
            <p style={{ marginTop: 14 }}>
              Based in Bengaluru, writing India-leaning on purpose. The
              global AI press writes for Bay Area readers; the India tech
              press doesn&rsquo;t always go deep on AI. There&rsquo;s a gap
              there. This is my attempt at filling part of it &mdash; one
              calm, honest issue every Saturday.
            </p>
            <p style={{ marginTop: 14 }}>
              The fastest way to find me:{' '}
              <a
                href="https://www.linkedin.com/in/surajpandita/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', fontWeight: 600 }}
              >
                linkedin.com/in/surajpandita
              </a>
              . Or reply to any issue &mdash; same inbox, same person.
            </p>
          </div>
        </section>

        <section className="sec">
          <div className="label">
            <span className="nm-lab">How the curation works</span>
          </div>
          <div className="lede">
            <p>
              I read about thirty newsletters, twenty papers, and an
              embarrassing amount of X every week. Then I pick the one thing
              that actually shifted &mdash; not the loudest, the most
              consequential. If a week doesn&rsquo;t have one, I&rsquo;ll
              tell you that too, instead of inventing one.
            </p>
          </div>
        </section>

        <section className="sec">
          <div className="label">
            <span className="nm-lab">Philosophy</span>
          </div>
          <div className="lede">
            <p>
              The bar is taste, not coverage. Most AI newsletters chase
              volume &mdash; fifteen tools, ten papers, twenty links a week.
              This one chases the single thing that mattered, and explains
              it the way your friend would over chai.
            </p>
            <p style={{ marginTop: 14 }}>
              Three things this is <em>not</em>:
            </p>
            <p style={{ marginTop: 10 }}>
              <b>Not a briefing service.</b> Briefings make you informed.
              This makes you decide.
            </p>
            <p style={{ marginTop: 8 }}>
              <b>Not a trend piece.</b> Trends are explanations after the
              fact. This is a heads-up before.
            </p>
            <p style={{ marginTop: 8 }}>
              <b>Not a FOMO machine.</b> FOMO is a tax on your attention.
              This pays it back.
            </p>
            <p style={{ marginTop: 14 }}>
              If a week&rsquo;s news doesn&rsquo;t clear the bar, the issue
              stays short. Some weeks the only honest answer is
              &ldquo;wait, that&rsquo;s it.&rdquo; Saying that is part of
              the job.
            </p>
          </div>
        </section>

        <section className="sec">
          <div className="label">
            <span className="nm-lab">How to reach me</span>
          </div>
          <div className="lede">
            <p>
              Reply to any issue and it lands in my inbox. Or email{' '}
              <a
                href="mailto:hello@aibasically.co"
                style={{ color: 'var(--accent)' }}
              >
                hello@aibasically.co
              </a>
              . I read everything, and I reply to most of it.
            </p>
          </div>
        </section>

        <section className="sec">
          <div className="label">
            <span className="nm-lab">Read one first</span>
          </div>
          <div className="lede">
            <p>Want to see how it reads?</p>
            <p style={{ marginTop: 14 }}>
              <Link
                href="/i/001?preview=1"
                style={{
                  display: 'inline-block',
                  padding: '11px 18px',
                  background: 'var(--ink)',
                  color: '#fff',
                  border: '1px solid var(--ink)',
                  fontFamily: "'Archivo Narrow', sans-serif",
                  fontWeight: 600,
                  fontSize: 12.5,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                Read last Saturday&rsquo;s issue &rarr;
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
