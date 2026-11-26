# AlphaGo Reel: edit review (v2) and v3 corrections

Files compared:
- **v2 final:** `BeyondIntelligence_Ep001_AlphaGo_v2.mp4` (2:25, 1080×1920, H.264 ~5 Mbps, AAC 256 kbps)
- **Raw footage:** `Rolltake recording · Nov 26, 2026 at 3.55.20 PM.mov` (3:09, 1920×1080 HEVC with portrait rotation, 30 fps, phone mic)

All v2 timestamps below are v2 timeline seconds.

## 1. Where the problems come from

| Issue | Origin | Notes |
|---|---|---|
| Hesitation "Google … DeepMind" before "1 in 10,000" | **Raw recording** | A 0.55 s non-speech gap (breath / low "mm", spectral centroid ~200 Hz) between "Google" (93.23–93.56 s raw) and "DeepMind" (from 94.15 s raw). v2 kept it. |
| Other inner-sentence pauses of 0.3–0.6 s (about 22) | **Raw recording**, kept by the **v2 edit** | v2 only trimmed pauses *between* lines, not inside them. |
| Repeated takes ("But turns out…", "Think about it…", "AI ne sirf…", "Machines ka…", "Usne un games se…", "experts ko lagta tha ki") | Raw recording | Removed in v2 and kept removed in v3. |
| Dim, warm, low-angle room light; ceiling fan in frame | Raw recording | Fan cropped out in both versions; v3 lifts exposure gently. |
| Heavy dark vignette, slightly dark face | **Edit (v2 grade)** | Vignette π/4.6, contrast 1.06. |
| Zoom switching on 40 of 46 cuts | **Edit (v2)** | Two framings alternated on every source jump, so it felt repetitive. |
| Long talking-head stretches | **Edit (v2)** | 13.0–24.2 (11 s), 76.8–87.7 (11 s), 99.7–109.2 (9.5 s), 119.9–141.5 (21.6 s). |
| Strong Move 37 boom and tension layers | Edit (v2) | Boom gain 0.55, tension gain 0.55. |
| End card 3.6 s | Edit (v2) | Longer than needed after the closing line. |
| Captions: 17 of 47 lines with estimated word timing | **Tooling** | Pocketsphinx could not force-align those Hinglish lines; timing estimated from voiced frames. |
| "512 × 910" resolution | **Delivery preview**, not the file | The v2 file is 1080×1920. The chat/phone preview shows a downscaled copy. Download the original file to judge quality. |

## 2. Timestamped v2 review

| v2 time | Observation | v3 action |
|---|---|---|
| 0:00–0:04 | Strong cold open on the real AlphaGo table photo with "THE MOVE EXPERTS CALLED A MISTAKE". Works. | Kept. Frame 0 is already the hook visual (no fade). |
| 0:04–0:10 | Face, hook continues, mascot "?" at "mistake". Good. | Kept. Small pause inside "Ek … machine" tightened. |
| 0:10–0:13 | Brand sting 2.6 s. Right length. | Kept. |
| 0:13–0:24 | 11 s of face (welcome + "Let's go back to 2016"). | The 2016 plate now starts on "Let's go back to 2016". |
| 0:24–0:46 | Real match photos for 2016, Lee Sedol, Go. Relevant. | Kept; inner pauses tightened ("Ab … Lee Sedol", "Chess …"). |
| 0:52–0:58 | Game 1, Game 2 cards with stone clicks. Good. | Kept. |
| 0:58–1:04 | Move 37 suspense card, then the board. The central moment works. | Kept; boom reduced. |
| **1:09.6–1:10.7** | **"Google … DeepMind ke according": a hesitation inside the name, just before "1 in 10,000".** Sounds like a stumble. | **Joined at a verified silent point. See §3.** |
| 1:16–1:27 | 11 s of face ("Lekin AlphaGo ne woh move…", "Ab naturally question…"). | New "GAME 2 · RESULT, ALPHAGO WINS" card on "Aur eventually us move ne game jeetne mein…". |
| 1:28–1:40 | Learning explainer (human games → self-play → improve). Clear. | Kept; inner pauses tightened. |
| 1:40–1:49 | "Think about it… Humne machine ko game sikhaya…" on face. | Emphasis framing on "Think about it"; Move 37 board returns as a callback on "aise moves discover… consider hi nahi kiye". |
| 1:49–2:00 | 4–1 result, Move 78, "Lee Sedol wins". Good. | Kept. |
| 2:00–2:22 | 21.6 s of face for the reflection. | Close-up of Lee Sedol (real match photo) on "Usne humans ko … rethink karne par majboor kar diya". The final question stays on the face, with no graphics. |
| 2:21–2:25 | End card 3.6 s. | Shortened to 2.8 s. |
| Whole reel | Heavy vignette; framing switches 40 times. | Lighter grade; framing switches only on 18 real take changes; tighter emphasis framing on 4 pivotal lines. |

## 3. The stutter before "1 in 10,000"

**Raw footage (sentence: "Google DeepMind ke according, human players ke historical patterns ke basis par is move ke play hone ki probability around 1 in 10,000 thi."):**
- "Google" ends at 93.56 s. The level falls below −40 dBFS from 93.62 s to 94.10 s. "DeepMind" starts at about 94.15 s.
- The gap holds no word. Whisper returns `[BLANK]` for it; its energy is a low breath or hum.
- **Diagnosis:** a natural hesitation inside a proper name, not a repeated word, not an editing cut. The rest of the sentence was checked word by word and has no other hesitation longer than 0.30 s.

**Cut tests (same Whisper model, cut out vs. uncut):**

| Cut (raw s) | Level at cut | Result |
|---|---|---|
| none (original) | – | "Google, deep mind, according to human plates…" (pause audible) |
| 93.65 → 94.05 | −27 dBFS | Cuts into the decay of "Google" (risk of a clipped word) |
| 93.62 → 94.12 | −19 dBFS | Fluent, but the cut lands on sound (click risk) |
| **93.72 → 94.06** | **−45 dBFS** | **"…had the probability of this move playing around 1 in 10,000." Clean, chosen.** |

The chosen cut keeps about 0.2 s of natural breath between "Google" and "DeepMind" (at 1.10× speed), with 20 ms fades on both sides. No words were removed or added. On screen this sentence sits under the "1 in 10,000" card, so there is no visible jump.

## 4. Story and visual changes in v3
- Hook order kept: cold open, then the sting, then the welcome.
- 23 inner pauses tightened (hesitation in the name joined; others set to about 0.20 s). Deliberate beats are untouched: before Move 37 (1.0 s), after "10,000" (0.6 s), after Lee Sedol wins (0.75 s), before the final question (as recorded).
- B-roll share rose from 45% to about 55% with three motivated inserts (Game 2 result, Move 37 callback, Lee Sedol close-up). All visuals come from your supplied authentic material or are original graphics labelled "Illustration".
- An attempt to crop into the Move 37 diagram was rejected: it exposed half-cut Quartz annotation text, and masking it would alter a third-party diagram. The full diagram is reused instead.
- External archival search (Wikimedia Commons) was attempted but rate-limited (HTTP 429), so no external assets were added.

## 5. Colour, camera, audio
- Grade: contrast 1.04, gamma 1.08, saturation 0.94, light vignette π/6.5, slight lift (no crushed blacks).
- Camera: wide/medium switch only on 18 take changes (down from 40); emphasis punch-in on "But turns out", "here's the crazy part", "Think about it", "But wait"; push-ins only on the hook and the final thought.
- Audio: same clean voice chain; 20 ms fades at every cut; Move 37 boom gain 0.55→0.30; tension layers 0.55→0.45; music ducked about 22 dB under the voice; mix −14 LUFS.

## 6. Export
1080×1920, 30 fps, H.264 High (CRF 17, max 16 Mbps), AAC 256 kbps, +faststart. Source detail is from a 1080-wide phone recording cropped about 1.25× for framing; no upscaling claims are made.

See `qc_report.json` for the automated checks on the final file.
