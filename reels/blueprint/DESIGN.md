# Blueprint reel: design system

Suraj approved this as the house style for explainer reels on @thinksafari (Nov 2026).
Inspired by a reel's *format* (grid paper + step timeline + UI cards). The character, copy and scenes are our own.
Never reuse another creator's avatar, script or handle, and never show invented numbers (fake "live" counters, follower counts).

## The look

| Token | Value | Use |
|---|---|---|
| bg | `#F8F8F9` + 1.5px grid lines `#ECECEF`, 54px cells | every frame |
| ink | `#111114` | bold words, titles |
| grey | `#8B8B92` | normal caption words, meta |
| blue | `#2F62E9` / soft `#E9EFFD` | rail, pills, highlights, "yours" |
| red | `#E5484D` / soft `#FDECEC` | "before", wrong, struck-out |
| green | `#1F9D57` / soft `#E6F6EC` | saved, "after", done |
| claude | `#D97757` | Claude mark |
| beige | `#EFE3CC` | "board" cards (what Claude knows, taste) |

Fonts: **Inter** (UI + captions), **Instrument Serif italic** (emphasis words), **JetBrains Mono** (kickers, files, code).
Cards: white, radius 26, 2px `#E5E5EA` border, soft drop shadow.
CTA scene: bottom fades to blue (`#DCE6FD` → `#C3D4FB`) with twinkling sparkles.

## The four layers (top to bottom)

1. **Kinetic captions** (y≈250): the spoken words appear one by one (blur → sharp). Chunks of 2-6 words; break at `|`.
   - normal word: grey Inter 500
   - `*word*`: bold black Inter 700
   - `_word_`: Instrument Serif italic in a light-blue box with a thin blue border (box wipes in left→right)
2. **Progress rail** (x=62): a vertical blue/grey line with the **doodle character** on it and a blue step pill (`03 Prompt 01`).
   On each new step the doodle walks down with a dashed trail, then the world scrolls back up and a ring pulses.
   No rail on the hook, promise, summary and CTA.
3. **Stage** (y≈640-1450): one UI scene per line of script (cards, folders, editors, hub-and-spoke, before/after).
   Each scene enters with a spring and exits with blur + lift. Every reveal is cued to a spoken word.
4. **Doodle character**: original hand-drawn face (side-swept hair, stubble, no glasses), black-and-white,
   SVG with a turbulence "boil" every 4 frames, blinks, mouth flaps while a word is being spoken.

## Story shape that works (from outlier research, Nov 2026)

- Line 1 = **pain + tool**, spoken from frame 0 ("Sabko pata chal jaata hai ki tumhari post AI ne likhi hai").
  Frame 0 must show the same thing (here: a generic post that gets an AI-WRITTEN stamp).
- Line 2 = the promise ("Claude ko sikhate hain…") with a big title card. No "₹X course for free" angles: Suraj rejected them.
- Then numbered steps, one visual idea per line, a **before/after payoff**, a **summary checklist**, and a CTA (save + follow).
- The creator's own voice beats AI voices for this account. Hinglish narration, English UI.

## Scene library (src/scenes.tsx)

`hook` generic post + stamp + comments · `promise` tear + big title + chips · `why` row of "same" cards + beige board ·
`folder` folder + tree + files flying in · `code` Claude Code card (Cloud/Local) + prompt dropped into a "Running" circle ·
`voice` hub-and-spoke rules with n/4 counter · `keyline` code editor, highlighted line + red/green diff ·
`topic` prompt card typing + serif topic + Sent · `result` before (struck) / after (glow) · `feedback` phone card + voice-note bubble + saved chip ·
`summary` vertical checklist with the doodle walking down · `cta` caption card + Save bookmark + profile Follow → Following.

Reference-reel ideas not built yet: 3D isometric stacked layers, corkboard with pinned polaroids + red strings, "same vs yours" magnifier line-up, DM keycaps CTA.

## How to make a new reel

1. Write `data/script.json`: one entry per line `{scene, text}`, with `|` chunk breaks and `*bold*` / `_serif_` markup.
2. Add or reuse scene components in `src/scenes.tsx`; cue reveals with `c('word')` (the frame that word is spoken).
3. Timing: `python3 data/estimate.py` writes placeholder timings to `data/timing.json`.
   With a real voice recording, replace it with forced-aligned word times (same JSON shape: `words[{w,s,e,line,chunk,style}]`, `lines[{scene,s,e}]`, `duration`).
4. `npm i`, then `node stills.mjs <frames…>` to check, `node render.mjs` to render, `python3 audio.py` for music + SFX bed,
   then mix voice + bed with ffmpeg (`loudnorm=I=-14:TP=-1.5`).
5. Check every scene still for overlaps, phone-size legibility and that captions match the spoken words exactly.
