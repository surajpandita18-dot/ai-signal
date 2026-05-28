/**
 * AI Signal email templates — research-backed design.
 *
 * Design principles (from top newsletter research):
 * - Plain-text aesthetic, lean HTML — avoids Promotions tab, loads everywhere
 * - Single column, 600px — mandatory for 55%+ mobile opens
 * - One visual pop only (key stat box) — everything else is clean black on white
 * - Preheader text explicitly set — +22% open rate lift
 * - P.S. line after content — highest CTR after subject line (Lenny's data)
 * - Forward link + subscriber count — free growth + social proof
 * - 👍👎 feedback mailto — reply signals improve inbox placement
 */

import type { ExtendedData } from '@/lib/types/extended-data'

// ─── Design tokens ─────────────────────────────────────────────────────────────

const BLUE       = '#0047FF'
const BLACK      = '#111111'
const BODY_TEXT  = '#1A1A1A'
const MUTED      = '#777777'
const MUTED_DARK = '#444444'
const BORDER     = '#E5E5E5'
const STAT_BG    = '#EEF3FF'   // only colored block in the whole email
const PAGE_BG    = '#F0F0F0'
const WHITE      = '#ffffff'

const MONO  = `'Courier New',Courier,monospace`
const SERIF = `Georgia,'Times New Roman',serif`
const SANS  = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`

const CATEGORY_LABELS: Record<string, string> = {
  models: 'MODELS', tools: 'TOOLS', business: 'BUSINESS',
  policy: 'POLICY', research: 'RESEARCH',
}

const FEEDBACK_EMAIL = 'hi@aisignal.so'

// ─── Preheader (hidden text — shows after subject line in inbox) ───────────────
// &nbsp;&zwnj; pads after preheader so email body doesn't bleed into preview.

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
    <tr><td align="center" style="padding:28px 16px 44px;">
      <!-- Email card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${WHITE};">
        <!-- 4px brand bar -->
        <tr><td height="4" style="background:${BLUE};font-size:0;line-height:0;">&nbsp;</td></tr>
        <!-- Content -->
        <tr><td style="padding:32px 40px 0 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${body}
          </table>
        </td></tr>
      </table>
      <!-- Below-card tagline -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr><td style="padding:14px 0 0;text-align:center;">
          <p style="margin:0;font-family:${SANS};font-size:11px;color:#aaaaaa;">AI Signal &nbsp;·&nbsp; aisignal.so &nbsp;·&nbsp; 6:14 AM IST every morning</p>
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
  <tr><td style="padding-bottom:18px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${BLUE};">AI SIGNAL</span></td>
      ${dateStr ? `<td align="right"><span style="font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.06em;">${dateStr}</span></td>` : ''}
    </tr></table>
  </td></tr>
  <tr><td style="padding-bottom:26px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>`
}

function divider(top = 20, bottom = 20): string {
  return `<tr><td style="padding:${top}px 0 ${bottom}px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>`
}

// Full-width CTA — research shows this outperforms small inline-block buttons
function ctaButton(href: string, label: string): string {
  return `<tr><td style="padding:6px 0 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:${BLUE};border-radius:5px;text-align:center;">
        <a href="${href}" style="display:block;padding:15px 24px;font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:0.1em;color:${WHITE};text-decoration:none;text-transform:uppercase;">${label}</a>
      </td></tr>
    </table>
  </td></tr>`
}

function footerRow(unsubscribeUrl: string, subscriberCount?: number): string {
  const countLine = subscriberCount
    ? `<p style="margin:0 0 10px;font-family:${SANS};font-size:12px;color:${MUTED};">You're one of <strong style="color:${MUTED_DARK};">${subscriberCount.toLocaleString()}+</strong> subscribers.</p>`
    : ''
  const forwardLine = `<p style="margin:0 0 10px;font-family:${SANS};font-size:12px;color:${MUTED};">
    Found this useful? <a href="https://aisignal.so" style="color:${BLUE};text-decoration:none;">Forward it</a> to one person in your team.
  </p>`
  const feedbackLine = `<p style="margin:0 0 14px;font-family:${SANS};font-size:12px;color:${MUTED};">
    Was today's signal useful? &nbsp;
    <a href="mailto:${FEEDBACK_EMAIL}?subject=Feedback: useful&body=This issue was useful." style="color:${BODY_TEXT};text-decoration:none;font-size:15px;">👍</a>
    &nbsp;
    <a href="mailto:${FEEDBACK_EMAIL}?subject=Feedback: not useful&body=This issue wasn't useful. Here's why:" style="color:${BODY_TEXT};text-decoration:none;font-size:15px;">👎</a>
  </p>`
  return `
  <tr><td style="padding:26px 0 36px;">
    <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 20px;"/>
    ${countLine}
    ${forwardLine}
    ${feedbackLine}
    <p style="margin:0 0 6px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">AI SIGNAL</p>
    <p style="margin:0 0 10px;font-family:${SANS};font-size:12px;color:${MUTED};line-height:1.6;">One AI story every morning at 6:14 AM IST.<br/>For builders, PMs, and founders in the Indian tech ecosystem.</p>
    <p style="margin:0;font-family:${SANS};font-size:12px;color:${MUTED};">
      <a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>
      &nbsp;·&nbsp;
      <a href="https://aisignal.so" style="color:${MUTED};text-decoration:underline;">aisignal.so</a>
    </p>
  </td></tr>`
}

// ─── Welcome email ─────────────────────────────────────────────────────────────

export function welcomeEmail(
  unsubscribeUrl: string
): { subject: string; html: string; text: string } {

  const subject    = `You're in. First signal tomorrow at 6:14 AM IST.`
  const preheader  = `One AI story. Every morning. For people who ship.`

  const html = wrap(preheader, `
    ${headerRow()}

    <tr><td style="padding-bottom:6px;">
      <h1 style="margin:0;font-family:${SERIF};font-size:28px;font-weight:400;letter-spacing:-0.02em;color:${BLACK};line-height:1.2;">You're subscribed.</h1>
    </td></tr>
    <tr><td style="padding-bottom:26px;">
      <p style="margin:0;font-family:${SANS};font-size:17px;color:${MUTED};line-height:1.6;">
        First signal arrives tomorrow at <strong style="color:${BLACK};">6:14 AM IST.</strong>
      </p>
    </td></tr>

    ${divider(4, 4)}

    <tr><td style="padding:20px 0 6px;">
      <p style="margin:0;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">WHAT YOU GET EVERY MORNING</p>
    </td></tr>

    <tr><td style="padding:14px 0;border-bottom:1px solid ${BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top" style="padding-top:1px;"><span style="font-family:${MONO};font-size:13px;font-weight:700;color:${BLUE};">01</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 2px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE SIGNAL</p>
          <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">One AI story — the one that changes something for builders. Not 10 headlines. Not a roundup.</p>
        </td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:14px 0;border-bottom:1px solid ${BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top" style="padding-top:1px;"><span style="font-family:${MONO};font-size:13px;font-weight:700;color:${BLUE};">02</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 2px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE NUMBERS</p>
          <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">The specific figures that change your decisions. Not the ones that sound impressive.</p>
        </td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:14px 0 26px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top" style="padding-top:1px;"><span style="font-family:${MONO};font-size:13px;font-weight:700;color:${BLUE};">03</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 2px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE MOVE</p>
          <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">What to do in the next 48 hours. A concrete action before standup tomorrow — not a reading list.</p>
        </td>
      </tr></table>
    </td></tr>

    ${divider(4, 4)}

    <tr><td style="padding:20px 0 16px;">
      <p style="margin:0;font-family:${SANS};font-size:16px;color:${BODY_TEXT};line-height:1.65;">
        While you wait — read today's signal. Something shipped last night that your competitors probably haven't noticed yet.
      </p>
    </td></tr>

    ${ctaButton('https://aisignal.so', "Read today's signal →")}

    <tr><td style="padding:4px 0 2px;">
      <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.7;">
        — Suraj<br/>
        <span style="color:${MUTED};font-size:14px;">P.S. Reply to this email. I read every message.</span>
      </p>
    </td></tr>

    ${footerRow(unsubscribeUrl)}
  `)

  const text = `AI SIGNAL
You're subscribed.

First signal arrives tomorrow at 6:14 AM IST.

WHAT YOU GET EVERY MORNING
01 — THE SIGNAL: One AI story that changes something for builders. Not 10 headlines.
02 — THE NUMBERS: The specific figures that change your decisions.
03 — THE MOVE: What to do in the next 48 hours. A concrete action.

While you wait — read today's signal: https://aisignal.so

— Suraj
P.S. Reply anytime. I read every message.

---
AI Signal · aisignal.so · 6:14 AM IST every morning
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

  const articleUrl  = `https://aisignal.so/signal/${issueNumber}`
  const ext         = story.extended_data
  const categoryTag = CATEGORY_LABELS[story.category] ?? story.category.toUpperCase()

  // Subject: editorial_take is shorter + punchier than the headline
  // Fallback to headline if not available
  const subject = story.editorial_take ?? story.headline

  // Preview cards (needed early for preheader)
  const cards       = ext?.preview_cards ?? []
  const numbersCard = cards.find(c => c.label === 'By the numbers')
  const mattersCard = cards.find(c => c.label === 'Why it matters')
  const moveCard    = cards.find(c => c.label === 'The move')

  // Preheader: "The move: {action}" creates urgency and complements editorial_take subject
  // Falls back to ticker number (inbox hook) if no move card
  const ticker   = ext?.tickers?.[0]
  const preheader = moveCard?.value
    ? `The move: ${moveCard.value}`
    : ticker
      ? `${ticker.value} — ${ticker.label.replace(/ (today|this week|this month)$/i, '')}`
      : story.headline

  // Hook: strip markdown bold, split into hook + implication
  const summaryClean = story.summary.replace(/\*\*(.*?)\*\*/g, '$1')
  const sentences    = summaryClean.split(/(?<=[.!?])\s+/)
  const hook         = sentences[0] ?? summaryClean
  const implication  = sentences[1] ?? null

  // Personal opener — one_breath gives a punchy human sentence before the headline.
  // Falls back to insights_strip "What changed" cell if one_breath not present.
  const opener = ext?.one_breath?.text?.replace(/\*\*(.*?)\*\*/g, '$1')
    ?? ext?.insights_strip?.[0]?.text?.replace(/==(.*?)==/g, '$1').trim()
    ?? null

  // Key stat
  const statValue = ticker?.value ?? null
  const statLabel = ticker ? `${ticker.change.text} — ${ticker.label}` : null
  const statNote  = ticker?.detail ?? null

  // Open question — cliffhanger shown BEFORE the CTA to drive clicks
  const openQuestion = ext?.open_question ?? null

  // Category-specific P.S. — urgency tuned to story type
  const PS_LINES: Record<string, string> = {
    models:   `Teams who act on this today have a head start. Forward it to one engineer before standup.`,
    tools:    `The gap between builders who've tried this and builders who haven't is growing fast. Forward this to one person.`,
    business: `Send this to one founder peer or your team lead. They need to see it.`,
    policy:   `Forward this to your legal or compliance lead. If they haven't seen it, they're behind.`,
    research: `Research-to-product lag is a real competitive gap. The teams reading this now are 2 weeks ahead.`,
  }
  const psLine = PS_LINES[story.category]
    ?? `Forward this to one person on your team who should see it. They can subscribe at <a href="https://aisignal.so" style="color:${BLUE};text-decoration:none;">aisignal.so</a>`

  const html = wrap(preheader, `
    ${headerRow(dateStr)}

    <!-- Category + read time -->
    <tr><td style="padding-bottom:12px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="background:${STAT_BG};border-radius:3px;padding:3px 8px;">
          <span style="font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.16em;color:${BLUE};">${categoryTag}</span>
        </td>
        <td style="padding-left:10px;">
          <span style="font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.04em;">${story.read_minutes} MIN READ</span>
        </td>
      </tr></table>
    </td></tr>

    <!-- One-breath opener — human, sets context before the headline -->
    ${opener ? `<tr><td style="padding-bottom:14px;">
      <p style="margin:0;font-family:${SANS};font-size:15px;color:${MUTED_DARK};line-height:1.65;font-style:italic;">${opener}</p>
    </td></tr>` : ''}

    <!-- Headline -->
    <tr><td style="padding-bottom:14px;">
      <h1 style="margin:0;font-family:${SERIF};font-size:27px;font-weight:400;letter-spacing:-0.025em;color:${BLACK};line-height:1.2;">${story.headline}</h1>
    </td></tr>

    <!-- Hook sentence -->
    <tr><td style="padding-bottom:${implication ? '0' : '18'}px;">
      <p style="margin:0;font-family:${SANS};font-size:17px;color:${BODY_TEXT};line-height:1.65;">${hook}</p>
    </td></tr>

    <!-- Implication (muted) — tells reader there's more, drives click -->
    ${implication ? `<tr><td style="padding:8px 0 18px;">
      <p style="margin:0;font-family:${SANS};font-size:16px;color:${MUTED_DARK};line-height:1.6;">${implication}</p>
    </td></tr>` : ''}

    <!-- Key stat — the ONE visual callout in the email -->
    ${statValue ? `<tr><td style="padding-bottom:22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="background:${STAT_BG};border-left:3px solid ${BLUE};padding:14px 18px;">
          <p style="margin:0 0 3px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${BLUE};">KEY STAT</p>
          <p style="margin:0 0 3px;font-family:${SERIF};font-size:28px;font-weight:400;color:${BLACK};line-height:1.1;">${statValue}</p>
          ${statLabel ? `<p style="margin:0 0 ${statNote ? '3px' : '0'};font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.04em;">${statLabel}</p>` : ''}
          ${statNote  ? `<p style="margin:0;font-family:${SANS};font-size:13px;color:${MUTED_DARK};line-height:1.5;">${statNote}</p>` : ''}
        </td>
      </tr></table>
    </td></tr>` : ''}

    <!-- What's inside — plain text rows, no boxes -->
    ${(numbersCard || mattersCard || moveCard) ? `
    <tr><td style="padding-bottom:4px;">
      <p style="margin:0 0 12px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">WHAT'S INSIDE TODAY</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${numbersCard ? `<tr><td style="padding:9px 0;border-bottom:1px solid ${BORDER};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="20" valign="top" style="padding-top:1px;"><span style="font-family:${MONO};font-size:10px;font-weight:700;color:${BLUE};">→</span></td>
            <td style="padding-left:8px;">
              <span style="font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">BY THE NUMBERS &nbsp;</span>
              <span style="font-family:${SANS};font-size:14px;color:${BODY_TEXT};">${numbersCard.value}</span>
            </td>
          </tr></table>
        </td></tr>` : ''}
        ${mattersCard ? `<tr><td style="padding:9px 0;border-bottom:1px solid ${BORDER};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="20" valign="top" style="padding-top:1px;"><span style="font-family:${MONO};font-size:10px;font-weight:700;color:${BLUE};">→</span></td>
            <td style="padding-left:8px;">
              <span style="font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">WHY IT MATTERS &nbsp;</span>
              <span style="font-family:${SANS};font-size:14px;color:${BODY_TEXT};">${mattersCard.value}</span>
            </td>
          </tr></table>
        </td></tr>` : ''}
        ${moveCard ? `<tr><td style="padding:9px 0 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="20" valign="top" style="padding-top:1px;"><span style="font-family:${MONO};font-size:10px;font-weight:700;color:${BLUE};">→</span></td>
            <td style="padding-left:8px;">
              <span style="font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE MOVE &nbsp;</span>
              <span style="font-family:${SANS};font-size:14px;color:${BODY_TEXT};">${moveCard.value}</span>
            </td>
          </tr></table>
        </td></tr>` : ''}
      </table>
    </td></tr>` : ''}

    <!-- Open question — cliffhanger BEFORE cta; unresolved question makes the click feel necessary -->
    ${openQuestion ? `
    ${divider(8, 16)}
    <tr><td style="padding-bottom:4px;">
      <p style="margin:0 0 8px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">ONE QUESTION NOBODY'S ANSWERED YET</p>
      <p style="margin:0;font-family:${SERIF};font-size:18px;font-weight:400;color:${BLACK};line-height:1.55;font-style:italic;">"${openQuestion}"</p>
    </td></tr>
    <tr><td style="padding-top:8px;"></td></tr>` : '<tr><td style="padding-top:16px;"></td></tr>'}

    <!-- Primary CTA — after the cliffhanger, click feels like the resolution -->
    ${ctaButton(articleUrl, `Read the full signal &nbsp;—&nbsp; ${story.read_minutes} min →`)}

    <!-- P.S. line — category-specific urgency; highest CTR after subject line -->
    ${divider(12, 16)}
    <tr><td style="padding-bottom:4px;">
      <p style="margin:0;font-family:${SANS};font-size:14px;color:${MUTED_DARK};line-height:1.65;">
        <strong>P.S.</strong> ${psLine}
      </p>
    </td></tr>

    ${footerRow(unsubscribeUrl, subscriberCount)}
  `)

  const psLineText = PS_LINES[story.category]
    ?? `Forward this to one person on your team. They can subscribe at aisignal.so`

  const text = `AI SIGNAL · ${dateStr}
${'─'.repeat(48)}
[${categoryTag}] ${story.read_minutes} MIN READ
${opener ? `\n${opener}\n` : ''}
${story.headline}

${hook}${implication ? `\n${implication}` : ''}
${statValue ? `\nKEY STAT: ${statValue}${statLabel ? ` — ${statLabel}` : ''}` : ''}

WHAT'S INSIDE TODAY
${numbersCard ? `→ By the numbers: ${numbersCard.value}` : ''}
${mattersCard ? `→ Why it matters: ${mattersCard.value}` : ''}
${moveCard    ? `→ The move: ${moveCard.value}` : ''}
${openQuestion ? `\nOne question nobody's answered yet:\n"${openQuestion}"\n` : ''}
Read the full signal (${story.read_minutes} min):
${articleUrl}

${'─'.repeat(48)}
P.S. ${psLineText}

${subscriberCount ? `You're one of ${subscriberCount.toLocaleString()}+ subscribers.\n` : ''}AI Signal · aisignal.so
Unsubscribe: ${unsubscribeUrl}`

  return { subject, html, text }
}
