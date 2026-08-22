---
title: This Portfolio Site
description: The portfolio you are looking at — built with Astro v5, TypeScript, and Markdown content collections. Static output, dark/light theme, RSS, sitemap, JSON-LD, and a base-path-aware URL helper for GitHub Pages.
track: engineering
hero: images/site.svg
impact:
  - Astro v5 + TypeScript + Markdown content collections
  - Dark/light theme with no-flash inline script
  - RSS, sitemap, robots, JSON-LD, OG/Twitter meta
  - Base-path-aware URLs for GitHub Pages subpath hosting
tools:
  - Astro
  - TypeScript
  - Markdown
  - CSS custom properties
github: https://github.com/NikitaBoyarkin/Personal_Projects.github.io
---

# This Portfolio Site

## Business Context

A static portfolio was needed where content (projects, posts) is edited in Markdown rather than component markup. Hosting is GitHub Pages under a subpath (`/Personal_Projects.github.io/`). Deploy is push-triggered, with no manual build.

## Hypothesis

If we take Astro with content collections and a Zod frontmatter schema, content and presentation separate: new projects/posts are a new `.md` file, with no component edits. The base path and meta tags (OG, JSON-LD, sitemap, RSS) are configured once.

## Data & Method

**Stack:** Astro v5, TypeScript, Markdown content collections (`src/content/{projects,posts}/`), Zod schemas in `src/content/config.ts`.

**Architecture:**
- **Content collections** — each project/post = Markdown + frontmatter; Zod validates fields at build.
- **Base path** — `withBase()` from `src/lib/path.ts` applies `base: '/Personal_Projects.github.io'` to all internal links and images.
- **Theme** — an inline `<head>` script reads `localStorage`/`prefers-color-scheme` and sets `data-theme` before first paint (no flash); CSS custom properties are reactive.
- **SEO** — `sitemap.xml`, `robots.txt`, `rss.xml`, JSON-LD, OG/Twitter meta, canonical.
- **Deploy** — GitHub Actions builds `dist/` and publishes to Pages on push to `master`.

**Validation:** `scripts/check_site.py` checks required pages, internal links, the profile image, and assets in `index.html`.

## Insight

Astro content collections with Zod are a contract between content and presentation: invalid frontmatter breaks the build, not the deploy. `withBase()` encapsulates the GitHub Pages subpath — no link hardcodes the base. The "content = `.md`, presentation = `.astro`" split means adding a project requires no code changes.

## Impact

- **Astro v5 + TypeScript + Markdown content collections** — content edited in `.md`, validated by Zod.
- **Dark/light theme without flash** — inline script before first paint.
- **Full SEO** — RSS, sitemap, robots, JSON-LD, OG/Twitter meta, canonical.
- **Base-path-aware URLs** — `withBase()` for GitHub Pages subpath, no hardcoding.

## Documentation

- [GitHub → Personal_Projects.github.io](https://github.com/NikitaBoyarkin/Personal_Projects.github.io)