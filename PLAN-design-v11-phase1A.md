# AI Signal V11 — Frontend Implementation Plan

**Status:** Phase 1A — Frontend-only static design refresh
**Reference:** `docs/design-reference/v11.html` (3845 lines, V3-approved design)
**Branch:** `design-v11`
**Production safety:** `main` branch + production untouched throughout
**Estimated time:** 90–110 minutes total, sequentially gated

---

## 🚨 ROOT CAUSES FROM LAST ATTEMPT (DO NOT REPEAT)

Last design refresh took 4+ hours and broke 3 times. The 6 root causes:

| # | Mistake | Symptom | Prevention this time |
|---|---|---|---|
| 1 | Inline styles in components | `::before`/`::after` pseudo-elements didn't render — animations + decorations missing | **ZERO inline styles. className-only.** |
| 2 | `.reveal` class with IntersectionObserver | Above-the-fold components invisible | **Use `.anim d1`/`d2`/`d3` for entrance animations** |
| 3 | Sub-agents working in parallel | Integration bugs, file overlap | **Single-threaded. One component at a time.** |
| 4 | Sub-agent "interpretation" of CSS/HTML | 60% match instead of pixel-perfect | **VERBATIM extraction. Copy-paste, never paraphrase.** |
| 5 | Big bang apply (16 components at once) | Bugs compound, rollback impossible | **Sequential gating. Verify after each component.** |
| 6 | Visual verification at the end | Bugs discovered late | **Visual verify after EVERY single step.** |

**These 6 rules are NON-NEGOTIABLE.**

---

## 🎯 WHAT THIS PHASE DELIVERS

After this phase, `localhost:3000` will render the V11 design **with hardcoded demo content** matching the reference HTML exactly.

**Included:**
- ✅ Top navigation (sticky, brand mark + ring)
- ✅ Hero zone (shapes, fragment, eyebrow, big headline, sub, why-context, broadcast typewriter, tickers, preview cards, bridge)
- ✅ Notebook strip (rotating "Did you know?" facts with categories)
- ✅ Article body — 22 sections matching V11
- ✅ Standup card with 4 platform tabs
- ✅ Reading sidebar (score ring + tomorrow probably envelope stack)
- ✅ Archive section + Subscribe section
- ✅ Reading progress bar, read stamp, feedback vote

**NOT included (deferred to Phase 1B/1C):**
- ❌ Writer prompt changes
- ❌ DB migrations
- ❌ Validator updates
- ❌ Real article data wiring (everything stays hardcoded)

**Why static-first:** Decouples design risk from backend risk. Last time we coupled both and rollback was painful.

---

## 📂 FILE INVENTORY

### CREATE:
```
docs/design-reference/v11.html              (user provides)
src/components/HeroZone.tsx                 (rewrite if exists, create if not)
src/components/NotebookStrip.tsx            (rewrite/create)
src/components/StoryArticle.tsx             (full rewrite)
src/components/StandupCard.tsx              (rewrite/create)
src/components/ReadingSidebar.tsx           (rewrite/create)
src/components/ArchiveSection.tsx           (rewrite/create)
```

### MODIFY:
```
src/app/globals.css                         (append V11 CSS, ~2500 new lines)
src/app/page.tsx                            (restructure to render new components)
src/components/SiteNav.tsx                  (rewrite/verify)
src/components/SubscribeSection.tsx         (verify)
```

### NEVER TOUCH:
```
src/lib/inngest/functions.ts                (writer — Phase 1B)
src/lib/validator.ts                        (Phase 1B)
supabase/migrations/                        (Phase 1B)
package.json                                (no new deps)
.env, .env.local                            (out of scope)
.claude/intelligence/                       (out of scope)
```

---

## 🔧 EXECUTION STEPS

Each step has: **(a)** action, **(b)** what NOT to do, **(c)** verify command, **(d)** STOP signal.

After every STOP, do not proceed until user explicitly confirms visual match.

---

### STEP 0: Branch + reference setup (3 min)

```bash
cd /Users/surajpandita/ai_signal
git status                          # confirm clean working tree
git checkout main
git pull origin main
git checkout -b design-v11

mkdir -p docs/design-reference
# User saves v11.html to docs/design-reference/v11.html
ls -la docs/design-reference/v11.html
wc -l docs/design-reference/v11.html
```

**Stop. Confirm:** "Branch `design-v11` created, reference at `docs/design-reference/v11.html` with ~3845 lines."

---

### STEP 1: Read reference once, full pass (5 min)

Read `docs/design-reference/v11.html` cover to cover. Build mental map of:
- All `<style>` blocks
- All `<section>` blocks
- All `<script>` blocks
- All animations (`.anim d1`, `.anim d2`, etc. — NOT `.reveal`)

**Action:** Output one-paragraph confirmation. Do NOT modify code yet.

**Stop. Confirm:** "Read v11.html in full. Identified N sections, M CSS blocks. Ready to extract."

---

### STEP 2: Extract CSS variables + base styles (5 min)

Read reference lines ~14-40 (`:root`, `*`, `html`, `body` styles).

In `src/app/globals.css`:
1. Comment out existing `:root` block: `/* OLD V10 tokens — replaced by V11 */`
2. Below it, paste V11 `:root` block VERBATIM
3. Same for base `*`, `html`, `body` styles

**DO:**
- Copy character-for-character
- Keep all CSS variable names
- Keep all hex values exactly

**DON'T:**
- Convert px to rem
- Reorder properties
- Add browser prefixes
- Merge with existing variables — comment old, paste new

**Verify:**
```bash
npx tsc --noEmit
grep -c '\-\-bg:' src/app/globals.css   # expect ≥ 2
```

**Stop. Confirm:** "Step 2 done. Reload localhost:3000 — page may look half-broken, that's expected. Confirm 'Page loads, fonts loading, no console errors.'"

---

### STEP 3: Extract animations + utilities (5 min)

In reference, find ALL `@keyframes`:
- `livePulse`, `scanLine`, `shimmerText`, `fadeIn`
- `markRing`, `caretBlink`, `progressGrow` (if present)
- Any used by `.anim d1/d2/d3` classes

Also find:
- `.anim`, `.anim.d1`, `.anim.d2`, `.anim.d3`, `.anim.d4`, `.anim.d5` rules
- `.progress-bar`
- `.ico`, `.ico-sm`

**Action:** Append all to `src/app/globals.css` VERBATIM.

**CRITICAL:** `.anim d1/d2/d3` use `animation: name duration delay forwards` — auto-play via CSS, NOT IntersectionObserver. Ignore `.reveal` if present.

**Verify:**
```bash
grep -c "@keyframes" src/app/globals.css     # expect ≥ 4
grep -c ".anim" src/app/globals.css          # expect ≥ 1
grep -c ".reveal" src/app/globals.css        # expect 0
```

**Stop. Confirm:** "Step 3 done. Animations extracted. No visual change yet."

---

### STEP 4: Extract NAV + Hero Zone CSS (10 min)

In reference, find:
- `nav { ... }`, `.mark*`, `.nav-meta`, `.nav-cta-link`, `.nav-soon*`
- `.hero-zone`, `.hero-banner`, `.hero-graphics`, `.hero-shape*`, `.hero-fragment`
- `.hero-eyebrow*`, `.big-headline`, `.hero-sub*`, `.hero-why*`
- `.hero-broadcast*`, `.typed`, `.caret`, `.live-pip`, `.topic-pill`
- `.hero-tickers`, `.hero-ticker*`
- `.hero-preview-strip`, `.hero-preview-card*`
- `.hero-bridge*`

**Action:** Append all VERBATIM to `globals.css` in same order as reference.

**CRITICAL:**
- Keep all `::before` and `::after` pseudo-elements
- Keep `transform`, `animation` declarations exactly
- Keep all `position`/z-index values

**DON'T:**
- Simplify rules
- Merge selectors
- Change cubic-bezier values

**Verify:**
```bash
grep -c ".hero-zone" src/app/globals.css       # expect 1
grep -c ".hero-shape" src/app/globals.css      # expect ≥ 2
grep -c ".hero-broadcast" src/app/globals.css  # expect ≥ 1
grep -c "::before" src/app/globals.css         # expect ≥ 5
```

**Stop. Confirm:** "Step 4 done. Nav + Hero CSS extracted. No visual change yet."

---

### STEP 5: Rewrite SiteNav.tsx (8 min)

Reference: `<nav>` block at line ~2602-2622.

**Action:** Rewrite `src/components/SiteNav.tsx` to render exact HTML.

**Translation rules:**
- `class=` → `className=`
- All static text verbatim ("AI", "Signal", "daily signal", "Archive", "About", "Sponsor", "Subscribe →")
- All SVG markup verbatim (ring SVG with `markRingFill`)
- Keep `data-soon`, `aria-disabled`, `aria-hidden`, `aria-label`

**DO:**
- `'use client';` at top
- `useEffect` for mark ring animation if needed (static SVG fine for now)

**DON'T:**
- ZERO inline styles
- No `react-icons` / `lucide-react` for SVGs — copy raw
- No Tailwind, no CSS modules

**Verify:**
```bash
npx tsc --noEmit
grep -c "style=" src/components/SiteNav.tsx       # expect 0
grep -c "className=" src/components/SiteNav.tsx   # expect ≥ 5
```

**Stop. Tell user:** "SiteNav rewritten. Reload localhost:3000 and verify:
1. Nav sticky at top (scroll, stays)
2. Brand mark left: SVG ring + 'S' inside, 'AI Signal' text with italic 'Signal', 'daily signal' tag below
3. Right: 'Archive' link, 'About' button (disabled, dot), 'Sponsor' button (disabled, dot), 'Subscribe →' link
4. No console errors

Confirm 'Nav matches.' or screenshot if differs."

**Wait for explicit user confirmation. Only then proceed to STEP 6.**

---

### STEP 6: Rewrite HeroZone.tsx (15 min)

Reference: `<section class="hero-zone">` at line ~2624-2716.

**HTML structure to render:**
```tsx
<section className="hero-zone">
  <div className="hero-banner">
    <div className="hero-graphics" aria-hidden="true">
      <span className="hero-shape hero-shape-warm"></span>
      <span className="hero-shape hero-shape-cobalt"></span>
      <span className="hero-fragment">One signal.</span>
    </div>
    <div className="hero-eyebrow anim d2">
      <span className="hero-eyebrow-pip"></span>
      <span className="hero-eyebrow-text">27 April 2026 · Today's signal</span>
    </div>
    <h1 className="big-headline anim d3">
      Today's one AI story.<br />
      <span className="ital sub-line">The one that should change a decision.</span>
    </h1>
    <p className="hero-sub anim d4">
      <span className="hero-sub-item">Filed <strong>06:14&nbsp;IST</strong></span>
      <span className="hero-sub-sep">·</span>
      <span className="hero-sub-item"><strong>3&nbsp;min</strong>&nbsp;read</span>
      <span className="hero-sub-sep">·</span>
      <span className="hero-sub-tagline">For people who ship</span>
    </p>
    <div className="hero-why anim d4">
      <span className="hero-why-pip">06</span>
      <div><strong>Why 06:14 IST?</strong> It's when the first commit of the day lands in Bengaluru. We file before you stand up.</div>
    </div>
    <div className="hero-broadcast anim d5">
      <span className="hero-broadcast-scan"></span>
      <div className="hero-broadcast-eyebrow">Today's broadcast</div>
      <div className="hero-broadcast-line">
        <span className="typed" id="broadcastTyped"></span>
        <span className="caret"></span>
      </div>
      <div className="hero-broadcast-meta">
        <span><span className="live-pip"></span>Live · today's broadcast</span>
        <span className="divider">·</span>
        <span className="topic-pill">Models</span>
      </div>
    </div>
    <div className="hero-tickers anim d5">
      {/* 3 ticker cards verbatim from reference */}
    </div>
    <div className="hero-preview-strip anim d5">
      {/* 3 preview cards 01/02/03 verbatim */}
    </div>
  </div>
</section>
<div className="hero-bridge anim d5">
  <span className="hero-bridge-text">What you're about to read</span>
  <span className="hero-bridge-line"></span>
</div>
```

**Add typewriter:**
- `'use client';`
- `useEffect(() => { ... }, [])`
- Find typewriter JS in reference's `<script>` (search `broadcastTyped`)
- Port to React: copy function body, target `document.getElementById('broadcastTyped')`
- Cleanup return: clear setTimeout

**Hardcode demo content:**
- Date: "27 April 2026 · Today's signal"
- Filed: "06:14 IST", read: "3 min", tagline: "For people who ship"
- "Why 06:14 IST?" full paragraph
- Topic pill: "Models"
- 3 tickers: GPT-5 Mini $0.04, AI funding $2.8B, Models shipped 23
- 3 preview cards: "By the numbers / $0.04 per 1M tokens", "Why it matters / Q1 budgets are wrong now", "The move / Switch defaults this week"
- Broadcast phrases: copy array from reference

**DO:**
- ZERO inline styles
- SVG markup verbatim
- Exact className strings (`hero-eyebrow anim d2`)

**DON'T:**
- IntersectionObserver
- Replace `.anim d2/d3/d4/d5` — they auto-play via CSS
- Shorten any text
- Switch fonts/colors

**Verify:**
```bash
npx tsc --noEmit
grep -c "style=" src/components/HeroZone.tsx       # expect 0
grep -c "anim d" src/components/HeroZone.tsx       # expect ≥ 5
grep -c "useEffect" src/components/HeroZone.tsx    # expect 1
```

**Stop. Tell user:**
"HeroZone rewritten. Reload localhost:3000 and verify:

1. **Hero shapes** — warm + cobalt blobs in background
2. **'One signal.' fragment** — italic floating top-left
3. **Eyebrow** — pip + '27 April 2026 · Today's signal'
4. **Big headline** — 'Today's one AI story.' + italic 'The one that should change a decision.'
5. **Sub** — 'Filed 06:14 IST · 3 min read · For people who ship'
6. **Why context** — '06' pip + 'Why 06:14 IST?' explanation
7. **Broadcast** — eyebrow + typewriter cycling + Live + topic pill
8. **3 tickers**
9. **3 preview cards** (01/02/03)
10. **Hero bridge** below

Stagger animations (d2 first, d5 last).
Confirm 'Hero matches.' or screenshot if off."

**Wait for explicit confirmation. Only then proceed to STEP 7.**

---

### STEP 7: Extract notebook + article body CSS (15 min)

In reference, find ALL CSS for these section groups:

**Notebook:**
- `.notebook-strip`, `.notebook`, `.nb-tape`, `.nb-margin`, `.nb-doodle`
- `.nb-row`, `.nb-left`, `.nb-title`, `.nb-counter`
- `.nb-fact-wrap`, `.nb-fact-text`
- `.nb-actions`, `.nb-controls`, `.nb-btn`, `.nb-tabs`, `.nb-tab`

**Layout:**
- `.main-grid`, `.sidebar`

**Story core:**
- `.story-wrap`, `.story-jump-link`, `.story-meta`, `.category-chip`, `.meta-text`, `.timer-bar*`, `.timer-icon`, `.timer-ring*`
- `.story-headline`, `.story-deck`
- `.author-row`, `.author-avatar`, `.author-info`, `.author-name`, `.author-handle`, `.verified`
- `.share-row`, `.share-label`, `.share-btn`

**TL;DR + Signal:**
- `.tldr-strip`, `.tldr-icon`, `.tldr-content`, `.tldr-label`, `.tldr-text`
- `.signal-block`, `.signal-eyebrow`, `.signal-body`

**Blocks + stats:**
- `.block`, `.block-header`, `.block-num`, `.block-eyebrow`, `.block-title`
- `.stat-cards`, `.stat-card*`, `.countup`, `.delta-down`, `.stat-sparkline*`

**Charts + insights:**
- `.compare-chart`, `.compare-title`, `.compare-subtitle`, `.compare-row`, `.compare-label`, `.compare-bar*`, `.compare-value`
- `.insights-strip`, `.insight-cell`, `.insight-icon`, `.insight-label`, `.insight-text`, `.highlight`

**Why + cascade + stakeholders:**
- `.context-body`, `.editorial-quote`, `.quote-glyph`, `.quote-attr`
- `.cascade-grid`, `.cascade-title`, `.cascade-subtitle`, `.cascade-row`, `.cascade-step`, `.cascade-marker`, `.cascade-week`, `.cascade-event`
- `.stakeholder-grid`, `.stakeholder-title`, `.stakeholder-subtitle`, `.stakeholder-matrix`, `.stakeholder-cell`, `.stakeholder-cell-label`, `.stakeholder-who`, `.stakeholder-why`

**Builder + decision:**
- `.builder-block`, `.builder-eyebrow`, `.live-mini`, `.builder-quote`, `.builder-attr*`
- `.builder-secondary`, `.builder-card*`
- `.decision-aid`, `.decision-title`, `.decision-question`, `.decision-flow`, `.decision-row`, `.decision-q`, `.q-num`, `.decision-pill`, `.decision-verdict*`

**Action + standup:**
- `.action-list`, `.action-item`, `.action-num`, `.action-content`, `.action-tag`, `.action-text`, `.action-progress*`
- `.standup-card`, `.standup-header`, `.standup-icon`, `.standup-title`, `.standup-subtitle`
- `.standup-tabs`, `.standup-tab`, `.standup-preview`, `.standup-copy-btn`, `.copy-icon`

**Counter + reactions + sources:**
- `.counter-block`, `.counter-stamp`, `.counter-eyebrow`, `.counter-headline`, `.counter-body`
- `.reaction-grid`, `.reaction-card`, `.reaction-quote`, `.reaction-attr`, `.reaction-avatar`, `.reaction-meta`, `.reaction-name`, `.reaction-role`
- `.sources-block`, `.sources-header`, `.sources-label`, `.sources-count`, `.sources-list`, `.source-card`, `.source-rank`, `.source-favicon`, `.source-info`, `.source-name`, `.source-title`, `.source-tag`, `.source-arrow`

**Footer:**
- `.read-stamp`
- `.feedback-vote*`, `.feedback-buttons`, `.feedback-btn`, `.vote-icon`, `.feedback-thanks`

**Sidebar:**
- `.score-card`, `.score-eyebrow*`, `.score-body`, `.score-ring*`, `.score-msg*`, `.score-pace*`
- `.probably-card`, `.probably-header`, `.probably-eyebrow`, `.probably-sub`, `.probably-stack`, `.probably-env*`

**Archive + subscribe:**
- `.archive`, `.archive-header*`, `.archive-cards`, `.archive-card*`
- `.subscribe`, `.subscribe-*`, `.subscribe-input`, `.subscribe-btn`

**Mobile media:**
- `@media (max-width: ...)` — entire mobile responsive block

**Action:** Append all VERBATIM to `globals.css` in same order as reference.

**CRITICAL:** Big step (~1500-2000 lines). No skipping. No merging selectors. Faithful copy.

**Verify:**
```bash
grep -c ".story-wrap" src/app/globals.css           # expect 1
grep -c ".standup-tab" src/app/globals.css          # expect ≥ 1
grep -c ".score-ring" src/app/globals.css           # expect ≥ 1
grep -c ".probably-env" src/app/globals.css         # expect ≥ 1
grep -c "@media" src/app/globals.css                # expect ≥ 1
wc -l src/app/globals.css                           # ~2000 line growth
```

**Stop. Confirm:** "Step 7 done. All article + sidebar + footer CSS extracted. No visual change yet."

---

### STEP 8: Create NotebookStrip.tsx (10 min)

Reference: `<section class="notebook-strip">` at line ~2724-2767.

**Render exact HTML structure** with:
- `.nb-tape`, `.nb-margin`, `.nb-doodle` decorations
- `.nb-row` with left (title + counter) / fact / actions
- 3 control buttons (prev/play/next) with SVG icons verbatim
- 4 tabs (All/Nums/Trivia/Industry)

**Behavior:**
- `'use client';`
- `useState` for fact index
- `useEffect` for auto-rotation (interval every 6s, paused if user clicked pause)
- Find fact pool array in reference's `<script>` — copy full array
- Wire prev/play/next + tab filters

**DON'T:**
- ZERO inline styles
- Change fact text or count
- Simplify SVGs

**Stop. Tell user:**
"NotebookStrip created. Reload localhost:3000 and verify:

1. Notebook below hero (cream/beige paper background)
2. Decorative tape top, red margin line left, doodle in corner
3. 'Did you know?' + 'Fact 01 of 12'
4. Initial fact text visible
5. Prev/Pause/Next functional
6. 4 tabs: All / Nums / Trivia / Industry
7. Auto-rotates ~6s
8. Pause stops rotation
9. Tab filters

Confirm 'Notebook matches.' or list issues."

**Wait for confirmation. Only then proceed to STEP 9.**

---

### STEP 9: Rewrite StoryArticle.tsx — main article body (25 min)

Reference: `<article class="story-wrap">` at line ~2772-3228.

**This is the biggest single component. Read carefully.**

**Render all 22 sections in this exact order:**
1. Story jump link
2. Story meta (category chip + read time + timer)
3. Story headline `<h2>`
4. Story deck
5. Author row + share buttons
6. TL;DR strip
7. Signal block
8. Block 1 'By the numbers' + 3 stat cards + comparison chart
9. Insights strip
10. Block 2 'Why it matters' + editorial quote
11. Cascade timeline
12. Stakeholder grid
13. Builder block + builder secondary
14. Decision aid
15. Block 3 'The Move' + action list + progress
16. `<StandupCard />` placeholder (created in STEP 10)
17. Counter block (Devil's Advocate)
18. Reaction grid
19. Sources block
20. Read stamp
21. Feedback vote

**Add comment at top:**
```tsx
/*
 * PHASE 1A: All content hardcoded from docs/design-reference/v11.html.
 * Phase 1B will replace with real article data props.
 * DO NOT modify content during Phase 1A — match reference byte-for-byte.
 */
```

**Hardcode all text from reference verbatim.** Do NOT abbreviate. Do NOT replace with `{props.headline}`.

**DO:**
- `'use client';`
- ZERO inline styles
- All SVG verbatim
- All `id="..."` attributes (timer, actionList, etc.)
- For interactive (timer countdown, action checkboxes, feedback buttons):
  - Minimal `useState` + `useEffect`
  - Find JS in reference `<script>`, port to React

**DON'T:**
- Refactor sections into smaller components yet (keep monolithic for speed)
- Add Tailwind / CSS modules / third-party libs
- Shorten any text

**Wire StandupCard:**
- Render `<StandupCard />` placeholder where standup-card belongs
- StandupCard component created in STEP 10

**Verify:**
```bash
npx tsc --noEmit
grep -c "style=" src/components/StoryArticle.tsx       # expect 0
grep -c "story-headline\|signal-block\|cascade-grid\|stakeholder-grid\|decision-aid\|reaction-grid\|sources-block\|read-stamp\|feedback-vote" src/components/StoryArticle.tsx  # expect ≥ 9
```

**Stop. Tell user:**
"StoryArticle rewritten with all 22 sections. Reload localhost:3000 and walk through top to bottom. Verify each section against reference:

1. Jump link top right
2. Story meta — category chip, read time, expiring timer
3. Headline + deck (large serif)
4. Author row — avatar, name with check, handle, share buttons
5. TL;DR strip — warm cream box
6. Signal block — blue-tinted, arrow icon, lede
7. Block 1 'By the numbers' — title + 3 stat cards with sparklines + comparison bars
8. Insights strip — 3 cells
9. Block 2 'Why it matters' — paragraphs + editorial quote
10. Cascade timeline — 4 weeks
11. Stakeholder grid — 2x2
12. Builder block + 2 secondary cards
13. Decision aid — 3 questions + verdict
14. Block 3 'The Move' — 3 actions + progress
15. (StandupCard placeholder — empty, filled in Step 10)
16. Counter block — 'Devil's Advocate' + counter view
17. Reaction grid — 3 cards
18. Sources block — 3 cards with rank/favicon
19. Read stamp
20. Feedback vote — 4 buttons

If ANY section broken/missing/off — STOP, screenshot, report, fix.
DO NOT proceed to Step 10 until all 21 sections render correctly."

**Wait for confirmation. Only then proceed to STEP 10.**

---

### STEP 10: Create StandupCard.tsx (12 min)

Reference: `<div class="standup-card">` at line ~3084-3112.

**Render HTML:**
```tsx
<div className="standup-card" id="standupCard">
  <div className="standup-header">
    <div className="standup-icon">
      {/* SVG clipboard icon verbatim */}
    </div>
    <div className="standup-header-text">
      <div className="standup-title">Bring this to your standup</div>
      <div className="standup-subtitle">9 AM · QUOTABLE</div>
    </div>
  </div>
  <div className="standup-tabs" role="tablist">
    <button className="standup-tab active" data-format="slack" role="tab">Slack</button>
    <button className="standup-tab" data-format="email" role="tab">Email</button>
    <button className="standup-tab" data-format="whatsapp" role="tab">WhatsApp</button>
    <button className="standup-tab" data-format="linkedin" role="tab">LinkedIn</button>
  </div>
  <div className="standup-preview" id="standupPreview">
    {/* Preview text per active format */}
  </div>
  <button className="standup-copy-btn" id="standupCopyBtn">
    <span className="copy-icon">{/* SVG */}</span>
    <span id="standupCopyLabel">Copy for Slack</span>
  </button>
</div>
```

**Behavior:**
- `'use client';`
- `useState` for active format (default 'slack')
- 4 hardcoded message templates from reference (find `slackText`, `emailText`, `whatsappText`, `linkedinText` in reference `<script>`)
- Tab click → switch format → update preview + copy label
- Copy button → use **`document.execCommand('copy')` fallback** (NOT `navigator.clipboard` — fails on `file://`)

**Copy fallback (port verbatim):**
```tsx
function copyToClipboard(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
```

**Show toast on copy:**
- Inline minimal toast div OR browser-native alert
- No complex toast library

**Wire into StoryArticle.tsx:**
Replace placeholder with `<StandupCard />`.

**CRITICAL:**
- ZERO inline styles
- Exact text per format from reference

**Verify:**
```bash
npx tsc --noEmit
grep -c "style=" src/components/StandupCard.tsx       # expect 0
grep -c "execCommand" src/components/StandupCard.tsx  # expect ≥ 1
```

**Stop. Tell user:**
"StandupCard created and wired. Reload localhost:3000 and verify:

1. Standup card between Block 3 (The Move) and Counter block
2. Header — clipboard icon + 'Bring this to your standup' + '9 AM · QUOTABLE'
3. 4 tabs: Slack (active default) / Email / WhatsApp / LinkedIn
4. Preview area shows pre-formatted Slack message
5. Copy button: 'Copy for Slack'
6. Click each tab → preview updates + copy label updates
7. Click copy → text copied (paste somewhere to verify)
8. Optional toast 'Copied'

Confirm 'Standup matches.' or list issues."

**Wait for confirmation. Only then proceed to STEP 11.**

---

### STEP 11: Rewrite ReadingSidebar.tsx (10 min)

Reference: `<aside class="sidebar">` at line ~3230-3301.

**Render:**
- Score card: SVG ring with gradient, percentage text, message title + detail, optional pace info
- Probably card: 3 envelope cards (TUE/WED/THU) with day/date/text/status

**Behavior:**
- `'use client';`
- Score ring fills based on scroll position (`useEffect` + scroll listener)
- Probably envelopes: 1st unlocked, 2nd + 3rd locked

**CRITICAL:**
- ZERO inline styles (except `stroke-dashoffset` which IS inline-style — that's a transient computed value, exception case)
- SVG verbatim including `linearGradient` definition

**Wire into page.tsx:**
- Wrap StoryArticle + ReadingSidebar in `<div className="main-grid">` (CSS already in globals.css from Step 7)

**Verify:**
```bash
npx tsc --noEmit
grep -c "style=" src/components/ReadingSidebar.tsx    # expect ≤ 1 (only stroke-dashoffset transient)
```

**Stop. Tell user:**
"ReadingSidebar rewritten and wired. Reload localhost:3000 and verify:

1. Sidebar right of article on desktop ≥ 880px
2. Sidebar sticky, scrolls with content but stays in view
3. Score card — gradient ring, % center
4. Score message — 'Just landed' / 'Most readers leave...'
5. Scroll down — ring fills, % increases
6. Probably card — 'Tomorrow, probably' eyebrow + 'three drafts on the desk'
7. 3 envelopes — TUE 28 Apr (unlocked) / WED 29 Apr (sealed) / THU 30 Apr (sealed)
8. Mobile (< 880px) — sidebar collapses below article

Confirm 'Sidebar matches.' or list issues."

**Wait for confirmation. Only then proceed to STEP 12.**

---

### STEP 12: Create ArchiveSection.tsx + verify SubscribeSection.tsx (10 min)

Reference:
- `<section class="archive">` at line ~3304
- `<section class="subscribe">` at line ~3331

**ArchiveSection:**
- Header: title + count
- 3 archive cards in grid
- Each card: date, headline, signal excerpt, CTA arrow

**SubscribeSection:** Likely exists. Check styling matches reference.

**Wire into page.tsx:**
After main-grid, render ArchiveSection then SubscribeSection.

**CRITICAL:**
- ZERO inline styles
- All static content from reference verbatim

**Stop. Tell user:**
"Archive + Subscribe done. Reload localhost:3000 and verify:

1. Below article + sidebar — archive section
2. 3 past issue cards in horizontal grid
3. Each card — date, headline, snippet, hover-elevate
4. Below archive — subscribe section
5. Email input + subscribe button
6. Footer if present

Confirm 'Archive + subscribe match.' or list issues."

**Wait for confirmation. Only then proceed to STEP 13.**

---

### STEP 13: Final integration test (5 min)

Walk page top to bottom. Verify everything ties together.

**Checklist:**
- [ ] Top progress bar fills on scroll
- [ ] Sticky nav stays at top
- [ ] Hero animations stagger on load
- [ ] Broadcast typewriter cycles
- [ ] Notebook auto-rotates
- [ ] Article renders all 22 sections cleanly
- [ ] Stat sparklines visible
- [ ] Comparison bars render
- [ ] Standup tabs switch correctly
- [ ] Action checkboxes work
- [ ] Sidebar score ring fills on scroll
- [ ] Mobile responsive (< 880px) collapses to single column
- [ ] No console errors
- [ ] No TypeScript errors

**Verify:**
```bash
cd /Users/surajpandita/ai_signal
npx tsc --noEmit
npm run lint 2>&1 | head -30
npm run build 2>&1 | tail -30
```

**Stop. Tell user:**
"Final integration check. Walk through page on desktop (1280px+) and mobile (375px). List any remaining issues. If all good, ready to commit."

---

### STEP 14: Commit on branch (do NOT push, do NOT merge)

```bash
git add docs/design-reference/v11.html
git add src/app/globals.css
git add src/app/page.tsx
git add src/components/SiteNav.tsx
git add src/components/HeroZone.tsx
git add src/components/NotebookStrip.tsx
git add src/components/StoryArticle.tsx
git add src/components/StandupCard.tsx
git add src/components/ReadingSidebar.tsx
git add src/components/ArchiveSection.tsx
git add src/components/SubscribeSection.tsx
git status

git commit -m "design: v11 phase 1A — full design refresh from V3 reference

Static frontend-only design refresh. No backend changes.

- Sticky nav with brand mark + ring
- Hero zone: shapes, fragment, eyebrow, headline, sub, why-context, broadcast typewriter, 3 tickers, 3 preview cards, bridge
- Notebook strip with rotating did-you-know facts (12 facts, 4 categories)
- Article body with 22 sections matching v11 reference
- Standup card with 4 platform tabs (Slack/Email/WhatsApp/LinkedIn) + execCommand copy
- Reading sidebar with score ring + tomorrow probably envelope stack
- Archive section (3 past issues) + Subscribe section
- Reading progress bar, read stamp, feedback vote

All CSS extracted byte-for-byte from docs/design-reference/v11.html.
All components use className-only (zero inline styles).
No .reveal class — uses .anim d1/d2/d3 for entrance animations.
Static demo content matching reference. Real article data wiring in Phase 1B.

Phase 1B (next session) will:
- Add full writer output schema (preview_cards, stat_cards, primary_chart, cascade, stakeholders, decision_aid, standup_messages, etc.)
- Update validator to enforce schema
- DB migration for new columns
- Wire components to read real fields, replace static demo
"
```

**Stop. Tell user:**
"Commit on `design-v11` branch. NOT pushed. NOT merged.

Hard reload (clear cache), walk page, click everything, resize browser.

If anything off, fix on this branch.

When confident:
- `git push origin design-v11` (creates remote branch, NOT main)
- `git checkout main && git merge design-v11 && git push origin main` to ship

Production untouched until you explicitly merge."

---

## 🛑 ROLLBACK PLAN

If branch breaks beyond fixing:

```bash
git checkout main                       # back to safe production
git branch -D design-v11                # delete branch entirely
# Production unaffected.
```

If partially good but want to restart from a step:
```bash
git log --oneline                       # find last good commit
git reset --hard <commit-hash>          # rewind
```

---

## ✅ SUCCESS CRITERIA

Phase 1A is COMPLETE when ALL TRUE:

- [ ] `design-v11` branch with commit
- [ ] `docs/design-reference/v11.html` in repo
- [ ] `globals.css` has all V11 CSS (~2500 new lines)
- [ ] `npx tsc --noEmit` zero errors
- [ ] `npm run build` succeeds
- [ ] All 7 components render, no console errors
- [ ] User visually verified every step
- [ ] Mobile responsive (< 880px)
- [ ] Standup card 4 tabs functional, copy works
- [ ] Notebook fact rotation works
- [ ] Hero broadcast typewriter cycles
- [ ] Reading progress bar fills on scroll
- [ ] Reading sidebar score ring fills on scroll
- [ ] Animations stagger correctly (no `.reveal` IntersectionObserver bugs)
- [ ] ZERO inline styles (`grep -c "style=" src/components/*.tsx` = 0 across all)

If any item fails → STOP. Don't commit. Don't push. Tell user, fix, re-verify.

---

## 🎯 PHASE 1B SCOPE (NEXT SESSION, NOT THIS)

After Phase 1A verified + merged:

1. Writer prompt updates — full output schema:
   - `category` enum
   - `broadcast_phrases[6]`
   - `preview_cards[3]`
   - `did_you_know_facts[8-12]`
   - `stat_cards[3]` with sparkline_type
   - `primary_chart` (typed)
   - `insights_strip[3]`
   - `cascade.steps[4]`
   - `stakeholders.cells[4]`
   - `decision_aid.rows`
   - `actions[3]` with action_tag enum
   - `standup_messages` (slack/email/whatsapp/linkedin)
   - `counter_view`
   - `reactions[3]`
   - `tomorrow_drafts[3]`

2. Validator hard checks for above

3. DB migration: new columns + `validation_errors jsonb` + `needs_review` enum

4. Replace hardcoded with real data

5. Test regenerated article via Inngest

6. Deploy production

**Phase 1B NOT in scope this plan. Don't attempt during 1A.**

---

## 📞 IF STUCK

1. Re-read root cause table at top
2. Check reference HTML
3. Ask: "Stuck at Step N because X. Reference shows Y. Should I do Z?"

**DON'T improvise. DON'T skip. DON'T batch. DON'T add libraries.**

If reference HTML has bug, flag but copy as-is. Bugs fixed in Phase 1C.

---

**End of plan. Execute sequentially. Visual verify every step.**
