# Beyond Intelligence Ep 001: reference analysis and edit notes

## 1. File inventory (Drive folder `1tFcz7mC…`)

| File | Type | Length | Format | Role |
|---|---|---|---|---|
| Memory-Explained-SnapYT.App.mp4 | Netflix *Explained* episode | 20:09 | 640×360, 23.98 fps | Reference |
| Why-Red-Bull-SnapYT.App.mp4 | Business video essay (voice-over) | 18:55 | 640×360, 30 fps | Reference |
| Why-Switzerland-Has-SnapYT.App.mp4 | Presenter-led documentary | 29:22 | 640×360, 23.98 fps | Reference |
| Sahil-Bloom-SnapYT.App.mp4 | Talks at Google stage talk | 64:33 | 640×360, 29.97 fps | Reference |

**The rough footage is not in this folder.** I edited the AlphaGo recording from the earlier Drive folder
(`Rolltake recording · Nov 26, 2026 at 3.55.20 PM.mov`, 3:09, 1080×1920 portrait, HEVC, 30 fps).

All four references are long-form, 16:9 YouTube/Netflix videos, not Reels. Their principles carry over;
their caption systems do not (they have no burned-in captions).

## 2. How the analysis was done (limitations)

I cannot watch video in real time. For each reference I:
- measured every cut automatically with scene-change detection over the whole video,
- reviewed 30 frames from the first 60 s (one every 2 s) and 30 frames spread across the whole video,
- transcribed the first 45 s with Whisper to study the hook,
- measured the audio floor in the hook to check for a continuous music bed.

Shot lengths are estimates from automatic cut detection. Slow dissolves and on-stage camera switches can be under-counted.

## 3. Reference analysis matrix

| | Memory Explained (Netflix) | Why Red Bull (business essay) | Why Switzerland (presenter documentary) | Sahil Bloom (stage talk) |
|---|---|---|---|---|
| **Cuts (whole video)** | 305 cuts, avg shot 4.0 s, median 2.9 s | 340 cuts, avg 3.3 s, median 1.8 s | 590 cuts, avg 3.0 s, median 2.0 s | ~91 detected, long holds (median ~12 s) |
| **Cuts (first 60 s)** | 65, about 0.9 s each: fast archival montage | 43, about 1.4 s each | 33, about 1.8 s each | none |
| **Hook** | Cold open on archival news (Diana, 9/11) plus "we believe there is a perfect recording…" | Date-stamped event: "October 14th 2012… 120,000 feet", then the pivot "However…" | In-world claim: "There are bunkers everywhere in this country", B&W archival | Personal, relatable observation |
| **Framing** | Interviews on a clean white background, small lower-thirds | No presenter, 100% B-roll | Wide-lens close-up of the presenter, handheld, on location | Wide stage shot |
| **Punch-ins** | Rare | Constant slow push-ins on B-roll | Cuts between wide and close angles | None |
| **Text / graphics** | Stippled B&W illustrations, yellow highlight on documents, yellow bar charts | Huge kinetic numbers and words in red/white, glitch textures | Paper-texture maps, terrain fly-overs | Slides only |
| **B-roll** | Archival news, brain scans, the actual research documents | Stock and brand footage with heavy grading | Original location footage, archival B&W | None |
| **Colour** | Neutral, near-monochrome illustration with a single yellow accent | Red/blue, high contrast, vignette | Natural, warm, soft contrast | Stage lighting |
| **Music** | Continuous low bed (hook floor about −38 dB) | Loud continuous bed (floor about −27 dB) | Continuous bed (floor about −31 dB) | None (floor about −54 dB) |
| **Ending** | Reflective question back to the viewer | Thank-you and subscribe card | Presenter on location, reflective | Q&A |

### What I adopted (principles, not identities)
- **Netflix Explained:** one restrained accent colour, used as a highlighter. This is where the **yellow** for the spoken word comes from. Also: show the actual evidence (real match photos, real board positions, a source tag on the 1-in-10,000 number).
- **Red Bull essay:** one hand-set **big number** ("1 in 10,000"), and the date-stamped cold open ("SEOUL · MARCH 2016").
- **Switzerland documentary:** a **cold open** that drops viewers into the moment before any intro; two camera framings (wide/close) to hide jump cuts; natural colour.
- **Sahil Bloom talk:** let the reflective ending breathe with real pauses. No graphics over the final question.

### What I did not copy
Red Bull's red glitch package and logo animation; Netflix's stippled illustration style and "Explained" branding;
the Switzerland video's map design. The Beyond Intelligence identity (charcoal, off-white, amber node) stays original.

## 4. Edit blueprint and decisions

| Decision | Why |
|---|---|
| **Cold open:** "Imagine karo… mistake kar di… But turns out it was actually brilliant." is moved before the intro sting | This is the strongest truthful hook in the footage. Your words are unchanged; only the order moved. The first frame shows the AlphaGo side of the real 2016 table with "THE MOVE EXPERTS CALLED A MISTAKE", so the spoken hook, the on-screen text and the image say the same thing. |
| Intro sting (2.6 s) placed after the cold open, then "Welcome to Beyond Intelligence" | The brand still lands, but the viewer is hooked before it starts. |
| **Speech 1.10× (pitch-preserved)**, pauses capped at 0.16 s except planned beats | Brings the reel from 2:48 to about 2:25 without sounding rushed. Planned beats kept: before Move 37 (1.0 s), after "10,000" (0.6 s), after Lee Sedol wins (0.75 s), before the final question (1.0 s). |
| Repeated takes removed | "But turns out…", "Think about it…", "AI ne sirf ek game nahi jeeta", "Machines ka humari tarah…", "Usne un games se…", and "experts ko lagta tha ki". The last one was found with an acoustic repeat detector and checked by re-transcribing the joined audio. |
| Wide/close alternate framing at every jump cut | Hides the cut without fake zoom effects. |
| **Captions:** phrase chunks of up to 3 words, the **spoken word turns yellow**, a 110 ms pop-in per phrase, key terms (37th move, Move 78, reinforcement learning, khud ke against, 1 in 10,000, Beyond Intelligence) in yellow capitals | You asked for this. Size 70 px Inter ExtraBold with outline, placed above the Instagram UI. |
| **"Node" mascot:** the logo's amber dot with eyes peeks in 3 times ("?" at *mistake*, "…" at *socha kaise?*, "!" at *machine surprise ho gayi*) | Your "AI avatar" idea, kept on-brand and small. It personifies the machine at exactly the three moments the machine is the subject. It is not shown during the final question. |
| **Suspense layers** (heartbeat, low dissonant drone, rising tone, hard stop) at: cold open → "brilliant"; "really interesting" → "37th"; "crazy part" → "10,000"; "Ab naturally question…"; "But wait" → "Move 78" | Tension builds and then cuts to silence right before each payoff. The music bed dips under these zones. |
| Music 22 dB under the voice, mix −14 LUFS / −1.5 dBTP | Voice is always on top. |
| B-roll about 46% of runtime, every insert tied to the spoken line | Within your 35–45% target (slightly above because of the cold open). |

## 5. Asset and licence log

| Asset | Source | Rights note |
|---|---|---|
| AlphaGo match photos (×2), Go board photo, Move 78 board image | Supplied by you | Press/editorial photos. Confirm you are comfortable posting them; credit "Google DeepMind" if asked. |
| Move 37 diagram | Supplied by you; Quartz (qz.com) graphic | Credited on screen ("Board diagram: Quartz"). |
| Self-play / pattern / strength graphics | Original, drawn in code | Labelled "Illustration". |
| Music, heartbeat, drones, stone clicks, chimes, blips | Original, synthesised in code | No third-party rights. |
| Fonts | Inter (SIL Open Font License) | Free for commercial use. |

## 6. What could not be verified automatically
- I cannot listen. Please watch once on a phone with sound, especially the cut points, the suspense zones and the mascot blips.
- 17 of 47 audio pieces did not get an exact forced alignment. Their caption timing is estimated within the piece (following voiced frames), so a word may lead or lag by a fraction of a second.
- Captions follow the script spelling. Where you said something slightly different, the caption shows the script wording.
