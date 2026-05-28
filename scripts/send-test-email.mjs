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

// ── Load .env.local manually (no dotenv dependency needed) ──────────────────
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

const TO_EMAIL   = process.argv[2]
const KEY_ARG    = process.argv[3]   // optional: pass key directly
if (!TO_EMAIL) { console.error('Usage: node scripts/send-test-email.mjs <email> [resend-api-key]'); process.exit(1) }

const RESEND_KEY = KEY_ARG || get('RESEND_API_KEY')
const SB_URL     = get('NEXT_PUBLIC_SUPABASE_URL')     || 'https://xswfsnnghloslzynkwni.supabase.co'
const SB_KEY     = get('SUPABASE_SERVICE_ROLE_KEY')    || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2Zzbm5naGxvc2x6eW5rd25pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE5NzgxOCwiZXhwIjoyMDkyNzczODE4fQ.P0ghCk98rYuZFq_XAInyVbQat-xW_BexDBhLnBFIMao'
if (!RESEND_KEY) { console.error('RESEND_API_KEY not found in .env.local'); process.exit(1) }

const FROM = get('EMAIL_FROM') || 'AI Signal <onboarding@resend.dev>'

// ── Inline minimal template (avoids TS import issues in .mjs) ───────────────
// Duplicates the core logic from email-templates.ts as plain JS.
// This is a test script only — the real templates are the TypeScript source.

const BLUE       = '#0047FF'
const BLACK      = '#111111'
const BODY_TEXT  = '#1A1A1A'
const MUTED      = '#666666'
const BORDER     = '#E8E8E8'
const CALLOUT_BG = '#EEF3FF'
const PAGE_BG    = '#F2F2F2'
const WHITE      = '#ffffff'
const MONO       = `'Courier New',Courier,monospace`
const SERIF      = `Georgia,'Times New Roman',serif`
const SANS       = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`

function wrap(body) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AI Signal</title></head>
<body style="margin:0;padding:0;background:${PAGE_BG};-webkit-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};">
<tr><td align="center" style="padding:32px 16px 48px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${WHITE};">
    <tr><td height="4" style="background:${BLUE};font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="padding:36px 40px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${body}
      </table>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
  <tr><td style="padding:16px 0 0;text-align:center;">
    <p style="margin:0;font-family:${SANS};font-size:11px;color:#999;">AI Signal &nbsp;·&nbsp; aisignal.so &nbsp;·&nbsp; 6:14 AM IST every morning</p>
  </td></tr></table>
</td></tr></table></body></html>`
}

function ctaButton(href, label) {
  return `<tr><td style="padding:4px 0 20px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="background:${BLUE};border-radius:5px;text-align:center;">
    <a href="${href}" style="display:block;padding:16px 24px;font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:0.1em;color:${WHITE};text-decoration:none;text-transform:uppercase;">${label}</a>
  </td></tr></table></td></tr>`
}

function divider() {
  return `<tr><td style="padding:20px 0;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>`
}

function footerRow(unsubscribeUrl, subscriberCount) {
  const MUTED_DARK = '#444444'
  const BODY_TEXT  = '#1A1A1A'
  const countLine = subscriberCount
    ? `<p style="margin:0 0 10px;font-family:${SANS};font-size:12px;color:${MUTED};">You're one of <strong style="color:${MUTED_DARK};">${subscriberCount.toLocaleString()}+</strong> subscribers.</p>`
    : ''
  return `<tr><td style="padding:28px 0 36px;">
  <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 20px;"/>
  ${countLine}
  <p style="margin:0 0 10px;font-family:${SANS};font-size:12px;color:${MUTED};">
    Found this useful? <a href="https://aisignal.so" style="color:${BLUE};text-decoration:none;">Forward it</a> to one person in your team.
  </p>
  <p style="margin:0 0 14px;font-family:${SANS};font-size:12px;color:${MUTED};">
    Was today's signal useful? &nbsp;
    <a href="mailto:hi@aisignal.so?subject=Feedback: useful&body=This issue was useful." style="color:${BODY_TEXT};text-decoration:none;font-size:15px;">👍</a>
    &nbsp;
    <a href="mailto:hi@aisignal.so?subject=Feedback: not useful&body=This issue wasn't useful. Here's why:" style="color:${BODY_TEXT};text-decoration:none;font-size:15px;">👎</a>
  </p>
  <p style="margin:0 0 6px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">AI SIGNAL</p>
  <p style="margin:0 0 10px;font-family:${SANS};font-size:12px;color:${MUTED};line-height:1.6;">One AI story every morning at 6:14 AM IST.<br/>For builders, PMs, and founders in the Indian tech ecosystem.</p>
  <p style="margin:0;font-family:${SANS};font-size:12px;color:${MUTED};">
    <a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp;
    <a href="https://aisignal.so" style="color:${MUTED};text-decoration:underline;">aisignal.so</a>
  </p></td></tr>`
}

function buildWelcomeHtml(unsubUrl) {
  return wrap(`
  <tr><td style="padding-bottom:20px;">
    <span style="font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${BLUE};">AI SIGNAL</span>
  </td></tr>
  <tr><td style="padding-bottom:28px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>
  <tr><td style="padding-bottom:8px;">
    <h1 style="margin:0;font-family:${SERIF};font-size:30px;font-weight:400;letter-spacing:-0.025em;color:${BLACK};line-height:1.2;">You're subscribed.</h1>
  </td></tr>
  <tr><td style="padding-bottom:28px;">
    <p style="margin:0;font-family:${SANS};font-size:17px;color:${MUTED};line-height:1.6;">Tomorrow at <strong style="color:${BLACK};">6:14 AM IST</strong>, your first signal arrives.</p>
  </td></tr>
  <tr><td style="padding:4px 0 4px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>
  <tr><td style="padding:20px 0 4px;">
    <p style="margin:0 0 16px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">WHAT YOU GET EVERY MORNING</p>
  </td></tr>
  <tr><td style="padding:14px 0;border-bottom:1px solid ${BORDER};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="24" valign="top" style="padding-top:2px;"><span style="font-family:${MONO};font-size:12px;font-weight:700;color:${BLUE};">01</span></td>
      <td style="padding-left:12px;">
        <p style="margin:0 0 2px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE SIGNAL</p>
        <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">One AI story — the one that changes something for builders. Not 10 headlines. Not a roundup.</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:14px 0;border-bottom:1px solid ${BORDER};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="24" valign="top" style="padding-top:2px;"><span style="font-family:${MONO};font-size:12px;font-weight:700;color:${BLUE};">02</span></td>
      <td style="padding-left:12px;">
        <p style="margin:0 0 2px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE NUMBERS</p>
        <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">The specific figures that change your decisions. Not the ones that sound impressive.</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:14px 0 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="24" valign="top" style="padding-top:2px;"><span style="font-family:${MONO};font-size:12px;font-weight:700;color:${BLUE};">03</span></td>
      <td style="padding-left:12px;">
        <p style="margin:0 0 2px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE MOVE</p>
        <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.55;">What to do in the next 48 hours — not a reading list. A concrete action before standup tomorrow.</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:4px 0 4px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>
  <tr><td style="padding:20px 0 16px;">
    <p style="margin:0;font-family:${SANS};font-size:16px;color:${BODY_TEXT};line-height:1.65;">While you wait — something probably shipped overnight that your competitors haven't noticed yet.</p>
  </td></tr>
  ${ctaButton('https://aisignal.so', "Read today's signal →")}
  <tr><td style="padding:8px 0 4px;">
    <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.7;">— Suraj<br/><span style="color:${MUTED};font-size:14px;">P.S. Reply to this email. I read every message.</span></p>
  </td></tr>
  ${footerRow(unsubUrl)}`)
}

function buildDailyHtml(story, issueNumber, unsubUrl, dateStr) {
  const CATEGORY_LABELS = { models:'MODELS', tools:'TOOLS', business:'BUSINESS', policy:'POLICY', research:'RESEARCH' }
  const categoryTag = CATEGORY_LABELS[story.category] ?? story.category.toUpperCase()
  const ext = story.extended_data ?? {}

  const summaryClean  = (story.summary || '').replace(/\*\*(.*?)\*\*/g, '$1')
  const sentences     = summaryClean.split(/(?<=[.!?])\s+/)
  const hook          = sentences[0] ?? summaryClean
  const implication   = sentences[1] ?? null

  const cards       = ext.preview_cards ?? []
  const numbersCard = cards.find(c => c.label === 'By the numbers')
  const mattersCard = cards.find(c => c.label === 'Why it matters')
  const moveCard    = cards.find(c => c.label === 'The move')

  const ticker    = ext.tickers?.[0]
  const statValue = ticker?.value ?? null
  const statLabel = ticker ? `${ticker.change?.text ?? ''} · ${ticker.label}` : null
  const statNote  = ticker?.detail ?? null
  const openQ     = ext.open_question ?? null
  const articleUrl = `https://aisignal.so/signal/${issueNumber}`

  // Personal opener — one_breath or insights_strip "What changed"
  const opener = ext.one_breath?.text?.replace(/\*\*(.*?)\*\*/g, '$1')
    ?? ext.insights_strip?.[0]?.text?.replace(/==(.*?)==/g, '$1').trim()
    ?? null

  // Category-specific P.S.
  const PS_LINES = {
    models:   `Teams who act on this today have a head start. Forward it to one engineer before standup.`,
    tools:    `The gap between builders who've tried this and builders who haven't is growing fast. Forward this to one person.`,
    business: `Send this to one founder peer or your team lead. They need to see it.`,
    policy:   `Forward this to your legal or compliance lead. If they haven't seen it, they're behind.`,
    research: `Research-to-product lag is a real competitive gap. The teams reading this now are 2 weeks ahead.`,
  }
  const psLine = PS_LINES[story.category]
    ?? `Forward this to one person on your team who should see it. They can subscribe at <a href="https://aisignal.so" style="color:${BLUE};text-decoration:none;">aisignal.so</a>`

  return wrap(`
  <tr><td style="padding-bottom:20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${BLUE};">AI SIGNAL</span></td>
      <td align="right"><span style="font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.08em;">${dateStr}</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding-bottom:28px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0;"/></td></tr>

  <tr><td style="padding-bottom:14px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="background:${CALLOUT_BG};border-radius:3px;padding:3px 9px;">
        <span style="font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.16em;color:${BLUE};">${categoryTag}</span>
      </td>
      <td style="padding-left:10px;">
        <span style="font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.06em;">${story.read_minutes} MIN READ</span>
      </td>
    </tr></table>
  </td></tr>

  ${opener ? `<tr><td style="padding-bottom:14px;">
    <p style="margin:0;font-family:${SANS};font-size:15px;color:#444444;line-height:1.65;font-style:italic;">${opener}</p>
  </td></tr>` : ''}

  <tr><td style="padding-bottom:14px;">
    <h1 style="margin:0;font-family:${SERIF};font-size:28px;font-weight:400;letter-spacing:-0.025em;color:${BLACK};line-height:1.2;">${story.headline}</h1>
  </td></tr>

  <tr><td style="padding-bottom:${implication ? '0' : '20'}px;">
    <p style="margin:0;font-family:${SANS};font-size:17px;color:${BODY_TEXT};line-height:1.65;">${hook}</p>
  </td></tr>

  ${implication ? `<tr><td style="padding:8px 0 20px;">
    <p style="margin:0;font-family:${SANS};font-size:16px;color:${MUTED};line-height:1.6;">${implication}</p>
  </td></tr>` : ''}

  ${statValue ? `<tr><td style="padding-bottom:24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="background:${CALLOUT_BG};border-left:3px solid ${BLUE};border-radius:0 4px 4px 0;padding:16px 20px;">
        <p style="margin:0 0 4px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BLUE};">KEY STAT</p>
        <p style="margin:0 0 4px;font-family:${SERIF};font-size:26px;font-weight:400;color:${BLACK};line-height:1.1;">${statValue}</p>
        ${statLabel ? `<p style="margin:0 0 ${statNote ? '3px' : '0'};font-family:${MONO};font-size:11px;color:${MUTED};letter-spacing:0.04em;">${statLabel}</p>` : ''}
        ${statNote  ? `<p style="margin:0;font-family:${SANS};font-size:13px;color:${MUTED};line-height:1.5;">${statNote}</p>` : ''}
      </td>
    </tr></table>
  </td></tr>` : ''}

  ${(numbersCard||mattersCard||moveCard) ? `
  <tr><td style="padding-bottom:6px;">
    <p style="margin:0 0 14px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">WHAT'S INSIDE TODAY</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${numbersCard ? `<tr><td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="28" valign="top"><span style="font-family:${MONO};font-size:10px;font-weight:700;color:${BLUE};">01</span></td>
          <td style="padding-left:8px;">
            <p style="margin:0 0 1px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">BY THE NUMBERS</p>
            <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.5;">${numbersCard.value}</p>
          </td>
        </tr></table>
      </td></tr>` : ''}
      ${mattersCard ? `<tr><td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="28" valign="top"><span style="font-family:${MONO};font-size:10px;font-weight:700;color:${BLUE};">02</span></td>
          <td style="padding-left:8px;">
            <p style="margin:0 0 1px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">WHY IT MATTERS</p>
            <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.5;">${mattersCard.value}</p>
          </td>
        </tr></table>
      </td></tr>` : ''}
      ${moveCard ? `<tr><td style="padding:10px 0 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="28" valign="top"><span style="font-family:${MONO};font-size:10px;font-weight:700;color:${BLUE};">03</span></td>
          <td style="padding-left:8px;">
            <p style="margin:0 0 1px;font-family:${MONO};font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">THE MOVE</p>
            <p style="margin:0;font-family:${SANS};font-size:15px;color:${BODY_TEXT};line-height:1.5;">${moveCard.value}</p>
          </td>
        </tr></table>
      </td></tr>` : ''}
    </table>
  </td></tr>` : ''}

  ${openQ ? `${divider()}<tr><td style="padding-bottom:8px;">
    <p style="margin:0 0 10px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">ONE QUESTION NOBODY'S ANSWERED YET</p>
    <p style="margin:0;font-family:${SERIF};font-size:18px;font-weight:400;color:${BLACK};line-height:1.55;font-style:italic;">"${openQ}"</p>
  </td></tr><tr><td style="padding-top:8px;"></td></tr>` : '<tr><td style="padding-top:20px;"></td></tr>'}

  ${ctaButton(articleUrl, `Read today's signal &nbsp;— ${story.read_minutes} min →`)}

  ${divider()}
  <tr><td style="padding-bottom:4px;">
    <p style="margin:0;font-family:${SANS};font-size:14px;color:#444444;line-height:1.65;">
      <strong>P.S.</strong> ${psLine}
    </p>
  </td></tr>

  ${footerRow(unsubUrl, null)}`)
}

// ── Main ───────────────────────────────────────────────────────────────────────

const sb     = createClient(SB_URL, SB_KEY)
const resend = new Resend(RESEND_KEY)

// Fetch most recent published story
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
const testUnsubUrl = 'https://aisignal.so/unsubscribe?token=test-token'

// ── 1. Send welcome email ──────────────────────────────────────────────────────
console.log('\n[1/2] Sending welcome email...')
const welcomeHtml    = buildWelcomeHtml(testUnsubUrl)
const welcomeResult  = await resend.emails.send({
  from: FROM,
  to: TO_EMAIL,
  subject: `You're in. First signal tomorrow at 6:14 AM IST.`,
  html: welcomeHtml,
})
console.log('Welcome email:', welcomeResult.data?.id ? `✓ sent (id: ${welcomeResult.data.id})` : `✗ ${JSON.stringify(welcomeResult.error)}`)

// ── 2. Send daily newsletter email ────────────────────────────────────────────
console.log('\n[2/2] Sending daily newsletter email...')
const dailyHtml      = buildDailyHtml(story, issueNumber, testUnsubUrl, dateStr)
const dailySubject   = story.editorial_take ?? story.headline
const dailyResult    = await resend.emails.send({
  from: FROM,
  to: TO_EMAIL,
  subject: dailySubject,
  html: dailyHtml,
})
console.log('Daily email:', dailyResult.data?.id ? `✓ sent (id: ${dailyResult.data.id})` : `✗ ${JSON.stringify(dailyResult.error)}`)

console.log(`\nDone. Check ${TO_EMAIL}`)
