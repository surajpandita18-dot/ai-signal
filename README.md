# AI Signal

I built AI Signal because following AI news started feeling like a full-time job.

There’s too much content, most of it repetitive, and almost nothing helps you figure out what actually matters. You end up scrolling through headlines instead of understanding what’s changing.

So instead of building another feed, I tried to build something that works more like a **daily intelligence layer**.

---

## What this is

AI Signal pulls in AI news from different sources and restructures it into something easier to scan and reason about.

Instead of just listing articles, it focuses on:

* surfacing the **top signals**
* giving a short daily brief
* presenting articles in a clean, structured format
* letting you save things that are actually worth revisiting

The goal is simple:

> reduce noise, improve understanding

---

## How it works (high level)

The pipeline is intentionally lightweight:

* RSS feeds are used for ingestion
* articles are normalized and stored as JSON
* a small layer on top organizes them into:

  * top signals
  * daily brief
  * searchable list

On the frontend:

* Next.js (App Router) handles rendering
* Tailwind is used for layout and styling
* state is kept minimal (filters, bookmarks, read state)

There’s also a GitHub Actions workflow running in the background to refresh data periodically, so the feed stays updated without needing a backend.

---

## Product decisions that mattered

Most of the effort wasn’t in fetching data — it was in deciding how to present it.

A few things I focused on:

### 1. Signal over volume

Not everything deserves equal attention.
Highlighting a few important things is more useful than showing everything.

### 2. Fast scanning

The layout is designed so you can understand what’s happening in ~1–2 minutes.

### 3. Structured reading

Article pages are simplified:

* summary
* “why it matters”
* clean reading flow

No distractions.

### 4. Personal knowledge layer

Saved articles aren’t just bookmarks — they’re meant to act like a small, growing knowledge base.

---

## Design approach

I didn’t want this to look like a typical SaaS dashboard.

The direction I went with:

* warm light theme (slightly off-white, not flat white)
* clear separation between sections (hero, brief, signals, cards)
* stronger hierarchy so important content stands out
* minimal color usage, but intentional accents (indigo + amber)

A lot of the iteration here was about fixing things that felt:

* too noisy
* too flat
* or too “template-like”

---

## The interesting part (for me)

One thing I didn’t expect was how much of this became a **system design problem**, not just a UI problem.

Instead of manually iterating on UI every time, I set up a structured workflow around Claude:

* a `CLAUDE.md` file to define product constraints and design direction
* small “skills” for UI, product critique, and refactoring
* command-style prompts to reuse context without re-explaining everything

The idea was to:

* avoid design drift
* keep iterations consistent
* reduce token usage
* and move faster without rewriting entire screens

This ended up being as important as the product itself.

---

## Tech stack

* Next.js (App Router)
* Tailwind CSS
* GitHub Actions (scheduled data refresh)
* RSS feeds for ingestion
* Claude (for structured iteration and system-driven design)

---

## What I’d improve next

There’s still a lot to do:

* better signal ranking (what’s actually important vs just recent)
* smarter summaries (LLM layer)
* topic clustering / trends
* optional daily email digest
* basic personalization

---

## Demo

https://ai-signal-eta.vercel.app/

---

If you’re working on AI products or thinking about information-heavy systems, I’d be happy to exchange notes.
