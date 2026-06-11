# Brief: NotebookFacts component

**Date:** 2026-04-28  
**Agent:** FORGE  
**File to create:** `src/components/NotebookFacts.tsx` (new)

**Design reference:** `design/references/ai-signal-v8.html` — read `.notebook-strip`, `.notebook`, `.nb-*` sections and the notebook JavaScript section.

---

## DO NOT
- Touch any file outside `src/components/NotebookFacts.tsx`
- Add new npm dependencies
- Use `any` types

---

## Overview

An animated "Did you know?" notebook card that rotates through AI facts. Key animations:
1. **Paper sway** — subtle continuous CSS animation on the notebook div
2. **Write-in** — new fact text clip-path reveals left-to-right
3. **Scribble-out** — outgoing fact gets a strikethrough line animation before text changes
4. Auto-advances every 5.5s, pause on hover

---

## Props

```ts
// No props — self-contained with hardcoded facts
// Export as: export function NotebookFacts()
```

---

## Facts data

```ts
const FACTS = [
  { cat: 'numbers', html: 'Today, humanity will consume <span class="nb-num">2.4 trillion</span> AI tokens before breakfast IST.' },
  { cat: 'numbers', html: 'GPT-5 Mini just answered <span class="nb-num">47,000</span> questions in the time you read this card.' },
  { cat: 'numbers', html: 'Claude has written ~<span class="nb-num">900M</span> lines of code this month — more than every human at Google combined.' },
  { cat: 'industry', html: '<span class="nb-num">1 in 4</span> Indian developers used an AI assistant before lunch today.' },
  { cat: 'numbers', html: 'A single GPT-5 Mini query now costs <span class="nb-num">$0.000004</span> — less than a grain of rice.' },
  { cat: 'trivia', html: 'The average AI model is now obsolete in <span class="nb-num">6 months</span>. Your phone is older.' },
  { cat: 'industry', html: 'AI job postings grew <span class="nb-num">38%</span> globally — and <span class="nb-num">51%</span> in India alone.' },
  { cat: 'trivia', html: 'AI Signal goes out at <span class="nb-num">06:14 IST</span> — when the first commit of the day usually lands.' },
  { cat: 'industry', html: 'There are now <span class="nb-num">14,000+</span> AI startups in Bengaluru alone. Three are unicorns.' },
  { cat: 'numbers', html: 'OpenAI processes ~<span class="nb-num">100 billion</span> tokens every hour — the entire Library of Congress, every 4 minutes.' },
  { cat: 'trivia', html: 'The first AI to pass the bar exam scored <span class="nb-num">90th</span> percentile. The average human lawyer? 68th.' },
  { cat: 'industry', html: 'The total private capital raised by AI labs in 2025 alone — over <span class="nb-num">$80 billion</span> — exceeds the GDP of <span class="nb-num">90+ countries</span>.' },
] as const
```

---

## State

```ts
type Category = 'all' | 'numbers' | 'trivia' | 'industry'

const [activeCategory, setActiveCategory] = useState<Category>('all')
const [factIndex, setFactIndex] = useState(0)
const [isPlaying, setIsPlaying] = useState(true)
const [animState, setAnimState] = useState<'idle' | 'scribbling' | 'writing'>('idle')
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
```

---

## Animation logic

When changing facts:
1. Set `animState = 'scribbling'` — this adds a strikethrough `::after` pseudo element (via CSS class)
2. After 380ms, update fact + set `animState = 'writing'`  — this triggers `writeIn` clip-path animation
3. After 900ms, set `animState = 'idle'`

```ts
function changeFact(newIndex: number) {
  setAnimState('scribbling')
  setTimeout(() => {
    setFactIndex(newIndex)
    setAnimState('writing')
    setTimeout(() => setAnimState('idle'), 900)
  }, 380)
}
```

Auto-advance interval:
```ts
useEffect(() => {
  if (!isPlaying) { if (intervalRef.current) clearInterval(intervalRef.current); return }
  intervalRef.current = setInterval(() => {
    const filtered = activeCategory === 'all' ? FACTS : FACTS.filter(f => f.cat === activeCategory)
    setFactIndex(i => (i + 1) % filtered.length)
    // trigger animation
  }, 5500)
  return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
}, [isPlaying, activeCategory])
```

---

## Styles (inline `<style>` tag inside the component)

Add an inline `<style>` tag at the top of the returned JSX:

```tsx
<style>{`
  .notebook-wrap {
    background: repeating-linear-gradient(180deg, #FFF8DC 0, #FFF8DC 30px, #E8D88A 30px, #E8D88A 31px);
    border-radius: 16px;
    padding: 28px 36px 24px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(184,134,11,0.16);
    transform: rotate(-0.4deg);
    position: relative;
    animation: paperSway 6s ease-in-out infinite;
    transition: transform 0.4s ease;
  }
  .notebook-wrap:hover {
    transform: rotate(0) !important;
    animation-play-state: paused;
  }
  .notebook-wrap::before {
    content: '';
    position: absolute;
    top: -10px; left: 50%;
    transform: translateX(-50%) rotate(-2deg);
    width: 100px; height: 22px;
    background: rgba(255,240,180,0.75);
    border: 1px solid rgba(180,140,60,0.2);
    border-radius: 2px;
  }
  .notebook-wrap::after {
    content: '';
    position: absolute;
    top: 14px; bottom: 14px; left: 60px;
    width: 1px;
    background: rgba(220,80,80,0.35);
  }
  .nb-fact-scribbling {
    position: relative;
  }
  .nb-fact-scribbling::after {
    content: '';
    position: absolute;
    top: 50%; left: 0;
    width: 0; height: 2px;
    background: #2B4A8F;
    transform: translateY(-50%) rotate(-1deg);
    animation: scribble 0.35s ease-out forwards;
  }
  .nb-fact-writing {
    animation: writeIn 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .nb-num {
    color: #C0392B;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: rgba(192,57,43,0.4);
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
`}</style>
```

---

## Layout structure

```
<div style={{ maxWidth: 1280, margin: '32px auto 0', padding: '0 32px' }}>
  <div className="notebook-wrap reveal">
    
    {/* 3-column row */}
    <div style={{ display:'grid', gridTemplateColumns:'220px 1fr auto', gap:32, alignItems:'center', paddingLeft:36 }}>
      
      {/* Left: title + counter */}
      <div>
        <p style={{ fontFamily:'var(--ff-hand)', fontSize:34, color:'var(--ink-pen)', fontWeight:700,
          textDecoration:'underline', textDecorationColor:'rgba(43,74,143,0.4)', textUnderlineOffset:5 }}>
          Did you know?
        </p>
        <p style={{ fontFamily:'var(--ff-hand)', fontSize:17, color:'rgba(43,74,143,0.7)', fontWeight:500, marginTop:4 }}>
          Fact {String(factIndex+1).padStart(2,'0')} of {String(filteredFacts.length).padStart(2,'0')}
        </p>
      </div>

      {/* Center: fact text */}
      <div style={{ position:'relative', minHeight:60, display:'flex', alignItems:'center' }}>
        <p
          className={animState === 'scribbling' ? 'nb-fact-scribbling' : animState === 'writing' ? 'nb-fact-writing' : ''}
          style={{ fontFamily:'var(--ff-hand)', fontSize:26, lineHeight:1.2, color:'var(--ink-pen)', fontWeight:600 }}
          dangerouslySetInnerHTML={{ __html: filteredFacts[factIndex]?.html ?? '' }}
        />
      </div>

      {/* Right: controls + category tabs */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
        {/* prev/play/next buttons — 30×30 circles */}
        {/* category tabs — All / Nums / Trivia / Industry */}
      </div>

    </div>
  </div>
</div>
```

The `filteredFacts` variable:
```ts
const filteredFacts = activeCategory === 'all' ? FACTS : FACTS.filter(f => f.cat === activeCategory)
// guard: if filteredFacts.length === 0, fall back to FACTS
```

Ensure `factIndex` is clamped: when category changes, reset `factIndex` to 0.

---

## Buttons styling

Prev/Play/Next buttons — 30×30px circles:
```tsx
<button style={{ width:30, height:30, borderRadius:'50%', border:'1px solid rgba(43,74,143,0.25)',
  background:'rgba(255,255,255,0.7)', color:'var(--ink-pen)', cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
```
Use simple `<` `||` `>` text or inline SVG chevrons.

Category tabs:
```tsx
<button style={{ fontFamily:'var(--ff-mono)', fontSize:'8.5px', fontWeight:600, textTransform:'uppercase',
  letterSpacing:'0.1em', padding:'3px 9px', border:'1px solid rgba(43,74,143,0.25)',
  borderRadius:999, cursor:'pointer', transition:'all 0.2s',
  background: isActive ? 'var(--ink-pen)' : 'rgba(255,255,255,0.5)',
  color: isActive ? 'white' : 'var(--ink-pen)'
}}>
```

---

## Responsive
At mobile (≤ 880px), stack the 3-column grid to 1 column. Add a `<style>` media query or use window width detection.

---

## Acceptance criteria
- Fact rotates every 5.5s
- Scribble-out + write-in animation works on change
- Pause on hover (animation-play-state: paused)
- Category filter works
- `npx tsc --noEmit` passes, no `any`
- Export: `export function NotebookFacts()`

## Log file
Write to `/src/IMPLEMENTATION_LOG_notebook.md`
