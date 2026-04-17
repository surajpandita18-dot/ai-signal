---

name: frontend-design
description: Design and implement premium, production-grade product UIs with strong visual hierarchy, depth, and interaction quality. Focus on modern SaaS, dashboards, and intelligence products.
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

This skill is used to build high-quality frontend interfaces that feel like real products, not templates or design experiments.

## Design Philosophy

Always design as a **product system**, not a visual experiment.

The UI must feel:

* structured
* scannable
* layered
* premium
* intentional

Avoid:

* random creative directions
* overly artistic or experimental layouts
* dribbble-style designs
* generic white templates

---

## Core Principles

### 1. Surface Hierarchy (MOST IMPORTANT)

* The page must have a clear base
* Sections must use different surfaces
* Cards must feel like objects on top of the base
* Avoid white-on-white systems

Use:

* tinted backgrounds
* layered surfaces
* subtle gradients
* depth via shadows

---

### 2. Productization (CRITICAL)

Every UI element must feel like part of a product system.

Use:

* metadata rows
* badges
* signal indicators
* structured content blocks

Avoid:

* plain paragraphs
* unstructured text

---

### 3. Color System

* Use 1 primary color (indigo)
* Use 1 supporting palette (slate / soft violet / muted tones)
* Use gradients subtly for surfaces, not decoration

Avoid:

* flat white everywhere
* random colors
* over-saturated palettes

---

### 4. Interaction Design

* cards should lift on hover (translate + shadow)
* use subtle colored shadows (indigo tint)
* titles respond on hover
* buttons feel tactile

Avoid:

* excessive animation
* gimmicky motion

---

### 5. Card System (MANDATORY)

Each card must follow structure:

1. Metadata row (badge + source + signal)
2. Content (title + summary)
3. Insight block (highlighted)
4. Action row

Cards must feel like **information objects**, not containers.

---

### 6. Typography

* prioritize readability
* strong hierarchy (title > summary > metadata)
* avoid decorative or experimental fonts

---

## Implementation Rules

* Prefer className changes over rewrites
* Do not break layout unless necessary
* Do not introduce unnecessary complexity
* Keep output minimal and precise

---

## Creative Constraint

You are NOT designing art.
You are designing a **premium AI product interface**.

Creativity should appear in:

* layering
* spacing
* depth
* subtle color usage

Not in:

* random styles
* extreme themes
* experimental layouts
