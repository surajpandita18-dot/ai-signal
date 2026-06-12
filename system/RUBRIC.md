# AI, Basically. — Surface Rubric (visual + readability + email)

**Owner:** Suraj · **Drafted by:** ARIA → SCRIPT specialist · **Date:** 2026-06-12
**Runner:** `scripts/rubric.mjs`
**Output:** `/tmp/rubric-<target>.json` + console summary + exit code
**Verdict bands:** ≥4.0 SHIP · 3.0–3.9 NEEDS_POLISH · <3.0 BLOCK

This rubric is **complementary** to the content rubric in
`src/lib/pipeline/rubric.ts` (which scores So-What / Actionability / Specificity
/ Freshness / Fairness / Restraint).

This one scores **surface signal**: can you read it, does it look right, does
it follow the brand voice constitution, and (for emails) is it client-safe.

> Every signal here is a deterministic measurement (DOM read, regex, or
> computed style). **No LLM judgement anywhere.** Two runs on the same content
> must produce identical scores (within rounding).

---

## How a target is scored

The runner takes a single `<target>`:

| Target form | Surface | Render path |
|---|---|---|
| `https://…`            | web   | Playwright loads the URL at 1400×900 + 390×844 |
| `email:001/002/003`    | email | `@react-email/render(IssueEmail)` against `content/issues/<slug>.json`, loaded into Playwright at 600×800 + 375×800 |
| `email:welcome`        | email | `@react-email/render(WelcomeEmail)` |
| `all`                  | every | landing + `i/001` web + 3 issue emails + welcome |

For each criterion:
1. Take the raw measurement (a number, a ratio, or a count).
2. Map it to **1–5** via the criterion-specific rule below.
3. Multiply by its **weight** (1× normal · 2× important · 3× load-bearing).
4. The target's **aggregate = weighted average** across all applicable
   criteria.

---

## Axis 1 — Readability (typography)

Source of truth: W3C ARIA Authoring Practices · Robert Bringhurst
"The Elements of Typographic Style" · Material 3 long-form typography ·
Apple HIG Readability.

### 1.1 Line length per content column · weight **2×**

- **Measures:** average characters per visible line of `<p>` / `<li>` text in the main column, using `ctx.measureText` against the element's computed font.
- **Source:** Bringhurst 45–75 ch ideal; Material 3 long-form 40–70 ch.
- **Score:**
  - 5 → ≥85% of paragraphs measure 45–75 ch
  - 4 → ≥70%
  - 3 → ≥50%
  - 2 → ≥30%
  - 1 → <30%
- **Worked example:** An email at a 560 px content column with 16 px Georgia
  body lands at ~70 ch — passes at 5. A landing page with a full-width 1200 px
  paragraph lands at ~140 ch — scores 1.

### 1.2 Body font size · weight **2×**

- **Measures:** median computed `font-size` of paragraph nodes. Minimum
  thresholds: **≥15 px web · ≥14 px email** (HIG iOS 17 default 17 px; web
  long-form 16–18 px norm).
- **Score:**
  - 5 → median ≥ min AND ≥90% of body samples meet min
  - 4 → median ≥ min AND ≥75% meet min
  - 3 → median = (min − 1) AND ≥60% meet min
  - 2 → median ≥ (min − 2)
  - 1 → otherwise.

### 1.3 Body line-height · weight **2×**

- **Measures:** `lineHeight / fontSize` ratio for body paragraphs.
- **Source:** Material 3 reading paragraph 1.5 · WCAG 1.4.12 1.5×.
- **Score:**
  - 5 → median ≥ 1.5 AND ≥90% of samples ≥ 1.5
  - 4 → median ≥ 1.5 AND ≥75% ≥ 1.5
  - 3 → median ≥ 1.4
  - 2 → ≥ 1.3
  - 1 → otherwise.

### 1.4 Avg paragraph word count · weight **1×**

- **Measures:** `text.split(/\s+/).length` per paragraph; average.
- **Score (40–80 words is the ideal narrative cadence):**
  - 5 → avg in 40–80 AND zero paragraphs >120 words
  - 4 → avg in 30–100 AND ≤10% >120 words
  - 3 → avg ≤120 AND ≤20% >120 words
  - 2 → avg ≤150
  - 1 → otherwise.

### 1.5 Heading hierarchy · weight **2×**

- **Measures:** count of `h1`; count of level skips (h1→h3 counts as 1 skip).
- **Source:** W3C ARIA · WCAG 1.3.1 structure.
- **Score:**
  - 5 → exactly one h1, zero skips
  - 4 → one h1, ≤1 skip
  - 3 → ≤1 h1, ≤2 skips
  - 2 → ≤2 h1
  - 1 → otherwise.

### 1.6 Active voice ratio · weight **1×**

- **Measures:** heuristic — `(is|are|was|were|been|being|be) + … + (\w+ed|\w+en)` matches per sentence. Score = `1 − passiveRatio`.
- **Source:** CLAUDE.md voice constitution ("verb-heavy, first-person, present-tense").
- **Score:**
  - 5 → active ≥ 0.8
  - 4 → ≥ 0.7
  - 3 → ≥ 0.6 (the tolerable floor)
  - 2 → ≥ 0.5
  - 1 → otherwise.

---

## Axis 2 — Design (visual)

Source of truth: **WCAG 2.1 / 2.2** · Material 3 · Apple HIG.

### 2.1 Color contrast · weight **3×**

- **Measures:** computed `color` vs ancestor `backgroundColor`. WCAG ratio formula. Per element:
  - body text (<18 px or <14 px-bold): must hit **4.5 : 1**
  - large text (≥18 px or ≥14 px-bold): must hit **3.0 : 1**
  - UI components: 3.0 : 1 (we treat any `button|a|input` as UI in addition to text)
- **Score:** ratio of failing elements / total sampled.
  - 5 → 0% fail
  - 4 → ≤2%
  - 3 → ≤5%
  - 2 → ≤10%
  - 1 → otherwise.

### 2.2 Palette discipline · weight **1×**

- **Measures:** distinct background / foreground / border colors across the
  page, quantised to the nearest 32 units per channel (collapses near-identical
  shades).
- **Source:** brand constitution — neutral cream + INK + ACCENT (#9C4A2E) + CLAY (#B5683E) + a small set of dark-band tones.
- **Score:**
  - 5 → ≤6 distinct hues
  - 4 → ≤8
  - 3 → ≤10
  - 2 → ≤14
  - 1 → otherwise.

### 2.3 Whitespace ratio · weight **1×**

- **Measures:** sample the document on an 8 px grid; mark a cell as "ink" if any text-node line rectangle intersects it. `backgroundRatio = 1 − ink/total`.
- **Source:** long-form editorial design (NYT, Stripe, Vercel reading view).
- **Score:**
  - 5 → 60–80% bg
  - 4 → 55–85%
  - 3 → 50–90%
  - 2 → ≥40%
  - 1 → otherwise.

### 2.4 Tap-target size at 390 / 375 px · weight **2×**

- **Measures:** at the mobile viewport, every `a|button|[role=button]|input|select|textarea` with a non-zero bounding box must be at least **44×44 CSS px** (web) or **28 px tall** (email — text links inside paragraphs are normal).
- **Source:** WCAG 2.5.5 Target Size · HIG iOS 44 pt.
- **Score:**
  - 5 → 0 failures
  - 4 → 1
  - 3 → ≤3
  - 2 → ≤6
  - 1 → otherwise.

### 2.5 Horizontal overflow at mobile · weight **3×**

- **Measures:** `scrollWidth > clientWidth + 1` on every element at the mobile viewport.
- **Source:** Material 3 + HIG layout (no horizontal scroll on phones).
- **Score:**
  - 5 → 0 elements overflow
  - 4 → 1
  - 3 → ≤3
  - 2 → ≤6
  - 1 → otherwise.

### 2.6 Numbered section gap consistency · weight **1×**

- **Measures:** find sections whose label contains a `01–09` prefix; compute the vertical gap between consecutive ones; require ≥95% to land within ±10% of the median gap.
- **Source:** internal brand rule — section rhythm.
- **Score:**
  - 5 → ≥95% within tolerance
  - 4 → ≥85%
  - 3 → ≥70%
  - 2 → ≥50%
  - 1 → otherwise.

---

## Axis 3 — Brand voice (deterministic)

Source of truth: **`CLAUDE.md` — voice constitution**.

### 3.1 No FOMO triggers · weight **3×**

- **Measures:** regex on `document.body.innerText`. Strip any `no (hype|fomo|scarcity|urgency|panic)` denial frame first so brand declaratives like *"no hype, no FOMO"* are not penalised. Then count matches of:
  - `/missing out/i`, `/\blimited[- ]time\b/i`, `/\bact now\b/i`,
    `/only \d+ left/i`, `/\bFOMO\b/i`, `/\bscarcity\b/i`, `/\burgency\b/i`.
- **Score:** 0 hits → 5; 1 hit → 3; ≥2 hits → 1.

### 3.2 Approved emoji only · weight **1×**

- **Measures:** count emojis in body text via a broad unicode range and check
  each against the approved set: **⚡ 🔨 ↳ ▸ ▾ ⧉ ✓ ■ →**.
- **Score:**
  - 5 → 0 unapproved
  - 4 → ≤1
  - 3 → ≤3
  - 2 → ≤6
  - 1 → otherwise.

### 3.3 No exclamation in body · weight **1×**

- **Measures:** count `!` inside `p|li` content only (titles + section labels exempt).
- **Score:** 0 → 5 · 1 → 4 · ≤2 → 3 · ≤4 → 2 · else 1.

### 3.4 Brand wordmark renders · weight **1×**

- **Measures:** regex match `/AI,\s*Basically\./` on body text.
- **Score:** binary — found → 5, missing → 1.

### 3.5 `.dot` accent colour · weight **1×**

- **Measures:** find an element containing "AI, Basically" then locate the
  child `span` whose text is `.` and check its computed `color` against the
  accent token `rgb(156, 74, 46)` (= `#9C4A2E`).
- **Score:** binary — exact match → 5, else 1.

---

## Axis 4 — Email-safety (email targets only)

Source of truth: **Litmus + Email on Acid client-rendering matrix** + Resend /
react-email docs. Apple Mail, Gmail (web + mobile), and Outlook 365 are the
client floors.

### 4.1 No `<script>` · weight **3×**

- **Measures:** `/<script\b/gi` count on the rendered HTML string.
- **Score:** 0 → 5, else 1.

### 4.2 No external images · weight **2×**

- **Measures:** `/<img[^>]+src="https?:\/\/(?!data:)/gi` matches.
- **Score:** 0 → 5 · 1 → 3 · else 1. (Inline data-URI images allowed.)

### 4.3 No CSS vars / class hooks · weight **1×**

- **Measures:** count `var(--` occurrences and `class="…"` attributes.
- **Score:**
  - 5 → 0 vars AND 0 class hooks
  - 4 → 0 vars AND ≤3 class hooks
  - 3 → ≤1 var
  - 1 → otherwise.

### 4.4 Container max-width = 600 · weight **2×**

- **Measures:** `/max-width:\s*600px/i` OR `width="600"`.
- **Score:** binary — match → 5, else 1.

### 4.5 Inline styles only · weight **2×**

- **Measures:** count `<link rel="stylesheet">` and `<style>` tags.
- **Score:** 0 of each → 5 · 0 links + ≤1 style → 4 · else 1.

### 4.6 Subject ≤ 50 chars · weight **1×**

- **Measures:** length of the derived subject (= stripped `hero_headline_html` for issues; canonical string for welcome).
- **Source:** Litmus mobile preview cutoff.
- **Score:** ≤40 → 5 · ≤50 → 4 · ≤65 → 3 · >65 → 2.

### 4.7 Preview text ≤ 90 chars · weight **1×**

- **Measures:** parse the hidden react-email `<Preview>` div, **strip the
  zero-width / NBSP / BOM padding** that react-email inserts, then count chars.
- **Source:** Gmail snippet length ~ 90 chars.
- **Score:** ≤80 → 5 · ≤90 → 4 · ≤110 → 3 · >110 → 2.

---

## Aggregate & ship gate

```
aggregate = Σ(score × weight) / Σ(weight)

≥ 4.0 → SHIP            (exit 0)
3.0 ≤ x < 4.0 → NEEDS_POLISH (exit 1)
< 3.0 → BLOCK           (exit 2)
```

The CLI exit code makes the runner CI-safe (`vercel-build`, GitHub Actions, or
a local pre-commit hook can fail builds at the BLOCK threshold).

## Worked example

A web target with: line length 5, body font 5, line-height 5, paragraph words
4, heading 5, voice 4 / contrast 5, palette 4, whitespace 5, tap targets 5,
overflow 5, layout 5 / voice 5,5,5,5,5 ⇒

```
Readability   = (5·2 + 5·2 + 5·2 + 4·1 + 5·2 + 4·1) / 10  = 4.80
Design        = (5·3 + 4·1 + 5·1 + 5·2 + 5·3 + 5·1) / 11  = 4.91
Voice         = (5·3 + 5·1 + 5·1 + 5·1 + 5·1) / 7         = 5.00
Aggregate     = (4.80·10 + 4.91·11 + 5.00·7) / 28         = 4.89  → SHIP
```

## Determinism guarantees

- Playwright launches Chromium head-less with deterministic viewports.
- Network: web targets use `waitUntil: 'networkidle'`; emails are
  `page.setContent(html)` (no network at all).
- All numeric thresholds are integers or fixed decimals (`0.6`, `4.5`, `44`).
- The active-voice regex is deterministic.
- Color quantisation is `Math.round(n / 32) * 32` — a closed function.
- No `Date.now()`, no randomness, no LLM calls.

Two consecutive runs on the same `<target>` will produce reports whose
numeric fields differ by at most floating-point rounding in the 5th decimal.

## Run book

```sh
# single URL
node scripts/rubric.mjs https://ai-signal-eta.vercel.app/i/001

# single email (renders + measures)
node scripts/rubric.mjs email:001
node scripts/rubric.mjs email:welcome

# everything (used for baseline + pre-ship gate)
node scripts/rubric.mjs all
```

Outputs:
- `/tmp/rubric-<slug>.json` — full report, per-criterion scores + raw measurements.
- stdout — axis-grouped summary with verdict and aggregate.
- exit code — `0 / 1 / 2` as above.

## Files

- `/Users/surajpandita/ai_signal/system/RUBRIC.md` — this document.
- `/Users/surajpandita/ai_signal/scripts/rubric.mjs` — the runner.
- `/Users/surajpandita/ai_signal/system/rubric-baseline-2026-06-12.md` — locked baseline.
