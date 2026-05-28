/**
 * send-test-email.mjs
 * Sends both welcome + daily newsletter emails to a test address
 * using the latest published story from Supabase.
 *
 * Usage: node scripts/send-test-email.mjs suraj.pandita18@gmail.com
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env.local')
const env = {}
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '')
  })
} catch { /* no .env.local — rely on process.env */ }
const get = k => env[k] || process.env[k]

const TO_EMAIL = process.argv[2]
const KEY_ARG  = process.argv[3]
if (!TO_EMAIL) { console.error('Usage: node scripts/send-test-email.mjs <email> [resend-api-key]'); process.exit(1) }

const RESEND_KEY = KEY_ARG || get('RESEND_API_KEY')
const SITE_URL   = get('NEXT_PUBLIC_SITE_URL') || 'https://ai-signal-eta.vercel.app'
const SB_URL     = get('NEXT_PUBLIC_SUPABASE_URL')  || 'https://xswfsnnghloslzynkwni.supabase.co'
const SB_KEY     = get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2Zzbm5naGxvc2x6eW5rd25pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE5NzgxOCwiZXhwIjoyMDkyNzczODE4fQ.P0ghCk98rYuZFq_XAInyVbQat-xW_BexDBhLnBFIMao'
if (!RESEND_KEY) { console.error('RESEND_API_KEY not found in .env.local'); process.exit(1) }

const FROM = get('EMAIL_FROM') || 'Suraj @ AI Signal <delta@getaisignal.org>'

// ── Design tokens (AI Signal Design System v1) ────────────────────────────────

const INK         = '#1c1a17'
const BODY_CLR    = '#3d3a34'
const META        = '#8a857d'
const FAINT       = '#a8a297'
const CANVAS      = '#ece9e3'
const FILL        = '#fbfaf8'
const LINE        = '#e7e3db'
const LINE_2      = '#ddd8cf'
const WHITE       = '#ffffff'
const INDIGO      = '#4F46E5'
const INDIGO_TINT = '#EEF2FF'
const INDIGO_TEXT = '#312e6b'
const ORANGE      = '#F97316'
const ORANGE_TINT = '#FFF7ED'
const ORANGE_INK  = '#7c2d12'
const ORANGE_LBL  = '#c2410c'
const TAN         = '#FBF6EE'
const TAN_LINE    = '#E8DFC9'
const TAN_INK     = '#9a7b3f'
const BUTTON      = '#0F172A'

const MONO  = `'SF Mono','JetBrains Mono',ui-monospace,Menlo,Consolas,monospace`
const SERIF = `Georgia,'Times New Roman',serif`
const SANS  = `-apple-system,system-ui,'Segoe UI',Helvetica,Arial,sans-serif`

const CATEGORY_COLORS = {
  models:   { accent: '#4F46E5', tint: '#EEF2FF', label: 'Models' },
  tools:    { accent: '#F97316', tint: '#FFF1E6', label: 'Tools' },
  business: { accent: '#10B981', tint: '#E7F8F0', label: 'Funding' },
  funding:  { accent: '#10B981', tint: '#E7F8F0', label: 'Funding' },
  research: { accent: '#8B5CF6', tint: '#F2EDFE', label: 'Research' },
  infra:    { accent: '#6B7280', tint: '#F1F1F0', label: 'Infra' },
  policy:   { accent: '#EF4444', tint: '#FDECEC', label: 'Safety' },
  safety:   { accent: '#EF4444', tint: '#FDECEC', label: 'Safety' },
  product:  { accent: '#EC4899', tint: '#FCEAF3', label: 'Product' },
}

function getCat(category) {
  return CATEGORY_COLORS[category?.toLowerCase()] ?? { accent: INDIGO, tint: INDIGO_TINT, label: category ?? 'AI' }
}

function md(text) {
  return (text ?? '')
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${INK};">$1</strong>`)
    .replace(/==(.*?)==/g, '$1')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

// ── Outer wrapper ─────────────────────────────────────────────────────────────

function wrap(preheader, body) {
  const pad = '&nbsp;&zwnj;'.repeat(9)
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <title>AI Signal</title>
  <style>
    :root { color-scheme: light; }
    .qr-row  { display:table-row; }
    .upi-row { display:none; }
    @media only screen and (max-width:600px) {
      .container { width:100% !important; }
      .px { padding-left:16px !important; padding-right:16px !important; }
      .stack { display:block !important; width:100% !important; box-sizing:border-box !important; margin-bottom:12px !important; }
      .stack-gap { display:none !important; }
      .h-headline { font-size:24px !important; line-height:1.2 !important; }
      .h-sub { font-size:20px !important; }
      .cta-btn { display:block !important; width:100% !important; box-sizing:border-box !important; text-align:center !important; padding-left:0 !important; padding-right:0 !important; }
      .qr-row  { display:none !important; }
      .upi-row { display:table-row !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${CANVAS}; color-scheme:light; -webkit-text-size-adjust:100%;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; color:${CANVAS}; opacity:0;">${preheader}${pad}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CANVAS};">
    <tr><td align="center" style="padding:28px 12px 40px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container" style="width:600px; max-width:600px; background-color:${WHITE};">
        <tbody>${body}</tbody>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Section builders ──────────────────────────────────────────────────────────

function sMasthead(issueNumber, dateStr, readMinutes) {
  const metaRow = issueNumber != null
    ? `Signal&nbsp;#${issueNumber}&nbsp;&nbsp;&middot;&nbsp;&nbsp;${dateStr}&nbsp;&nbsp;&middot;&nbsp;&nbsp;${readMinutes ?? 4}&nbsp;min&nbsp;read`
    : `Welcome&nbsp;Edition&nbsp;&nbsp;&middot;&nbsp;&nbsp;${dateStr}`
  return `
  <tr><td class="px" style="padding:30px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="left" style="font-family:${SERIF}; font-style:italic; font-size:19px; color:${INK};">AI&nbsp;Signal</td>
      <td align="right" style="font-family:${MONO}; font-size:10px; letter-spacing:1.2px; color:${META}; text-transform:uppercase;">signal@getaisignal.org</td>
    </tr></table>
  </td></tr>
  <tr><td class="px" style="padding:14px 44px 0 44px;">
    <div style="font-family:${MONO}; font-size:11px; letter-spacing:1.8px; color:${META}; text-transform:uppercase;">${metaRow}</div>
  </td></tr>
  <tr><td class="px" style="padding:18px 44px 0 44px;">
    <div style="border-top:1px solid ${LINE}; font-size:0; line-height:0;">&nbsp;</div>
  </td></tr>`
}

function sCatBadge(category) {
  const cat = getCat(category)
  return `
  <tr><td class="px" style="padding:26px 44px 0 44px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="background-color:${cat.tint}; border-radius:3px; padding:6px 11px; font-family:${MONO}; font-size:11px; letter-spacing:2px; color:${cat.accent}; text-transform:uppercase; font-weight:700;">${cat.label}</td>
    </tr></table>
  </td></tr>`
}

function sHeadline(text) {
  return `
  <tr><td class="px" style="padding:16px 44px 0 44px;">
    <h1 class="h-headline" style="margin:0; font-family:${SERIF}; font-weight:700; font-size:31px; line-height:1.2; letter-spacing:-0.3px; color:${INK};">${text}</h1>
  </td></tr>`
}

function sOneBreath(text) {
  return `
  <tr><td class="px" style="padding:26px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${ORANGE_TINT}; border-left:4px solid ${ORANGE}; border-radius:0 4px 4px 0;"><tr>
      <td style="padding:16px 20px 18px 20px;">
        <div style="font-family:${MONO}; font-size:10px; letter-spacing:2px; color:${ORANGE_LBL}; text-transform:uppercase; font-weight:700;">&#9680;&nbsp;&nbsp;In one breath</div>
        <p style="margin:8px 0 0 0; font-family:${SERIF}; font-size:16px; line-height:1.5; color:${ORANGE_INK};">${md(text)}</p>
      </td>
    </tr></table>
  </td></tr>`
}

function sTheSignal(text) {
  return `
  <tr><td class="px" style="padding:16px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${INDIGO_TINT}; border-left:4px solid ${INDIGO}; border-radius:0 4px 4px 0;"><tr>
      <td style="padding:18px 22px 20px 22px;">
        <div style="font-family:${MONO}; font-size:10px; letter-spacing:2px; color:${INDIGO}; text-transform:uppercase; font-weight:700;">&#9655;&nbsp;&nbsp;The signal</div>
        <p style="margin:9px 0 0 0; font-family:${SERIF}; font-size:16px; line-height:1.62; color:${INDIGO_TEXT};">${md(text)}</p>
      </td>
    </tr></table>
  </td></tr>`
}

function sStatsGrid(insights) {
  if (!insights || insights.length === 0) return ''
  const cells = insights.slice(0, 3)
  const cards = cells.map((cell, i) => {
    const labelColor = i === 2 ? INDIGO : META
    return `<td class="stack" valign="top" style="background-color:${FILL}; border:1px solid ${LINE}; border-radius:5px; padding:15px 15px 16px 15px;">
      <div style="font-family:${MONO}; font-size:10px; letter-spacing:1.5px; color:${labelColor}; text-transform:uppercase; font-weight:700;">${cell.icon}&nbsp;&nbsp;${cell.label}</div>
      <p style="margin:8px 0 0 0; font-family:${SANS}; font-size:14px; line-height:1.5; color:${BODY_CLR};">${md(cell.text)}</p>
    </td>`
  })
  const parts = []
  cards.forEach((card, i) => {
    parts.push(card)
    if (i < cards.length - 1) parts.push(`<td class="stack-gap" width="12" style="font-size:0; line-height:0;">&nbsp;</td>`)
  })
  return `
  <tr><td class="px" style="padding:28px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr>
      ${parts.join('\n      ')}
    </tr></table>
  </td></tr>`
}

function sWhyItMatters(subHead, bodyText) {
  if (!bodyText) return ''
  return `
  <tr><td class="px" style="padding:34px 44px 0 44px;">
    <div style="font-family:${MONO}; font-size:10px; letter-spacing:2px; color:${META}; text-transform:uppercase; font-weight:700;">Why it matters</div>
  </td></tr>
  <tr><td class="px" style="padding:12px 44px 0 44px;">
    <h2 style="margin:0; font-family:${SERIF}; font-weight:700; font-size:23px; line-height:1.28; letter-spacing:-0.2px; color:${INK};">${md(subHead)}</h2>
  </td></tr>
  <tr><td class="px" style="padding:14px 44px 0 44px;">
    <p style="margin:0; font-family:${SANS}; font-size:15px; line-height:1.65; color:${BODY_CLR};">${md(bodyText)}</p>
  </td></tr>
  <tr><td class="px" style="padding:12px 44px 0 44px;">
    <p style="margin:0; font-family:${SERIF}; font-style:italic; font-size:15px; line-height:1.6; color:${META};">The full breakdown — and what to build next — is in today's analysis. &#8595;</p>
  </td></tr>`
}

function sEditorsTake(text) {
  return `
  <tr><td class="px" style="padding:28px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${FILL}; border:1px solid ${LINE_2}; border-radius:5px;"><tr>
      <td style="padding:20px 22px 22px 22px;">
        <div style="font-family:${MONO}; font-size:10px; letter-spacing:2px; color:${META}; text-transform:uppercase; font-weight:700;">Editor's take</div>
        <p style="margin:10px 0 0 0; font-family:${SERIF}; font-size:16px; line-height:1.58; color:${BODY_CLR};"><strong style="color:${INDIGO};">My call &#8594;</strong> ${md(text)}</p>
      </td>
    </tr></table>
  </td></tr>`
}

function sPlaybook(moveText) {
  return `
  <tr><td class="px" style="padding:16px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${FILL}; border:1px solid ${LINE_2}; border-radius:6px;"><tr>
      <td style="padding:20px 22px 22px 22px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-family:${MONO}; font-size:11px; letter-spacing:2px; color:${META}; text-transform:uppercase; font-weight:700;">What you should do</td>
          <td align="right" style="font-family:${MONO}; font-size:10px; letter-spacing:1.5px; color:${INDIGO}; text-transform:uppercase; font-weight:700;">&#10697;&nbsp;The move</td>
        </tr></table>
        <p style="margin:13px 0 0 0; font-family:${SANS}; font-size:15px; line-height:1.5; color:${INK}; font-weight:600;">${md(moveText)}</p>
        <div style="border-top:1px dashed ${LINE_2}; margin-top:15px; font-size:0; line-height:0;">&nbsp;</div>
        <p style="margin:13px 0 0 0; font-family:${MONO}; font-size:11px; line-height:1.55; letter-spacing:0.5px; color:${META}; text-transform:uppercase;">The how-to — with examples — is in the full analysis &#8595;</p>
      </td>
    </tr></table>
  </td></tr>`
}

function sCtaButton(href) {
  return `
  <tr><td class="px" align="center" style="padding:20px 44px 0 44px;">
    <a href="${href}" class="cta-btn" style="display:inline-block; background-color:${BUTTON}; color:${WHITE}; font-family:${SANS}; font-size:15px; font-weight:700; text-decoration:none; padding:15px 34px; border-radius:5px; letter-spacing:0.2px;">Read the full analysis&nbsp;&#8594;</a>
  </td></tr>`
}

function sHairline(paddingTop = 32) {
  return `
  <tr><td class="px" style="padding:${paddingTop}px 44px 0 44px;">
    <div style="border-top:1px solid ${LINE}; font-size:0; line-height:0;">&nbsp;</div>
  </td></tr>`
}

function sCounterView(reactions) {
  if (!reactions || reactions.length === 0) return ''
  const cards = reactions.slice(0, 3).map(r =>
    `<td class="stack" valign="top" style="border:1px solid ${LINE}; border-radius:5px; padding:15px 15px 16px 15px;">
      <div style="font-family:${SERIF}; font-size:26px; line-height:0.6; color:#cfc7b8;">&#8220;</div>
      <p style="margin:4px 0 0 0; font-family:${SERIF}; font-style:italic; font-size:14px; line-height:1.5; color:${BODY_CLR};">${md(r.quote)}</p>
      <p style="margin:12px 0 0 0; font-family:${MONO}; font-size:9px; line-height:1.5; letter-spacing:0.5px; color:${META}; text-transform:uppercase;">${r.name}<br>${r.role}</p>
    </td>`
  )
  const parts = []
  cards.forEach((card, i) => {
    parts.push(card)
    if (i < cards.length - 1) parts.push(`<td class="stack-gap" width="12" style="font-size:0; line-height:0;">&nbsp;</td>`)
  })
  return `
  ${sHairline(24)}
  <tr><td class="px" style="padding:24px 44px 0 44px;">
    <div style="font-family:${MONO}; font-size:11px; letter-spacing:2px; color:${META}; text-transform:uppercase; font-weight:700;">In the field</div>
  </td></tr>
  <tr><td class="px" style="padding:14px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr>
      ${parts.join('\n      ')}
    </tr></table>
  </td></tr>`
}

const SURAJ_NOTES = {
  models:   `Yaar, every week a new model drops and everyone scrambles to update their benchmarks. But the real question isn't which model is best right now — it's which **architectural decision** you're making that locks you into one. That's the thing to audit before you do anything else.`,
  tools:    `Yaar, the tool that looked like a nice-to-have last quarter is now quietly becoming table stakes. I've seen this pattern before — the builders who tried it early are already two iterations ahead. If you're reading this, you're not late. But you will be if you wait another week.`,
  business: `Yaar, funding rounds feel like noise until they shift the floor under your pricing assumptions. This one did that. The valuation tells you what the smart money believes will be worth owning in 18 months. It's worth 10 minutes to ask if your roadmap is building toward that or away from it.`,
  research: `Yaar, most research takes 18 months to become something you can actually ship. This one has a shorter runway than that. The signal I look for is when a benchmark result changes what you'd build this week — not just what you'd talk about. This one passed that test.`,
  policy:   `Yaar, regulation feels abstract until it hits your compliance checklist. The teams that read these signals early write the playbook. The ones that wait inherit someone else's interpretation. This is one of those moments where getting ahead of it is the entire advantage.`,
}

function sSurajTake(noteText, category) {
  const rawNote = noteText || SURAJ_NOTES[category] || `Yaar, one story. Every morning. The one that actually changes what you'd build this week — not just what you'd tweet about. If it landed for you, it'll land for someone on your team too. You already know who.`
  const body = md(rawNote)
  return `
  <tr><td class="px" style="padding:30px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${TAN}; border:1px solid ${TAN_LINE}; border-top:3px solid ${INK}; border-radius:2px 2px 6px 6px;"><tr>
      <td style="padding:24px 26px 26px 26px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle" width="38" style="width:38px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="width:38px; height:38px; background-color:${INK}; border-radius:50%; text-align:center; font-family:${SERIF}; font-style:italic; font-size:18px; color:${TAN};">S</td>
            </tr></table>
          </td>
          <td valign="middle" style="padding-left:12px; font-family:${SANS}; font-size:14px; font-weight:700; color:${INK};">
            Suraj<br><span style="font-family:${MONO}; font-size:9px; letter-spacing:1px; color:${TAN_INK}; text-transform:uppercase; font-weight:700;">Founder &middot; writes this solo</span>
          </td>
          <td valign="middle" align="right" style="font-family:${MONO}; font-size:9px; letter-spacing:1.5px; color:#b09257; text-transform:uppercase; font-weight:700; white-space:nowrap;">&#9993;&nbsp; Email-only</td>
        </tr></table>
        <p style="margin:18px 0 0 0; font-family:${SERIF}; font-style:italic; font-size:17px; line-height:1.68; color:#46402f;">${body}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr>
          <td style="font-family:${SERIF}; font-style:italic; font-size:22px; color:${INK};">&#8212;&nbsp;Suraj</td>
        </tr></table>
      </td>
    </tr></table>
  </td></tr>`
}

function sTipJar() {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&ecc=M&data=upi%3A%2F%2Fpay%3Fpa%3Dsuraj.pandita132%40ybl%26pn%3DAI%2520Signal%26cu%3DINR`
  return `
  ${sHairline(34)}
  <tr><td class="px" align="center" style="padding:22px 44px 12px 44px;">
    <p style="margin:0; font-family:${SERIF}; font-size:15px; line-height:1.5; color:${INK};">Built by one founder. Read by builders.</p>
    <p style="margin:6px 0 0 0; font-family:${SANS}; font-size:14px; line-height:1.5; color:#6b6b6b;">If today saved you 30 minutes, &#9749; send a chai &#8594;</p>
  </td></tr>
  <tr class="qr-row" style="display:table-row;"><td class="px" align="center" style="padding:14px 44px 0 44px;">
    <img src="${qrSrc}" width="140" height="140" alt="Scan to pay via UPI" style="display:block; margin:0 auto; border:1px solid ${LINE}; border-radius:8px; padding:8px; background:${WHITE};">
    <p style="margin:10px 0 2px 0; font-family:${MONO}; font-size:10px; letter-spacing:1px; color:${FAINT}; text-transform:uppercase;">Scan with PhonePe &middot; GPay &middot; any UPI app</p>
    <p style="margin:0; font-family:${MONO}; font-size:11px; color:${META}; letter-spacing:0.5px;">suraj.pandita132@ybl</p>
  </td></tr>
  <tr class="upi-row" style="display:none;"><td class="px" align="center" style="padding:14px 16px 0 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="background-color:${TAN}; border:1px dashed ${TAN_LINE}; border-radius:8px; padding:16px 18px; text-align:center;">
        <div style="font-family:${MONO}; font-size:10px; letter-spacing:1.5px; color:${TAN_INK}; text-transform:uppercase; margin-bottom:10px;">&#9749;&nbsp; Send a chai &mdash; UPI ID</div>
        <div style="font-family:${MONO}; font-size:17px; font-weight:700; color:${INK}; letter-spacing:0.5px; -webkit-user-select:all; user-select:all;">suraj.pandita132@ybl</div>
        <div style="font-family:${SANS}; font-size:12px; color:${META}; margin-top:10px; line-height:1.5;">Tap &amp; hold to copy &rarr; open PhonePe or GPay &rarr; paste in &ldquo;Pay&rdquo;</div>
      </td>
    </tr></table>
  </td></tr>`
}

const AI_FACTS = [
  { label: 'Origin story', fact: `The paper that powers every AI today — "Attention Is All You Need" — was written by 8 Google researchers in 2017. All 8 left Google within 5 years to found or join rival AI labs.` },
  { label: 'Scale check', fact: `GPT-4 has ~1.8 trillion parameters. The human brain has ~86 billion neurons — but each neuron connects to 7,000 others dynamically. Parameters don't come close to that richness.` },
  { label: 'Real cost', fact: `Training a single frontier model can cost over $100 million and use as much electricity as 1,000 US homes consume in a year. Inference — every query you run — adds to that.` },
  { label: 'First chatbot', fact: `ELIZA (1966), the first chatbot, simulated a therapist so convincingly that its creator's own secretary asked him to leave the room so she could speak to it in private.` },
  { label: 'Real impact', fact: `DeepMind's AlphaFold 2 solved protein-structure prediction in 2020 — a problem biologists had worked on for 50 years. It's now accelerating drug discovery at hundreds of labs.` },
  { label: 'Word of the era', fact: `The term "hallucination" appeared in fewer than 10 AI papers before 2018. By 2023, it appeared in over 10,000. The problem didn't get worse — we just started talking about it.` },
  { label: 'Etymology', fact: `"Robot" comes from 'robota' — Czech for drudgery or forced labor — coined in a 1920 sci-fi play. The author later said he regretted introducing the word to the world.` },
]

function sAIFact(issueNumber) {
  const idx = issueNumber != null ? issueNumber % AI_FACTS.length : new Date().getDate() % AI_FACTS.length
  const f = AI_FACTS[idx]
  return `
  <tr><td class="px" style="padding:26px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${FILL}; border:1px solid ${LINE}; border-radius:5px;"><tr>
      <td style="padding:14px 18px 16px 18px;">
        <div style="font-family:${MONO}; font-size:9px; letter-spacing:2px; color:${META}; text-transform:uppercase; font-weight:700;">&#9889;&nbsp; Did you know &middot; ${f.label}</div>
        <p style="margin:8px 0 0 0; font-family:${SANS}; font-size:13px; line-height:1.58; color:${BODY_CLR};">${f.fact}</p>
      </td>
    </tr></table>
  </td></tr>`
}

function sPS(text) {
  return `
  <tr><td class="px" style="padding:26px 44px 0 44px;">
    <p style="margin:0; font-family:${SERIF}; font-size:16px; line-height:1.5; color:${BODY_CLR};">
      <em style="color:${INK};">P.S.</em>&nbsp; ${text}
    </p>
  </td></tr>`
}

function sFooter(unsubUrl) {
  return `
  ${sHairline(34)}
  <tr><td class="px" align="center" style="padding:24px 44px 34px 44px;">
    <div style="font-family:${SERIF}; font-style:italic; font-size:16px; color:${INK};">AI&nbsp;Signal</div>
    <p style="margin:6px 0 0 0; font-family:${SANS}; font-size:12px; line-height:1.5; color:${META};">Made with care in Bengaluru &middot; 06:14 IST, every morning<br>Bengaluru, Karnataka, India</p>
    <p style="margin:14px 0 0 0; font-family:${MONO}; font-size:11px; letter-spacing:1px; color:#6b6b6b; text-transform:uppercase;">
      <a href="https://twitter.com/getaisignal" style="color:#6b6b6b; text-decoration:none;">Twitter</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="https://getaisignal.org/rss" style="color:#6b6b6b; text-decoration:none;">RSS</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="https://getaisignal.org/privacy" style="color:#6b6b6b; text-decoration:none;">Privacy</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="mailto:signal@getaisignal.org" style="color:#6b6b6b; text-decoration:none;">Contact</a>
    </p>
    <p style="margin:14px 0 0 0; font-family:${SANS}; font-size:11px; line-height:1.6; color:${FAINT};">
      <a href="https://getaisignal.org/manage" style="color:${FAINT}; text-decoration:underline;">Manage preferences</a>&nbsp;&middot;&nbsp;<a href="${unsubUrl}" style="color:${FAINT}; text-decoration:underline;">Unsubscribe</a>
      <br>You're receiving this because you signed up at getaisignal.org
    </p>
  </td></tr>`
}

// ── Template builders ─────────────────────────────────────────────────────────

function buildWelcomeHtml(unsubUrl) {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const body = `
    ${sMasthead(null, today)}
    <tr><td class="px" style="padding:26px 44px 0 44px;">
      <h1 class="h-headline" style="margin:0; font-family:${SERIF}; font-weight:700; font-size:31px; line-height:1.2; letter-spacing:-0.3px; color:${INK};">You're in.</h1>
    </td></tr>
    <tr><td class="px" style="padding:16px 44px 0 44px;">
      <p style="margin:0; font-family:${SERIF}; font-size:18px; line-height:1.55; color:${BODY_CLR};">First signal lands tomorrow at <strong style="color:${INK};">6:14 AM IST.</strong> One AI story, every morning — the one worth acting on.</p>
    </td></tr>
    <tr><td class="px" style="padding:28px 44px 0 44px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${FILL}; border:1px solid ${LINE_2}; border-radius:6px;"><tr>
        <td style="padding:20px 22px 22px 22px;">
          <div style="font-family:${MONO}; font-size:11px; letter-spacing:2px; color:${META}; text-transform:uppercase; font-weight:700;">What you get every morning</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
            <tr>
              <td valign="top" width="26" style="font-family:${MONO}; font-size:13px; font-weight:700; color:${INDIGO}; padding-top:1px;">01</td>
              <td style="font-family:${SANS}; font-size:15px; line-height:1.5; color:${INK}; font-weight:600; padding-bottom:9px;">The Signal — one AI story that forces a decision</td>
            </tr>
            <tr>
              <td valign="top" width="26" style="font-family:${MONO}; font-size:13px; font-weight:700; color:${INDIGO}; padding-top:1px;">02</td>
              <td style="font-family:${SANS}; font-size:15px; line-height:1.5; color:${INK}; font-weight:600; padding-bottom:9px;">Why it matters — the implication you can't ignore</td>
            </tr>
            <tr>
              <td valign="top" width="26" style="font-family:${MONO}; font-size:13px; font-weight:700; color:${INDIGO}; padding-top:1px;">03</td>
              <td style="font-family:${SANS}; font-size:15px; line-height:1.5; color:${INK}; font-weight:600;">The Move — what to do in the next 48 hours</td>
            </tr>
          </table>
          <div style="border-top:1px dashed ${LINE_2}; margin-top:15px; font-size:0; line-height:0;">&nbsp;</div>
          <p style="margin:13px 0 0 0; font-family:${MONO}; font-size:11px; line-height:1.55; letter-spacing:0.5px; color:${META}; text-transform:uppercase;">4 minutes. Every morning. In your inbox by 6:14 AM IST.</p>
        </td>
      </tr></table>
    </td></tr>
    <tr><td class="px" align="center" style="padding:20px 44px 0 44px;">
      <a href="${SITE_URL}" class="cta-btn" style="display:inline-block; background-color:${BUTTON}; color:${WHITE}; font-family:${SANS}; font-size:15px; font-weight:700; text-decoration:none; padding:15px 34px; border-radius:5px; letter-spacing:0.2px;">Read today's signal&nbsp;&#8594;</a>
    </td></tr>
    ${sSurajTake(null, null)}
    ${sTipJar()}
    ${sAIFact()}
    ${sPS('Reply to this email anytime. I read every message — it shapes what gets covered.')}
    ${sFooter(unsubUrl)}`
  return wrap("One AI story. Every morning. For people who ship.", body)
}

function buildDailyHtml(story, issueNumber, unsubUrl, dateStr) {
  const ext = story.extended_data ?? {}

  const cards       = ext.preview_cards ?? []
  const mattersCard = cards.find(c => c.label === 'Why it matters')
  const moveCard    = cards.find(c => c.label === 'The move')
  const numbersCard = cards.find(c => c.label === 'By the numbers')

  const reactions = ext.reactions ?? []
  const insights  = ext.insights_strip ?? []

  const rawMatters = mattersCard?.value ?? ''
  const whySubHead = ext.matters_headline
    ?? (rawMatters ? rawMatters.split(/(?<=[.!?])\s+/)[0]?.trim() : '')
  const whyBody    = ext.matters_headline
    ? rawMatters
    : rawMatters.split(/(?<=[.!?])\s+/).slice(1).join(' ').trim()

  const PS_LINES = {
    models:   `One engineer on your team is about to make an architecture decision without seeing this. You know who.`,
    tools:    `Someone you work with is about to spend a week building something this tool already does. Worth a forward.`,
    business: `If someone on your team is writing a roadmap or pitch this week, they should read this first.`,
    policy:   `Your compliance or legal lead will hear about this eventually — better from you, with context, than cold.`,
    research: `Someone on your team will rediscover this in 6 months and call it a new idea. Forward it now.`,
  }
  const psText = PS_LINES[story.category] ?? `Know someone who'd find this useful? They can subscribe at getaisignal.org — free, every morning.`
  const articleUrl = `${SITE_URL}/goto/${issueNumber}`

  const body = `
    ${sMasthead(issueNumber, dateStr, story.read_minutes)}
    ${sCatBadge(story.category)}
    ${sHeadline(story.headline)}
    ${ext.one_breath?.text ? sOneBreath(ext.one_breath.text) : ''}
    ${sTheSignal(story.summary)}
    ${insights.length > 0 ? sStatsGrid(insights) : ''}
    ${(whySubHead && whyBody) ? sWhyItMatters(whySubHead, whyBody) : whySubHead ? sWhyItMatters(whySubHead, rawMatters) : ''}
    ${story.editorial_take ? sEditorsTake(story.editorial_take) : ''}
    ${moveCard?.value ? sPlaybook(moveCard.value) : ''}
    ${sCtaButton(articleUrl)}
    ${reactions.length > 0 ? sCounterView(reactions) : sHairline(32)}
    ${sSurajTake(ext.suraj_note, story.category)}
    ${sTipJar()}
    ${sAIFact(issueNumber)}
    ${sPS(psText)}
    ${sFooter(unsubUrl)}`

  const preheader = moveCard?.value
    ? `The move: ${moveCard.value.slice(0, 100)}`
    : story.headline

  return wrap(preheader, body)
}

// ── Main ───────────────────────────────────────────────────────────────────────

const sb     = createClient(SB_URL, SB_KEY)
const resend = new Resend(RESEND_KEY)

const { data: issues } = await sb
  .from('issues')
  .select('issue_number, stories(*)')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(1)

if (!issues?.length || !issues[0].stories?.length) {
  console.error('No published stories found'); process.exit(1)
}

const issueNumber = issues[0].issue_number
const story = issues[0].stories[0]

console.log(`Using story: [#${issueNumber}] ${story.headline}`)

const now = new Date()
const dateStr = now.toLocaleDateString('en-IN', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric'
})
const testUnsubUrl = 'https://getaisignal.org/unsubscribe?token=test-token'

console.log('\n[1/2] Sending welcome email...')
const welcomeHtml   = buildWelcomeHtml(testUnsubUrl)
const welcomeResult = await resend.emails.send({
  from: FROM,
  to: TO_EMAIL,
  subject: `You're in. First signal tomorrow at 6:14 AM IST.`,
  html: welcomeHtml,
})
console.log('Welcome email:', welcomeResult.data?.id ? `✓ sent (id: ${welcomeResult.data.id})` : `✗ ${JSON.stringify(welcomeResult.error)}`)

console.log('\n[2/2] Sending daily newsletter email...')
const dailyHtml    = buildDailyHtml(story, issueNumber, testUnsubUrl, dateStr)
const dailySubject = story.editorial_take ?? story.headline
const dailyResult  = await resend.emails.send({
  from: FROM,
  to: TO_EMAIL,
  subject: dailySubject,
  html: dailyHtml,
})
console.log('Daily email:', dailyResult.data?.id ? `✓ sent (id: ${dailyResult.data.id})` : `✗ ${JSON.stringify(dailyResult.error)}`)

console.log(`\nDone. Check ${TO_EMAIL}`)
