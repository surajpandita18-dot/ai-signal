/**
 * AI Signal email templates.
 * All CSS is inline — email clients don't support external stylesheets.
 * Max-width 600px. Single-column. Serif + mono design language.
 */

import type { ExtendedData } from '@/lib/types/extended-data'

// ─── Shared constants ──────────────────────────────────────────────────────────

const BLUE   = '#0047FF'
const BLACK  = '#0A0A0A'
const MUTED  = '#6B6B6B'
const BORDER = '#E8E8E8'
const BG     = '#FAFAFA'

const MONO = `'SF Mono','Fira Code','Fira Mono','Roboto Mono',monospace`
const SERIF = `'Georgia','Times New Roman',serif`
const SANS  = `'-apple-system','BlinkMacSystemFont','Segoe UI',Helvetica,Arial,sans-serif`

// ─── Shared wrapper ────────────────────────────────────────────────────────────

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>AI Signal</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:${SANS};-webkit-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
  <tr><td align="center" style="padding:32px 16px 48px;">
    <table role="presentation" width="100%" style="max-width:580px;" cellpadding="0" cellspacing="0">
      ${body}
    </table>
  </td></tr>
</table>
</body>
</html>`
}

// ─── Shared blocks ─────────────────────────────────────────────────────────────

function header(): string {
  return `<tr><td style="padding-bottom:28px;">
  <span style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BLUE};">AI SIGNAL</span>
  <span style="font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.12em;"> · AISIGNAL.SO</span>
</td></tr>`
}

function divider(): string {
  return `<tr><td style="padding:4px 0 20px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>`
}

function footer(unsubscribeUrl: string): string {
  return `<tr><td style="padding-top:32px;">
  <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 20px;"/>
  <p style="margin:0 0 6px;font-family:${MONO};font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">AI SIGNAL</p>
  <p style="margin:0;font-family:${SANS};font-size:12px;color:${MUTED};line-height:1.6;">
    One AI story. Every morning at 6:14 AM IST.
    For builders, PMs, and founders in the Indian tech ecosystem.<br/>
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
  const subject = `You're in. First signal tomorrow at 6:14 AM IST.`

  const html = wrap(`
    ${header()}

    <tr><td style="padding-bottom:24px;">
      <h1 style="margin:0 0 12px;font-family:${SERIF};font-size:26px;font-weight:400;letter-spacing:-0.02em;color:${BLACK};line-height:1.2;">
        You're subscribed.
      </h1>
      <p style="margin:0;font-family:${SANS};font-size:16px;color:${MUTED};line-height:1.65;">
        Tomorrow at <strong style="color:${BLACK};">6:14 AM IST</strong>, your first signal arrives.
      </p>
    </td></tr>

    ${divider()}

    <tr><td style="padding-bottom:24px;">
      <p style="margin:0 0 16px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">What you'll get every morning</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
            <span style="font-family:${MONO};font-size:11px;color:${BLUE};font-weight:700;letter-spacing:0.1em;">→</span>
            <span style="font-family:${SANS};font-size:15px;color:${BLACK};margin-left:10px;line-height:1.5;">
              The <strong>one AI story</strong> that changes something for builders — not 10 headlines
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
            <span style="font-family:${MONO};font-size:11px;color:${BLUE};font-weight:700;letter-spacing:0.1em;">→</span>
            <span style="font-family:${SANS};font-size:15px;color:${BLACK};margin-left:10px;line-height:1.5;">
              The <strong>numbers that matter</strong> (not the ones that just sound impressive)
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;">
            <span style="font-family:${MONO};font-size:11px;color:${BLUE};font-weight:700;letter-spacing:0.1em;">→</span>
            <span style="font-family:${SANS};font-size:15px;color:${BLACK};margin-left:10px;line-height:1.5;">
              <strong>What to do in the next 48 hours</strong> — not a reading list, an action
            </span>
          </td>
        </tr>
      </table>
    </td></tr>

    ${divider()}

    <tr><td style="padding-bottom:28px;">
      <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;color:${BLACK};line-height:1.65;">
        While you wait — read today's signal. Something shipped last night that your competitors probably haven't noticed yet.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr><td style="background:${BLUE};border-radius:4px;">
          <a href="https://aisignal.so" style="display:inline-block;padding:12px 24px;font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:0.08em;color:#ffffff;text-decoration:none;text-transform:uppercase;">
            Read today's signal →
          </a>
        </td></tr>
      </table>
    </td></tr>

    <tr><td style="padding-bottom:20px;">
      <p style="margin:0;font-family:${SANS};font-size:14px;color:${MUTED};line-height:1.65;">
        — Suraj<br/>
        <span style="font-size:13px;">P.S. Reply to this email. I read every message.</span>
      </p>
    </td></tr>

    ${footer(unsubscribeUrl)}
  `)

  const text = `You're subscribed to AI Signal.

Tomorrow at 6:14 AM IST, your first signal arrives.

What you'll get every morning:
→ The one AI story that changes something for builders
→ The numbers that matter (not the ones that sound impressive)
→ What to do in the next 48 hours

While you wait — read today's signal: https://aisignal.so

— Suraj
P.S. Reply anytime. I read every message.

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
  dateStr: string   // e.g. "May 28, 2026"
): { subject: string; html: string; text: string } {

  const articleUrl = `https://aisignal.so/signal/${issueNumber}`
  const ext = story.extended_data

  // Hook: first sentence of summary — strip markdown bold
  const summaryClean = story.summary.replace(/\*\*(.*?)\*\*/g, '$1')
  const hookSentence = summaryClean.split(/(?<=[.!?])\s+/)[0] ?? summaryClean

  // Key number from first ticker
  const ticker = ext?.tickers?.[0]
  const keyNumber = ticker ? `${ticker.value} — ${ticker.label}` : null

  // "What's inside" from preview_cards
  const previewCards = ext?.preview_cards ?? []
  const numbersCard  = previewCards.find(c => c.label === 'By the numbers')
  const mattersCard  = previewCards.find(c => c.label === 'Why it matters')
  const moveCard     = previewCards.find(c => c.label === 'The move')

  // Open question — the curiosity cliffhanger
  const openQuestion = ext?.open_question ?? null

  const subject = `${story.headline} — AI Signal`

  const insideRows = [
    numbersCard ? `<tr><td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
      <span style="font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};display:block;margin-bottom:4px;">By the numbers</span>
      <span style="font-family:${SANS};font-size:15px;color:${BLACK};line-height:1.5;">${numbersCard.value}</span>
    </td></tr>` : '',
    mattersCard ? `<tr><td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
      <span style="font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};display:block;margin-bottom:4px;">Why it matters</span>
      <span style="font-family:${SANS};font-size:15px;color:${BLACK};line-height:1.5;">${mattersCard.value}</span>
    </td></tr>` : '',
    moveCard ? `<tr><td style="padding:10px 0;">
      <span style="font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};display:block;margin-bottom:4px;">The move</span>
      <span style="font-family:${SANS};font-size:15px;color:${BLACK};line-height:1.5;">${moveCard.value}</span>
    </td></tr>` : '',
  ].filter(Boolean).join('')

  const html = wrap(`
    ${header()}

    <tr><td style="padding-bottom:6px;">
      <span style="font-family:${MONO};font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">${dateStr}</span>
    </td></tr>

    <tr><td style="padding-bottom:20px;">
      <h1 style="margin:0 0 14px;font-family:${SERIF};font-size:24px;font-weight:400;letter-spacing:-0.02em;color:${BLACK};line-height:1.2;">
        ${story.headline}
      </h1>
      <p style="margin:0;font-family:${SANS};font-size:16px;color:#2a2a2a;line-height:1.65;">
        ${hookSentence}
      </p>
    </td></tr>

    ${keyNumber ? `<tr><td style="padding:14px 16px;background:${BG};border-left:3px solid ${BLUE};margin-bottom:20px;">
      <span style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};display:block;margin-bottom:4px;">Key number</span>
      <span style="font-family:${SERIF};font-size:20px;color:${BLACK};font-weight:400;">${keyNumber}</span>
    </td></tr><tr><td style="padding-bottom:4px;"></td></tr>` : ''}

    ${insideRows ? `
    <tr><td style="padding:4px 0 20px;">
      <p style="margin:0 0 12px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">What's inside today</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${insideRows}</table>
    </td></tr>
    ` : ''}

    <tr><td style="padding:4px 0 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr><td style="background:${BLUE};border-radius:4px;">
          <a href="${articleUrl}" style="display:inline-block;padding:13px 28px;font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:0.08em;color:#ffffff;text-decoration:none;text-transform:uppercase;">
            Read today's signal — ${story.read_minutes} min →
          </a>
        </td></tr>
      </table>
    </td></tr>

    ${openQuestion ? `
    ${divider()}
    <tr><td style="padding-bottom:8px;">
      <p style="margin:0 0 8px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">One question nobody's answered yet</p>
      <p style="margin:0;font-family:${SERIF};font-size:17px;color:${BLACK};line-height:1.55;font-style:italic;">
        ${openQuestion}
      </p>
    </td></tr>
    ` : ''}

    ${footer(unsubscribeUrl)}
  `)

  const text = `AI Signal · ${dateStr}

${story.headline}

${hookSentence}
${keyNumber ? `\nKey number: ${keyNumber}\n` : ''}
${numbersCard ? `By the numbers: ${numbersCard.value}` : ''}
${mattersCard ? `Why it matters: ${mattersCard.value}` : ''}
${moveCard ? `The move: ${moveCard.value}` : ''}

Read the full signal (${story.read_minutes} min): ${articleUrl}
${openQuestion ? `\nOne question nobody's answered yet:\n${openQuestion}` : ''}

---
AI Signal · aisignal.so
Unsubscribe: ${unsubscribeUrl}`

  return { subject, html, text }
}
