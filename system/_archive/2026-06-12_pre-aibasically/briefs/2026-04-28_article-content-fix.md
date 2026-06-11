# Brief: StoryArticle — full content sections + missing renders

**Date:** 2026-04-28  
**Agent:** FORGE  
**File to edit:** `src/components/StoryArticle.tsx`

**Depends on:** SEED migration brief `2026-04-28_schema-stats.md` must have updated `database.ts` first — read the updated types before editing.

---

## DO NOT
- Touch any other component file
- Touch page.tsx, layout.tsx, globals.css
- Use `any` types
- Add npm dependencies

---

## Read first
1. `/Users/surajpandita/ai_signal/db/types/database.ts` — for the updated Story type with `stats`, `action_items`, `counter_view`, `counter_view_headline`, `pull_quote`
2. `/Users/surajpandita/ai_signal/design/references/ai-signal-v8.html` — find `.stat-cards`, `.editorial-quote`, `.builder-block`, `.action-list`, `.counter-block` sections

---

## What to add (insert between existing sections in order)

Current section order:
1. Meta bar
2. Headline + deck
3. Author row
4. Signal block (why_it_matters) ← keep as-is
5. [ADD] By the Numbers (stats grid)
6. [ADD] Why it matters detail + pull_quote (editorial quote block)
7. Builder lens (dark block) ← move/keep here
8. PM lens ← keep
9. Founder lens ← keep  
10. [ADD] The Move (action checklist)
11. [ADD] Devil's Advocate (counter_view)
12. Deeper read / sources ← keep
13. Read stamp ← keep

---

### Section: By the Numbers (after signal block)

Render only if `story.stats && story.stats.length > 0`.

```tsx
{story.stats && story.stats.length > 0 && (
  <div style={{ marginBottom: 40 }}>
    {/* Numbered section header */}
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
      <span style={{ width:26, height:26, borderRadius:7, background:'var(--text)', color:'var(--bg)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:12, fontWeight:700, fontFamily:'var(--ff-mono)', flexShrink:0 }}>1</span>
      <div>
        <span style={{ fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:600,
          textTransform:'uppercase', letterSpacing:'0.16em', color:'var(--text-mute)' }}>
          By the numbers
        </span>
      </div>
    </div>
    <h3 style={{ fontFamily:'var(--ff-display)', fontSize:30, lineHeight:1.1,
      fontWeight:400, letterSpacing:'-0.02em', marginBottom:16 }}>
      The data shifted overnight.
    </h3>

    {/* 3-col stat grid */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
      {story.stats.map((stat, i) => (
        <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:12, padding:20, position:'relative', overflow:'hidden',
          transition:'transform 0.25s, border-color 0.25s, box-shadow 0.25s' }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.borderColor = 'var(--border-mid)'
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ fontFamily:'var(--ff-mono)', fontSize:10, textTransform:'uppercase',
            letterSpacing:'0.12em', color:'var(--text-mute)', marginBottom:8, fontWeight:500 }}>
            {stat.label}
          </div>
          <div style={{ fontFamily:'var(--ff-display)', fontSize:30, lineHeight:1,
            marginBottom:6, display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
            {stat.value}
            {stat.delta && (
              <span style={{ fontStyle:'italic', color:'var(--green)', fontSize:16 }}>
                {stat.delta}
              </span>
            )}
          </div>
          <div style={{ fontSize:13, color:'var(--text-mute)', lineHeight:1.4 }}>
            {stat.detail}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

---

### Section: Why it matters detail + pull_quote (after By the Numbers)

Render the `why_it_matters` text as a paragraph, then the `pull_quote` as an editorial quote if it exists.

```tsx
{/* Numbered section 2 */}
<div style={{ marginBottom: 40 }}>
  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
    <span style={{ width:26, height:26, borderRadius:7, background:'var(--text)', color:'var(--bg)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:12, fontWeight:700, fontFamily:'var(--ff-mono)', flexShrink:0 }}>2</span>
    <span style={{ fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:600,
      textTransform:'uppercase', letterSpacing:'0.16em', color:'var(--text-mute)' }}>
      Why it matters
    </span>
  </div>
  <h3 style={{ fontFamily:'var(--ff-display)', fontSize:30, lineHeight:1.1,
    fontWeight:400, letterSpacing:'-0.02em', marginBottom:16 }}>
    Every Q1 budget is now wrong.
  </h3>
  <div style={{ fontSize:18, lineHeight:1.7, color:'var(--text-soft)' }}
    dangerouslySetInnerHTML={{ __html: renderWhy }} />

  {/* Editorial pull quote block */}
  {story.pull_quote && (
    <div style={{ margin:'28px 0', padding:'28px 32px', background:'var(--bg-soft)',
      borderRadius:14, position:'relative' }}>
      <span aria-hidden="true" style={{ position:'absolute', top:14, left:18,
        fontFamily:'var(--ff-display)', fontStyle:'italic', fontSize:56,
        color:'var(--text-faint)', lineHeight:0.9, opacity:0.5 }}>"</span>
      <p style={{ fontFamily:'var(--ff-display)', fontSize:24, lineHeight:1.3,
        fontWeight:400, letterSpacing:'-0.012em', paddingLeft:36 }}>
        {story.pull_quote}
      </p>
      <div style={{ marginTop:14, paddingLeft:36, fontFamily:'var(--ff-mono)',
        fontSize:11, color:'var(--text-mute)', textTransform:'uppercase',
        letterSpacing:'0.14em', fontWeight:500 }}>
        — AI Signal Editorial
      </div>
    </div>
  )}
</div>
```

---

### Section: The Move — action checklist (after role lenses, before counter-view)

Render only if `story.action_items && story.action_items.length > 0`.

```tsx
{story.action_items && story.action_items.length > 0 && (
  <div style={{ marginBottom: 40 }}>
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
      <span style={{ width:26, height:26, borderRadius:7, background:'var(--text)', color:'var(--bg)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:12, fontWeight:700, fontFamily:'var(--ff-mono)', flexShrink:0 }}>3</span>
      <span style={{ fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:600,
        textTransform:'uppercase', letterSpacing:'0.16em', color:'var(--text-mute)' }}>
        The move · next 48h
      </span>
    </div>
    <h3 style={{ fontFamily:'var(--ff-display)', fontSize:30, lineHeight:1.1,
      fontWeight:400, letterSpacing:'-0.02em', marginBottom:16 }}>
      Three things to do tomorrow.
    </h3>
    <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:12 }}>
      {story.action_items.map((item, i) => (
        <li key={i} style={{ display:'flex', gap:14, padding:'18px 20px',
          background:'var(--green-soft)', border:'1px solid rgba(27,122,62,0.18)',
          borderRadius:12, transition:'transform 0.2s, box-shadow 0.2s, border-color 0.2s' }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateX(2px)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(27,122,62,0.08)'
            e.currentTarget.style.borderColor = 'rgba(27,122,62,0.32)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateX(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'rgba(27,122,62,0.18)'
          }}
        >
          <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--green)',
            color:'white', display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, marginTop:1, fontSize:12 }}>✓</span>
          <span style={{ fontSize:16, lineHeight:1.55 }}>{item}</span>
        </li>
      ))}
    </ul>
  </div>
)}
```

---

### Section: Devil's Advocate (counter_view, after action items, before deeper read)

Render only if `story.counter_view`.

```tsx
{story.counter_view && (
  <div style={{ background:'var(--beige)', border:'1px solid var(--beige-deep)',
    borderRadius:14, padding:28, marginBottom:40, position:'relative' }}>
    {/* Stamp */}
    <span style={{ position:'absolute', top:-10, right:24, background:'var(--text)',
      color:'var(--bg)', padding:'4px 10px', borderRadius:6,
      fontFamily:'var(--ff-mono)', fontSize:10, fontWeight:700,
      letterSpacing:'0.16em', textTransform:'uppercase', transform:'rotate(2deg)',
      display:'inline-block' }}>
      Devil's Advocate
    </span>
    <div style={{ marginBottom:10, display:'flex', alignItems:'center', gap:8,
      fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:700,
      letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-mute)' }}>
      ⚠ The Counter-View
    </div>
    <h4 style={{ fontFamily:'var(--ff-display)', fontSize:24, lineHeight:1.2,
      marginBottom:12, fontWeight:400, letterSpacing:'-0.015em' }}>
      {story.counter_view_headline ?? 'Another angle.'}
    </h4>
    <p style={{ fontSize:16, lineHeight:1.6, color:'var(--text-soft)' }}>
      {story.counter_view}
    </p>
  </div>
)}
```

---

### Fix: Sources rendering

After the deeper_read card, if `story.sources.length > 0`, render source cards:

```tsx
{story.sources && story.sources.length > 0 && (
  <div style={{ marginTop: 16, display:'flex', flexDirection:'column', gap:8 }}>
    {story.sources.map((src, i) => (
      <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 18px', background:'var(--bg-card)',
          border:'1px solid var(--border)', borderRadius:10,
          textDecoration:'none', color:'var(--text)', transition:'border-color 0.2s, background 0.2s',
          fontSize:14 }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--signal)'; e.currentTarget.style.background = 'var(--signal-faint)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' }}
      >
        <span style={{ fontWeight:500 }}>{src.label}</span>
        <span style={{ color:'var(--text-mute)', fontSize:12 }}>→</span>
      </a>
    ))}
  </div>
)}
```

---

### Fix: Stat grid responsive

The 3-col stat grid breaks on mobile. Wrap it in a style tag:
```tsx
<style>{`
  @media (max-width: 640px) {
    .stat-grid { grid-template-columns: 1fr !important; }
  }
`}</style>
```
Add `className="stat-grid"` to the grid div.

---

## Acceptance criteria
- `npx tsc --noEmit` passes, no `any`
- Stats section renders 3 cards when `story.stats` is populated
- Pull quote renders in editorial quote style
- Action items render as green checklist
- Devil's Advocate renders with beige block + rotated stamp
- Sources render as clickable links
- Export name unchanged: `export function StoryArticle()`

## Log file
Append to `/src/IMPLEMENTATION_LOG_article.md`
