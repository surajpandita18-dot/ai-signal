/**
 * AI Signal email templates — premium editorial design.
 *
 * Design principles (Morning Brew / Lenny / WSJ editorial research):
 * - Warm cream background — not cold corporate grey
 * - Stat displayed typographically (big number) — no blue boxes
 * - Single accent color used sparingly
 * - Generous whitespace — breathing room signals premium
 * - Personal sign-off from Suraj on every email
 * - Category tag inline text, no pill backgrounds
 * - Preheader = "The move: {action}" — urgency over raw numbers
 * - P.S. category-specific — urgency tuned to story type
 */

import type { ExtendedData } from '@/lib/types/extended-data'

// ─── Design tokens ─────────────────────────────────────────────────────────────

const BLUE       = '#0047FF'
const BLACK      = '#111111'
const BODY_TEXT  = '#1A1A1A'
const MUTED      = '#777777'
const MUTED_DARK = '#444444'
const BORDER     = '#E8E8E8'
const PAGE_BG    = '#F5F5F0'   // warm cream — not cold grey
const WHITE      = '#ffffff'

const MONO  = `'Courier New',Courier,monospace`
const SERIF = `Georgia,'Times New Roman',serif`
const SANS  = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`

const CATEGORY_LABELS: Record<string, string> = {
  models: 'MODELS', tools: 'TOOLS', business: 'BUSINESS',
  policy: 'POLICY', research: 'RESEARCH',
}

const FEEDBACK_EMAIL = 'hi@getaisignal.org'

// ─── Preheader ─────────────────────────────────────────────────────────────────

function preheaderHtml(text: string): string {
  const pad = '&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;'
  return `<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:${PAGE_BG};">${text}${pad}</span>`
}

// ─── Outer wrapper ─────────────────────────────────────────────────────────────

function wrap(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>AI Signal</title>
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">
  ${preheaderHtml(preheader)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};">
    <tr><td align="center" style="padding:32px 16px 48px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${WHITE};">
        <!-- 3px brand bar -->
        <tr><td height="3" style="background:${BLUE};font-size:0;line-height:0;">&nbsp;</td></tr>
        <!-- Content -->
        <tr><td style="padding:36px 44px 0 44px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${body}
          </table>
        </td></tr>
      </table>
      <!-- Below-card tagline -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr><td style="padding:14px 0 0;text-align:center;">
          <p style="margin:0;font-family:${SANS};font-size:11px;color:#aaaaaa;">AI Signal &nbsp;·&nbsp; getaisignal.org &nbsp;·&nbsp; 6:14 AM IST every morning</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Shared blocks ─────────────────────────────────────────────────────────────

function headerRow(dateStr?: string): string {
  return `
  <tr><td style="padding-bottom:16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${BLUE};">AI SIGNAL</span></td>
      ${dateStr ? `<td align="right"><span style="font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.06em;">${dateStr}</span></td>` : ''}
    </tr></table>
  </td></tr>
  <tr><td style="padding-bottom:28px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>`
}

function divider(top = 20, bottom = 20): string {
  return `<tr><td style="padding:${top}px 0 ${bottom}px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>`
}

function ctaButton(href: string, label: string): string {
  return `<tr><td style="padding:6px 0 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:${BLUE};border-radius:4px;text-align:center;">
        <a href="${href}" style="display:block;padding:16px 24px;font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:0.08em;color:${WHITE};text-decoration:none;text-transform:uppercase;">${label}</a>
      </td></tr>
    </table>
  </td></tr>`
}

function surajSignoff(): string {
  return `
  <tr><td style="padding:6px 0 4px;">
    <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.75;">
      — Suraj<br/>
      <span style="font-family:${SANS};font-size:14px;color:${MUTED};line-height:1.65;">Building AI Signal from Bengaluru. I read every AI story so you don't have to — and only send the one worth acting on.</span>
    </p>
  </td></tr>`
}

function footerRow(unsubscribeUrl: string, subscriberCount?: number): string {
  const countLine = subscriberCount
    ? `<p style="margin:0 0 8px;font-family:${SANS};font-size:12px;color:${MUTED};">You're one of <strong style="color:${MUTED_DARK};">${subscriberCount.toLocaleString()}+</strong> subscribers.</p>`
    : ''
  return `
  <tr><td style="padding:24px 0 36px;">
    <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 20px;"/>
    ${countLine}
    <p style="margin:0 0 8px;font-family:${SANS};font-size:12px;color:${MUTED};">
      Found this useful? <a href="https://getaisignal.org" style="color:${BLUE};text-decoration:none;">Forward it</a> to one person who should know.
    </p>
    <p style="margin:0 0 14px;font-family:${SANS};font-size:12px;color:${MUTED};">
      Was today's signal useful? &nbsp;
      <a href="mailto:${FEEDBACK_EMAIL}?subject=Feedback: useful&body=This issue was useful." style="color:${BODY_TEXT};text-decoration:none;font-size:15px;">👍</a>
      &nbsp;
      <a href="mailto:${FEEDBACK_EMAIL}?subject=Feedback: not useful&body=This issue wasn't useful. Here's why:" style="color:${BODY_TEXT};text-decoration:none;font-size:15px;">👎</a>
    </p>
    <p style="margin:0 0 10px;font-family:${SANS};font-size:12px;color:${MUTED};line-height:1.6;">One AI story every morning at 6:14 AM IST. Made with care in Bengaluru.</p>
    <p style="margin:0;font-family:${SANS};font-size:12px;color:${MUTED};">
      <a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>
      &nbsp;·&nbsp;
      <a href="https://getaisignal.org" style="color:${MUTED};text-decoration:underline;">getaisignal.org</a>
    </p>
  </td></tr>`
}

// ─── Welcome email ─────────────────────────────────────────────────────────────

export function welcomeEmail(
  unsubscribeUrl: string
): { subject: string; html: string; text: string } {

  const subject   = `You're in. First signal tomorrow at 6:14 AM IST.`
  const preheader = `One AI story. Every morning. For people who ship.`

  const html = wrap(preheader, `
    ${headerRow()}

    <tr><td style="padding-bottom:8px;">
      <h1 style="margin:0;font-family:${SERIF};font-size:30px;font-weight:400;letter-spacing:-0.025em;color:${BLACK};line-height:1.2;">You're in.</h1>
    </td></tr>
    <tr><td style="padding-bottom:28px;">
      <p style="margin:0;font-family:${SANS};font-size:17px;color:${MUTED_DARK};line-height:1.65;">
        First signal lands tomorrow at <strong style="color:${BLACK};">6:14 AM IST.</strong> Here's what to expect.
      </p>
    </td></tr>

    ${divider(0, 4)}

    <tr><td style="padding:22px 0 6px;">
      <p style="margin:0;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">WHAT YOU GET EVERY MORNING</p>
    </td></tr>

    <tr><td style="padding:14px 0;border-top:1px solid ${BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top" style="padding-top:2px;"><span style="font-family:${MONO};font-size:11px;font-weight:700;color:${BLUE};">01</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 3px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE SIGNAL</p>
          <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">One AI story — the one that forces a decision. Not 10 headlines. Not a roundup.</p>
        </td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:14px 0;border-top:1px solid ${BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top" style="padding-top:2px;"><span style="font-family:${MONO};font-size:11px;font-weight:700;color:${BLUE};">02</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 3px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE NUMBER</p>
          <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">The one figure that changes your assumptions. With the context to know what to do about it.</p>
        </td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:14px 0 28px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top" style="padding-top:2px;"><span style="font-family:${MONO};font-size:11px;font-weight:700;color:${BLUE};">03</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 3px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE MOVE</p>
          <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">What to do in the next 48 hours. A concrete action — not a reading list.</p>
        </td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:22px 0 18px;">
      <p style="margin:0;font-family:${SANS};font-size:16px;color:${BODY_TEXT};line-height:1.7;">
        While you wait — today's signal is already live. Something shifted overnight that most teams haven't seen yet.
      </p>
    </td></tr>

    ${ctaButton('https://getaisignal.org', "Read today's signal →")}

    ${surajSignoff()}

    <tr><td style="padding:16px 0 4px;">
      <p style="margin:0;font-family:${SANS};font-size:14px;color:${MUTED_DARK};line-height:1.65;">
        <strong>P.S.</strong> Reply to this email. I read every message — and it actually shapes what gets covered.
      </p>
    </td></tr>

    ${footerRow(unsubscribeUrl)}
  `)

  const text = `AI SIGNAL
${'─'.repeat(48)}
You're in.

First signal lands tomorrow at 6:14 AM IST.

WHAT YOU GET EVERY MORNING
01 — THE SIGNAL: One AI story that forces a decision. Not 10 headlines.
02 — THE NUMBER: The one figure that changes your assumptions.
03 — THE MOVE: What to do in the next 48 hours. A concrete action.

While you wait — today's signal is live: https://getaisignal.org

— Suraj
Building AI Signal from Bengaluru. I read every AI story so you don't have to.

P.S. Reply to this email. I read every message.

${'─'.repeat(48)}
AI Signal · getaisignal.org · 6:14 AM IST every morning
Made with care in Bengaluru.
Unsubscribe: ${unsubscribeUrl}`

  return { subject, html, text }
}

// ─── Daily newsletter email ────────────────────────────────────────────────────

export function dailyNewsletterEmail(
  story: {
    headline: string
    summary: string
    read_minutes: number
    category: string
    extended_data: ExtendedData | null
    editorial_take?: string | null
  },
  issueNumber: number,
  unsubscribeUrl: string,
  dateStr: string,
  subscriberCount?: number
): { subject: string; html: string; text: string } {

  const articleUrl  = `https://getaisignal.org/signal/${issueNumber}`
  const ext         = story.extended_data
  const categoryTag = CATEGORY_LABELS[story.category] ?? story.category.toUpperCase()

  // Subject: editorial_take is punchier than the headline
  const subject = story.editorial_take ?? story.headline

  // Preview cards (needed early for preheader)
  const cards       = ext?.preview_cards ?? []
  const numbersCard = cards.find(c => c.label === 'By the numbers')
  const mattersCard = cards.find(c => c.label === 'Why it matters')
  const moveCard    = cards.find(c => c.label === 'The move')

  // Preheader: "The move: {action}" — urgency complement to curiosity subject
  const ticker    = ext?.tickers?.[0]
  const preheader = moveCard?.value
    ? `The move: ${moveCard.value}`
    : ticker
      ? `${ticker.value} — ${ticker.label.replace(/ (today|this week|this month)$/i, '')}`
      : story.headline

  // Summary: strip markdown, split hook + implication
  const summaryClean = story.summary.replace(/\*\*(.*?)\*\*/g, '$1')
  const sentences    = summaryClean.split(/(?<=[.!?])\s+/)
  const hook         = sentences[0] ?? summaryClean
  const implication  = sentences[1] ?? null

  // Personal opener — one_breath or insights_strip "What changed"
  const opener = ext?.one_breath?.text?.replace(/\*\*(.*?)\*\*/g, '$1')
    ?? ext?.insights_strip?.[0]?.text?.replace(/==(.*?)==/g, '$1').trim()
    ?? null

  // Key stat — displayed typographically, no colored box
  const statValue = ticker?.value ?? null
  const statLabel = ticker ? `${ticker.change.text} · ${ticker.label}` : null
  const statNote  = ticker?.detail ?? null

  // Open question — cliffhanger BEFORE CTA drives clicks
  const openQuestion = ext?.open_question ?? null

  // Category-specific P.S.
  const PS_LINES: Record<string, string> = {
    models:   `Teams who act on this today have a head start. Forward it to one engineer before standup.`,
    tools:    `The gap between builders who've tried this and those who haven't is growing. Forward to one person now.`,
    business: `Send this to one founder peer or team lead. They need to see it.`,
    policy:   `Forward this to your legal or compliance lead. If they haven't seen it, they're behind.`,
    research: `Research-to-product lag is a real competitive gap. The teams reading this now are 2 weeks ahead.`,
  }
  const psLine = PS_LINES[story.category]
    ?? `Forward this to one person who should see it. They can subscribe at <a href="https://getaisignal.org" style="color:${BLUE};text-decoration:none;">getaisignal.org</a>`

  const html = wrap(preheader, `
    ${headerRow(dateStr)}

    <!-- Category tag — pill background for visual weight -->
    <tr><td style="padding-bottom:18px;">
      <span style="display:inline-block;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;background:#EEF3FF;color:${BLUE};padding:4px 10px;border-radius:2px;">${categoryTag}</span>
      <span style="font-family:${MONO};font-size:10px;color:${MUTED};letter-spacing:0.1em;"> &nbsp;· ${story.read_minutes} MIN</span>
    </td></tr>

    <!-- One-breath opener — sets context before the headline -->
    ${opener ? `<tr><td style="padding-bottom:14px;">
      <p style="margin:0;font-family:${SANS};font-size:15px;color:${MUTED};line-height:1.65;font-style:italic;">${opener}</p>
    </td></tr>` : ''}

    <!-- Headline — commanding, editorial -->
    <tr><td style="padding-bottom:18px;">
      <h1 style="margin:0;font-family:${SERIF};font-size:30px;font-weight:400;letter-spacing:-0.03em;color:${BLACK};line-height:1.2;">${story.headline}</h1>
    </td></tr>

    <!-- Summary hook -->
    <tr><td style="padding-bottom:${implication ? '8' : '22'}px;">
      <p style="margin:0;font-family:${SANS};font-size:17px;color:${BODY_TEXT};line-height:1.65;">${hook}</p>
    </td></tr>
    ${implication ? `<tr><td style="padding-bottom:24px;">
      <p style="margin:0;font-family:${SANS};font-size:16px;color:${BODY_TEXT};line-height:1.65;">${implication}</p>
    </td></tr>` : ''}

    <!-- The number — callout block with left border and tinted background -->
    ${statValue ? `
    ${divider(4, 8)}
    <tr><td style="padding-bottom:16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:#EEF3FF;border-left:3px solid ${BLUE};padding:18px 22px;">
          <p style="margin:0 0 10px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BLUE};">THE NUMBER</p>
          <p style="margin:0 0 6px;font-family:${SERIF};font-size:44px;font-weight:400;color:${BLACK};line-height:1.0;">${statValue}</p>
          ${statLabel ? `<p style="margin:0 0 6px;font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.04em;">${statLabel}</p>` : ''}
          ${statNote ? `<p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.6;">${statNote}</p>` : ''}
        </td></tr>
      </table>
    </td></tr>` : ''}

    <!-- Inside this signal — visual hierarchy: numbers=plain, matters=callout, move=dark -->
    ${(numbersCard || mattersCard || moveCard) ? `
    ${divider(18, 18)}
    <tr><td style="padding-bottom:16px;">
      <p style="margin:0;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#222222;">INSIDE THIS SIGNAL</p>
    </td></tr>
    ${numbersCard ? `<tr><td style="padding:13px 0;border-top:1px solid ${BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top" style="padding-top:2px;"><span style="font-family:${MONO};font-size:11px;font-weight:700;color:${BLUE};">01</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">By the numbers</p>
          <p style="margin:0;font-family:${SANS};font-size:16px;color:${BODY_TEXT};line-height:1.55;">${numbersCard.value}</p>
        </td>
      </tr></table>
    </td></tr>` : ''}
    ${mattersCard ? `<tr><td style="padding:0;border-top:1px solid ${BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top" style="padding:14px 0;"><span style="font-family:${MONO};font-size:11px;font-weight:700;color:${BLUE};">02</span></td>
        <td style="padding:0 0 0 12px;">
          <div style="border-left:3px solid ${BLUE};background:#EEF3FF;padding:12px 16px;margin:8px 0;">
            <p style="margin:0 0 5px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BLUE};">Why it matters</p>
            <p style="margin:0;font-family:${SANS};font-size:17px;color:${BODY_TEXT};line-height:1.6;font-weight:500;">${mattersCard.value}</p>
          </div>
        </td>
      </tr></table>
    </td></tr>` : ''}
    ${moveCard ? `<tr><td style="padding:13px 0;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top" style="padding-top:2px;"><span style="font-family:${MONO};font-size:11px;font-weight:700;color:${BLUE};">03</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">The move</p>
          <p style="margin:0;font-family:${SANS};font-size:16px;color:${BLACK};line-height:1.55;font-weight:500;">${moveCard.value}</p>
        </td>
      </tr></table>
    </td></tr>` : ''}` : ''}

    <!-- Open question — callout box before CTA, visual cliffhanger -->
    ${openQuestion ? `
    ${divider(22, 12)}
    <tr><td style="padding-bottom:16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:#F5F5F0;border-left:3px solid #333333;padding:18px 22px;">
          <p style="margin:0 0 10px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#333333;">ONE OPEN QUESTION</p>
          <p style="margin:0;font-family:${SERIF};font-size:22px;font-weight:400;color:${BLACK};line-height:1.55;font-style:italic;">"${openQuestion}"</p>
        </td></tr>
      </table>
    </td></tr>` : `<tr><td style="padding-top:22px;"></td></tr>`}

    <!-- CTA -->
    ${ctaButton(articleUrl, `Read the full signal &nbsp;— ${story.read_minutes} min →`)}

    <!-- Suraj personal sign-off -->
    ${divider(14, 16)}
    ${surajSignoff()}

    <!-- P.S. — category-specific urgency -->
    <tr><td style="padding:14px 0 4px;">
      <p style="margin:0;font-family:${SANS};font-size:14px;color:${MUTED_DARK};line-height:1.65;">
        <strong>P.S.</strong> ${psLine}
      </p>
    </td></tr>

    ${footerRow(unsubscribeUrl, subscriberCount)}
  `)

  const psLineText = PS_LINES[story.category]
    ?? `Forward this to one person who should see it. They can subscribe at getaisignal.org`

  const text = `AI SIGNAL · ${dateStr}
${'─'.repeat(48)}
[${categoryTag}] ${story.read_minutes} MIN
${opener ? `\n${opener}\n` : ''}
${story.headline}

${hook}${implication ? `\n${implication}` : ''}
${statValue ? `\nTHE NUMBER: ${statValue}${statLabel ? ` — ${statLabel}` : ''}${statNote ? `\n${statNote}` : ''}` : ''}

INSIDE THIS SIGNAL
${numbersCard ? `01 By the numbers: ${numbersCard.value}` : ''}
${mattersCard ? `02 Why it matters: ${mattersCard.value}` : ''}
${moveCard    ? `03 The move:       ${moveCard.value}` : ''}
${openQuestion ? `\nONE OPEN QUESTION:\n"${openQuestion}"\n` : ''}
Read the full signal (${story.read_minutes} min):
${articleUrl}

${'─'.repeat(48)}
— Suraj
Building AI Signal from Bengaluru. I read every AI story so you don't have to — and only send the one worth acting on.

P.S. ${psLineText}

${subscriberCount ? `You're one of ${subscriberCount.toLocaleString()}+ subscribers.\n` : ''}Made with care in Bengaluru. · getaisignal.org
Unsubscribe: ${unsubscribeUrl}`

  return { subject, html, text }
}
