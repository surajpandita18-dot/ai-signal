---
name: P1 Selector Mapping
description: Maps v11.html selectors to current globals.css selectors for P1 mobile fixes
type: project
---

# P1 Selector Mapping — v11 → current codebase

## Item A — Nav padding @ 880px

| | Selector | Rule |
|---|---|---|
| v11 | `nav` | `padding: 14px 20px` |
| current CSS | `header.site-nav-inner` | same rule |
| current component | `<header className="site-nav-inner">` | SiteNav.tsx:26 |

**Status: ALREADY APPLIED** at globals.css line 1675.
No change needed.

---

## Item B — Footer @ 880px

| | Selector | Rule |
|---|---|---|
| v11 | `footer` | `flex-direction: column; text-align: center; padding: 32px 20px 48px` |
| current CSS | `.site-footer` | same rules |
| current component | `<footer className="site-footer">` | SiteFooter.tsx:5 |

**Status: ALREADY APPLIED** at globals.css line 2040.
No change needed.

---

## Item C — builder-quote font-size @ 880px

| | |
|---|---|
| v11 rule | `.builder-quote { font-size: 22px }` at 880px |
| current CSS selector | `.builder-quote` at globals.css line 1306 (font-size: 26px) |
| current component | BuilderCard.tsx — `<p className="builder-quote">` |

**Status: MISSING — needs adding.**
Target block: @media (max-width: 880px) at globals.css line 3054.

---

## Item D — prefers-reduced-motion (3 missing properties)

| Property | v11 | current |
|---|---|---|
| `animation-duration` | `0.01ms !important` | ✅ present |
| `animation-iteration-count` | `1 !important` | ✅ present |
| `transition-duration` | `0.01ms !important` | ✅ present |
| `animation-delay` | `0ms !important` | ❌ missing |
| `transition-delay` | `0ms !important` | ❌ missing |
| `scroll-behavior` | `auto !important` | ❌ missing |

**Status: PARTIAL — 3 properties missing.**
Will add as a new `*, *::before, *::after` block inside the existing @media (prefers-reduced-motion: reduce) block at line 167.

---

## Summary

| Item | Action |
|---|---|
| A — nav padding | Skip — already applied |
| B — footer layout | Skip — already applied |
| C — builder-quote font | ADD to 880px block |
| D — reduced-motion | ADD 3 properties to existing block |
