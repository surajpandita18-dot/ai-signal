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
            <a
              href="/"
              style={{ textDecoration: 'none' }}
              className="wordmark"
            >
              AI, Basically<span className="dot">.</span>
            </a>
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
              Suraj Pandita. PM background, now building solo. I&rsquo;m not
              a researcher and I don&rsquo;t pretend to be. I read a lot,
              talk to people who ship, and try to write the version I
              wish someone had sent me when I was getting started.
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
      </div>
    </main>
  )
}
