# Current globals.css Mobile Rules

All @media blocks found in src/app/globals.css. Listed by line number.

---

## Line 163 — @media (max-width: 640px)
```css
html, body { font-size: 15px; }
```

---

## Line 167 — @media (prefers-reduced-motion: reduce)
```css
*, *::before, *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
```
NOTE: Missing `animation-delay`, `transition-delay`, `scroll-behavior` vs v11.

---

## Line 567 — @media (max-width: 720px)
Section: Hero shapes + hero broadcast (MATCHES v11 Blocks 3+4)
```css
.hero-shape-warm { width: 180px; height: 180px; top: 4%; right: -10%; }
.hero-shape-cobalt { width: 240px; height: 160px; bottom: 8%; left: -20%; }
.hero-fragment { display: none; }
.hero-broadcast { margin-top: 40px; padding: 28px 20px 22px; }
.hero-broadcast-line { font-size: 19px; min-height: 80px; line-height: 1.45; }
.hero-broadcast-line .num { font-size: 17px; }
.hero-broadcast-meta { flex-wrap: wrap; gap: 8px 12px; font-size: 9px; }
```

---

## Lines 944-950 — @media (max-width: 880px) + @media (max-width: 640px)
Section: Story wrap + stat cards
```css
/* 880px */
.story-wrap { padding: 32px 24px; }
.stat-cards { grid-template-columns: 1fr; }
/* 640px */
.stat-cards { grid-template-columns: 1fr; }  /* duplicate — 640 adds nothing new */
```

---

## Line 1236 — @media (max-width: 1080px)
Section: Notebook strip row layout (MATCHES v11 Block 10 partial)
```css
.nb-row { grid-template-columns: 1fr; gap: 16px; padding-left: 16px; }
.nb-actions { flex-direction: row; justify-content: space-between; width: 100%; }
```
NOTE: Missing `.main-grid` and `.sidebar` from v11 Block 10 — these handled separately.

---

## Line 1242 — @media (max-width: 880px)
Section: Notebook strip (MATCHES v11 Block 11 partial)
```css
.notebook-strip { padding: 0 20px; }
.notebook { padding: 22px 20px 18px; }
.nb-fact-text { font-size: 22px; }
```

---

## Line 1475 — @media (max-width: 720px)
Section: Builder cards (MATCHES v11 Block 6 + adds builder-block)
```css
.builder-secondary { grid-template-columns: 1fr; }
.builder-block { padding: 24px; }
```

---

## Lines 1674-1692 — Nav + main-grid + sidebar
```css
/* 880px */ header.site-nav-inner { padding: 14px 20px; }
/* 640px */ header.site-nav-inner { padding: 14px 16px; }
/* 1080px */ .main-grid { grid-template-columns: 1fr; gap: 32px; }
/* 880px */ .main-grid { padding: 0 20px; }
/* 1080px */ .sidebar { display: none; }
```
NOTE: v11 uses `display: none` on sidebar at 1080px — current uses same.
NOTE: Nav selector is `header.site-nav-inner` (current) vs `nav` (v11). Different selectors.

---

## Line 1976 — @media (max-width: 880px)
Section: Archive (MATCHES v11 Block 11 partial)
```css
.archive { padding: 64px 20px 0; margin-top: 80px; }
.archive-cards { grid-template-columns: 1fr; }
```

---

## Lines 2017-2022 — @media (max-width: 880px)
Section: Subscribe (MATCHES v11 Block 11 partial)
```css
.subscribe { padding: 0 20px; }
.subscribe-card { grid-template-columns: 1fr; gap: 36px; padding: 44px 28px; }
.sub-form { flex-direction: column; }
.sub-btn { padding: 14px; }
```
NOTE: v11 targets `.sub-form button`, current targets `.sub-btn` — functionally same.

---

## Lines 2039-2042 — @media (max-width: 880px)
Section: Footer (MATCHES v11 Block 11 partial)
```css
.site-footer { padding: 32px 20px 48px; flex-direction: column; text-align: center; }
.footer-links { justify-content: center; flex-wrap: wrap; }
```
NOTE: v11 targets `footer`, current targets `.site-footer`. Different selector — verify footer uses `.site-footer`.

---

## Line 2417 — @media (max-width: 640px)
Section: Compare row (not in v11, current-only addition)
```css
.compare-row { grid-template-columns: 1fr 64px; }
.compare-label { font-size: 11px; }
```

---

## Lines 3054-3081 — V11 responsive additions block
Section: Hero, insights, cascade, reactions, stakeholders, decision-aid, standup, feedback, sources
```css
/* 880px */
.hero-tickers { grid-template-columns: 1fr; max-width: 100%; }
.hero-preview-strip { grid-template-columns: 1fr; max-width: 100%; }
.hero-banner::before { background-size: 32px 32px; }
.insights-strip { grid-template-columns: 1fr; }
.insight-cell { border-right: none; border-bottom: 1px solid var(--border); }
.insight-cell:last-child { border-bottom: none; }
.compare-row { grid-template-columns: 100px 1fr 60px; gap: 8px; }
.cascade-row { grid-template-columns: 1fr; gap: 16px; }
.cascade-row::before { display: none; }
.reaction-grid { grid-template-columns: 1fr; }
.stakeholder-matrix { grid-template-columns: 1fr; }
.decision-row { grid-template-columns: 1fr; gap: 8px; }
.decision-pill { justify-self: flex-start; }
/* 720px */
.standup-tabs-row { display: grid !important; grid-template-columns: 1fr 1fr; }
.standup-tab:nth-child(1), .standup-tab:nth-child(3) { border-right: 1px solid rgba(180,140,60,0.15); }
.feedback-buttons { flex-direction: column; }
.feedback-btn { width: 100%; justify-content: center; }
.source-rank { display: none; }
.source-tag { display: none; }
.source-title { white-space: normal; }
```

---

## Lines 3260-3271 — @media (max-width: 1080px) + @media (max-width: 640px)
Section: main-article-grid (article page layout)
```css
/* 1080px */ .main-article-grid { grid-template-columns: 1fr; gap: 32px; }
/* 640px */ .main-article-grid { padding: 0 16px; margin-top: 40px; }
```

---

## Lines 3539, 3582 — @media (max-width: 640px)
Section: About page, sponsor stats (current-only pages)
```css
/* 640px */ .about-page { padding: 0 20px 80px; margin-top: 56px; }
.about-headline { font-size: 38px; }
.about-cta { padding: 36px 24px; }
/* 640px */ .sponsor-stats { grid-template-columns: 1fr; }
.sponsor-stat { border-right: none; border-bottom: 1px solid var(--border); }
.sponsor-stat:last-child { border-bottom: none; }
```
