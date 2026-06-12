// Welcome email sent the moment someone subscribes.
// Sister to emails/IssueEmail.tsx. Same render constraints:
//   - table layout via @react-email/components
//   - Georgia / Helvetica only (no web fonts)
//   - inline styles
//   - no <script>, no external images
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

type WelcomeEmailProps = {
  siteUrl?: string
  unsubscribeToken?: string
}

const INK = '#191712'
const ACCENT = '#9C4A2E'
const GREY = '#7d776c'
const HAIR = '#DCD6C8'

export default function WelcomeEmail({
  siteUrl,
  unsubscribeToken,
}: WelcomeEmailProps) {
  const site = siteUrl ?? 'https://ai-signal-eta.vercel.app'
  const unsubLink = `${site}/u/${unsubscribeToken ?? 'UNSUB_TOKEN'}`

  return (
    <Html lang="en">
      <Head>
        <title>AI, Basically. — you&apos;re in.</title>
      </Head>
      <Preview>One newsletter every Saturday at 8 AM IST. No hype.</Preview>
      <Body
        style={{
          backgroundColor: '#fff',
          color: INK,
          fontFamily: "Georgia, 'Times New Roman', serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: 600,
            margin: '0 auto',
            padding: '0 26px 26px',
          }}
        >
          {/* Masthead */}
          <Section
            style={{
              borderBottom: `2px solid ${INK}`,
              padding: '20px 0 14px',
            }}
          >
            <Text
              style={{
                margin: 0,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontWeight: 'bold',
                fontSize: 18,
                color: INK,
                letterSpacing: '-.3px',
              }}
            >
              AI, Basically
              <span style={{ color: ACCENT }}>.</span>
            </Text>
          </Section>

          {/* Hero */}
          <Heading
            as="h1"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 30,
              fontWeight: 'bold',
              letterSpacing: '-.01em',
              lineHeight: 1.1,
              padding: '22px 0 8px',
              margin: 0,
              color: INK,
            }}
          >
            You&rsquo;re in.
          </Heading>
          <Text
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: 'italic',
              color: '#5a574e',
              fontSize: 14.5,
              lineHeight: 1.55,
              paddingBottom: 16,
              margin: 0,
            }}
          >
            One newsletter, every Saturday at 8 AM IST. No hype, no FOMO, no
            &ldquo;10 tools you must try.&rdquo;
          </Text>

          {/* Body */}
          <Section
            style={{
              padding: '20px 0',
              borderBottom: `1px solid ${HAIR}`,
            }}
          >
            <Text
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 15,
                lineHeight: 1.68,
                margin: '0 0 12px',
              }}
            >
              Every Saturday morning you&rsquo;ll get the single shift in AI
              that actually mattered that week — explained like a normal person
              would, with the &ldquo;so what do I do on Monday&rdquo; spelled out.
            </Text>
            <Text
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 15,
                lineHeight: 1.68,
                margin: '0 0 12px',
              }}
            >
              Skim it in five minutes, or go deep in twelve. Your call. There
              are four reader tracks — Builder, Product / Biz, Secure Pro, and
              Switcher — and each issue serves all four.
            </Text>
            <Text
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 15,
                lineHeight: 1.68,
                margin: '0 0 12px',
              }}
            >
              The first issue you&rsquo;ll see is the one shipping this
              Saturday. While you wait, you can{' '}
              <Link
                href={`${site}/i/001`}
                style={{ color: ACCENT, textDecoration: 'underline' }}
              >
                read last week&rsquo;s
              </Link>{' '}
              or{' '}
              <Link
                href={`${site}/archive`}
                style={{ color: ACCENT, textDecoration: 'underline' }}
              >
                browse the archive
              </Link>
              .
            </Text>
            <Text
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 15,
                lineHeight: 1.68,
                margin: '0',
              }}
            >
              Reply to any issue. I read them all.
            </Text>
          </Section>

          {/* Sign-off */}
          <Section style={{ padding: '20px 0' }}>
            <Text
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                fontSize: 14.5,
                color: '#5a574e',
                margin: 0,
              }}
            >
              — Suraj
            </Text>
          </Section>

          {/* Footer */}
          <Section
            style={{
              borderTop: `1px solid ${HAIR}`,
              paddingTop: 16,
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: 10.5,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: GREY,
            }}
          >
            <Text style={{ margin: 0, color: GREY, fontSize: 10.5 }}>
              Saturday · 8:00 IST ·{' '}
              <Link href={unsubLink} style={{ color: ACCENT }}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
