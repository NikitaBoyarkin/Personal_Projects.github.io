---
version: alpha
name: Personal Projects Portfolio
description: Bilingual (RU/EN) portfolio for a product/data analyst — Obsidian-inspired dark-teal theme with light and cyberpunk modes, a single coral accent, and a kanban project board.
colors:
  background-primary: "#0f2a2b"
  background-secondary: "#1a3435"
  background-tertiary: "#234044"
  text-normal: "#e4e4e7"
  text-muted: "#a1a1aa"
  text-accent: "#ff8569"
  text-accent-hover: "#ffa68a"
  button-bg: "#ff6643"
  button-bg-hover: "#e0532f"
  interactive-normal: "#234044"
  interactive-hover: "#3f3f46"
  border-color: "#3f3f46"
  border-active: "#ff8569"
  code-background: "#234044"
  blockquote-border: "#3f3f46"
  table-border: "#3f3f46"
  table-header-background: "#234044"
  shadow-color: "rgba(0, 0, 0, 0.4)"
typography:
  sans:
    fontFamily: Inter
    fontSize: 16px
    lineHeight: 1.6
  mono:
    fontFamily: SF Mono
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  1: 0.25rem
  2: 0.5rem
  3: 0.75rem
  4: 1rem
  5: 1.25rem
  6: 1.5rem
  8: 2rem
  10: 2.5rem
  12: 3rem
  16: 4rem
  20: 5rem
components:
  button:
    backgroundColor: "{colors.button-bg}"
    textColor: "#1a1a1a"
    rounded: "{rounded.md}"
---

## Overview

A bilingual (RU/EN) personal portfolio for a product/data analyst, built with Astro and deployed to GitHub Pages. The design language is Obsidian-inspired: a dark-teal default theme with stepped surface roles, a single coral accent reserved for interactive semantics, and two alternate themes (light, cyberpunk) that re-map the same tokens. Projects are presented as a kanban board; content is card-based with sticky-note styling.

## Colors

- The accent is semantic, not decorative: use it for links, active nav, focus rings, borders, and primary actions. Do not introduce a second accent.
- Surfaces step primary → secondary → tertiary for page, card, and nested surfaces (code blocks, table headers, chips).
- The button fill is a distinct saturated orange with fixed dark ink — the primary-button convention. Button text is not a token.
- `text-muted` is for secondary text and metadata; `text-normal` for body and headings.

## Color Roles — 60-30-10

The palette is formalized against the **60-30-10** rule (`docs/prd-palette-60-30-10.md`): 60% dominant surfaces, 30% secondary neutrals (text + borders), 10% coral accent for interactive semantics. Every token maps to exactly one role; `--code-background` and `--table-header-background` are aliases of the tertiary surface, not separate colors.

| Role | Token | Dark | Light | Cyberpunk |
|---|---|---|---|---|
| **60% Dominant** (surfaces) | `--background-primary` | `#0f2a2b` | `#f4efca` | `#0a0a12` |
| | `--background-secondary` | `#1a3435` | `#ffffff` | `#11111d` |
| | `--background-tertiary` | `#234044` | `#f4f4f5` | `#1a1a2e` |
| | `--interactive-normal` | `#234044` | `#f4f4f5` | `#1a1a2e` |
| | `--interactive-hover` | `#3f3f46` | `#e4e4e7` | `#232342` |
| | `--code-background` | `#234044` | `#f4f4f5` | `#1a1a2e` |
| | `--table-header-background` | `#234044` | `#f4f4f5` | `#1a1a2e` |
| **30% Secondary** (neutrals) | `--text-normal` | `#e4e4e7` | `#18181b` | `#e6f1ff` |
| | `--text-muted` | `#a1a1aa` | `#52525b` | `#8a8aa8` |
| | `--border-color` | `#3f3f46` | `#e4e4e7` | `#2a2a4a` |
| | `--blockquote-border` | `#3f3f46` | `#e4e4e7` | `#2a2a4a` |
| | `--table-border` | `#3f3f46` | `#e4e4e7` | `#2a2a4a` |
| **10% Accent** (interactive) | `--text-accent` | `#ff8569` | `#a8331a` | `#ff8569` |
| | `--text-accent-hover` | `#ffa68a` | `#8a2a16` | `#ffbe99` |
| | `--button-bg` | `#ff6643` | `#ff6643` | `#ff2bd6` |
| | `--button-bg-hover` | `#e0532f` | `#e0532f` | `#ff5ce0` |
| | `--border-active` | `#ff8569` | `#a8331a` | `#ff8569` |

Application budget: dominant 55–65% of any screen, secondary 25–35%, accent ≤15%. The accent is reserved for links, active nav, focus rings, `border-active`, primary button fill, accent bars, and badge pills — never as the fill of a content block.

## Color Wheel & Harmony

- **Dominant + accent = near-complementary pair.** Teal (≈180°) and coral (≈15°) sit on opposite sides of the color wheel, giving the 10% accent the tension the rule calls for. The single accent hue is a deliberate constraint: a second accent would dilute the "accent = action" semantics.
- **Secondary is achromatic.** The zinc neutrals carry no hue, so they never compete with the dominant teal or the coral accent — they provide depth and legibility, which is exactly why a neutral works as the 30% in this scheme.
- **Dark ≈ monochrome.** The dark theme is close to the article's monochrome case: one hue family (teal) across three stepped surfaces plus an achromatic 30%, with coral reserved for the 10%.
- **Cyberpunk ≈ vivid/eclectic.** The cyberpunk theme is the article's "break the rule" example: the button fill shifts to magenta `#ff2bd6` while the interactive accent stays coral, a deliberate 10% variation rather than a new 30% block.
- **The rule is a guide, not a law.** Deviations are documented here and in the PRD; the contrast gate (below) is the non-negotiable constraint.

## Contrast Verification

WCAG AA contrast is verified two ways. Dark (`:root`) and light are bound to a mechanism — `.claude/hooks/contrast-gate.js`, a PostToolUse guard that blocks any edit to `global.css` whose text/accent pair drops below AA (4.5:1 text, 3:1 non-text). Cyberpunk is verified by the same WCAG 2.1 formula (computed, not yet wired to the hook — see PRD REQ-005, Open Question Q1 resolved: cyberpunk button-ink `#1a1a1a` on `#ff2bd6` = 5.44:1, passes AA).

| Pair | Dark | Light | Cyberpunk | Gate |
|---|---|---|---|---|
| text-normal / bg-primary | 11.94:1 | 15.22:1 | 17.27:1 | hook |
| text-muted / bg-primary | 5.91:1 | 6.64:1 | 5.90:1 | hook |
| text-accent / bg-secondary (card) | 5.55:1 | 6.66:1 | 7.85:1 | hook (dark+light) / computed (cyberpunk) |
| button-ink `#1a1a1a` / button-bg | 6.00:1 | 6.00:1 | 5.44:1 | hook (dark+light) / computed (cyberpunk) |
| border-active / bg-primary (3:1) | 6.36:1 | 5.72:1 | 8.27:1 | hook (dark+light) / computed (cyberpunk) |

## Themes

The default (dark) values live in the frontmatter. Light and cyberpunk re-map the same semantic tokens:

| Token | Light | Cyberpunk |
|---|---|---|
| background-primary | `#f4efca` | `#0a0a12` |
| background-secondary | `#ffffff` | `#11111d` |
| background-tertiary | `#f4f4f5` | `#1a1a2e` |
| text-normal | `#18181b` | `#e6f1ff` |
| text-muted | `#52525b` | `#8a8aa8` |
| text-accent | `#a8331a` | `#ff8569` |
| text-accent-hover | `#8a2a16` | `#ffbe99` |
| button-bg | `#ff6643` | `#ff2bd6` |
| button-bg-hover | `#e0532f` | `#ff5ce0` |
| interactive-normal | `#f4f4f5` | `#1a1a2e` |
| interactive-hover | `#e4e4e7` | `#232342` |
| border-color | `#e4e4e7` | `#2a2a4a` |
| border-active | `#a8331a` | `#ff8569` |
| code-background | `#f4f4f5` | `#1a1a2e` |
| blockquote-border | `#e4e4e7` | `#2a2a4a` |
| table-border | `#e4e4e7` | `#2a2a4a` |
| table-header-background | `#f4f4f5` | `#1a1a2e` |
| shadow-color | `rgba(0, 0, 0, 0.08)` | `rgba(255, 133, 105, 0.15)` |

The cyberpunk theme keeps the dark theme's accent so accent-tint recipes (badges, facets, counts) pass contrast on both; only the button fill shifts to magenta.

## Typography

- Inter variable is the only sans face, self-hosted in four subsets covering RU + EN — do not add a second family.
- Base text is the `sans` scale; code uses the mono stack.
- Headings use weight contrast and tight letter-spacing rather than size alone; the hero heading is the most extreme of both.

## Layout

- The body is centered at a fixed max width with modest padding; the kanban board is the only element that breaks out, to a wider viewport-capped width.
- Project grids use auto-fit with a minimum card width so cards reflow without media queries.
- Post content is capped at a comfortable reading measure; intro paragraphs are narrower.
- The nav is sticky with a backdrop blur over a translucent background — it must stay legible over scrolling content.

## Elevation & Depth

- Hover lift is translateY plus a shadow derived from the shadow token — never scale or opacity alone.
- Cards lift more than buttons; buttons get an accent-tinted shadow.
- Reveal animations use the shared easing with a downward translate; stagger via the delay classes.

## Shapes

- Radii scale from small to full; cards use the largest corner, buttons the medium, badges and count pills the full.
- The accent top bar (cards, kanban columns) is the hover/active signal — keep it accent, not a surface color.

## Components

- **Button** — three variants: primary (button fill, dark ink), secondary (transparent, accent border and text), demo (accent-tinted fill). Hover lifts with an accent-tinted shadow.
- **Project card** — secondary surface, hairline border, large corner; an accent gradient bar reveals on hover; the hero image scales up slightly.
- **Skill badge** — accent-tinted pill with an accent border; used for skills and topic chips.
- **Kanban column** — full-width snap panel on mobile, equal share on desktop; accent top border; header carries an accent dot and a count pill.

## Do's and Don'ts

- Don't ship a theme color that fails WCAG AA contrast against both the page background and the card surface — enforced by the contrast-gate hook.
- Don't use the accent as link text on a light card unless it passes AA; a vivid accent that works as a button fill often fails as link text.
