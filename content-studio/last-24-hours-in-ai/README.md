# Last 24 hours in AI — daily Instagram carousel (@thinksafari)

A daily series by Suraj Pandita (AI Product Manager). Everything that moved in AI in the last 24 hours,
explained simply: **News · Money · Models, simply · India · My take (as an AI PM)**.
Built every night around midnight IST, posted by Suraj at 8:00 AM IST.

## Make an episode

```bash
cd content-studio/last-24-hours-in-ai
cp issues/2026-11-26.json issues/<YYYY-MM-DD>.json   # then edit it (schema below)
node make.js issues/<YYYY-MM-DD>.json                # → issues/<date>/dayNN-01.png … + contact-sheet.png
```

Needs Node with Playwright + Chromium. Fonts are in `fonts/` (Inter, Newsreader: SIL Open Font License).
`make.js` prints layout warnings (content too tall, text running into the source line). Fix every one, then
look at `contact-sheet.png` before sending.

## Slide order (fixed, so the series is recognisable)

1. **Cover** (auto): author chip "by Suraj Pandita", `DAY NN | DATE` badge, series name, the 5 "what you get"
   pills, and a dark swipe strip with today's hook (`cover.today`).
2. **N things that moved in AI** (auto from `summary`): one line per story with category and date.
   It must work on its own, because Instagram often re-shows a carousel starting from slide 2.
3. **Content slides** (`slides[]`): usually News ×2, Money ×1 (`stats`), Models, simply ×1–2, India ×1,
   then The big picture (`picture`), then My take (`take`).
4. **Close** (auto): "which one got you?", Comment DAILY, "DAY NN+1 TOMORROW", author line.

Aim for 9–11 slides in total.

## JSON schema

```jsonc
{
  "day": 3, "date": "Fri 27 Nov 2026", "handle": "@thinksafari",
  "author": {"name": "Suraj Pandita", "initials": "SP", "role": "AI Product Manager"},
  "cover": {"today": "One sentence, 3 hooks, ≤ 20 words."},
  "summary": [{"cat": "News", "date": "26 Nov", "text": "≤ 12 words."}],
  "summaryNote": "optional footer line on slide 2",
  "slides": [
    {"type": "news",  "k": "News|Money|Models, simply|India", "d": "26 Nov",
     "t": "lowercase title ≤ 4 words", "aka": "aka. one plain line",
     "il": {…illustration…}, "p": "story, ≤ 35 words", "india": "In India: … (or Why it matters: …)",
     "src": "named sources · caveats (reported / preprint / self-reported)"},
    {"type": "stats", "k": "Money", "d": "…", "t": "…", "aka": "…",
     "stats": [{"v": "$30B", "l": "≤ 18 words"}, {"v": "~$7.5B", "l": "…"}], "india": "…", "src": "…"},
    {"type": "picture", "t": "…", "aka": "…", "il": {"type": "ladder", …}, "p": "…", "src": "…"},
    {"type": "take", "k": "My take · as an AI PM", "t": "…", "sub": "…", "p": ["lowercase essay paragraphs"]}
  ]
}
```

Illustrations (`il.type`): `dots` (many attempts, a few that matter), `bars` (before/after numbers),
`flow` (A → B → C), `ladder` (levels or stages), `svg` (a hand-drawn SVG for this story: preferred when it says
more). Style: black 3px line art, orange `#E07B4F` circles. No robots, brains, neon or stock images.

## Editorial rules

- **Strictly the last 24 hours.** Check each story's real announce date. Put that date on its slide.
- Every number has a named source. Say "reported", "preprint" or "self-reported" when it applies.
  If outlets disagree on a number, leave it out.
- Each "In India" line names something real (a rule, company, number or price), or it's cut.
- **My take is drafted for Suraj and he approves it.** Tie it to his work as an AI PM, and keep it specific to
  today. It must not fit any of the last 4 episodes unchanged.
- No repeats from recent episodes (check `issues/`).

## Caption (issues/<date>/caption.md)

Hook line (the cover story) · "I’m Suraj, an AI product manager in India, and this is Day NN of my daily
series" · one emoji line per story (📰 💰 🧠 🇮🇳) · my take in one line · honest notes · "Which one got you?
Reply 1 to N 👇" · "Comment DAILY and I’ll DM you every new episode." · 6–9 hashtags incl.
#last24hoursinAI #thinksafari · pinned first comment with numbered sources.
