# Gap Analysis — V11 Mobile vs Current globals.css

Legend:
- ✅ MATCH — rule exists and matches v11
- ⚠️ PARTIAL — selector exists, rule differs or incomplete
- ❌ MISSING — v11 has it, current does not
- 🔄 RENAMED — selector changed, adapt needed
- ➕ CURRENT-ONLY — in globals.css but not in v11 (skip)

Priority:
- P0: Critical — user-visible layout breakage on mobile
- P1: Important — visual degradation, needs adaptation (renamed selectors)
- P2: Skip — selector doesn't exist in current codebase

---

## V11 Block 1 (@media 880px) — Stakeholders + Decision Aid

| V11 Rule | Status | Notes |
|---|---|---|
| `.stakeholder-matrix { grid-template-columns: 1fr }` | ✅ MATCH | Present in current line 3065 |
| `.decision-row { grid-template-columns: 1fr; gap: 8px }` | ✅ MATCH | Present in current line 3066 |
| `.decision-pill { justify-self: flex-start }` | ✅ MATCH | Present in current line 3067 |

---

## V11 Block 2 (@media 880px) — Hero tickers + preview strip

| V11 Rule | Status | Notes |
|---|---|---|
| `.hero-tickers { grid-template-columns: 1fr; max-width: 100% }` | ✅ MATCH | Present in current line 3055 |
| `.hero-preview-strip { grid-template-columns: 1fr; max-width: 100% }` | ✅ MATCH | Present in current line 3056 |
| `.hero-banner::before { background-size: 32px 32px }` | ✅ MATCH | Present in current line 3057 |

---

## V11 Block 3 (@media 720px) — Hero backdrop shapes

| V11 Rule | Status | Notes |
|---|---|---|
| `.hero-shape-warm` resize | ✅ MATCH | Present in current line 568 |
| `.hero-shape-cobalt` resize | ✅ MATCH | Present in current line 569 |
| `.hero-fragment { display: none }` | ✅ MATCH | Present in current line 570 |

---

## V11 Block 4 (@media 720px) — Hero broadcast

| V11 Rule | Status | Notes |
|---|---|---|
| `.hero-broadcast` padding + margin | ✅ MATCH | Present in current line 571 |
| `.hero-broadcast-line` font-size + min-height | ✅ MATCH | Present in current line 572 |
| `.hero-broadcast-line .num` font-size | ✅ MATCH | Present in current line 573 |
| `.hero-broadcast-meta` flex-wrap + font | ✅ MATCH | Present in current line 574 |

---

## V11 Block 5 (@media 880px) — Insights, cascade, reactions

| V11 Rule | Status | Notes |
|---|---|---|
| `.insights-strip { grid-template-columns: 1fr }` | ✅ MATCH | Present in current line 3058 |
| `.insight-cell` border swap | ✅ MATCH | Present in current lines 3059-3060 |
| `.compare-row` grid columns | ✅ MATCH | Present in current line 3061 |
| `.cascade-row { grid-template-columns: 1fr }` | ✅ MATCH | Present in current line 3062 |
| `.cascade-row::before { display: none }` | ✅ MATCH | Present in current line 3063 |
| `.reaction-grid { grid-template-columns: 1fr }` | ✅ MATCH | Present in current line 3064 |

---

## V11 Block 6 (@media 720px) — Builder secondary

| V11 Rule | Status | Notes |
|---|---|---|
| `.builder-secondary { grid-template-columns: 1fr }` | ✅ MATCH | Present in current line 1476 |

---

## V11 Block 7 (@media 720px) — Standup card

| V11 Rule | Status | Notes |
|---|---|---|
| `.standup-card { padding: 18px 20px; margin: 24px 0 8px }` | ❌ MISSING — P0 | Current has standup-card rules but NO mobile override in 720px block |
| `.standup-tabs { display: grid; grid-template-columns: 1fr 1fr }` | ⚠️ PARTIAL | Current targets `.standup-tabs-row`, v11 targets `.standup-tabs` — selector mismatch in current component |
| `.standup-tab { padding: 10px 0 }` | ❌ MISSING — P0 | Not in current mobile rules |
| `.standup-tab:nth-child(1)` border-right | ✅ MATCH | Present in current line 3235 (via combined selector) |
| `.standup-preview { padding: 12px 14px; font-size: 13px }` | ❌ MISSING — P0 | Current has no mobile override for standup-preview |

---

## V11 Block 8 (@media 720px) — Feedback vote

| V11 Rule | Status | Notes |
|---|---|---|
| `.feedback-buttons { flex-direction: column }` | ✅ MATCH | Present in current line 3211 |
| `.feedback-btn { width: 100%; justify-content: center }` | ✅ MATCH | Present in current line 3212 |

---

## V11 Block 9 (@media 720px) — Source cards

| V11 Rule | Status | Notes |
|---|---|---|
| `.source-rank { display: none }` | ✅ MATCH | Present in current line 3154 |
| `.source-tag { display: none }` | ✅ MATCH | Present in current line 3155 |
| `.source-title { white-space: normal }` | ✅ MATCH | Present in current line 3156 |

---

## V11 Block 10 (@media 1080px) — Main grid + notebook

| V11 Rule | Status | Notes |
|---|---|---|
| `.main-grid { grid-template-columns: 1fr; gap: 32px }` | ✅ MATCH | Present in current line 1687 |
| `.sidebar { position: static }` | ⚠️ PARTIAL — P1 | Current uses `display: none` at 1080px — v11 uses `position: static`. Current hides sidebar entirely; v11 shows it but unsticks it. Behavior difference. |
| `.nb-row { grid-template-columns: 1fr; gap: 16px; padding-left: 16px }` | ✅ MATCH | Present in current line 1237 |
| `.nb-actions` flex direction | ✅ MATCH | Present in current line 1238 |

---

## V11 Block 11 (@media 880px) — Master breakpoint

| V11 Rule | Status | Notes |
|---|---|---|
| `nav { padding: 14px 20px }` | 🔄 RENAMED — P1 | Current targets `header.site-nav-inner`. Verify selector is correct. |
| `.nav-meta a { display: none }` | ❌ MISSING — P0 | Nav links not hidden on mobile — nav likely overflows on 375px |
| `.nav-meta .nav-cta-link { display: inline-flex }` | ❌ MISSING — P0 | CTA not shown on mobile — linked to above rule |
| `.hero-banner { padding: 56px 20px 16px }` | ❌ MISSING — P0 | No `.hero-banner` mobile padding rule in current code |
| `.notebook-strip { padding: 0 20px }` | ✅ MATCH | Present in current line 1243 |
| `.notebook { padding: 22px 20px 18px }` | ✅ MATCH | Present in current line 1244 |
| `.nb-fact-text { font-size: 22px }` | ✅ MATCH | Present in current line 1245 |
| `.main-grid { padding: 0 20px }` | ✅ MATCH | Present in current line 1688 |
| `.story-wrap { padding: 32px 24px }` | ✅ MATCH | Present in current line 945 |
| `.stat-cards { grid-template-columns: 1fr }` | ✅ MATCH | Present in current line 946 |
| `.builder-block { padding: 24px }` | ✅ MATCH | Present in current line 1477 |
| `.builder-quote { font-size: 22px }` | ❌ MISSING — P1 | No mobile font-size override for builder-quote (26px) |
| `.archive { padding: 64px 20px 0; margin-top: 80px }` | ✅ MATCH | Present in current line 1977 |
| `.archive-cards { grid-template-columns: 1fr }` | ✅ MATCH | Present in current line 1978 |
| `.subscribe { padding: 0 20px }` | ✅ MATCH | Present in current line 2018 |
| `.subscribe-card` 1-col layout | ✅ MATCH | Present in current lines 2019-2021 |
| `.sub-form { flex-direction: column }` | ✅ MATCH | Present in current line 2020 |
| `footer { padding/flex-direction/text-align }` | 🔄 RENAMED — P1 | Current targets `.site-footer`. Verify this selector matches the rendered element. |

---

## V11 Block 12 (prefers-reduced-motion)

| V11 Rule | Status | Notes |
|---|---|---|
| `animation-delay: 0ms !important` | ❌ MISSING — P1 | Current omits animation-delay and transition-delay |
| `transition-delay: 0ms !important` | ❌ MISSING — P1 | Same |
| `scroll-behavior: auto !important` | ❌ MISSING — P1 | Same |

---

## SUMMARY TABLE

| Priority | Count | Rules |
|---|---|---|
| **P0 Critical** | **5** | `.nav-meta a { display:none }`, `.nav-meta .nav-cta-link`, `.hero-banner` padding, `.standup-card` mobile padding, `.standup-preview` mobile padding |
| **P1 Important** | **5** | nav selector mismatch, footer selector mismatch, `.sidebar` static vs none, `.builder-quote` font-size, reduced-motion missing properties |
| **P2 Skip** | **0** | All selectors exist in current codebase |
| **✅ Already matched** | **28** | |
| **Total v11 rules checked** | **38** | |

---

## P0 CRITICAL ISSUES — must fix before launch

### P0-1: Nav links not hidden on mobile
- V11: `.nav-meta a { display: none }` at 880px
- Current: NO rule — nav links visible on 375px, likely causes overflow
- Fix: Add to 880px block

### P0-2: Nav CTA not shown on mobile
- V11: `.nav-meta .nav-cta-link { display: inline-flex }` at 880px  
- Current: NO rule — CTA may not show on mobile
- Fix: Add alongside P0-1

### P0-3: hero-banner horizontal padding missing on mobile
- V11: `.hero-banner { padding: 56px 20px 16px }` at 880px
- Current: NO `.hero-banner` mobile rule — hero content hits screen edge on 375px
- Fix: Add to 880px block

### P0-4: Standup card not resized on mobile
- V11: `.standup-card { padding: 18px 20px; margin: 24px 0 8px }` at 720px
- Current: No mobile padding override for `.standup-card`
- Fix: Add to 720px block

### P0-5: Standup preview not resized on mobile  
- V11: `.standup-preview { padding: 12px 14px; font-size: 13px }` at 720px
- Current: No mobile override
- Fix: Add alongside P0-4

---

## P1 IMPORTANT ISSUES — verify before fix

### P1-1: Nav selector mismatch
- V11: `nav { padding: 14px 20px }`
- Current: `header.site-nav-inner { padding: 14px 20px }` — different selector, verify it targets the same element

### P1-2: Footer selector mismatch
- V11: `footer { flex-direction: column; text-align: center; padding: 32px 20px 48px }`
- Current: `.site-footer { ... }` — verify `.site-footer` is the rendered element class

### P1-3: Sidebar behavior difference
- V11: `position: static` at 1080px (sidebar shows, just unsticked)
- Current: `display: none` (sidebar hidden entirely)
- May be intentional design decision — verify with Suraj

### P1-4: builder-quote font too large on mobile
- V11: `.builder-quote { font-size: 22px }` at 880px
- Current: No override — stays at 26px on mobile, may look oversized

### P1-5: prefers-reduced-motion incomplete
- V11 has `animation-delay`, `transition-delay`, `scroll-behavior` guards
- Current missing these — minor a11y gap
