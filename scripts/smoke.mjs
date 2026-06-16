// Smoke test: all routes status, all internal anchors resolve, all external
// links return 2xx/3xx, plus duplicate-text patterns we've seen leak.
// Regex-based DOM scrape — no jsdom dep so this stays cheap.
// Run: node scripts/smoke.mjs [base-url]

const BASE = process.argv[2] ?? 'https://aibasically-eta.vercel.app'

const ROUTES = [
  '/', '/about', '/archive',
  '/i/001', '/i/002', '/i/003',
  '/i/doesnotexist',
]

const fail = []
const pass = []

function p(test, ok, detail = '') {
  ;(ok ? pass : fail).push({ test, detail })
  console.log(`${ok ? '✓' : '✗'} ${test}${detail ? '  ' + detail : ''}`)
}

// Hosts that block HEAD or bot user-agents but work fine for real users.
// Returning 'warn' instead of fail keeps the smoke meaningful.
const BOT_BLOCKED_HOSTS = new Set([
  'www.linkedin.com', 'linkedin.com',
  'www.apollohospitals.com', 'apollohospitals.com',
  'english.bmrc.co.in', 'bmrc.co.in',
  'www.tneb.tnebnet.org', 'tneb.tnebnet.org',
])

async function head(url) {
  const opts = {
    redirect: 'follow',
    headers: {
      // Pretend to be a real browser; some hosts only respond to UAs that
      // claim Chrome/Firefox identity.
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 ' +
        '(KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    },
  }
  try {
    const r = await fetch(url, { method: 'HEAD', ...opts })
    if (r.status === 405) {
      // HEAD not allowed — retry with GET (LinkedIn does this).
      const g = await fetch(url, { method: 'GET', ...opts })
      return { ok: g.status < 400, status: g.status }
    }
    return { ok: r.status < 400, status: r.status }
  } catch {
    try {
      const r = await fetch(url, { method: 'GET', ...opts })
      return { ok: r.status < 400, status: r.status }
    } catch (e) {
      return { ok: false, status: 0, err: e.message }
    }
  }
}

async function getHtml(path) {
  const r = await fetch(BASE + path, { redirect: 'follow' })
  return { status: r.status, html: await r.text() }
}

const externalCache = new Map()
async function checkExternal(url) {
  if (externalCache.has(url)) return externalCache.get(url)
  const r = await head(url)
  externalCache.set(url, r)
  return r
}

// Strip HTML tags + collapse whitespace for content checks (close enough).
function plainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

console.log(`\nSMOKE: ${BASE}\n`)

for (const route of ROUTES) {
  const { status, html } = await getHtml(route)
  const expect404 = route === '/i/doesnotexist'
  p(`${route} → ${status}`, expect404 ? status === 404 : status === 200)
  if (status >= 500) continue
  if (expect404) continue

  // ---- Internal anchors resolve ----
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))
  const internalAnchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
  for (const a of internalAnchors) {
    if (a === '' || a === 'top') continue
    p(`${route} anchor #${a} resolves`, ids.has(a))
  }

  // ---- Duplicate text patterns ----
  const text = plainText(html)
  const dupePatterns = [
    [/Why you care:[^.]{0,200}?Why you care:/i, '"Why you care" appears twice'],
    [/So do this:[^.]{0,200}?So do this:/i, '"So do this" appears twice'],
    [/→ Do:[^.]{0,200}?→ Do:[^.]{0,200}?→ Do:/, '"→ Do:" lens action duplicated'],
  ]
  for (const [re, desc] of dupePatterns) {
    p(`${route} no duplicate: ${desc}`, !re.test(text))
  }

  // ---- No raw leak strings ----
  for (const bad of [' undefined ', ' null undefined ', '[object Object]', ' NaN ']) {
    p(`${route} no leak of "${bad.trim()}"`, !text.includes(bad))
  }

  // ---- External links (one per host) ----
  const externals = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1])
  const seenHost = new Set()
  for (const url of externals) {
    let h
    try { h = new URL(url).host } catch { continue }
    if (seenHost.has(h)) continue
    seenHost.add(h)
    const r = await checkExternal(url)
    if (!r.ok && BOT_BLOCKED_HOSTS.has(h)) {
      // Treat as a warning, not a failure — these are known to reject HEAD /
      // automated requests but resolve cleanly in real browsers.
      console.log(`⚠ ${route} external ${h} → ${r.status} (bot-blocked; OK for users)`)
      continue
    }
    p(`${route} external ${h} → ${r.status}`, r.ok, r.err ?? '')
  }

  // ---- mailto well-formed ----
  const mailtos = [...html.matchAll(/href="(mailto:[^"]+)"/g)].map((m) => m[1])
  for (const m of mailtos) {
    p(`${route} mailto well-formed: ${m}`, /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+/.test(m))
  }
}

console.log(`\n— ${pass.length} passed, ${fail.length} failed —\n`)
if (fail.length > 0) {
  console.log('FAILURES:')
  for (const f of fail) console.log('  ✗ ' + f.test + (f.detail ? '  ' + f.detail : ''))
  process.exit(1)
}
