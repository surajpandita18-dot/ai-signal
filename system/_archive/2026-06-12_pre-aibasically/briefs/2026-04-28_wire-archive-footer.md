# Brief: TheWire + ArchiveSection + SubscribeSection + SiteFooter

**Date:** 2026-04-28  
**Agent:** FORGE  
**Files to create:**
- `src/components/TheWire.tsx` (new)
- `src/components/ArchiveSection.tsx` (new)
- `src/components/SubscribeSection.tsx` (new)
- `src/components/SiteFooter.tsx` (new)

**Design reference:** `design/references/ai-signal-v8.html` — read `.wire-zone`, `.archive`, `.subscribe`, `footer` sections and the wire JavaScript.

---

## DO NOT
- Touch any existing component files
- Touch globals.css, layout.tsx, tailwind.config.ts, or page.tsx
- Add new npm dependencies
- Use `any` types

---

## 1. TheWire.tsx

`'use client'` — live number tickers + live clock.

### No props (self-contained static dispatches)

### State for tickers
```ts
const [tokensVal, setTokensVal] = useState(4.2)   // trillions
const [co2Val, setCo2Val] = useState(142)          // metric tons/hour
const [powerVal, setPowerVal] = useState(0.31)     // % of grid
const [clockStr, setClockStr] = useState('')
```

### Ticker effects
```ts
// Tokens — fast (1.4s)
useEffect(() => {
  const id = setInterval(() => {
    setTokensVal(v => parseFloat((v + Math.random() * 0.05 + 0.02).toFixed(1)))
  }, 1400)
  return () => clearInterval(id)
}, [])

// CO₂ — slower (2.2s)
useEffect(() => {
  const id = setInterval(() => {
    setCo2Val(v => Math.round(v + Math.random() * 0.4 + 0.1))
  }, 2200)
  return () => clearInterval(id)
}, [])

// Power — drifts (3.5s)
useEffect(() => {
  const id = setInterval(() => {
    setPowerVal(v => {
      const next = v + (Math.random() - 0.3) * 0.005
      return parseFloat(Math.max(0.28, Math.min(0.35, next)).toFixed(2))
    })
  }, 3500)
  return () => clearInterval(id)
}, [])

// Clock
useEffect(() => {
  const tick = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2,'0')
    setClockStr(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`)
  }
  tick()
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)
}, [])
```

### Inline style for wire shell
The `.wire-shell` has a paper-ruled background + subtle grain — implement via inline `<style>` tag:
```tsx
<style>{`
  .wire-shell {
    background:
      repeating-linear-gradient(0deg, transparent 0, transparent 38px, rgba(20,17,15,0.025) 38px, rgba(20,17,15,0.025) 39px),
      #FBF8F1;
    border: 1px solid #D6D2C5;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 24px rgba(20,17,15,0.06), 0 24px 64px rgba(20,17,15,0.04);
  }
  .dispatch-num-flash {
    animation: numFlash 1s ease-out;
  }
`}</style>
```

### Structure

```tsx
<section style={{ maxWidth:1280, margin:'80px auto 0', padding:'0 32px' }} className="reveal">
  <div className="wire-shell">

    {/* Masthead */}
    <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:24,
      alignItems:'center', padding:'28px 36px 22px', borderBottom:'2px solid var(--text)' }}>
      
      {/* Title */}
      <div style={{ display:'flex', alignItems:'baseline', gap:16, lineHeight:1 }}>
        <span style={{ fontFamily:'var(--ff-fraunces)', fontStyle:'italic', fontWeight:500,
          fontSize:38, color:'var(--text)', letterSpacing:'-0.025em' }}>
          The <span style={{ color:'var(--warm)', fontWeight:600 }}>Wire</span>
        </span>
        <span style={{ fontFamily:'var(--ff-mono)', fontSize:10, fontWeight:700,
          color:'var(--text-mute)', letterSpacing:'0.22em', textTransform:'uppercase',
          borderLeft:'1px solid var(--border-mid)', paddingLeft:14 }}>
          · 047 · LIVE FEED
        </span>
      </div>

      {/* Dateline */}
      <div style={{ textAlign:'center', fontFamily:'var(--ff-mono)', fontSize:10,
        fontWeight:600, color:'var(--text-mute)', letterSpacing:'0.32em', textTransform:'uppercase' }}>
        <span style={{ color:'var(--text)', fontWeight:700 }}>28 April 2026</span> · While you were reading
      </div>

      {/* Live badge */}
      <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'var(--ff-mono)',
        fontSize:10, fontWeight:700, color:'var(--warm)', letterSpacing:'0.22em', textTransform:'uppercase',
        padding:'8px 14px', border:'1px solid rgba(255,107,53,0.35)', borderRadius:2,
        background:'var(--warm-soft)' }}>
        <span style={{ width:7, height:7, background:'var(--warm)', borderRadius:'50%',
          animation:'livePulse 1.4s ease-in-out infinite', display:'inline-block',
          boxShadow:'0 0 0 3px rgba(255,107,53,0.18)' }} />
        Filed live
      </div>
    </div>

    {/* Dispatches — 4 rows */}
    <div>
      {/* Row 1: lead + breaking (Paris, Mistral $240M) */}
      <WireDispatch
        time="14:23 IST" origin="RTRS-AI" city="Paris"
        text={<>Mistral closes <strong>$240M</strong> Series C round, valuation reportedly hits <strong>$6B</strong>. Sources cite enterprise contract pipeline as primary driver.</>}
        delta={{ dir: 'up', value: '+8.4%' }}
        isLead isBreaking
      />
      
      {/* Row 2: power consumption (uses live powerVal) */}
      <WireDispatch
        time="14:18 IST" origin="WSJ-DC" city="Global"
        text={<>AI inference now consuming <NumFlash value={`${powerVal}%`} /> of global electricity grid — up from 0.18% same period last year.</>}
        delta={{ dir: 'down', value: '+72.2%' }}
      />
      
      {/* Row 3: CO₂ (uses live co2Val) */}
      <WireDispatch
        time="14:09 IST" origin="NIKKEI" city="Tokyo"
        text={<>Nvidia order book reaches <strong>14,000 GPUs</strong> in the past hour. CO₂ from inference clocking <NumFlash value={`${co2Val}`} /> metric tons / hour worldwide.</>}
        delta={{ dir: 'up', value: '+11.6%' }}
      />
      
      {/* Row 4: tokens (uses live tokensVal) */}
      <WireDispatch
        time="14:02 IST" origin="AISIG" city="Worldwide"
        text={<>Major providers processed <NumFlash value={`${tokensVal}T`} /> tokens this hour. Total AI infrastructure spend today: <strong>$847.2M</strong>.</>}
        delta={{ dir: 'up', value: '+8.4%' }}
      />
    </div>

    {/* Footer */}
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'14px 36px', borderTop:'1px solid var(--border-mid)',
      background:'rgba(20,17,15,0.03)', fontFamily:'var(--ff-mono)',
      fontSize:10, fontWeight:600, color:'var(--text-mute)',
      letterSpacing:'0.18em', textTransform:'uppercase' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span>The Wire</span>
        <span style={{ width:1, height:12, background:'var(--border-mid)', display:'inline-block' }} />
        <span>Aggregated dispatches · Refreshed live</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span>IST</span>
        <span style={{ color:'var(--text)', fontWeight:700, fontVariantNumeric:'tabular-nums',
          letterSpacing:'0.04em' }}>{clockStr}</span>
      </div>
    </div>

  </div>
</section>
```

### Internal sub-components (not exported, defined in same file):

**WireDispatch:**
```ts
interface WireDispatchProps {
  time: string
  origin: string
  city: string
  text: React.ReactNode
  delta: { dir: 'up' | 'down'; value: string }
  isLead?: boolean
  isBreaking?: boolean
}
```
4-column grid: `88px 100px 1fr auto`. Breaking = `borderLeft: '3px solid var(--warm)'`.

**NumFlash:**
```ts
interface NumFlashProps { value: string }
```
Renders a `<span>` with warm color. On value change, adds `dispatch-num-flash` class for 1s, then removes it.

---

## 2. ArchiveSection.tsx

Server component. No props (hardcoded demo data for now).

```ts
const ARCHIVE_ITEMS = [
  { cat: 'INFRASTRUCTURE', day: '26 April', title: 'Anthropic ships agentic file system primitives — quietly redrawing the eval map' },
  { cat: 'REGULATION', day: '25 April', title: 'EU AI Act enforcement begins. Three startups pulled out of the market overnight.' },
  { cat: 'TALENT', day: '24 April', title: 'The post-research generation: where the people who left the big labs landed in Q1' },
]
```

Layout:
```tsx
<section style={{ maxWidth:1280, margin:'100px auto 0', padding:'80px 32px 0',
  borderTop:'1px solid var(--border)' }} className="reveal">
  
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end',
    marginBottom:36, flexWrap:'wrap', gap:16 }}>
    <h2 style={{ fontFamily:'var(--ff-display)', fontSize:44, lineHeight:1,
      fontWeight:400, letterSpacing:'-0.025em' }}>
      Past <em style={{ fontStyle:'italic', color:'var(--signal)' }}>transmissions</em>
    </h2>
    <a href="/archive" style={{ color:'var(--text)', borderBottom:'1px solid var(--border-strong)',
      textDecoration:'none', paddingBottom:1, fontSize:14, fontWeight:500 }}>
      View full archive →
    </a>
  </div>

  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
    {ARCHIVE_ITEMS.map((item, i) => (
      <article key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:14, padding:28, cursor:'pointer', minHeight:240,
        display:'flex', flexDirection:'column' }} className="reveal">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <span style={{ fontFamily:'var(--ff-mono)', fontSize:10, fontWeight:600,
            textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--signal)' }}>
            {item.cat}
          </span>
          <span style={{ fontFamily:'var(--ff-mono)', fontSize:11, color:'var(--text-mute)' }}>
            {item.day}
          </span>
        </div>
        <h3 style={{ fontFamily:'var(--ff-display)', fontSize:22, lineHeight:1.2,
          fontWeight:400, flex:1, marginBottom:18, letterSpacing:'-0.015em' }}>
          {item.title}
        </h3>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          paddingTop:16, borderTop:'1px solid var(--border)', fontSize:12,
          color:'var(--text-mute)', fontWeight:500 }}>
          <span style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:5, height:5, background:'var(--text-faint)', borderRadius:'50%',
              display:'inline-block' }} />
            Expired
          </span>
          <span>Read →</span>
        </div>
      </article>
    ))}
  </div>
</section>
```

---

## 3. SubscribeSection.tsx

`'use client'` — form state.

### State
```ts
const [email, setEmail] = useState('')
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
const [errorMsg, setErrorMsg] = useState('')
```

### Submit handler
```ts
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    setErrorMsg('Enter a valid email.'); setStatus('error'); return
  }
  setStatus('loading')
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.ok || res.status === 409) {
      setStatus('success')
    } else {
      throw new Error()
    }
  } catch {
    setStatus('error'); setErrorMsg('Something went wrong. Try again.')
  }
}
```

### Layout
```tsx
<section style={{ maxWidth:1280, margin:'100px auto 0', padding:'0 32px' }}>
  <div style={{
    background: 'var(--text)', color: 'var(--bg)',
    borderRadius: 24, padding: '64px 56px',
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64,
    alignItems: 'center', position: 'relative', overflow: 'hidden',
  }}>
    {/* glow blob behind */}
    <div style={{ position:'absolute', top:'-50%', right:'-20%', width:500, height:500,
      background:'radial-gradient(circle, var(--signal) 0%, transparent 60%)',
      opacity:0.4, pointerEvents:'none' }} />

    {/* Left: headline */}
    <h2 style={{ fontFamily:'var(--ff-display)', fontSize:'clamp(32px,4vw,48px)',
      lineHeight:1.05, fontWeight:400, letterSpacing:'-0.025em', position:'relative', zIndex:1 }}>
      Get tomorrow's signal{' '}
      <em style={{ fontStyle:'italic', color:'var(--signal-soft)' }}>before</em> it expires.
    </h2>

    {/* Right: form */}
    <div style={{ position:'relative', zIndex:1 }}>
      <div style={{ fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:600,
        textTransform:'uppercase', letterSpacing:'0.16em', color:'var(--signal-soft)', marginBottom:18 }}>
        ↑ The dispatch
      </div>
      <p style={{ fontSize:16, lineHeight:1.6, color:'rgba(255,255,255,0.75)', marginBottom:28 }}>
        One transmission, every morning at 06:14 IST. Built for builders, engineers, and product people.
      </p>
      
      {status === 'success' ? (
        <p style={{ color:'var(--signal-soft)', fontFamily:'var(--ff-mono)', fontSize:14 }}>
          ✓ You're in. See you tomorrow at 06:14 IST.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display:'flex', gap:8,
          background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
          borderRadius:12, padding:6 }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ flex:1, background:'transparent', border:'none', outline:'none',
              padding:'12px 14px', color:'white', fontSize:15, fontFamily:'var(--ff-body)' }}
          />
          <button type="submit" disabled={status === 'loading'}
            style={{ background:'var(--signal)', color:'white', border:'none',
              padding:'12px 24px', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            {status === 'loading' ? '…' : 'Subscribe'}
          </button>
        </form>
      )}
      
      {status === 'error' && (
        <p style={{ marginTop:8, fontSize:12, color:'rgba(255,100,100,0.9)' }}>{errorMsg}</p>
      )}
      
      <div style={{ marginTop:18, fontSize:13, color:'rgba(255,255,255,0.55)',
        display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <span>✓ Free forever</span>
        <span>✓ No spam</span>
        <span>✓ Unsubscribe anytime</span>
      </div>
    </div>
  </div>
</section>
```

---

## 4. SiteFooter.tsx

Server component.

```tsx
export function SiteFooter() {
  return (
    <footer style={{ maxWidth:1280, margin:'80px auto 0', padding:'40px 32px 60px',
      borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between',
      alignItems:'center', flexWrap:'wrap', gap:24, fontSize:13, color:'var(--text-mute)' }}>
      
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10,
          fontSize:14, fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em' }}>
          <div style={{ width:24, height:24, background:'var(--text)', borderRadius:6,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--bg)', fontSize:12, fontWeight:800 }}>S</div>
          <span>AI Signal</span>
        </div>
        <span style={{ fontFamily:'var(--ff-display)', fontSize:14,
          color:'var(--text-mute)', fontStyle:'normal' }}>
          <em style={{ fontStyle:'italic', color:'var(--text-soft)' }}>Made with care in Bengaluru</em>
          {' '}· 06:14 IST, every morning
        </span>
      </div>

      <div style={{ display:'flex', gap:24 }}>
        {[
          { label: 'Twitter', href: 'https://twitter.com' },
          { label: 'About', href: '/about' },
          { label: 'Privacy', href: '/privacy' },
          { label: 'Contact', href: 'mailto:suraj.pandita18@gmail.com' },
        ].map(link => (
          <a key={link.label} href={link.href}
            style={{ color:'inherit', textDecoration:'none', transition:'color 0.2s' }}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  )
}
```

---

## Acceptance criteria
- `npx tsc --noEmit` passes, no `any`
- Live tickers update in TheWire without full re-render of other sections
- SubscribeSection form calls `/api/subscribe` correctly
- All 4 exports: `TheWire`, `ArchiveSection`, `SubscribeSection`, `SiteFooter`

## Log file
Write to `/src/IMPLEMENTATION_LOG_wire.md`
