# Brief: StoryArticle + ReadingSidebar components

**Date:** 2026-04-28  
**Agent:** FORGE  
**Files to create:**
- `src/components/StoryArticle.tsx` (new)
- `src/components/ReadingSidebar.tsx` (new)

**Design reference:** `design/references/ai-signal-v8.html` — read `.story-wrap`, `.sidebar`, `.score-card`, `.preview-card` sections and the reading score JavaScript.

**Types reference:** `db/types/database.ts` — read for the `Story` row type

---

## DO NOT
- Touch any existing component files
- Touch globals.css, layout.tsx, page.tsx
- Add new npm dependencies
- Use `any` types

---

## 1. StoryArticle.tsx

`'use client'` — needs expiry timer countdown + share button interactions.

### Props
```ts
import type { Database } from '@/db/types/database'
type Story = Database['public']['Tables']['stories']['Row']

interface StoryArticleProps {
  story: Story
  publishedAt: string   // ISO string of issue published_at
  signalNumber: number
  onReadPctChange?: (pct: number) => void  // for syncing with sidebar
}
```

### Expiry timer
```ts
const [timeLeft, setTimeLeft] = useState('')
const [expired, setExpired] = useState(false)

useEffect(() => {
  const published = new Date(publishedAt).getTime()
  const expiry = published + 24 * 60 * 60 * 1000

  function tick() {
    const remaining = expiry - Date.now()
    if (remaining <= 0) { setExpired(true); setTimeLeft('00:00:00'); return }
    const h = Math.floor(remaining / 3600000)
    const m = Math.floor((remaining % 3600000) / 60000)
    const s = Math.floor((remaining % 60000) / 1000)
    setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
  }
  tick()
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)
}, [publishedAt])
```

### Reading progress tracking
```ts
const articleRef = useRef<HTMLElement>(null)

useEffect(() => {
  function onScroll() {
    if (!articleRef.current) return
    const { offsetTop, offsetHeight } = articleRef.current
    const scrolled = window.scrollY + window.innerHeight - offsetTop
    const pct = Math.max(0, Math.min(100, Math.round((scrolled / offsetHeight) * 100)))
    onReadPctChange?.(pct)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  return () => window.removeEventListener('scroll', onScroll)
}, [onReadPctChange])
```

### Layout

Wrap everything in `<article ref={articleRef} className="reveal">` with:
```
background: var(--bg-card)
border: 1px solid var(--border)
border-radius: 20px
padding: 48px
box-shadow: 0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.04)
```

**Section 1 — Story meta bar:**
```tsx
<div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
  {/* Category chip */}
  <span style={{ background:'var(--signal-soft)', color:'var(--signal-deep)', padding:'5px 11px',
    borderRadius:6, fontSize:12, fontWeight:600 }}>
    {story.category.toUpperCase()}
  </span>
  <span style={{ fontSize:14, color:'var(--text-mute)', fontWeight:500 }}>{story.read_minutes} min read</span>
  <span style={{ color:'var(--text-faint)' }}>·</span>
  <span style={{ fontSize:14, color:'var(--text-mute)', fontWeight:500 }}>Filed 06:14 IST</span>
  
  {/* Timer badge */}
  {!expired && (
    <span style={{ display:'inline-flex', alignItems:'center', gap:8,
      background:'var(--warm-soft)', border:'1px solid rgba(255,107,53,0.25)',
      padding:'5px 11px', borderRadius:6, fontFamily:'var(--ff-mono)',
      fontSize:12, fontWeight:600, color:'var(--warm)' }}>
      <span style={{ width:12, height:12, border:'1.5px solid var(--warm)', borderRadius:'50%',
        position:'relative', display:'inline-block' }} />
      {timeLeft}
    </span>
  )}
</div>
```

**Section 2 — Headline + deck:**
```tsx
<h2 style={{ fontFamily:'var(--ff-display)', fontSize:'clamp(34px,4.6vw,52px)',
  lineHeight:1.06, letterSpacing:'-0.025em', fontWeight:400, marginBottom:0 }}>
  {story.headline}
</h2>

<p style={{ fontSize:19, lineHeight:1.55, color:'var(--text-soft)', margin:'28px 0 32px' }}>
  {story.summary}
</p>
```

**Section 3 — Author row:**
```tsx
<div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 0',
  borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', marginBottom:36 }}>
  <div style={{ width:38, height:38, borderRadius:'50%',
    background:'linear-gradient(135deg, var(--signal), var(--warm))',
    flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
    color:'white', fontWeight:700, fontSize:13, position:'relative' }}>
    AS
  </div>
  <div style={{ flex:1 }}>
    <div style={{ fontSize:14, fontWeight:600 }}>AI Signal Editorial</div>
    <div style={{ fontSize:13, color:'var(--text-mute)' }}>@aisignal · Signal #{signalNumber}</div>
  </div>
  {/* Share buttons row — X, copy link, bookmark */}
  <ShareButtons />
</div>
```

**Section 4 — Signal block (why it matters):**
```tsx
<div style={{ background:'linear-gradient(135deg,var(--signal-faint),var(--bg-card))',
  border:'1px solid var(--signal-soft)', borderLeft:'4px solid var(--signal)',
  borderRadius:14, padding:'24px 28px', marginBottom:40 }}>
  <div style={{ color:'var(--signal)', marginBottom:10, display:'flex', alignItems:'center', gap:8,
    fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase' }}>
    ▶ The Signal
  </div>
  <div style={{ fontSize:17, lineHeight:1.6 }}
    dangerouslySetInnerHTML={{ __html: story.why_it_matters.replace(
      /\*\*(.*?)\*\*/g, '<strong style="font-weight:600">$1</strong>'
    )}} />
</div>
```

**Section 5 — Role lenses (3 blocks if data exists):**

For each available lens (`lens_pm`, `lens_founder`, `lens_builder`):
```tsx
{story.lens_pm && (
  <div style={{ marginBottom:32 }}>
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
      <span style={{ width:26, height:26, borderRadius:7, background:'var(--text)', color:'var(--bg)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:12, fontWeight:700, fontFamily:'var(--ff-mono)' }}>PM</span>
      <span style={{ fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:600,
        textTransform:'uppercase', letterSpacing:'0.16em', color:'var(--text-mute)' }}>PM lens</span>
    </div>
    <p style={{ fontSize:17, lineHeight:1.6, color:'var(--text-soft)' }}>{story.lens_pm}</p>
  </div>
)}
```
Same pattern for `lens_founder` (label "Founder lens") and `lens_builder` (label "Builder lens", use dark builder block style from HTML: dark bg, gradient, Fraunces quote font).

**Section 6 — Deeper read link (if exists):**
```tsx
{story.deeper_read && (
  <a href={story.deeper_read} target="_blank" rel="noopener noreferrer" 
    style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'18px 22px', background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:12, marginTop:32, textDecoration:'none', color:'var(--text)',
      transition:'all 0.2s' }}>
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:38, height:38, borderRadius:8, background:'var(--text)',
        color:'white', display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:700, fontSize:15 }}>→</div>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-mute)', marginBottom:2 }}>
          Deeper read
        </div>
        <div style={{ fontSize:15, fontWeight:500 }}>Read the full source →</div>
      </div>
    </div>
  </a>
)}
```

**Section 7 — Read stamp:**
```tsx
<div style={{ marginTop:32, padding:20, textAlign:'center',
  fontFamily:'var(--ff-hand)', fontSize:22, color:'var(--text-mute)',
  borderTop:'1px dashed var(--border-mid)', lineHeight:1.3 }}>
  You've read Signal #{signalNumber}. Tomorrow's drops at 06:14 IST.
</div>
```

### ShareButtons (internal sub-component, not exported)
Simple buttons: X share (window.open twitter intent), copy link (navigator.clipboard), bookmark (console.log for now).
Each is 32×32px, border 1px solid var(--border), rounded-lg.

---

## 2. ReadingSidebar.tsx

`'use client'` — scroll tracking + ring animation.

### Props
```ts
interface ReadingSidebarProps {
  readPct: number   // 0–100, passed from parent
  signalNumber: number
}
```

### Reading score SVG ring

The ring is an SVG circle with stroke-dasharray = 2π×34 ≈ 213.63:
```tsx
const circumference = 2 * Math.PI * 34  // 213.628...

// stroke-dashoffset = circumference * (1 - pct/100)
const offset = circumference * (1 - readPct / 100)
```

```tsx
<svg viewBox="0 0 80 80" style={{ width: 80, height: 80, transform: 'rotate(-90deg)' }}>
  <defs>
    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#2B5BFF" />
      <stop offset="100%" stopColor="#FF6B35" />
    </linearGradient>
  </defs>
  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-soft)" strokeWidth="6" />
  <circle
    cx="40" cy="40" r="34"
    fill="none"
    stroke="url(#scoreGrad)"
    strokeWidth="6"
    strokeLinecap="round"
    strokeDasharray={`${circumference}`}
    strokeDashoffset={`${offset}`}
    style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.2,0.8,0.2,1)' }}
  />
</svg>
// centered number overlay (position absolute over SVG)
<div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
  alignItems:'center', justifyContent:'center' }}>
  <span style={{ fontFamily:'var(--ff-display)', fontSize:22, fontWeight:500, color:'var(--text)' }}>
    {readPct}<em style={{ fontStyle:'italic', color:'var(--signal)', fontSize:14 }}>%</em>
  </span>
</div>
```

### Contextual message (changes at milestones)
```ts
function getMessage(pct: number): { title: string; detail: string } {
  if (pct < 10) return { title: 'Just landed.', detail: 'Most readers leave before the second paragraph. Stay.' }
  if (pct < 25) return { title: 'Past the headline.', detail: 'You made it past the headline. That alone puts you ahead.' }
  if (pct < 50) return { title: 'Halfway in.', detail: 'The data section is below — usually where readers quit.' }
  if (pct < 75) return { title: 'Past the data.', detail: "You're reading the part most subscribers skip." }
  if (pct < 95) return { title: 'Almost there.', detail: "The final section has the real edge." }
  return { title: 'Inner circle.', detail: `You read the whole thing. Tomorrow's signal drops at 06:14 IST.` }
}
```

### Milestone markers
```tsx
<div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--ff-mono)',
  fontSize:9, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.12em',
  marginTop:14, paddingTop:14, borderTop:'1px dashed var(--border)' }}>
  {[25, 50, 75, 100].map(m => (
    <span key={m} style={{ color: readPct >= m ? 'var(--signal)' : undefined,
      fontWeight: readPct >= m ? 700 : 500 }}>
      {m === 100 ? 'Finish' : `${m}%`}
    </span>
  ))}
</div>
```

### Coming up next card
Static for now — hardcoded 3 future items:
- Tomorrow's (unlocked preview): "Coming soon — tomorrow's signal"
- 2 days out: locked
- 3 days out: locked

```tsx
<div style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
  borderRadius:14, padding:'20px 22px', boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}>
  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14,
    fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:600,
    textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--signal)' }}>
    → Coming up next
  </div>
  {/* list of 3 items, last 2 show lock icon + "Subscribe to unlock" */}
</div>
```

### Full sidebar wrapper
```tsx
<aside style={{ position:'sticky', top:100, display:'flex', flexDirection:'column', gap:20 }}>
  {/* score card */}
  {/* coming up next */}
</aside>
```

---

## Acceptance criteria
- StoryArticle: expiry timer counts down in real time
- ReadingSidebar: ring fills smoothly as user scrolls
- Both typecheck clean, no `any`
- Export: `export function StoryArticle()` and `export function ReadingSidebar()`

## Log file
Write to `/src/IMPLEMENTATION_LOG_article.md`
