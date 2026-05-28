import { NextRequest } from 'next/server'

export const runtime = 'edge'

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
  // Starting index varies by issue so different emails show different facts first
  const startIdx = issueNumber % 10

  const factsJson = JSON.stringify([
    { l: 'Origin story', t: `The paper powering every AI you've used — "Attention Is All You Need" — was written by 8 Google researchers in 2017. All 8 left Google within 5 years to start or join rival AI labs.` },
    { l: 'First chatbot', t: `ELIZA (1966) simulated a therapist so convincingly that its creator's own secretary asked him to leave the room so she could speak to it in private. It was just pattern-matching text.` },
    { l: 'The real scale', t: `GPT-4 has ~1.8 trillion parameters. Your brain has 86 billion neurons — each dynamically wired to 7,000 others. We're not even in the same conversation.` },
    { l: 'The word of our era', t: `"Hallucination" appeared in fewer than 10 AI papers before 2018. By 2023, it appeared in over 10,000. The problem didn't get worse. We just finally had a word for it.` },
    { l: 'The 50-year shortcut', t: `AlphaFold 2 solved protein-structure prediction in 2020 — a problem biologists had worked on for 50 years. It's now accelerating drug discovery at 500+ labs worldwide.` },
    { l: 'The real cost', t: `Training a single frontier model costs $100M+ and uses as much electricity as 1,000 US homes burn in a year. Every query you run adds to that bill.` },
    { l: 'Etymology', t: `"Robot" comes from 'robota' — Czech for drudgery or forced labour — coined in a 1920 sci-fi play. The playwright later said he deeply regretted giving the word to the world.` },
    { l: 'The literal bug', t: `The first computer bug was an actual bug — a moth found stuck in a relay of the Harvard Mark II in 1947. Grace Hopper's team taped it into the logbook. The entry reads: "First actual case of bug being found."` },
    { l: 'The ironic name', t: `OpenAI stopped publishing research papers in 2022 and closed its most powerful models. The "open" in the name now refers mainly to the website being publicly accessible.` },
    { l: 'Naming convention', t: `Claude, GPT, Gemini, Llama — AI models are named like hurricane seasons and ancient gods. The models will outlast the names. Probably.` },
  ])

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AI Signal</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;background:#ece9e3;display:flex;align-items:center;justify-content:center;padding:24px;font-family:-apple-system,system-ui,'Segoe UI',sans-serif}
    .card{background:#fff;border-radius:8px;padding:40px 36px;max-width:520px;width:100%;box-shadow:0 2px 20px rgba(0,0,0,.06);opacity:0;transform:translateY(10px);transition:opacity .35s ease,transform .35s ease}
    .card.vis{opacity:1;transform:translateY(0)}
    .brand{font-family:Georgia,serif;font-style:italic;font-size:20px;color:#1c1a17;margin-bottom:28px}
    .status{font-family:'SF Mono',ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#8a857d;margin-bottom:18px}
    .label{font-family:'SF Mono',ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#4F46E5;font-weight:700;margin-bottom:10px;transition:opacity .2s}
    .fact{font-family:Georgia,serif;font-size:17px;line-height:1.68;color:#3d3a34;transition:opacity .2s;min-height:90px}
    .dots{display:flex;gap:6px;margin-top:28px;align-items:center}
    .dots span{width:6px;height:6px;background:#e7e3db;border-radius:50%;animation:pulse 1.4s ease-in-out infinite}
    .dots span:nth-child(2){animation-delay:.2s}
    .dots span:nth-child(3){animation-delay:.4s}
    @keyframes pulse{0%,100%{background:#e7e3db}50%{background:#4F46E5}}
    .footer{display:flex;justify-content:space-between;align-items:center;margin-top:24px;font-size:12px;color:#a8a297}
    .footer a{color:#4F46E5;text-decoration:none}
    .counter{font-family:'SF Mono',ui-monospace,Menlo,monospace;font-size:10px}
  </style>
</head>
<body>
  <div class="card" id="c">
    <div class="brand">AI Signal</div>
    <div class="status">&#9889;&nbsp; Your signal is loading &mdash; here's something worth knowing</div>
    <div class="label" id="lbl"></div>
    <p class="fact" id="txt"></p>
    <div class="dots"><span></span><span></span><span></span></div>
    <div class="footer">
      <span class="counter" id="ctr"></span>
      <a href=${JSON.stringify(destination)}>Skip &rarr;</a>
    </div>
  </div>
  <script>
    var dest=${JSON.stringify(destination)};
    var facts=${factsJson};
    var i=${startIdx};
    var total=facts.length;

    // Fire redirect immediately — if fast, user never sees this page at all
    try{window.location.replace(dest)}catch(e){}

    function show(n,animate){
      var f=facts[n%total];
      var lbl=document.getElementById('lbl');
      var txt=document.getElementById('txt');
      var ctr=document.getElementById('ctr');
      if(animate){
        lbl.style.opacity='0';txt.style.opacity='0';
        setTimeout(function(){
          lbl.textContent=f.l;txt.textContent=f.t;
          ctr.textContent=(n%total+1)+' / '+total;
          lbl.style.opacity='1';txt.style.opacity='1';
        },200);
      }else{
        lbl.textContent=f.l;txt.textContent=f.t;
        ctr.textContent=(n%total+1)+' / '+total;
      }
    }

    // Reveal card only if still on page after 300ms (destination is slow)
    setTimeout(function(){
      var c=document.getElementById('c');
      if(!c)return;
      c.className+=' vis';
      show(i,false);
      // Rotate to next fact every 4s so longer waits = more content
      setInterval(function(){i++;show(i,true)},4000);
    },300);
  </script>
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
