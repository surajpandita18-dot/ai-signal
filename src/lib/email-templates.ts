/**
 * AI Signal email templates — premium editorial design.
 * All CSS inline. Email-client safe. Tested layout on Gmail / Apple Mail / Outlook.
 * Max-width 600px. Single-column. Outer bg #F5F5F5 so white container pops.
 */

import type { ExtendedData } from '@/lib/types/extended-data'

// ─── Design tokens ─────────────────────────────────────────────────────────────

const BLUE        = '#0047FF'
const BLACK       = '#111111'
const BODY_TEXT   = '#1A1A1A'
const MUTED       = '#666666'
const BORDER      = '#E8E8E8'
const CALLOUT_BG  = '#EEF3FF'   // light blue tint — key stat, open question
const PAGE_BG     = '#F2F2F2'   // outer wrapper
const WHITE       = '#ffffff'

const MONO   = `'Courier New',Courier,monospace`
const SERIF  = `Georgia,'Times New Roman',serif`
const SANS   = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`

const CATEGORY_LABELS: Record<string, string> = {
  models:   'MODELS',
  tools:    'TOOLS',
  business: 'BUSINESS',
  policy:   'POLICY',
  research: 'RESEARCH',
}

// ─── Outer wrapper ─────────────────────────────────────────────────────────────
// Outer bg is PAGE_BG so the white email box visually pops as a "card".
// 4px blue top bar = instant brand signal even before reading a word.

function wrap(body: string): string {
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
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:32px 16px 48px;">
        <!-- Email container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${WHITE};">
          <!-- 4px brand accent bar -->
          <tr>
            <td height="4" style="background:${BLUE};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Body content -->
          <tr>
            <td style="padding:36px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${body}
              </table>
            </td>
          </tr>
        </table>
        <!-- Sub-footer note outside the card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="padding:16px 0 0;text-align:center;">
              <p style="margin:0;font-family:${SANS};font-size:11px;color:#999999;line-height:1.5;">
                AI Signal &nbsp;·&nbsp; aisignal.so &nbsp;·&nbsp; 6:14 AM IST every morning
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`
}

// ─── Shared building blocks ────────────────────────────────────────────────────

function headerRow(dateStr?: string): string {
  return `
  <tr>
    <td style="padding-bottom:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${BLUE};">AI SIGNAL</span>
          </td>
          ${dateStr ? `<td align="right">
            <span style="font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.08em;">${dateStr}</span>
          </td>` : ''}
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:28px;">
      <hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/>
    </td>
  </tr>`
}

function divider(vPad = 24): string {
  return `<tr><td style="padding:${vPad}px 0;">
    <hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/>
  </td></tr>`
}

function footerRow(unsubscribeUrl: string): string {
  return `
  <tr>
    <td style="padding:28px 0 36px;">
      <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 20px;"/>
      <p style="margin:0 0 6px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">AI SIGNAL</p>
      <p style="margin:0 0 10px;font-family:${SANS};font-size:12px;color:${MUTED};line-height:1.6;">
        One AI story every morning at 6:14 AM IST.<br/>
        For builders, PMs, and founders in the Indian tech ecosystem.
      </p>
      <p style="margin:0;font-family:${SANS};font-size:12px;color:${MUTED};">
        <a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <a href="https://aisignal.so" style="color:${MUTED};text-decoration:underline;">aisignal.so</a>
      </p>
    </td>
  </tr>`
}

// Full-width CTA button — more visible than inline-block on mobile
function ctaButton(href: string, label: string): string {
  return `
  <tr>
    <td style="padding:4px 0 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:${BLUE};border-radius:5px;text-align:center;">
            <a href="${href}" style="display:block;padding:16px 24px;font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:0.1em;color:${WHITE};text-decoration:none;text-transform:uppercase;">
              ${label}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

// ─── Welcome email ─────────────────────────────────────────────────────────────

export function welcomeEmail(
  unsubscribeUrl: string
): { subject: string; html: string; text: string } {

  const subject = `You're in. First signal tomorrow at 6:14 AM IST.`

  const html = wrap(`
    ${headerRow()}

    <!-- Headline -->
    <tr>
      <td style="padding-bottom:8px;">
        <h1 style="margin:0;font-family:${SERIF};font-size:30px;font-weight:400;letter-spacing:-0.025em;color:${BLACK};line-height:1.2;">
          You're subscribed.
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding-bottom:28px;">
        <p style="margin:0;font-family:${SANS};font-size:17px;color:${MUTED};line-height:1.6;">
          Tomorrow at <strong style="color:${BLACK};">6:14 AM IST</strong>, your first signal arrives.
        </p>
      </td>
    </tr>

    ${divider(4)}

    <!-- What you get -->
    <tr>
      <td style="padding:20px 0 4px;">
        <p style="margin:0 0 16px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">WHAT YOU GET EVERY MORNING</p>
      </td>
    </tr>

    <!-- Row 1 -->
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid ${BORDER};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="24" valign="top" style="padding-top:2px;">
              <span style="font-family:${MONO};font-size:12px;font-weight:700;color:${BLUE};">01</span>
            </td>
            <td style="padding-left:12px;">
              <p style="margin:0 0 2px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE SIGNAL</p>
              <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">
                One AI story — the one that changes something for builders.<br/>
                Not 10 headlines. Not a roundup.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Row 2 -->
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid ${BORDER};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="24" valign="top" style="padding-top:2px;">
              <span style="font-family:${MONO};font-size:12px;font-weight:700;color:${BLUE};">02</span>
            </td>
            <td style="padding-left:12px;">
              <p style="margin:0 0 2px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE NUMBERS</p>
              <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">
                The specific figures that actually change your decisions.<br/>
                Not the ones that just sound impressive.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Row 3 -->
    <tr>
      <td style="padding:14px 0 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="24" valign="top" style="padding-top:2px;">
              <span style="font-family:${MONO};font-size:12px;font-weight:700;color:${BLUE};">03</span>
            </td>
            <td style="padding-left:12px;">
              <p style="margin:0 0 2px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE MOVE</p>
              <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">
                What to do in the next 48 hours — not a reading list.<br/>
                A concrete action you can take before standup tomorrow.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${divider(4)}

    <!-- CTA nudge -->
    <tr>
      <td style="padding:20px 0 16px;">
        <p style="margin:0;font-family:${SANS};font-size:16px;color:${BODY_TEXT};line-height:1.65;">
          While you wait — something probably shipped overnight that your competitors haven't noticed yet.
        </p>
      </td>
    </tr>

    ${ctaButton('https://aisignal.so', "Read today's signal →")}

    <!-- Sign-off -->
    <tr>
      <td style="padding:8px 0 4px;">
        <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.7;">
          — Suraj<br/>
          <span style="color:${MUTED};font-size:14px;">P.S. Reply to this email. I read every message.</span>
        </p>
      </td>
    </tr>

    ${footerRow(unsubscribeUrl)}
  `)

  const text = `AI SIGNAL
You're subscribed.

Tomorrow at 6:14 AM IST, your first signal arrives.

WHAT YOU GET EVERY MORNING
01 — THE SIGNAL: One AI story that changes something for builders. Not 10 headlines.
02 — THE NUMBERS: The specific figures that change your decisions.
03 — THE MOVE: What to do in the next 48 hours. A concrete action.

While you wait — read today's signal: https://aisignal.so

— Suraj
P.S. Reply anytime. I read every message.

---
AI Signal · aisignal.so
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
  },
  issueNumber: number,
  unsubscribeUrl: string,
  dateStr: string
): { subject: string; html: string; text: string } {

  const articleUrl  = `https://aisignal.so/signal/${issueNumber}`
  const ext         = story.extended_data
  const categoryTag = CATEGORY_LABELS[story.category] ?? story.category.toUpperCase()

  // Hook: strip markdown bold, take first sentence only — enough to intrigue
  const summaryClean  = story.summary.replace(/\*\*(.*?)\*\*/g, '$1')
  const sentences     = summaryClean.split(/(?<=[.!?])\s+/)
  const hookSentence  = sentences[0] ?? summaryClean
  // Second sentence is the implication — shown in muted style to drive click
  const implication   = sentences[1] ?? null

  // Key stat from first ticker
  const ticker    = ext?.tickers?.[0]
  const statValue = ticker?.value ?? null
  const statLabel = ticker ? `${ticker.change.text} · ${ticker.label}` : null
  const statNote  = ticker?.detail ?? null

  // Preview cards
  const cards       = ext?.preview_cards ?? []
  const numbersCard = cards.find(c => c.label === 'By the numbers')
  const mattersCard = cards.find(c => c.label === 'Why it matters')
  const moveCard    = cards.find(c => c.label === 'The move')

  // Open question — the cliffhanger
  const openQuestion = ext?.open_question ?? null

  const subject = `${story.headline}`

  const html = wrap(`
    ${headerRow(dateStr)}

    <!-- Category badge + read time -->
    <tr>
      <td style="padding-bottom:14px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:${CALLOUT_BG};border-radius:3px;padding:3px 9px;">
              <span style="font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.16em;color:${BLUE};">${categoryTag}</span>
            </td>
            <td style="padding-left:10px;">
              <span style="font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.06em;">${story.read_minutes} MIN READ</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Headline -->
    <tr>
      <td style="padding-bottom:14px;">
        <h1 style="margin:0;font-family:${SERIF};font-size:28px;font-weight:400;letter-spacing:-0.025em;color:${BLACK};line-height:1.2;">
          ${story.headline}
        </h1>
      </td>
    </tr>

    <!-- Hook sentence -->
    <tr>
      <td style="padding-bottom:${implication ? '0' : '20'}px;">
        <p style="margin:0;font-family:${SANS};font-size:17px;color:${BODY_TEXT};line-height:1.65;">
          ${hookSentence}
        </p>
      </td>
    </tr>

    <!-- Implication sentence (muted — teases the "so what") -->
    ${implication ? `
    <tr>
      <td style="padding:8px 0 20px;">
        <p style="margin:0;font-family:${SANS};font-size:16px;color:${MUTED};line-height:1.6;">
          ${implication}
        </p>
      </td>
    </tr>` : ''}

    <!-- Key stat callout box -->
    ${statValue ? `
    <tr>
      <td style="padding-bottom:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:${CALLOUT_BG};border-left:3px solid ${BLUE};border-radius:0 4px 4px 0;padding:16px 20px;">
              <p style="margin:0 0 4px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BLUE};">KEY STAT</p>
              <p style="margin:0 0 4px;font-family:${SERIF};font-size:26px;font-weight:400;color:${BLACK};line-height:1.1;">${statValue}</p>
              ${statLabel ? `<p style="margin:0 0 ${statNote ? '3px' : '0'};font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.04em;">${statLabel}</p>` : ''}
              ${statNote  ? `<p style="margin:0;font-family:${SANS};font-size:13px;color:${MUTED};line-height:1.5;">${statNote}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ''}

    <!-- What's inside today -->
    ${(numbersCard || mattersCard || moveCard) ? `
    <tr>
      <td style="padding-bottom:6px;">
        <p style="margin:0 0 14px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">WHAT'S INSIDE TODAY</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${numbersCard ? `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td width="28" valign="top"><span style="font-family:${MONO};font-size:10px;font-weight:700;color:${BLUE};">01</span></td>
                <td style="padding-left:8px;">
                  <p style="margin:0 0 1px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">BY THE NUMBERS</p>
                  <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.5;">${numbersCard.value}</p>
                </td>
              </tr></table>
            </td>
          </tr>` : ''}
          ${mattersCard ? `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td width="28" valign="top"><span style="font-family:${MONO};font-size:10px;font-weight:700;color:${BLUE};">02</span></td>
                <td style="padding-left:8px;">
                  <p style="margin:0 0 1px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">WHY IT MATTERS</p>
                  <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.5;">${mattersCard.value}</p>
                </td>
              </tr></table>
            </td>
          </tr>` : ''}
          ${moveCard ? `
          <tr>
            <td style="padding:10px 0 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td width="28" valign="top"><span style="font-family:${MONO};font-size:10px;font-weight:700;color:${BLUE};">03</span></td>
                <td style="padding-left:8px;">
                  <p style="margin:0 0 1px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE MOVE</p>
                  <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.5;">${moveCard.value}</p>
                </td>
              </tr></table>
            </td>
          </tr>` : ''}
        </table>
      </td>
    </tr>` : ''}

    <!-- CTA -->
    <tr><td style="padding-top:20px;"></td></tr>
    ${ctaButton(articleUrl, `Read today's signal &nbsp;—&nbsp; ${story.read_minutes} min →`)}

    <!-- Open question — the cliffhanger AFTER the CTA -->
    ${openQuestion ? `
    ${divider(20)}
    <tr>
      <td style="padding-bottom:8px;">
        <p style="margin:0 0 10px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">ONE QUESTION NOBODY'S ANSWERED YET</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:${CALLOUT_BG};border-radius:4px;padding:18px 20px;">
              <p style="margin:0;font-family:${SERIF};font-size:18px;font-weight:400;color:${BLACK};line-height:1.55;font-style:italic;">
                "${openQuestion}"
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ''}

    ${footerRow(unsubscribeUrl)}
  `)

  const text = `AI SIGNAL · ${dateStr}
${'─'.repeat(50)}

[${categoryTag}] ${story.read_minutes} MIN READ

${story.headline}

${hookSentence}${implication ? `\n${implication}` : ''}
${statValue ? `\nKEY STAT: ${statValue}${statLabel ? ` — ${statLabel}` : ''}` : ''}

WHAT'S INSIDE TODAY
${numbersCard ? `01 By the numbers — ${numbersCard.value}` : ''}
${mattersCard ? `02 Why it matters — ${mattersCard.value}` : ''}
${moveCard    ? `03 The move — ${moveCard.value}` : ''}

Read the full signal (${story.read_minutes} min):
${articleUrl}
${openQuestion ? `\n${'─'.repeat(50)}\nOne question nobody's answered yet:\n"${openQuestion}"` : ''}

${'─'.repeat(50)}
AI Signal · aisignal.so
Unsubscribe: ${unsubscribeUrl}`

  return { subject, html, text }
}
