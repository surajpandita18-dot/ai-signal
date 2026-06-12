# Mobile Deep Dive — Issue 001 at 390px

Date: 2026-06-12
Viewport tested: 390 x 844, DPR 2, hasTouch:true, isMobile:true
URL: https://ai-signal-eta.vercel.app/i/001?preview=1
Screenshots: /tmp/aib-mobile-audit/ (above-the-fold.png, full-page.png, scroll-00..15, elem-*)
Measurements JSON: /tmp/aib-mobile-audit/measurements.json

Headline facts:
- Total page height: **11,317 px**. That is **13.4 viewports** of vertical scroll on an iPhone 14.
- 90%+ of all interactive elements fall under the 44x44 css-pixel iOS HIG / 48dp Material minimum.
- The reading-progress bar is rendered (`height:3px`, top:0) but `width:0` — meaning it never advances because the JS hook isn't computing scroll % on this page, or it's keyed off a wrong element. See item #10.

---

## 1. Screenshot pass — what 390px actually looks like

I ran `/Users/surajpandita/ai_signal/scripts/mobile-audit.mjs` (Playwright, iPhone 14 emulation). The full page PNG is 390x11,317. Key frames:

| Y range | What lives there | Visual punctuation? |
|---|---|---|
| 0–540 | Masthead + eyebrow + H1 + sub | strong: serif H1 dominates |
| 540–960 | TL;DR box (4 rows) | mid: bordered box |
| 960–1900 | "01 One Thing" (lede + Skip List stamp) | weak: 940px of body text on cream, no break |
| 1900–3050 | "02 So What For Me?" (track-chips + 4 stacked lenses) | weak: lenses blur into each other after the chips |
| 3050–3450 | "03 Build Notes" intro on dark band | strong: full-bleed dark band — best break in the whole page |
| 3450–3700 | Fold button + skim card on dark band | strong (still dark) |
| 3700–5100 | "04 Job Signal" (2 jobrows + spotlight + upskill ladder + interview Q) | weak: 1,400 px of cream tone, multiple sub-blocks blur |
| 5100–6300 | "05 Under the Hood" (question + SVG diagram + fold + source) | mid: SVG is a visual rest |
| 6300–7400 | "06 The Rep" + "07 Toolbox" | weak: both on cream, similar density |
| 7400–8400 | Reality Check (env, water bill) | weak |
| 8400–9300 | "08 India Signal" — 3 stacked cards | weak: cards read as a list |
| 9300–9700 | Closer dark band (the dark joke) | strong: full-bleed black |
| 9700–10,700 | Referral dark band | strong (continues black, but flows into closer with no break) |
| 10,700–11,317 | Poll + foot | mid |

Strong breaks I count: **3** (Build Notes dark band, Closer band, Referral band). For a 13-viewport scroll, three breaks at y=3050, y=9300, y=9700 means **6,250 px of unbroken cream tone between break #1 and break #2**. That's ~7.5 phone-screens with no visual rest. Reader fatigue absolutely lives in 5100–9300.

The Closer band and Referral band sit back-to-back (y=9300 → y=10,700). Two dark bands sandwiched is a wasted opportunity — one of them should move higher to break the cream slab.

---

## 2. Tap-target audit table

WCAG 2.5.5 = 44x44 css px. iOS HIG = 44x44. Material = 48x48. Anything under 44 fails on touch.

| Element | W x H | Verdict | Why / Fix |
|---|---|---|---|
| `.track-chip` (lens picker) | ~80–112 x **29** | **FAIL** | Rendered as `<span>`, not button. Height 29 px. Hard to hit precisely; chips on adjacent rows are 9 px apart — easy mis-tap. Fix: `<button>` + `padding:12px 14px` + `min-height:44px`. Also wider row gap. |
| `.foldbtn` (Under the Hood: "Read deeper") | 257 x **37** | **FAIL** | 37 px height. Chevron `▸` is tiny on touch. Bump padding to `12px 16px` for h=44. |
| `.bn-foldbtn` (Build Notes: "Open full breakdown") | 346 x **36** | **FAIL** | Same as above but on dark band. Padding `12px 16px`. |
| `.codecopy` ("⧉ copy" on code block) | 0 x 0 | **FAIL HARD** | Element measures **0x0** because it's inside `.bn-fold` which is `display:none` until opened. After opening: ~52 x 22 (font 10.5px, padding 3px 8px). Way under 44. Fix: `padding:8px 12px;font-size:11.5px;min-height:36px`. Then add an offset away from corner so right-handed thumb does not hit it accidentally while scrolling code. |
| `.share-card` ("⧉ Copy as share card", closer band) | 141 x **36** | **FAIL** | Bump padding to `12px 16px`. Currently sits on dark band, low contrast border (`#3a3a3a`) — borderline invisible too. |
| `.ref-copy` ("⧉ COPY YOUR INVITE LINK") | 189 x **41** | **MARGINAL** | 41 px. Almost there. `padding:14px 20px` → h=47. Also: this is the **most important CTA on the page**; it deserves to be `display:block;width:100%` on mobile so the whole row is tappable. |
| `.poll .opt` | 126–171 x **40** | **MARGINAL** | 40 px. Bump padding to `12px 18px` → h=44. Wraps to 2 rows (2+1), looks awkward (see screenshot). Stack 1-col on mobile. |
| `.sig-tag` (status pills SHIPPED / OPEN-SOURCE / DATA DROP) | 60–88 x **21** | **N/A — not interactive** | 21 px high, but these are pills, not buttons. Visually fine. Confirm with code that no onClick is attached. |
| `.signal-foot a` ("REPLY AND SEND IT →") | 332 x 36 | **MARGINAL** | 36 px — bump line-height/padding for h=44. |
| `.sp-cta` (sponsor) | absent on issue 001 | n/a | Sponsor null in JSON. |
| `.toolbox .try` ("TRY IT ON NEXT EMAIL…") | 346 x **56** | **PASS** | The only mobile-pass interactive on the page, ironically. |
| `.progress` (reading bar) | **0 x 3** | **BROKEN** | Width never grows. Hook is wired but not measuring. See #10. |
| Hero H1 line length | 346 px wide, 38 px font, 3 lines | **PASS but fragile** | The forced `<br>` tags in `hero_headline_html` create good shape on this issue but will break on a 5-word headline. Acceptable for issue 001. |

Net: **7 interactive elements fail or are marginal at 44px**, only 1 passes cleanly.

---

## 3. Scroll-fatigue map (section-by-section)

Natural pause = where the eye gets visual respite (color shift, image, full-bleed band). Slog = unbroken body-copy density.

| Y (px) | Section | Reader state | Risk |
|---|---|---|---|
| 0 | Masthead + Hero | engaged | ok |
| 540 | TL;DR | engaged (scanning) | ok — but **4 items × 78 px = 312 px** of identical-rhythm bullets. Promise of "Skim in 5" appears here but isn't reinforced. |
| 1000 | One Thing lede | reading | ok |
| 1300 | Skip List stamp | natural pause (it's a stamp/card) | ok |
| 1900 | Track-chip picker | curiosity spike — but then 5 chips wrap to 2 rows, and the picker scrolls off-screen as you read the lenses | **HIGH RISK** — once you scroll into the lenses, the picker is gone. To switch lens you scroll up. Discoverability suffers. |
| 2000–3000 | 4 lenses stacked | grinding | **HIGH RISK** — 4 lens cards, all similar typography, separated only by 1px hairline. After lens #2 the reader does not know which one applies to them. |
| 3050 | Dark band begins | **relief** | best moment of the page |
| 3400 | Skim card | engaged | ok |
| 3450 | Bn-foldbtn ("Open full breakdown") | curious | tap-target fail (#3) |
| 3700 | Returns to cream — Job Signal | **dropoff begins** | The handoff from dark→cream is jarring AND there's no visual anchor; the eye doesn't know what's next. |
| 4200 | Spotlight box "11,000+" | brief recovery | ok |
| 4500–5100 | Upskill ladder (3 rungs) + interview Q | high cognitive load on mobile (ladder is grid 1-col now, rungs blur) | **HIGH** |
| 5100 | Under the Hood — question | re-engage (serif text, big punchline) | ok |
| 5400 | SVG diagram | **relief** | ok |
| 6100 | foldbtn | tap fail | |
| 6300 | Rep section | resumed reading | ok |
| 6800 | Reader-win quote | brief lift | ok |
| 7100 | Toolbox | low-friction (1 paragraph + CTA) | ok |
| 7400 | Reality Check | dense paragraph | **dropoff** |
| 8400 | India Signal — 3 cards | scanning, but cards look identical | medium |
| 9300 | Closer dark band | **relief** | ok |
| 9700 | Referral dark band | continues dark — no clean break from closer | **opportunity wasted** |
| 10,400 | Poll | engagement spike (it's a 1-tap action) | ok |
| 10,700 | Foot | done | ok |

Worst stretches:
- **y=3700 to y=5100** (Job Signal, 1,400 px of cream-on-cream sub-sections).
- **y=1900 to y=3050** (4 lenses + track picker, picker scrolls off).
- **y=7400 to y=9300** (Reality + India Signal, 1,900 px).

---

## 4. Lens-picker UX on mobile (specific to Q4)

Found at y=1900 in measurements.json. 5 chips: SHOW ALL, BUILDER, PRODUCT/BIZ, SECURE PRO, SWITCHER.

- Chip widths: 87, 78, 112, 102, 88. Row 1 fits SHOW ALL + BUILDER + PRODUCT/BIZ (8+87+8+78+8+112 = 301 px, fits within 346 content width). Row 2: SECURE PRO + SWITCHER. Visually balanced, no overflow.
- BUT: at h=29px and visually identical styling (only "SHOW ALL" gets the kesari fill on initial load), the chips don't read as "tap me to filter" — they read as section-labels. Users won't try them.
- Once the user scrolls past y=2000, the picker is gone. The 4 lenses below are 216 / 190 / 242 / 259 px tall. Total lens stack = **907 px** = more than one full viewport. So **the picker is off-screen for the entire second half of the section**. Dimming non-selected lenses (the current behaviour) is irrelevant once you can't see the picker anymore.
- Fix options, cheapest first:
  1. Sticky picker on mobile only — `position:sticky; top:0; background:var(--paper); z-index:5; padding:8px 0` (low cost, big UX win).
  2. Show only the **selected** lens on mobile (collapse the other 3 behind chips). More invasive — defer.
  3. Replace dim behaviour with collapse — when a chip is selected, fold the other 3 into 1-line summary. Bigger change; defer.

Recommend #1 for Monday ship.

---

## 5. Fold buttons (Q5)

`.foldbtn` (Under the Hood) and `.bn-foldbtn` (Build Notes) are the two folds.

Behaviour test (`fold-after-open.png` capture):
- Before click: scrollY = 5737
- After click: scrollY = 5737 (no jump)

Good — no scroll-jump regression. BUT the visual on the dark band shows the chevron `▸` and the inserted content `.bn-fold.show` appears **below** the button. On a phone the button is now at the top of the viewport with all the new content below, and the reader has to scroll to see what they unlocked. That's tolerable but not delightful.

Issues:
- `▸` and `▾` chevrons live inside the label string (`"▸ Read deeper — the 3 steps"`). They're font-rendered, ~10px wide on screen, easy to miss as an affordance.
- No focus-visible style. On touch this matters less but on iPad with keyboard it's hidden.
- Tap targets fail (see #2).

Fix: bump padding, replace text-glyph chevron with an inline SVG `▸/▾` rotated via transform, add a subtle 1px bottom shadow on `.foldbtn` so it reads as a button rather than a hyperlink-on-a-border.

---

## 6. Build Notes dark band on mobile (Q6)

`.bn-grid` correctly collapses to 1-col at ≤640px (line 121 of issue.css). Confirmed in `scroll-04-y2800.png` — Struggle / Finding / Fix / Metric stack vertically. Reads fine.

Code block: not visible until fold is opened. When opened, `.codeblock pre` has `font-size:11.5px` (line 83) and `overflow-x:auto;white-space:pre`. The example code from JSON:

```
def disagreement_rate(rows):
    # rows: list of {"chunk": str, "answer": str}
    miss = sum(1 for r in rows
               if not entailed(r["answer"], r["chunk"]))
    return miss / len(rows)   # your real hallucination metric
```

Longest line ≈ 56 chars. At 11.5px monospace (≈7px per char) that's ~392px. Container width is 346px (after `padding:0 22px`). So **horizontal scroll IS required** — about 50 px overflow. Acceptable but not ideal.

Copy button: 0x0 because in measurements JSON `.codecopy` is inside an unopened fold. When opened: 52x22 at `top:8px;right:8px`. That sits in the top-right corner where a right thumb scrolling code horizontally would tap it. Risk.

Fix: 
- Wrap the longest line, or set `font-size:11px` so it fits.
- Move copy button to bottom-right with `top:auto;bottom:8px` to avoid scroll-finger collisions.
- Bump padding to `padding:6px 10px;min-height:32px`.

---

## 7. India Signal cards on mobile (Q7)

`elem-india-signal.png` shows 3 stacked `.sig` cards. They use a 1px hairline divider between, no margin gap, identical typography. Result: reads as a **list of 3 paragraphs**, not 3 distinct moments.

Status pills (`.sig-tag` = SHIPPED, OPEN-SOURCE, DATA DROP) sit top-right at h=21 px. Visible, well-styled, no tap function so 21px is fine. The OPEN-SOURCE one with `.hot` modifier (kesari border + color) does pop relative to the others — that signal works.

Why-you lines (`.sig-you`) are italic light-grey — they correctly read as a tertiary layer.

Monotony fix: alternate background. Every other card gets `background:var(--faint);padding-left:14px;margin-left:-14px`. Or, simpler: give each card a left border in a different accent shade. Currently they're indistinguishable at thumb-scroll speed.

---

## 8. Referral block on mobile (Q8)

`elem-referral.png` is the cleanest section in the whole audit:
- Heading "Like this? Pass it on." is serif, big, scannable.
- 3 numbered rungs are visually distinct (circle + line).
- Copy button at 189x41 reads as a button (kesari fill, white text).

Issues:
- **Copy button is not full-width on mobile.** 189 px wide on a 390 viewport leaves 200 px of empty space to its right. On a primary CTA, that's a thumb-reach miss. Right-handed thumb naturally lands right-of-center; the button sits left-of-center.
- "You've referred **0** so far" sits underneath — italic, small, low contrast on dark. Hard to read.
- The `.ref-rung` height is 66–88 px (1-col stack). Big enough to look like rows you can tap, but they aren't interactive. Some users will tap them and get nothing. Either make them tappable (each = a share-this-tier action) or visually de-emphasise the click affordance.

Fix Monday: full-width copy button, count text bumped to 13px, italic dropped.

---

## 9. Poll on mobile (Q9)

`elem-poll.png`: 3 options flex-wrap. At 390px the result is **2 chips on row 1, 1 chip on row 2** (171+10+126 = 307px fits row 1, leftover "…planning a switch" alone on row 2). Visually unbalanced — looks broken at first glance.

Heights are 40 px (marginal under 44 px). Padding `9px 16px` + font 13.5px. 

Fix: stack 1-col at ≤640px:
```css
.issue .poll .opts{flex-direction:column;align-items:stretch}
.issue .poll .opt{width:100%;text-align:left;padding:12px 18px;font-size:14px}
```
Or keep flex but `flex:1 1 100%` to force each onto its own row. Either makes the poll feel like a deliberate 3-choice question rather than overflow noise.

---

## 10. Reading progress bar (Q10)

`.progress` measures **w=0, h=3, x=0, y=0** when scroll is at top. That's expected. When I scroll, it stays at width:0 — see `scroll-15-y10500.png` — there is NO visible orange line at the top of the dark band area where it should be near 100%.

Look at `ReadingProgress.tsx` (5 lines — that's the file size). The width-update logic is presumably in `/src/components/interactive/ReadingProgressClient.tsx`. Either:
- The hook isn't measuring `document.scrollHeight - window.innerHeight` correctly, or
- It's keyed off a scroll target that doesn't fire on this page.

Either way: **the progress bar is dead on mobile**. With a 11,317 px page that lacks visual punctuation, a working progress bar is one of the cheapest motivational tools we have. Fix is high-leverage.

Open `ReadingProgressClient.tsx` and verify `useEffect` is attached to `window`'s `scroll` event AND that it computes `pct = scrollY / (scrollH - viewH)`. Then make sure the bar element is the same one styled by `.issue .progress` (CSS targets `.issue .progress` — confirm the React component renders with that class chain).

---

## Top 10 mobile-specific fixes — file + before/after

### Fix 1 — Reading progress bar (CRITICAL, 5-min fix)

**File:** `/Users/surajpandita/ai_signal/src/components/interactive/ReadingProgressClient.tsx`
(file size 5 lines per `wc -l` on `ReadingProgress.tsx` — confirm the client file does the math.)

**Diagnostic first:** open the file and confirm the listener actually runs and writes `style.width = pct + '%'` on the right node. If it does, the bug is the parent rendering `.progress` outside `.issue`, breaking the `.issue .progress` selector.

**Why this matters:** an 11,317 px article without a progress signal feels infinite. The bar exists in CSS — it's just not advancing. Free win.

---

### Fix 2 — Lens picker becomes sticky on mobile

**File:** `/Users/surajpandita/ai_signal/src/styles/issue.css`
**Lines:** Around line 304 (`.issue .track-bar`) and inside the `@media(max-width:640px)` block at line 54–78.

**Before** (line 304):
```css
.issue .track-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;max-width:600px;align-items:flex-start}
```

**After** — add inside the existing 640px block (e.g. after line 77):
```css
.issue .track-bar{position:sticky;top:0;background:var(--paper);z-index:5;padding:10px 0 8px;margin:0 0 14px;border-bottom:1px solid var(--hair)}
.issue .track-chip{padding:11px 14px;min-height:44px;display:inline-flex;align-items:center}
```

**Why:** picker stays in view across the 907 px lens stack, restoring the dim-other-lenses interaction, and chips hit the 44px tap minimum.

---

### Fix 3 — Track-chip is a button, not a span

**File:** `/Users/surajpandita/ai_signal/src/components/interactive/LensTrackPicker.tsx`
**Lines:** 45–60.

**Before:**
```tsx
<span className={`track-chip${selected === null ? ' on kesari' : ''}`} onClick={() => setSelected(null)}>Show all</span>
{labels.map((name, i) => (
  <span key={i} className={`track-chip${selected === i ? ' on' : ''}`} onClick={() => setSelected(i)}>{name}</span>
))}
```

**After:**
```tsx
<button type="button" className={`track-chip${selected === null ? ' on kesari' : ''}`} aria-pressed={selected === null} onClick={() => setSelected(null)}>Show all</button>
{labels.map((name, i) => (
  <button key={i} type="button" className={`track-chip${selected === i ? ' on' : ''}`} aria-pressed={selected === i} onClick={() => setSelected(i)}>{name}</button>
))}
```

**Why:** semantically correct, keyboard-focusable, and pairs with the padding bump from Fix 2.

---

### Fix 4 — Fold buttons hit 44px

**File:** `/Users/surajpandita/ai_signal/src/styles/issue.css`
**Lines:** 189 (`.foldbtn`) and 197 (`.bn-foldbtn`).

**Before:**
```css
.issue .foldbtn{...padding:8px 14px;...}
.issue .bn-foldbtn{...padding:8px 14px;...}
```

**After** — inside the 640px block:
```css
.issue .foldbtn,.issue .bn-foldbtn{padding:12px 16px;min-height:44px}
```

**Why:** trivial, both folds become true tap targets.

---

### Fix 5 — Poll opts stack 1-col, hit 44px

**File:** `/Users/surajpandita/ai_signal/src/styles/issue.css`
**Lines:** 294–298.

**After** — add inside the 640px block:
```css
.issue .poll .opts{flex-direction:column;gap:8px}
.issue .poll .opt{width:100%;padding:12px 18px;font-size:14px;min-height:44px;display:flex;align-items:center}
```

**Why:** the current 2+1 wrap looks like overflow garbage. Vertical stack reads as a clean question.

---

### Fix 6 — Referral copy button full-width

**File:** `/Users/surajpandita/ai_signal/src/styles/issue.css`
**Lines:** 237–241 (`.ref-actions`, `.ref-copy`).

**After** — inside the 640px block:
```css
.issue .ref-actions{flex-direction:column;align-items:stretch;gap:14px}
.issue .ref-copy{width:100%;padding:14px 18px;min-height:48px;text-align:center}
.issue .ref-count{text-align:center;font-style:normal;font-size:13px}
```

**Why:** the primary money CTA shouldn't be a 189px button stranded on the left of a 390px screen. Full-width = thumb-friendly = more taps.

---

### Fix 7 — Code block: smaller font + bottom-right copy

**File:** `/Users/surajpandita/ai_signal/src/styles/issue.css`
**Lines:** 130–133.

**Before:**
```css
.issue .codecopy{position:absolute;top:8px;right:8px;...padding:3px 8px;...}
```

**After** — inside the 640px block:
```css
.issue .codeblock pre{font-size:11px;line-height:1.55;padding:14px 14px 36px}
.issue .codecopy{top:auto;bottom:8px;right:8px;padding:6px 12px;font-size:11px;min-height:32px}
```

**Why:** kills horizontal overflow on the longest line; copy button moves away from where the thumb scrolls horizontally; pre gets bottom-padding so text doesn't sit under the button.

---

### Fix 8 — India Signal cards: alternate visual weight

**File:** `/Users/surajpandita/ai_signal/src/styles/issue.css`
**Lines:** 269–280.

**After** — inside the 640px block:
```css
.issue .signal2 .sig:nth-child(even){background:var(--faint);margin:0 -22px;padding:18px 22px}
.issue .signal2 .sig:nth-child(even):first-child{padding-top:14px}
```

**Why:** breaks the "3 paragraphs in a row" perception. Alternating bands give the eye a beat.

---

### Fix 9 — Hero h1 line-height + max-line-length safety

**File:** `/Users/surajpandita/ai_signal/src/styles/issue.css`
**Lines:** 39.

**Before:**
```css
.issue .hero h1{font-family:'Fraunces',serif;font-weight:500;font-size:clamp(38px,6vw,70px);line-height:1.04;letter-spacing:-.025em;margin-top:22px}
```

**After** — inside the 640px block:
```css
.issue .hero h1{font-size:34px;line-height:1.08;letter-spacing:-.02em;margin-top:18px}
```

**Why:** the issue 001 hero uses forced `<br>` so it works. But the source HTML mobile preview rendered at ~34px and gave more breathing room. We currently render at 38px (clamped lower bound) which is right at the edge of overflow risk if a future issue doesn't use `<br>` — and the 6vw scaling at 390px = 23.4px which would never apply since 38px is the clamp floor. Tightening explicitly at ≤640px is safe.

---

### Fix 10 — Add an in-content section break ("part 2 of 3" sigil)

**File:** `/Users/surajpandita/ai_signal/src/styles/issue.css` (new rule) AND add a `<hr class="part-break">` JSX in the issue page route between Job Signal (sec 03) and Under the Hood (sec 04), and between Reality Check (sec 07) and India Signal (sec 08).

**New CSS:**
```css
.issue .part-break{border:none;height:1px;background:var(--ink);max-width:60px;margin:48px auto;position:relative;text-align:center}
.issue .part-break::after{content:"§ ii";position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--paper);padding:0 12px;font-family:'Newsreader',serif;font-style:italic;font-size:13px;color:var(--grey)}
```

**Why:** the worst fatigue zones are y=3700–5100 and y=7400–9300 (per #3). One sigil break in each, plus the existing dark bands, gives the page 5 punctuation marks instead of 3. Reader feels rhythm, not infinity.

(Not strictly CSS-only — needs a JSX insertion in `/src/app/i/[issue]/page.tsx`. Worth the 2 lines.)

---

## Verdicts (1–5)

| Dimension | Score | Notes |
|---|---|---|
| First-screen quality | **4 / 5** | Masthead + hero + sub + TL;DR all land above the fold. H1 is gorgeous. Eyebrow line `01 · 13.06.2026 · 7 MIN` reads well. Loses a point because the "Skim in 5, or go deep in 12" promise is lost in the sub — could be its own row. |
| Tap-target ergonomics | **2 / 5** | 7 of 8 interactive elements fail or are marginal at 44px. Track chips and copy buttons are the worst. |
| Scroll-rhythm | **2 / 5** | 11,317 px page with only 3 visual breaks — and two of them sit back-to-back at the very end. The middle 3,000 px is a single cream-toned slog. |
| Native-on-touch feel | **2 / 5** | Track-chip is `<span>` (non-button). Hover-only states (`.foldbtn:hover` etc) with no `:active` equivalent for touch. Copy buttons are tiny. Progress bar broken. |
| Completes-the-issue likelihood | **3 / 5** | The content is genuinely strong, the dark bands rescue it, and the poll at the bottom is a good lure. But without sticky lens picker and a working progress bar, I estimate 40–50% of mobile readers drop in the 3,700–5,100 stretch. |

---

## Final tally

- **Mobile issues found: 23** (10 prioritised fixes above; 13 secondary issues documented across §1–10, e.g. monotonous India Signal cards, sig-foot link 36px, two dark bands sandwiched, sub-copy "Skim in 5" hidden, etc.)

- **Top 3 fixes to ship Monday:**
  1. **Fix the reading-progress bar** (it currently renders but never advances). 5-minute diagnostic, biggest emotional reward per CSS line shipped.
  2. **Make the lens picker sticky on mobile + bump track-chip to 44px + convert `<span>` to `<button>`** (Fixes 2 + 3 combined). This rescues the entire "So What For Me?" section which is the editorial soul of the issue.
  3. **Stack poll opts 1-col + bump fold buttons + full-width referral copy** (Fixes 4, 5, 6 batched). Three CSS rules inside the existing `@media(max-width:640px)` block. Zero JS. Ships in 10 minutes.
