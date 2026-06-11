# Design Review — Phase 4 FOMO Homepage — 2026-04-27

## Verdict
CHANGES_NEEDED

---

## Critical (visual integrity failures)

- **ExpiryBadge.tsx** — Checklist: `ExpiryBadge — Margin-bottom is 32px before the story card (8px rhythm)` — marginBottom is `40px`, not `32px`. 40px is not a multiple of 8px per the base-unit rule (40 = 5×8, so 40px IS a valid rhythm multiple — however the checklist specifies exactly 32px for this element). Fix: change `marginBottom: '40px'` to `marginBottom: '32px'`.

- **ExpiryBadge.tsx** — Checklist: `ExpiryBadge — No animation, no pulsing, no color-change as deadline approaches — stays static in appearance` and design-system rule `No animation beyond expand/collapse and focus transitions` — The countdown updates every 1,000ms with seconds visible. While there is no CSS animation, having HH:MM:SS ticking seconds creates a pulsing visual rhythm that violates the "no animation" spirit of the design system. The PRD specifies the countdown format as `14H 32M` (hours and minutes only). The label copy reads `expires in {h}h {m}m` (correct) but the hero display shows `{h}:{m}:{s}` with seconds. The seconds digit creates constant visual motion. Fix: remove the seconds component from the hero display; show `{pad(h)}:{pad(m)}` only. The `setInterval` can remain at 1000ms for accuracy but only re-renders on minute changes.

- **ExpiryBadge.tsx** — Checklist: `ExpiryBadge — Text color is text-secondary token — NOT the accent color` and PRD/design-system colour rule — The large 48px countdown number uses `color: 'var(--text-primary)'`. The checklist specifies text-secondary for the badge, and the label already correctly uses text-secondary. The large hero number dominating the page in full text-primary (#1A1A1A / #F0EDE6) competes with the story headline which is the primary content. The countdown should feel like a FOMO signal, not a headline. Fix: change the 48px countdown color to `var(--text-secondary)` to keep it in the FOMO-metadata register and let the headline retain typographic dominance.

- **SignalExpired.tsx** — Checklist: `SignalExpired — CTA copy: "Tomorrow's signal drops at 9 AM IST. Subscribe to be first." — font-sans, text-secondary, 15px` — The tomorrow tease line in SignalExpired is rendered in `font-mono`, `11px`, uppercase — not `font-sans`, `15px` as the checklist requires. This is a rubric failure. Fix: change the tomorrow tease `<p>` in SignalExpired.tsx to `className="font-sans"`, `fontSize: '15px'`, standard case, `letterSpacing` removed.

- **page.tsx / State B (SignalExpired)** — Checklist: `SignalExpired — Subscribe input below CTA: single line, consistent with SubscribeInput checklist` — In State B on page.tsx, the SubscribeInput label prop is `"Tomorrow's signal drops at 9 AM IST. Subscribe to be first."` — this duplicates the tomorrow tease line that is already rendered inside SignalExpired. The page renders SignalExpired (which shows the tomorrow tease) then immediately renders SubscribeInput with the same tomorrow tease as the label, creating a repeated message. Fix: pass a shorter label to SubscribeInput in State B, e.g. `label="Subscribe to get it first."`, and let SignalExpired own the tomorrow tease copy.

- **SiteShell.tsx** — Checklist: `SiteWordmark — 'AI SIGNAL' rendered in font-mono or font-sans (NOT serif), uppercase, tracking widened — small, restrained` — The wordmark reads `AI Signal` (mixed case) not `AI SIGNAL`. The checklist explicitly requires uppercase. The `textTransform: 'uppercase'` CSS is present, which means the text will render uppercase visually but the source node has mixed case. While CSS uppercasing works visually, the checklist states the rendered value must be uppercase. This is a minor code-hygiene issue but worth noting. More critically: the font-weight on the wordmark is `600` — the checklist says the wordmark should feel "small, restrained" and "authoritative, not like a header component." At 13px/600 weight, this is acceptable, but read the SiteWordmark checklist which says `tracking widened — small, restrained`. The letterSpacing is `0.14em` which is wider than the standard `0.06em` for metadata — this is a strong choice, keep it. No critical failure here once CSS uppercase is confirmed rendering.

---

## Important (polish)

- **ExpiryBadge.tsx** — The label text reads `Today's signal — expires in {h}h {m}m` using a long dash (`—`) and mixed case ("Today's"). The checklist specifies the format: `TODAY'S SIGNAL — EXPIRES IN 14H 32M` — all uppercase. The label already has `textTransform: 'uppercase'` applied, but the copy does not match the spec format exactly. The spec uses `—` correctly but also uses all-caps word casing in the spec example. With CSS `uppercase` applied, the rendered output will be `TODAY'S SIGNAL — EXPIRES IN {H}H {M}M` which matches. This passes on render. However the `{h}h {m}m` interpolation will not uppercase the `h` and `m` unit suffixes — CSS `text-transform: uppercase` only affects alphabetic characters, so `h` becomes `H` and `m` becomes `M`. This is fine. No change needed if CSS is confirmed, but recommend verifying the rendered output in browser.

- **SubscribeInput.tsx** — The focus ring is implemented via inline `onFocus`/`onBlur` JavaScript style manipulation (`boxShadow`). The design system specifies `2px solid accent with 2px offset` — a focus *ring* (`outline`, not `box-shadow`). The component uses `outline: 'none'` and substitutes `box-shadow: 0 0 0 2px var(--accent)`. Box-shadow does not respect `offset` — a 2px offset requires `outline-offset`. This means the focus indicator does not meet the spec for offset. Fix: use `outline: '2px solid var(--accent)'` and `outlineOffset: '2px'` on focus, remove the `outline: 'none'` override.

- **SubscribeInput.tsx** — The component accepts a `label` prop and renders it as a visible `<p>` element above the input. The checklist says `No placeholder text beyond "your@email.com"` — the label prop is being used as pre-input marketing copy across all three homepage states with varying text (`"Be first when we launch."`, `"Tomorrow's signal drops at 9 AM IST. Subscribe to be first."`, `"Get tomorrow's signal in your inbox."`). This label-as-CTA pattern adds a marketing framing that violates editorial restraint. The subscribe input should feel calm, not pushy. Fix: make the label prop optional, or keep it but enforce that it is a factual statement, not a CTA. The copy in State C (`"Be first when we launch."`) and State A (`"Get tomorrow's signal in your inbox."`) reads like SaaS onboarding. Recommended copy: `"Subscribe."` or `"Daily signal to your inbox."`.

- **SignalExpired.tsx** — The component renders a decorative `<hr>` divider between the headline and the tomorrow tease. The design system states: `No decorative rules, no gradient under the wordmark, no shadows` (under SiteWordmark) and the component-level checklist says `No card surface, no box-shadow, no gradient — all inline on page background`. While the checklist does not explicitly ban `<hr>` dividers in SignalExpired, the design system references say "no decorative rules." The `<hr>` here acts as a section separator and is decorative. Fix: remove the `<hr>` and replace with margin spacing only (the gap between the headline and tomorrow tease should be sufficient via `marginBottom: '32px'` on the headline).

- **page.tsx — State A** — The visual hierarchy in State A is: wordmark → ExpiryBadge (48px countdown) → StoryCard → SubscribeInput. The PRD hierarchy requirement is: wordmark → countdown → story card → subscribe. This passes hierarchy order. However the `marginTop: '48px'` on the SubscribeInput wrapper (line 88) is 48px — a valid 8px multiple. The gap between StoryCard and SubscribeInput feels generous but not excessive. No failure, noting for completeness.

- **SiteShell.tsx** — The footer uses `marginTop: '80px'`. This is a valid 8px multiple (10×8). The design system specifies `Section gap: 40px (5 × 8px)` as the section gap. 80px is double the section gap, which is intentional for footer separation. No failure.

---

## Nice to have (defer)

- **ExpiryBadge.tsx** — The 48px hero number uses `fontWeight: 300` (light). This is a strong, considered choice — the thin weight at large size creates gravity without aggression, matching the Stratechery/Pragmatic Engineer register. Worth keeping. However, the design system does not explicitly sanction `fontWeight: 300` for any element (headings are 600-700, body is 400, labels are 500). Consider whether `fontWeight: 400` (body weight) at 48px would be more in-spec while still creating hierarchy.

- **SiteShell.tsx** — The footer renders `LinkedIn ↗` with a Unicode arrow. The Unicode arrow `↗` is decorative but minimal enough to be acceptable. No urgent fix needed.

- **SignalGate.tsx** — The headline in SignalGate uses `lineHeight: 1.35` rather than the `headline` spec of `line-height: 1.3`. The 0.05 difference is visually imperceptible but is technically out of spec. Fix if precision is a priority.

- **page.tsx — State C** — The "Signal loading…" fallback (line 95–103) uses an ellipsis `…` character in a mono uppercase context. This is never seen by real users under normal conditions (it only shows if a story query returns empty for an active issue). Not a user-visible concern.

---

## Strong choices worth keeping

- **ExpiryBadge.tsx — 48px mono countdown as hero:** The decision to make the countdown the dominant visual element (48px, not a small badge) is correct and matches the PRD intent. The countdown as hero creates genuine FOMO by asserting the scarcity hierarchy immediately after the wordmark. This is the right instinct — the issue is only the seconds digit and the color token.

- **SiteShell.tsx — 0.14em letter-spacing on wordmark:** The widened tracking at `0.14em` on `AI Signal` gives the wordmark the restrained authority of a publication masthead. This is noticeably better than the standard `0.06em` and is distinct from SaaS header patterns.

- **SignalExpired.tsx — opacity 0.6 + italic on expired headline:** The expired headline treatment (Source Serif 4, italic, 22px, opacity 0.6) correctly communicates decay without removing the text. It reads like a newspaper that's been rained on — the story is there, but it's gone. Excellent editorial choice.

- **SubscribeInput.tsx — transparent button with border token:** Using `backgroundColor: 'transparent'` and `border: '1px solid var(--border)'` (not accent) on the submit button is exactly right. The button does not compete for attention. It's a mechanism, not a CTA.

- **SignalGate.tsx — "simply absent" content:** The gate correctly does not blur, fade, or overlay the body content — it simply does not render it. This is the correct approach per the checklist: `Story card body is not rendered for non-subscribers — not blurred, not faded — simply absent`. Clean boundary, not punitive.

- **page.tsx — three-state architecture:** The State A / B / C split for homepage is well-structured. The states map cleanly to real user scenarios and each one degrades gracefully without requiring client-side loading skeletons or suspense boundaries for the gated content.

---

## Token verification summary

All components use `var(--*)` CSS tokens correctly. No hard-coded hex values found in any Phase 4 component. Dark mode should work correctly from token definitions in globals.css. The `--text-muted` token exists in globals.css but is not in the design-system.md spec — FORGE is not using it in Phase 4 components, so no violation.
