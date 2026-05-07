# V11 Mobile Rules — Extracted from docs/design-reference/v11.html

All @media blocks found in v11.html. Listed in order of appearance.

---

## Block 1 — @media (max-width: 880px) [line 246]
Section: Stakeholders / Decision Aid

```css
.stakeholder-matrix { grid-template-columns: 1fr; }
.decision-row { grid-template-columns: 1fr; gap: 8px; }
.decision-pill { justify-self: flex-start; }
```

---

## Block 2 — @media (max-width: 880px) [line 552]
Section: Hero tickers + preview strip

```css
.hero-tickers { grid-template-columns: 1fr; max-width: 100%; }
.hero-preview-strip { grid-template-columns: 1fr; max-width: 100%; }
.hero-banner::before { background-size: 32px 32px; }
```

---

## Block 3 — @media (max-width: 720px) [line 653]
Section: Hero backdrop shapes

```css
.hero-shape-warm { width: 180px; height: 180px; top: 4%; right: -10%; }
.hero-shape-cobalt { width: 240px; height: 160px; bottom: 8%; left: -20%; }
.hero-fragment { display: none; }
```

---

## Block 4 — @media (max-width: 720px) [line 810]
Section: Hero broadcast

```css
.hero-broadcast { margin-top: 40px; padding: 28px 20px 22px; }
.hero-broadcast-line { font-size: 19px; min-height: 80px; line-height: 1.45; }
.hero-broadcast-line .num { font-size: 17px; }
.hero-broadcast-meta { flex-wrap: wrap; gap: 8px 12px; font-size: 9px; }
```

---

## Block 5 — @media (max-width: 880px) [line 1612]
Section: Insights strip, comparison chart, cascade, reactions

```css
.insights-strip { grid-template-columns: 1fr; }
.insight-cell { border-right: none; border-bottom: 1px solid var(--border); }
.insight-cell:last-child { border-bottom: none; }
.compare-row { grid-template-columns: 100px 1fr 60px; gap: 8px; }
.cascade-row { grid-template-columns: 1fr; gap: 16px; }
.cascade-row::before { display: none; }
.reaction-grid { grid-template-columns: 1fr; }
```

---

## Block 6 — @media (max-width: 720px) [line 1706]
Section: Builder secondary cards

```css
.builder-secondary { grid-template-columns: 1fr; }
```

---

## Block 7 — @media (max-width: 720px) [line 1928]
Section: Standup card

```css
.standup-card { padding: 18px 20px; margin: 24px 0 8px; }
.standup-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.standup-tab { padding: 10px 0; }
.standup-tab:nth-child(1) { border-right: 1px solid rgba(180,140,60,0.15); }
.standup-tab:nth-child(3) { border-right: 1px solid rgba(180,140,60,0.15); }
.standup-preview { padding: 12px 14px; font-size: 13px; }
```

---

## Block 8 — @media (max-width: 720px) [line 2005]
Section: Feedback vote buttons

```css
.feedback-buttons { flex-direction: column; }
.feedback-btn { width: 100%; justify-content: center; }
```

---

## Block 9 — @media (max-width: 720px) [line 2135]
Section: Source cards

```css
.source-rank { display: none; }
.source-tag { display: none; }
.source-title { white-space: normal; }
```

---

## Block 10 — @media (max-width: 1080px) [line 2553]
Section: Main grid layout

```css
.main-grid { grid-template-columns: 1fr; gap: 32px; }
.sidebar { position: static; }
.nb-row { grid-template-columns: 1fr; gap: 16px; padding-left: 16px; }
.nb-actions { flex-direction: row; justify-content: space-between; width: 100%; }
```

---

## Block 11 — @media (max-width: 880px) [line 2559]
Section: Nav, hero-banner, notebook, story-wrap, builder, archive, subscribe, footer — MASTER breakpoint

```css
nav { padding: 14px 20px; }
.nav-meta a { display: none; }
.nav-meta .nav-cta-link { display: inline-flex; }
.hero-banner { padding: 56px 20px 16px; }
.notebook-strip { padding: 0 20px; }
.notebook { padding: 22px 20px 18px; }
.nb-fact-text { font-size: 22px; }
.main-grid { padding: 0 20px; }
.story-wrap { padding: 32px 24px; }
.stat-cards { grid-template-columns: 1fr; }
.builder-block { padding: 24px; }
.builder-quote { font-size: 22px; }
.archive { padding: 64px 20px 0; margin-top: 80px; }
.archive-cards { grid-template-columns: 1fr; }
.subscribe { padding: 0 20px; }
.subscribe-card { grid-template-columns: 1fr; gap: 36px; padding: 44px 28px; }
.sub-form { flex-direction: column; }
.sub-form button { padding: 14px; }
footer { padding: 32px 20px 48px; flex-direction: column; text-align: center; }
```

---

## Block 12 — @media (prefers-reduced-motion: reduce) [line 2584]
Section: A11y — kills all decorative animations

```css
*, *::before, *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  animation-delay: 0ms !important;
  transition-duration: 0.01ms !important;
  transition-delay: 0ms !important;
  scroll-behavior: auto !important;
}
```

---

## Summary
- Total media blocks: 12
- Breakpoints used: 1080px, 880px, 720px, prefers-reduced-motion
- No 640px breakpoints in v11 (current code added these)
- Master 880px block (Block 11) is the most critical — covers nav, layout, subscribe, footer
