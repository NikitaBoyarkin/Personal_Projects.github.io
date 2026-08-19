---
title: Scrolly English Speaking
description: "A scrollytelling guide for improving spoken English in workplace conversations (A2–B1) — built on Astro 6 with an MDX narrative and D3 visualizations. Content and visuals are decoupled: MDX holds the text, data modules hold section structure and viz props."
hero: images/scrolly.svg
impact:
  - Scrollytelling narrative on Astro 6 + MDX, D3 visualizations (workflow, bars, calendar, checklist)
  - Content and visuals decoupled — trusted data module, frontmatter safely merged on top
  - Interactive viz panels via IntersectionObserver + dark/light theme + reduced-motion
  - Deployed to GitHub Pages subpath, Node 22, `astro check` in CI
tools:
  - Astro
  - TypeScript
  - MDX
  - D3
  - Tailwind v4
github: https://github.com/NikitaBoyarkin/scrolly-english-speaking
---

# Scrolly English Speaking

## Business Context

Workplace conversations in English (standups, syncs, interviews) are a weak spot for many Russian-speaking specialists at A2–B1: the grammar is there, but coherent speech and real-time reactions stall. A textbook doesn't help much: no context, no visuals, no link between phrases and situation. The task is to build not an article but an interactive guide, where a narrative leads the reader through workplace-conversation scenes and visualizations show how the workflow, tools, and progress metrics are structured.

## Hypothesis

If we deliver the material as scrollytelling — text in the left column, visualizations in the right, switched on scroll via IntersectionObserver — the reader sees a connected story, not a list of tips. Decoupling content (MDX narrative) from visuals (data modules + D3 renderers) makes the guide easy to extend: a new scene is a new data file + MDX, with no rendering changes.

## Data & Method

**Stack:** Astro 6 (`output: static`) + MDX + Tailwind v4 (via `@tailwindcss/vite`), D3 v7 for visualizations, Shiki (`nord` theme) for code, `@astrojs/sitemap`. Deploy to GitHub Pages subpath, Node 22.

**Architecture:**
- `src/layouts/ScrollyLayout.astro` — single template: hero, 2-column scrolly, viz panels, head meta.
- `src/posts/scrolly/*.mdx` — narrative (section text) with `<ScrollySection>` blocks.
- `src/scrolly/data/*.ts` — `configId` + sections + viz props + theme. Trusted HTML source: hero/footer always come from the data module, never from frontmatter — injection guard.
- `src/scrolly/scrolly-runtime.ts` — IntersectionObserver, `switchViz`, theme-toggle; viz renderers via lazy import.

**Content model:** MDX frontmatter (`configId`, `metadata`, `theme`) is safely merged on top of the trusted data module. Hero/footer HTML always from `data/*.ts`, never from frontmatter.

## Insight

The power of scrollytelling is synchronizing narrative and visualization: the reader reaches a paragraph and at that moment the chart on the right changes. This holds attention better than a static article with pictures. Splitting MDX and data modules solves the core pain of static sites — mixing text and logic: the narrative stays editable in Markdown, and the visualizations stay typed in TypeScript.

## Impact

- **Scrollytelling narrative** — 2-column layout, viz panels switch on scroll via IntersectionObserver.
- **D3 visualizations** — workflow, tools, bars, resources, metrics, calendar, checklist.
- **Content/visuals decoupled** — MDX narrative + trusted data modules; frontmatter safely merged, hero/footer HTML only from data.
- **Dark/light theme + reduced-motion** — accessibility and reading comfort.

## Documentation

- [Live page →](https://nikitaboyarkin.github.io/scrolly-english-speaking/english-speaking)
- [GitHub → scrolly-english-speaking](https://github.com/NikitaBoyarkin/scrolly-english-speaking)