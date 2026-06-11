# Review — Phase 2: StoryCard component — 2026-04-27

## Verdict
PASS

---

## Critical (must fix before merge)
None.

---

## Important (should fix)

- `src/components/StoryCard.tsx:68` — `onKeyDown` on a `<button>` is redundant. Browsers fire `onClick` for Enter/Space on buttons natively. The handler is harmless but adds noise. Remove in next pass.

- `src/components/StoryCard.tsx:108` — `story[field]` where `field` is `keyof Pick<Story, 'lens_pm' | 'lens_founder' | 'lens_builder'>` — TypeScript accepts this but the fallback `?? ''` hides a null. The brief specifies all lens fields are populated in seed data, but the type allows null. The null-to-empty-string coercion is correct behaviour; the lint concern is that a rendered empty lens column would look broken. Consider a guard: if `!story[field]` skip rendering that column entirely. Low priority for Phase 2 since seed data always has values.

---

## Nice to have (defer)

- `src/components/StoryCard.tsx` — focus-visible ring uses `onFocus`/`onBlur` event handlers. Prefer CSS `button:focus-visible` in globals.css — more accessible, works for keyboard only (not mouse click focus). Fine for MVP.
- `src/lib/fonts.ts` — file exists but is unused (layout.tsx imports fonts directly). Delete in Phase 3 cleanup.
- `next.config.ts` file was renamed to `next.config.mjs` but the old `.ts` file may still appear in git as a rename. Verify with `git status`.

---

## Strong choices worth keeping

- CSS grid row animation (`grid-template-rows: 0fr → 1fr`) is the correct zero-layout-shift approach. Avoids the `max-height` hack entirely.
- `LENSES` array extracted as a const outside the component. Clean render loop, easy to extend.
- `sources` cast typed as `StorySource[]` at the top of the component, not inline. Correct place for the cast.
- All colours via CSS custom properties — zero Tailwind `dark:` variants in the component file. Dark mode will just work when `--card-bg` etc. flip.
- `aria-expanded={expanded}` on the button — correct accessibility attribute.
