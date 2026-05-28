import { NextRequest } from 'next/server'

export const runtime = 'edge'

const FACTS = [
  { label: 'Origin story', text: `The paper that powers every AI you use — "Attention Is All You Need" — was written by 8 Google researchers in 2017. All 8 left Google within 5 years to start or join rival AI labs.` },
  { label: 'The real cost', text: `Training a single frontier model costs over $100M and uses as much electricity as 1,000 US homes consume in a year. Every query you run adds to that tab.` },
  { label: 'First chatbot', text: `ELIZA (1966), the world's first chatbot, simulated a therapist so convincingly that its own creator's secretary asked him to leave the room so she could talk to it in private.` },
  { label: 'The 50-year problem', text: `DeepMind's AlphaFold 2 solved protein-structure prediction in 2020 — a problem biologists had worked on for 50 years. It's now accelerating drug discovery at 500+ labs worldwide.` },
  { label: 'The word of our era', text: `"Hallucination" appeared in fewer than 10 AI papers before 2018. By 2023: over 10,000 papers. The problem didn't get worse — we just finally had a word for it.` },
  { label: 'Scale vs. brain', text: `GPT-4 has ~1.8 trillion parameters. The human brain has 86 billion neurons — each connecting to 7,000 others, dynamically. Parameters don't come close.` },
  { label: 'Etymology', text: `"Robot" comes from 'robota' — Czech for drudgery or forced labour — coined in a 1920 sci-fi play. The playwright later said he regretted giving the word to the world.` },
]

async function getDestination(issueNumber: number): Promise<string> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'
  const article = `${base}/signal/${issueNumber}`

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return article

  try {
    const res = await fetch(
      `${url}/rest/v1/issues?select=issue_number&status=eq.published&order=published_at.desc&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return article
    const rows = (await res.json()) as Array<{ issue_number: number }>
    const latest = rows[0]?.issue_number ?? null
    return latest === issueNumber ? base : article
  } catch {
    return article
  }
}

function buildPage(destination: string, issueNumber: number): string {
  const fact = FACTS[issueNumber % FACTS.length]
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AI Signal</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;background:#ece9e3;display:flex;align-items:center;justify-content:center;padding:24px;font-family:-apple-system,system-ui,'Segoe UI',sans-serif}
    .card{background:#fff;border-radius:8px;padding:40px 36px;max-width:520px;width:100%;box-shadow:0 2px 20px rgba(0,0,0,.06)}
    .brand{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:20px;color:#1c1a17;margin-bottom:28px}
    .eyebrow{font-family:'SF Mono',ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#8a857d;margin-bottom:10px}
    .label{font-family:'SF Mono',ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#4F46E5;font-weight:700;margin-bottom:10px}
    .fact{font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.68;color:#3d3a34}
    .bar-wrap{margin-top:32px;height:2px;background:#e7e3db;border-radius:2px;overflow:hidden}
    .bar{height:100%;background:#4F46E5;width:0;border-radius:2px;animation:grow 1.8s linear forwards}
    @keyframes grow{to{width:100%}}
    .skip{margin-top:16px;text-align:center;font-size:12px;color:#a8a297}
    .skip a{color:#4F46E5;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">AI Signal</div>
    <div class="eyebrow">&#9889;&nbsp; One sec — while we route you</div>
    <div class="label">${fact.label}</div>
    <p class="fact">${fact.text}</p>
    <div class="bar-wrap"><div class="bar"></div></div>
    <p class="skip">Skip the wait? <a href="${destination}">Go now &rarr;</a></p>
  </div>
  <script>setTimeout(function(){location.replace(${JSON.stringify(destination)})},1800)</script>
</body>
</html>`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params
  const issueNumber = parseInt(number, 10)
  const destination = await getDestination(issueNumber)

  return new Response(buildPage(destination, issueNumber), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
    },
  })
}
