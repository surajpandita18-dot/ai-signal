# Speech Editing, Hesitation Handling and Field Lessons

These rules come from real edits (first: Beyond Intelligence Ep 001, AlphaGo, Nov 2026). They apply to every future Reel.

## 1. Find hesitations before you trust a transcript
A clean transcript can hide a stumble. Speech recognisers skip pauses, "mm"s and half-words.
1. Compute short-time energy (10 ms frames) for the whole recording.
2. Inside every kept line, list silent runs (≤ −39 dBFS, ≥ 0.30 s) that are *not* at the end of the line.
3. Classify each run:
   - **Hesitation inside a name or phrase** ("Google … DeepMind"): join it, keeping about 0.05–0.10 s.
   - **Clause or sentence pause inside a line**: shorten to about 0.20 s. Never shorter: speech starts to sound machine-cut.
   - **Deliberate beat** (before a reveal or the final question): keep it as recorded.
4. Do not classify runs using word timings that were estimated rather than force-aligned. If alignment is uncertain, use the neutral rule (0.20 s) instead of guessing.

## 2. Verify every speech cut by ear-proxy
For any cut inside a sentence:
- Put the cut point where the level is at or below −40 dBFS, never mid-decay. A cut at −27 dBFS produced an audible clip in testing; −45 dBFS was clean.
- Use 20 ms fades at every cut (12 ms is too short on room-tone joins).
- Splice the candidate audio and re-transcribe it. Compare against the uncut original with the *same* model. If the uncut audio also garbles a phrase (for example "1 in 10,000"), that is model noise, not an edit problem.
- Check the whole sentence before and after the cut, not only the two words.

## 3. Repeats and false starts
- Look for repeats three ways: (a) transcript n-grams, (b) acoustic self-similarity (MFCC + DTW; known repeats scored about 3.5–4.3, non-repeats about 5.1 or more), (c) lines that are spoken unusually slowly for their length.
- When two takes exist, prefer the later take unless it is worse. Confirm with a re-transcribed splice.
- Matching phrases that the script legitimately repeats ("play kiya … play kiya") are not repeats.

## 4. Words must never disappear
When a line is split at removed pauses, assign every word to the sub-segment it overlaps most and clamp its times inside it. Otherwise words whose timing was estimated can fall into a removed gap and silently vanish from the captions.

## 5. Opening and branding
- The strongest truthful moment goes first (a cold open). The brand sting comes after the hook, at 2–3 s long.
- The spoken hook, the frame-0 text and the frame-0 visual must say the same thing.
- The first frame must already be the hook visual: no fade-in from another shot.
- A caption must never run across the brand sting. Clamp captions at the cold-open boundary.
- End card at 2.5–3 s. Do not add branding after the final reflective line other than the end card.

## 6. Talking head vs visuals
- Target roughly 40–55% B-roll on explainer topics. Any face stretch over about 6 s needs a reason (emotion, a direct question, the final thought).
- Insert visuals where the line names something concrete (a result, a person, a move). Use callbacks: return to an earlier key visual when the narration refers back to it.
- Use detail crops of authentic photos (a face, a clock, a board) for variety before reaching for new assets.
- Do not mask or alter third-party diagrams to make them fit a crop. If a crop exposes cut text, use the full diagram instead.

## 7. Camera
- Two base framings (wide and medium) that switch only on real take changes (gap > 0.6 s). Do not switch on every small pause cut, or the zoom changes become repetitive.
- One tighter emphasis framing reserved for a few pivotal lines ("But wait", "Think about it").
- Slow push-ins only on the hook and the final thought.

## 8. Colour
- Correct first: gentle contrast (about 1.04), slight gamma lift, saturation about 0.94 for phone footage under warm bulbs.
- Use a light vignette only (about π/6.5). A heavy vignette (π/4.6) made the face look dark.
- Check the darkest areas are not crushed before rendering.

## 9. Sound
- Voice about 22 dB above the music bed while speaking. Integrated −14 LUFS, true peak about −1.5 dBTP.
- Suspense layers (heartbeat, low drone, rising tone) end with a hard stop just before the payoff. Use them at most 4–5 times per 2-minute Reel.
- Keep impacts subtle. One low impact per Reel, at the central reveal.

## 10. Delivery
- Export 1080 × 1920, H.264 high profile, CRF 16–18, AAC 256 kbps, +faststart.
- Chat apps and messaging previews often show a downscaled copy (for example 512 × 910). Tell the creator to download the original file, not the preview, before judging quality.
- Run a full-file QC, not frame samples only: black frames, frozen frames, silences, clipping, A/V duration match, a contact sheet every second, and a full re-transcription compared with the script.
