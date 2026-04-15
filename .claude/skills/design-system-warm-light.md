# Design System — AI Signal Warm Light

## Surfaces

```
Page base:        linear-gradient(160deg, #EDE7DC 0%, #F5F1EC 45%, #FAFAF9 100%) fixed on body
Surface/warm:     #F7F4F0   — nav buttons, Top Signals container, insets, read-state cards
Surface/deep:     #F2EDE5   — Daily Brief
Surface/featured: gradient from-[#EDE8E0] via-[#F5F1EC] to-white — hero + article header
Surface/card:     #FFFFFF   — primary cards
```

## Borders

```
Border/default:   #E0D9CF   — standard
Border/strong:    #C8C0B5   — hover, emphasis
Border/light:     #EDE8E2   — internal dividers only
```

## Shadows

```
Cards resting:    shadow-sm
Cards hover:      shadow-[0_8px_28px_rgba(0,0,0,0.09)]
Hero resting:     shadow-[0_4px_24px_rgba(0,0,0,0.07)]
Hero hover:       shadow-[0_8px_36px_rgba(0,0,0,0.11)]
```

## Text — always stone-*, never gray-*

```
Primary:   text-stone-900
Secondary: text-stone-600
Body:      text-stone-500
Meta:      text-stone-400
```

## Accent

```
Indigo (primary):  bg-indigo-600 text-white  — solid active/CTA
                   bg-indigo-50 text-indigo-700  — tinted bg
                   border-indigo-200  — tinted border
Amber (bookmarks): bg-amber-50 border-amber-300 text-amber-600  — active saved state
```

## Typography

```
Eyebrow:    text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone-400
Card title: text-[0.9375rem] font-semibold leading-[1.5]
Hero title: text-4xl md:text-5xl font-semibold leading-[1.12] tracking-tight
Body:       text-sm leading-6
```

## Anti-patterns (reject these)

- `gray-*` text or borders
- `bg-white` on nav buttons
- `rounded-3xl` on containers
- Ghost indigo CTA on hero
- `* { transition: all }` global rules
- `bg-stone-50` on `<main>` that overrides body gradient
