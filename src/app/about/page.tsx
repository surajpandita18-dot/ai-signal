import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'About — AI Signal',
  description: 'One story. Every day. Gone in 24 hours. The single most important thing in AI, curated daily.',
  openGraph: {
    title: 'About AI Signal',
    description: 'One story. Every day. Gone in 24 hours.',
    url: 'https://aisignal.so/about',
    siteName: 'AI Signal',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About AI Signal',
    description: 'One story. Every day. Gone in 24 hours.',
  },
}

export default function AboutPage() {
  return (
    <>
      <SiteNav />

      <main className="about-page">

        <Link href="/" className="about-back">
          ← Today&apos;s signal
        </Link>

        {/* Hero */}
        <div className="about-hero">
          <p className="about-kicker">What this is</p>
          <h1 className="about-headline">
            One story.<br />
            <em>Every day.</em><br />
            Gone in 24 hours.
          </h1>
          <p className="about-deck">
            AI Signal is not a roundup. Not a feed. Not a digest. It is one editorial pick — the single most
            important thing that happened in AI in the last 24 hours — published at 06:14 IST, then gone.
          </p>
        </div>

        {/* Section 1 — The constraint */}
        <section className="about-section">
          <div className="about-section-label">01 — The constraint</div>
          <h2 className="about-section-title">The 24-hour window is the product.</h2>
          <div className="about-body">
            <p>
              Most newsletters give you everything. AI Signal gives you one thing — and takes it away.
              That pressure is intentional. If you read it, you read it with urgency. If you missed it,
              you&apos;ll be here tomorrow.
            </p>
            <p>
              The expiry is not a gimmick. It is the editorial spine. It forces a question every morning:
              what is the one development that, if you ignored it, could cost you a decision?
              Everything that doesn&apos;t clear that bar gets cut.
            </p>
            <p>
              If nothing clears the bar, there is no signal that day. A missed day beats a weak pick.
              That choice — to publish nothing rather than publish noise — is the commitment.
            </p>
          </div>
        </section>

        {/* Pull quote */}
        <blockquote className="about-quote">
          <p>
            "One good signal, read before your standup, is worth more than twelve newsletters
            skimmed over the weekend."
          </p>
          <cite>— The editorial principle behind every pick</cite>
        </blockquote>

        {/* Section 2 — The process */}
        <section className="about-section">
          <div className="about-section-label">02 — The process</div>
          <h2 className="about-section-title">Where the signal comes from.</h2>
          <div className="about-body">
            <p>
              Every morning, the scan starts before 05:30 IST. Sources include TLDR AI, The Rundown,
              Ben&apos;s Bites, The Neuron, Stratechery, Latent Space, The Pragmatic Engineer, Hacker News,
              and primary company announcements. The filter is brutal — most days, a hundred things happen
              and none of them qualify.
            </p>
            <p>
              A story qualifies only if it meets all three criteria: it affects how builders and product
              teams make decisions today, it is verifiable from at least one primary source, and it is
              not already priced into the conversation. Timing matters — a story that everyone has
              already processed is not a signal, it is a recap.
            </p>
          </div>

          {/* Process steps */}
          <div className="about-steps">
            <div className="about-step">
              <span className="about-step-num">1</span>
              <div>
                <strong>Scan</strong>
                <p>168+ articles, newsletters, and announcements reviewed each morning.</p>
              </div>
            </div>
            <div className="about-step">
              <span className="about-step-num">2</span>
              <div>
                <strong>Filter</strong>
                <p>One question: does this change a decision a builder is making today?</p>
              </div>
            </div>
            <div className="about-step">
              <span className="about-step-num">3</span>
              <div>
                <strong>Write</strong>
                <p>Signal, data, context, lenses, action. No filler. Sources always credited.</p>
              </div>
            </div>
            <div className="about-step">
              <span className="about-step-num">4</span>
              <div>
                <strong>File at 06:14 IST</strong>
                <p>When the first commit of the day lands in Bengaluru. Before your standup.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Who it's for */}
        <section className="about-section">
          <div className="about-section-label">03 — The reader</div>
          <h2 className="about-section-title">Built for people who ship.</h2>
          <div className="about-body">
            <p>
              AI Signal is written for senior engineers, product managers, and early-stage founders
              in the Indian tech ecosystem — people who are making real decisions about AI in their
              products, teams, and roadmaps. Not spectators.
            </p>
            <p>
              The format reflects that. Every signal comes with a lens for builders, a lens for
              founders, a data section, a counter-view, and three specific actions to take in the
              next 48 hours. It is not a briefing for executives who want to sound informed.
              It is a working document for people who will act on it.
            </p>
          </div>
        </section>

        {/* Section 4 — The person */}
        <section className="about-section">
          <div className="about-section-label">04 — The editor</div>
          <h2 className="about-section-title">Suraj Pandita, Bengaluru.</h2>
          <div className="about-body">
            <p>
              I built AI Signal because I was tired of reading ten newsletters to find one insight
              worth sharing in standup. Every existing option was either too long, too surface-level,
              too American, or too excited about everything equally. So I started picking one thing
              a day and writing it up the way I would explain it to a colleague.
            </p>
            <p>
              I am not a journalist. I am a builder who thinks clearly about what AI actually means
              for products and teams — not in theory, but in the kind of decisions that get made in
              sprint planning and pricing meetings and board decks.
            </p>
            <p>
              Reach out if you have a story tip, a sponsorship conversation, or just want to argue
              about the pick.
            </p>
          </div>

          <div className="about-contact">
            <a
              href="https://linkedin.com/in/surajpandita"
              target="_blank"
              rel="noopener noreferrer"
              className="about-contact-link"
            >
              LinkedIn ↗
            </a>
            <a
              href="mailto:suraj@aisignal.so"
              className="about-contact-link"
            >
              suraj@aisignal.so ↗
            </a>
            <a
              href="https://twitter.com/surajpandita"
              target="_blank"
              rel="noopener noreferrer"
              className="about-contact-link"
            >
              @surajpandita ↗
            </a>
          </div>
        </section>

        {/* CTA */}
        <div className="about-cta">
          <p className="about-cta-text">
            Tomorrow&apos;s signal drops at 06:14 IST.
          </p>
          <Link href="/#subscribe" className="about-cta-btn">
            Get the signal →
          </Link>
        </div>

      </main>

      <SiteFooter />
    </>
  )
}
