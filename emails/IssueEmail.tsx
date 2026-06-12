/**
 * IssueEmail — Gmail/Apple-Mail safe twin of the web issue.
 * Renders the same IssueContent prop as the web page.
 * Inline styles only. No Tailwind. No external CSS. No web fonts.
 * Width: 600px max. Match the `.email` block in
 * ~/Downloads/ai-basically-FINAL.html verbatim in structure + styling.
 *
 * Template tokens the send pipeline must replace per-recipient:
 *   - YOUR_CODE  — referral code (in the referral CTA href)
 *   - UNSUB_TOKEN — unsubscribe token (in the footer unsubscribe href)
 */

import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Link,
  Hr,
  Preview,
} from '@react-email/components'
import type { IssueContent } from '../src/lib/content-model'

type Props = {
  content: IssueContent
  siteUrl?: string
}

// ----------------------------------------------------------------------------
// renderInlineHtml — tiny regex tokenizer for the subset of inline markup that
// the content_html strings carry: <em>, <strong>, <b>, <br>, <code>, and the
// single span variant <span class="punch">…</span>. Everything else is escaped
// to plain text. NO dependency on a parser. NO dangerouslySetInnerHTML.
// ----------------------------------------------------------------------------

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'open'; tag: string; cls?: string }
  | { kind: 'close'; tag: string }
  | { kind: 'br' }

function tokenize(html: string): Token[] {
  const tokens: Token[] = []
  // Accept any attributes (style="…", class="…", etc.) on the whitelisted
  // inline tags. Previously only matched a bare `class="…"`, which meant a
  // tag like `<b style="color:#fff">` leaked through as literal text. We
  // still only render class — other attrs are ignored, not echoed.
  const re =
    /<(\/?)(em|strong|b|i|code|br|span)(\s[^>]*)?\s*\/?>/gi
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) {
      tokens.push({ kind: 'text', value: html.slice(last, m.index) })
    }
    const closing = m[1] === '/'
    const tag = m[2].toLowerCase()
    if (tag === 'br') {
      tokens.push({ kind: 'br' })
    } else if (closing) {
      tokens.push({ kind: 'close', tag })
    } else {
      const attrs = m[3] || ''
      const classMatch = /class="([^"]*)"/i.exec(attrs)
      tokens.push({
        kind: 'open',
        tag,
        cls: classMatch ? classMatch[1] : undefined,
      })
    }
    last = re.lastIndex
  }
  if (last < html.length) tokens.push({ kind: 'text', value: html.slice(last) })
  return tokens
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function renderInlineHtml(html: string): React.ReactNode {
  if (!html) return null
  const tokens = tokenize(html)
  const out: React.ReactNode[] = []
  // Stack of open tags so we can wrap children inside the right element.
  // We build a flat list because email-safe HTML doesn't need deep nesting.
  type Frame = { tag: string; cls?: string; children: React.ReactNode[] }
  const root: Frame = { tag: 'root', children: [] }
  const stack: Frame[] = [root]
  const top = () => stack[stack.length - 1]
  let key = 0

  for (const t of tokens) {
    if (t.kind === 'text') {
      if (t.value.length > 0) top().children.push(decodeEntities(t.value))
    } else if (t.kind === 'br') {
      top().children.push(<br key={`br-${key++}`} />)
    } else if (t.kind === 'open') {
      stack.push({ tag: t.tag, cls: t.cls, children: [] })
    } else if (t.kind === 'close') {
      // Pop matching tag if found; otherwise ignore (drop stray).
      const frame = stack.pop()
      if (!frame || frame.tag === 'root') {
        // stray close — drop
        if (frame && frame.tag === 'root') stack.push(frame)
        continue
      }
      const node = wrap(frame.tag, frame.cls, frame.children, key++)
      top().children.push(node)
    }
  }
  // If anything remained open, flush it as inline text.
  while (stack.length > 1) {
    const frame = stack.pop()!
    const node = wrap(frame.tag, frame.cls, frame.children, key++)
    top().children.push(node)
  }
  for (let i = 0; i < root.children.length; i++) {
    out.push(<React.Fragment key={i}>{root.children[i]}</React.Fragment>)
  }
  return out
}

function wrap(
  tag: string,
  cls: string | undefined,
  children: React.ReactNode[],
  key: number,
): React.ReactNode {
  const k = `${tag}-${key}`
  switch (tag) {
    case 'em':
      return (
        <span key={k} style={{ fontStyle: 'italic', color: '#9C4A2E' }}>
          {children}
        </span>
      )
    case 'i':
      return (
        <span key={k} style={{ fontStyle: 'italic' }}>
          {children}
        </span>
      )
    case 'strong':
    case 'b':
      return (
        <strong key={k} style={{ fontWeight: 'bold' }}>
          {children}
        </strong>
      )
    case 'code':
      return (
        <code
          key={k}
          style={{
            fontFamily: "'Courier New', monospace",
            background: '#0c1a13',
            padding: '1px 5px',
            color: '#A2C2AC',
            fontSize: 12,
          }}
        >
          {children}
        </code>
      )
    case 'span':
      if (cls && cls.split(/\s+/).includes('punch')) {
        return (
          <span key={k} style={{ color: '#C8794B' }}>
            {children}
          </span>
        )
      }
      return <span key={k}>{children}</span>
    default:
      // Unknown tag — escape into plain text.
      return (
        <span key={k}>
          {`<${tag}>`}
          {children}
          {`</${tag}>`}
        </span>
      )
  }
}

// Strip every tag from an HTML string. Used for the preview line and for
// turning headlines into plain text where needed.
function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ''))
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = 'Helvetica, Arial, sans-serif'

const INK = '#191712'
const ACCENT = '#9C4A2E'
const CLAY = '#B5683E'
const FAINT = '#ECE7DA'
const HAIR = '#DCD6C8'
const GREY = '#7d776c'
const DARK_BAND = '#14241C'

// Shared body-text + section rhythm. Every <Text> that carries normal
// running copy should use BODY_TEXT so the rhythm stays uniform. Every
// numbered section uses SECTION_STYLE. Banded/boxed sections use
// INNER_PADDING. The container's own horizontal padding (18px) is the
// only outer gutter; banded sections add their own to inset content.
const BODY_FONT_SIZE = 15
const BODY_LINE_HEIGHT = 1.68
const SECTION_PADDING = '20px 0'
const INNER_PADDING = '14px 18px'
const SAFE_WRAP: React.CSSProperties = {
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  padding: '0 18px',
  background: '#F4F1E8',
  color: INK,
  fontFamily: SERIF,
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  background: '#F4F1E8',
  color: INK,
  fontFamily: SERIF,
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 10.5,
  fontWeight: 'bold',
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: INK,
  ...SAFE_WRAP,
}

const sectionStyle: React.CSSProperties = {
  padding: SECTION_PADDING,
  borderBottom: `1px solid ${HAIR}`,
}

const bodyTextStyle: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: BODY_FONT_SIZE,
  lineHeight: BODY_LINE_HEIGHT,
  color: INK,
  margin: '10px 0 0',
  ...SAFE_WRAP,
}

const hintStyle: React.CSSProperties = {
  fontWeight: 'normal',
  letterSpacing: '.02em',
  textTransform: 'none',
  color: GREY,
  fontSize: 11,
}

function SectionLabel({
  n,
  name,
  hint,
}: {
  n?: string
  name: string
  hint?: string
}) {
  return (
    <div style={sectionLabelStyle}>
      {n ? (
        <i
          style={{
            fontStyle: 'normal',
            color: ACCENT,
            marginRight: 6,
          }}
        >
          {n}
        </i>
      ) : null}
      {name}
      {hint ? <span style={hintStyle}> {hint}</span> : null}
    </div>
  )
}

export default function IssueEmail({ content, siteUrl }: Props) {
  const SITE =
    siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'

  // Preview text — the first TLDR is hand-tightened by the editor and is the
  // strongest single sentence in the email. Fall back to the hero sub if the
  // TLDR is short / missing.
  const firstTldrBody = content.tldr?.[0]?.body?.trim() ?? ''
  const previewText = (
    firstTldrBody.length >= 20 ? firstTldrBody : stripTags(content.hero_sub_html)
  ).slice(0, 120)

  const primaryLens = content.so_what.lenses.find((l) => l.is_primary)
  const otherLenses = content.so_what.lenses.filter((l) => !l.is_primary)

  const bn = content.build_notes
  const job = content.job_signal
  const hood = content.under_the_hood
  const rep = content.the_rep
  const tb = content.toolbox
  const rc = content.reality_check
  const india = content.india_signal
  const sponsor = content.sponsor
  const closer = content.closer

  return (
    <Html lang="en">
      <Head>
        <title>{`AI, Basically. — Issue ${content.slug}`}</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* ---------- Masthead ---------- */}
          <Section
            style={{
              borderBottom: `2px solid ${INK}`,
              padding: '20px 0 14px',
            }}
          >
            <Row>
              <Column align="left" style={{ verticalAlign: 'middle' }}>
                <span
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: INK,
                    letterSpacing: '-0.3px',
                    ...SAFE_WRAP,
                  }}
                >
                  AI, Basically<span style={{ color: ACCENT }}>.</span>
                </span>
              </Column>
              <Column align="right" style={{ verticalAlign: 'middle' }}>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: GREY,
                    ...SAFE_WRAP,
                  }}
                >
                  {`#${content.slug} · ${content.date_display}`}
                  <br />
                  <Link
                    href={`${SITE}/i/${content.slug}`}
                    style={{ color: GREY, textDecoration: 'underline' }}
                  >
                    Open in browser
                  </Link>
                </span>
              </Column>
            </Row>
          </Section>

          {/* ---------- Hero headline ---------- */}
          <Heading
            as="h1"
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              fontWeight: 'bold',
              letterSpacing: '-0.005em',
              lineHeight: 1.12,
              padding: '22px 0 8px',
              margin: 0,
              color: INK,
              ...SAFE_WRAP,
            }}
          >
            {renderInlineHtml(content.hero_headline_html)}
          </Heading>

          {/* ---------- Sub ---------- */}
          <Text
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              color: '#5a574e',
              fontSize: 14.5,
              lineHeight: 1.55,
              padding: 0,
              margin: '0 0 16px',
              ...SAFE_WRAP,
            }}
          >
            {renderInlineHtml(content.hero_sub_html)}
          </Text>

          {/* ---------- TLDR ---------- */}
          <Section
            style={{
              border: `1px solid ${INK}`,
              padding: INNER_PADDING,
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 'bold',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: GREY,
                margin: '0 0 8px',
              }}
            >
              In this issue
            </Text>
            {content.tldr.map((row, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: SERIF,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  margin: '6px 0',
                  color: INK,
                  ...SAFE_WRAP,
                }}
              >
                <b style={{ color: ACCENT }}>{row.label} &rarr;</b> {row.body}
              </Text>
            ))}
          </Section>

          {/* ---------- 01 The One Thing ---------- */}
          <Section style={sectionStyle}>
            <SectionLabel n="01" name="The One Thing" hint="— the one that matters" />
            <Text style={bodyTextStyle}>
              {renderInlineHtml(content.one_thing.lede_html)}
            </Text>
            <Section
              style={{
                borderLeft: `5px solid ${CLAY}`,
                background: FAINT,
                padding: '12px 14px',
                marginTop: 12,
                fontSize: 13,
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: INK,
                  ...SAFE_WRAP,
                }}
              >
                <b
                  style={{
                    color: CLAY,
                    fontSize: 10,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 3,
                  }}
                >
                  {content.one_thing.skip_list.title}
                </b>
                {content.one_thing.skip_list.body}
              </Text>
            </Section>
          </Section>

          {/* ---------- 02 So What For Me ---------- */}
          <Section style={sectionStyle}>
            <SectionLabel
              n="02"
              name="So What For Me"
              hint="— find your track"
            />
            {primaryLens ? (
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 14.5,
                  padding: '10px 0',
                  lineHeight: 1.6,
                  margin: 0,
                  color: INK,
                  ...SAFE_WRAP,
                }}
              >
                <b style={{ color: ACCENT }}>
                  &#9632; {primaryLens.label.toUpperCase()} &rarr;
                </b>{' '}
                {renderInlineHtml(primaryLens.body_html)}
                <span
                  style={{
                    display: 'block',
                    fontWeight: 'bold',
                    fontSize: 12.5,
                    marginTop: 3,
                  }}
                >
                  {primaryLens.action}
                </span>
              </Text>
            ) : null}
            {otherLenses.map((lens) => (
              <Text
                key={lens.role}
                style={{
                  fontFamily: SERIF,
                  fontSize: 14.5,
                  padding: '10px 0',
                  lineHeight: 1.6,
                  borderTop: `1px solid #E4DFD2`,
                  margin: 0,
                  color: INK,
                  ...SAFE_WRAP,
                }}
              >
                <b style={{ color: GREY }}>{lens.label.toUpperCase()} &rarr;</b>{' '}
                {renderInlineHtml(lens.body_html)}
                {lens.action ? (
                  <span
                    style={{
                      display: 'block',
                      fontWeight: 'bold',
                      fontSize: 12.5,
                      marginTop: 3,
                      color: INK,
                    }}
                  >
                    {lens.action}
                  </span>
                ) : null}
              </Text>
            ))}
          </Section>

          {/* ---------- Build Notes (unnumbered dark band) ---------- */}
          <Section
            style={{
              background: DARK_BAND,
              color: '#E6EEE7',
              padding: INNER_PADDING,
              margin: '4px 0',
            }}
          >
            <Text
              style={{
                fontFamily: "'Courier New', monospace",
                color: '#86B098',
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                margin: '0 0 6px',
                ...SAFE_WRAP,
              }}
            >
              <b style={{ color: ACCENT }}>&lt;/&gt; BUILD NOTES</b> &middot; for
              people shipping AI to prod
            </Text>
            <Heading
              as="h4"
              style={{
                color: '#fff',
                fontSize: 16,
                margin: '0 0 8px',
                fontFamily: SERIF,
                fontWeight: 'bold',
                ...SAFE_WRAP,
              }}
            >
              {bn.title}
            </Heading>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                lineHeight: 1.65,
                color: '#DCE7DD',
                margin: 0,
                ...SAFE_WRAP,
              }}
            >
              {renderInlineHtml(bn.skim_html)}
            </Text>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                lineHeight: 1.65,
                color: '#DCE7DD',
                margin: '8px 0 0',
                ...SAFE_WRAP,
              }}
            >
              {renderInlineHtml(bn.fix_html)}
            </Text>
            <Section
              style={{
                borderTop: '1px solid #2a4633',
                marginTop: 10,
                paddingTop: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: '#E6EEE7',
                  margin: 0,
                  fontFamily: SERIF,
                  lineHeight: 1.55,
                  ...SAFE_WRAP,
                }}
              >
                <b style={{ color: ACCENT }}>Ship this week: </b>
                {renderInlineHtml(bn.ship_this_week_html)}
              </Text>
              {bn.metric_html ? (
                <Text
                  style={{
                    fontSize: 13,
                    color: '#A2C2AC',
                    margin: '8px 0 0',
                    fontFamily: SERIF,
                    fontStyle: 'italic',
                    lineHeight: 1.55,
                    ...SAFE_WRAP,
                  }}
                >
                  {renderInlineHtml(bn.metric_html)}
                </Text>
              ) : null}
            </Section>
            {/* SVG diagram intentionally skipped in email — short alt note: */}
            <Text
              style={{
                fontSize: 11,
                color: '#86B098',
                margin: '10px 0 0',
                fontFamily: "'Courier New', monospace",
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                ...SAFE_WRAP,
              }}
            >
              Diagram in the browser version &rarr;{' '}
              <Link
                href={`${SITE}/i/${content.slug}`}
                style={{ color: '#A2C2AC' }}
              >
                open issue
              </Link>
            </Text>
          </Section>

          {/* ---------- 03 Job Signal ---------- */}
          <Section style={sectionStyle}>
            <SectionLabel
              n="03"
              name="Job Signal"
              hint="— jobs, money, interviews"
            />
            {/* Spotlight */}
            <Section
              style={{
                border: `1px solid ${INK}`,
                padding: INNER_PADDING,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: ACCENT,
                  margin: 0,
                  lineHeight: 1.1,
                  ...SAFE_WRAP,
                }}
              >
                {job.spotlight.stat}
              </Text>
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 13,
                  fontWeight: 'bold',
                  margin: '4px 0 0',
                  color: INK,
                  ...SAFE_WRAP,
                }}
              >
                {job.spotlight.stat_sub}
              </Text>
              <Text
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  color: GREY,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  margin: '6px 0 0',
                  ...SAFE_WRAP,
                }}
              >
                Source: {job.spotlight.source}
              </Text>
            </Section>
            {/* Interview */}
            <Section
              style={{
                border: `1px dashed ${ACCENT}`,
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  background: ACCENT,
                  color: '#fff',
                  padding: '10px 10px',
                  fontWeight: 'bold',
                  fontSize: 14,
                  margin: 0,
                  fontFamily: SERIF,
                  lineHeight: 1.4,
                  ...SAFE_WRAP,
                }}
              >
                <small
                  style={{
                    display: 'block',
                    fontWeight: 'normal',
                    fontSize: 10,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    opacity: 0.9,
                    marginBottom: 3,
                    fontFamily: SANS,
                  }}
                >
                  {job.interview.q_label}
                </small>
                {job.interview.q}
              </Text>
              <Text
                style={{
                  padding: '10px 10px',
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  margin: 0,
                  fontFamily: SERIF,
                  color: INK,
                  ...SAFE_WRAP,
                }}
              >
                {job.interview.steps.map((s, i) => (
                  <React.Fragment key={s.n}>
                    <b
                      style={{
                        color: ACCENT,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {s.n}.
                    </b>{' '}
                    {renderInlineHtml(s.body_html)}
                    {i < job.interview.steps.length - 1 ? '  ' : ''}
                  </React.Fragment>
                ))}
                <br />
                <i>{renderInlineHtml(job.interview.tip_html)}</i>
              </Text>
            </Section>
          </Section>

          {/* ---------- 04 Under the Hood ---------- */}
          <Section style={sectionStyle}>
            <SectionLabel
              n="04"
              name="Under the Hood"
              hint="— jargon, decoded"
            />
            <Heading
              as="h3"
              style={{
                fontFamily: SERIF,
                fontSize: 19,
                fontWeight: 'bold',
                margin: '10px 0 9px',
                color: INK,
                ...SAFE_WRAP,
              }}
            >
              {stripTags(hood.question_html)}
            </Heading>
            <Section
              style={{
                background: INK,
                color: '#fff',
                padding: INNER_PADDING,
                margin: '10px 0',
              }}
            >
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 13,
                  lineHeight: 1.6,
                  margin: 0,
                  color: '#fff',
                  ...SAFE_WRAP,
                }}
              >
                <b
                  style={{
                    color: ACCENT,
                    fontSize: 10,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 5,
                  }}
                >
                  The dabba analogy
                </b>
                {hood.steps[0]
                  ? renderInlineHtml(hood.steps[0].body_html)
                  : null}
              </Text>
            </Section>
            {hood.steps[1] ? (
              <Text style={bodyTextStyle}>
                {renderInlineHtml(hood.steps[1].body_html)}
              </Text>
            ) : null}
          </Section>

          {/* ---------- 05 The Rep ---------- */}
          <Section style={sectionStyle}>
            <SectionLabel n="05" name="The 15-Min Rep" />
            <Text style={bodyTextStyle}>
              {renderInlineHtml(rep.lite_html)}
            </Text>
            {rep.full_html ? (
              <Text style={bodyTextStyle}>
                {renderInlineHtml(rep.full_html)}
              </Text>
            ) : null}
            {rep.done ? (
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  margin: '8px 0 0',
                  color: INK,
                  fontWeight: 'bold',
                  ...SAFE_WRAP,
                }}
              >
                {rep.done}
              </Text>
            ) : null}
            <Text
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                color: GREY,
                margin: '6px 0 0',
                fontSize: 13,
                lineHeight: 1.55,
                ...SAFE_WRAP,
              }}
            >
              Last week: &ldquo;{rep.reader_win.quote}&rdquo; &mdash;{' '}
              {rep.reader_win.by}
            </Text>
          </Section>

          {/* ---------- 06 Toolbox ---------- */}
          {tb ? (
            <Section style={sectionStyle}>
              <SectionLabel n="06" name="Toolbox" hint="— any job" />
              <Text style={bodyTextStyle}>
                {renderInlineHtml(tb.tool_html)}
              </Text>
            </Section>
          ) : null}

          {/* ---------- 07 Reality Check ---------- */}
          <Section style={sectionStyle}>
            <SectionLabel
              n="07"
              name="Reality Check"
              hint="— the honest bit"
            />
            {rc.h3 ? (
              <Heading
                as="h3"
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  fontWeight: 'bold',
                  margin: '10px 0 6px',
                  lineHeight: 1.25,
                  color: INK,
                  ...SAFE_WRAP,
                }}
              >
                {rc.h3}
              </Heading>
            ) : null}
            <Text style={{ ...bodyTextStyle, margin: '6px 0 0' }}>
              {renderInlineHtml(rc.body_html)}
            </Text>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 14.5,
                lineHeight: 1.6,
                margin: '8px 0 0',
                color: INK,
                ...SAFE_WRAP,
              }}
            >
              {renderInlineHtml(rc.honest_html)}
            </Text>
            <Text
              style={{
                fontFamily: SANS,
                fontSize: 10,
                color: GREY,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                margin: '6px 0 0',
                ...SAFE_WRAP,
              }}
            >
              Source: {rc.source}
            </Text>
          </Section>

          {/* ---------- 08 India Signal ---------- */}
          <Section style={sectionStyle}>
            <SectionLabel
              n="08"
              name="India Signal"
              hint="— three India-only signals"
            />
            {india.cards.map((card, i) => (
              <Section
                key={i}
                style={{
                  borderTop: i === 0 ? 'none' : '1px solid #E4DFD2',
                  paddingTop: 10,
                  marginTop: i === 0 ? 6 : 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 'bold',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: card.status_hot ? ACCENT : INK,
                    borderLeft: `3px solid ${ACCENT}`,
                    paddingLeft: 7,
                    margin: 0,
                    ...SAFE_WRAP,
                  }}
                >
                  {card.cat}
                </Text>
                <Text
                  style={{
                    fontFamily: SERIF,
                    margin: '5px 0 2px',
                    fontWeight: 'bold',
                    fontSize: 14.5,
                    color: INK,
                    lineHeight: 1.4,
                    ...SAFE_WRAP,
                  }}
                >
                  {card.h4}
                </Text>
                <Text
                  style={{
                    fontFamily: SERIF,
                    margin: 0,
                    fontSize: 13,
                    color: '#555',
                    lineHeight: 1.55,
                    ...SAFE_WRAP,
                  }}
                >
                  {card.body}
                </Text>
                {card.why_you ? (
                  <Text
                    style={{
                      fontFamily: SERIF,
                      margin: '4px 0 0',
                      fontSize: 12.5,
                      color: GREY,
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                      ...SAFE_WRAP,
                    }}
                  >
                    &#x21B3; Why you care: {card.why_you}
                  </Text>
                ) : null}
              </Section>
            ))}
          </Section>

          {/* ---------- Sponsor ---------- */}
          {sponsor ? (
            <Section
              style={{
                border: `1px solid ${HAIR}`,
                background: FAINT,
                padding: INNER_PADDING,
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  letterSpacing: '.16em',
                  textTransform: 'uppercase',
                  color: '#6f6a60',
                  margin: 0,
                  ...SAFE_WRAP,
                }}
              >
                {sponsor.brand_tag}
              </Text>
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: '#2a2720',
                  margin: '8px 0 0',
                  ...SAFE_WRAP,
                }}
              >
                {renderInlineHtml(sponsor.copy_html)}{' '}
                <Link href={sponsor.cta_url} style={{ color: ACCENT }}>
                  {sponsor.cta} &rarr;
                </Link>
              </Text>
            </Section>
          ) : null}

          {/* ---------- Closer "One Last Thing" ---------- */}
          <Section
            style={{
              background: INK,
              color: '#fff',
              padding: INNER_PADDING,
              fontSize: 15,
              lineHeight: 1.45,
              fontWeight: 'bold',
              marginTop: 8,
            }}
          >
            <Text
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 10,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: GREY,
                fontWeight: 'normal',
                fontFamily: SANS,
                margin: '0 0 8px',
                ...SAFE_WRAP,
              }}
            >
              One Last Thing
            </Text>
            {closer.format_label ? (
              <Text
                style={{
                  fontSize: 10,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: '#C8794B',
                  fontWeight: 'normal',
                  fontFamily: SANS,
                  margin: '0 0 6px',
                  ...SAFE_WRAP,
                }}
              >
                {closer.format_label}
              </Text>
            ) : null}
            <Text
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 1.45,
                fontWeight: 'bold',
                color: '#fff',
                ...SAFE_WRAP,
              }}
            >
              {renderInlineHtml(closer.body_html)}
            </Text>
          </Section>

          {/* ---------- Referral ---------- */}
          <Section
            style={{
              background: INK,
              color: '#F4F1E8',
              padding: INNER_PADDING,
              marginTop: 14,
            }}
          >
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                fontWeight: 'bold',
                margin: '0 0 4px',
                color: '#F4F1E8',
                ...SAFE_WRAP,
              }}
            >
              Like this? Pass it on.
            </Text>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 13.5,
                lineHeight: 1.55,
                color: '#cfc7b8',
                margin: '0 0 12px',
                ...SAFE_WRAP,
              }}
            >
              Grows by word of mouth, not ads. Refer 1 &rarr; unlock the archive
              &middot; Refer 3 &rarr; my reusable Prompt Pack &middot; Refer 5
              &rarr; a subscriber-only deep dive.
            </Text>
            {/* TODO templating — send pipeline must replace YOUR_CODE per recipient */}
            <Link
              href={`${SITE}/r/YOUR_CODE`}
              style={{
                display: 'inline-block',
                background: ACCENT,
                color: '#fff',
                fontFamily: SANS,
                fontWeight: 'bold',
                fontSize: 12,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                padding: '10px 16px',
                textDecoration: 'none',
              }}
            >
              Copy your invite link
            </Link>
          </Section>

          {/* ---------- Footer ----------
             Explicit border widths on every side. Without these, the
             @react-email/components <Hr> applies a 1px borderTop default,
             but our overriding `borderStyle: 'solid'` would re-enable the
             unset side borders at browser-default medium (~3px) width, which
             overflows the 600 container by ~6px. */}
          <Hr
            style={{
              width: '100%',
              border: 'none',
              borderTop: `1px solid ${HAIR}`,
              borderBottom: 'none',
              margin: '14px 0 0',
            }}
          />
          <Text
            style={{
              fontFamily: SANS,
              fontSize: 10,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: GREY,
              padding: '16px 0',
              margin: 0,
              ...SAFE_WRAP,
            }}
          >
            Reply &amp; tell me &mdash; did you do the Rep? &middot; Next: Sat
            8:00 &middot;{' '}
            {/* TODO templating — send pipeline must replace UNSUB_TOKEN per recipient */}
            <Link
              href={`${SITE}/u/UNSUB_TOKEN`}
              style={{ color: GREY, textDecoration: 'underline' }}
            >
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
