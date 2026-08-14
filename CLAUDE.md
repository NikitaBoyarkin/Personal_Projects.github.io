# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

An Astro-powered static portfolio site deployed to GitHub Pages. Source lives in `src/`, content is authored in Markdown with YAML frontmatter, and the production build is emitted to `dist/`.

The site is published at `https://nikitaboyarkin.github.io/Personal_Projects.github.io/`, so `base: '/Personal_Projects.github.io'` is configured in `astro.config.mjs`.

The site is **bilingual (RU / EN)**. Russian is the default; an `en/` page tree mirrors the main pages and renders the `projects-en` collection.

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (default port 4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type-check Astro files
npm run check

# Generate OG images
npm run og

# Validate the built site
make check
```

## Project Structure

```text
├── astro.config.mjs          # site, base path, output mode
├── package.json
├── tsconfig.json
├── public/                   # static assets copied as-is to dist/
│   ├── images/               # profile photo + project hero SVGs (one per project)
│   └── og/                   # generated OG images
├── src/
│   ├── content/              # Markdown content collections (schema in config.ts)
│   │   ├── config.ts         # Zod schemas: projects, projects-en, volta-parts, volta-parts-en, posts
│   │   ├── projects/         # RU project markdown (one file per project)
│   │   ├── projects-en/      # EN project markdown (mirror)
│   │   ├── volta-parts/      # RU Volta sub-projects (funnel, ab, retention, segmentation)
│   │   ├── volta-parts-en/   # EN Volta sub-projects (mirror)
│   │   └── posts/            # blog post markdown
│   ├── layouts/
│   │   ├── Base.astro        # nav, footer, fonts, meta, theme, PostHog, lang/counterpartHref
│   │   └── Post.astro        # blog post wrapper
│   ├── components/
│   │   ├── ProjectCard.astro / ProjectGrid.astro / ProjectFilter.astro
│   │   ├── BlogCard.astro / BlogFilter.astro
│   │   ├── CaseStudy.astro   # problem/approach/result/metrics block for projects
│   │   ├── InnerTOC.astro    # client-side TOC + scrollspy
│   │   ├── IntroShader.astro # Paper mesh gradient background
│   │   ├── TopicMap.astro / KnowledgeGraph.astro / Graph (graph.astro)
│   │   ├── CollaborationFormats.astro / MaterialStrip.astro
│   │   ├── LangSwitch.astro  # RU/EN toggle (uses counterpartHref)
│   │   ├── SearchBox.astro   # client-side search over search-index.json
│   │   └── Analytics.astro   # PostHog (inert until PUBLIC_POSTHOG_KEY env var is set)
│   ├── pages/
│   │   ├── index.astro / about.astro / now.astro / cv.astro / contact.astro
│   │   ├── writing.astro / guides.astro / notes.astro / start.astro / graph.astro
│   │   ├── projects/[slug].astro   # RU project pages
│   │   ├── posts/[slug].astro      # blog post pages
│   │   ├── topics/                 # topic pages
│   │   ├── en/                     # EN mirror: index, about, start, graph, projects/[slug].astro
│   │   ├── 404.astro
│   │   ├── sitemap.xml.ts / robots.txt.ts / rss.xml.ts / search-index.json.ts
│   ├── styles/
│   │   ├── global.css       # theme tokens, light/dark via [data-theme]
│   │   └── blog.css
│   └── lib/
│       ├── date.ts          # formatting + read-time estimate
│       ├── path.ts          # base-path aware URL helper (withBase)
│       └── topics.ts
├── scripts/
│   ├── check_site.py        # validates the dist/ build
│   └── generate-og.mjs      # OG image generator (npm run og)
├── .github/workflows/
│   └── deploy.yml           # builds and deploys dist/ to GitHub Pages
└── .claude/
    ├── settings.json
    └── hooks/               # contrast-gate.js, portfolio-category-guard.js
```

## Content Collections

Schemas are defined with Zod in `src/content/config.ts`.

### Projects (`projects` RU, `projects-en` EN)

Each project is a Markdown file with frontmatter:

| Field | Purpose |
|---|---|
| `title` | Project title (also page `<title>`) |
| `description` | Short summary used on the project card and meta tags |
| `hero` | Path to hero image relative to `public/` (e.g. `images/volta.svg`) |
| `impact` | Array of bullet points rendered as card subtitle and CV bullets |
| `tools` | Array of tools/technologies |
| `github` | URL to the project repository (optional) |
| `demo` | Path/URL to a live demo (optional) |
| `related` | Array of internal links to related project/post pages |
| `children` | Array of child sub-project slugs (used by Volta) |
| `caseStudy` | Optional `{ problem, approach, result, metrics: [{label, value}] }` block rendered by `CaseStudy.astro` |
| `draft` | If `true`, omitted from the build |

### Volta parts (`volta-parts` / `volta-parts-en`)

Sub-projects of the Volta neobank narrative: `funnel`, `ab`, `retention`, `segmentation`. Schema: `title`, `description`, `part`, `order`, `impact`, `tools`, `github` (optional), `draft`.

### Posts

| Field | Purpose |
|---|---|
| `title` | Post title |
| `date` | Publication date (`YYYY-MM-DD`) |
| `category` | Must match `BlogFilter.astro` taxonomy — `decision-log`, `framework`, `guide`, `note` (enforced by `portfolio-category-guard.js`) |
| `tags` | Array of tags |
| `excerpt` | Short description for cards and meta tags |
| `image` | Optional cover image |
| `related` / `keywords` | Optional arrays |
| `draft` | If `true`, omitted from the build |

## Adding Content

### Add a project

1. Create `src/content/projects/<id>.md` **and** `src/content/projects-en/<id>.md` (keep RU and EN in sync).
2. Add the hero image to `public/images/` (the `hero` field is required).
3. Add the slug to the `ORDER` array in `src/components/ProjectGrid.astro` so it sorts as intended (unlisted slugs sort first).
4. Run `npm run build` and `make check`.

### Add a blog post

1. Create `src/content/posts/<slug>.md` with the required frontmatter; `category` must be one of `decision-log`, `framework`, `guide`, `note`.
2. Run `npm run build` and `make check`.

## Internal Links

Always use the `withBase()` helper from `src/lib/path.ts` for internal links and image paths so the `base` path is applied correctly:

```astro
import { withBase } from '../lib/path';

<a href={withBase('writing/')}>Writing</a>
<img src={withBase('images/00_profile.jpg')} alt="..." />
```

## Internationalization (RU / EN)

- Default pages (`src/pages/*.astro`) are Russian (`lang="ru"`).
- English mirrors live in `src/pages/en/` and render the `projects-en` collection.
- Each `Base` page declares `lang` and `counterpartHref` (the URL of the other-language version); `LangSwitch.astro` toggles between them.
- When adding a page or project, add **both** language versions and keep `counterpartHref` wired.

## Theme System

The theme toggle is implemented in `src/layouts/Base.astro`:

- An inline script in `<head>` reads `localStorage` or `prefers-color-scheme` and sets `data-theme` before first paint to avoid flashes.
- The toggle button updates `data-theme` and persists the choice.
- CSS custom properties in `src/styles/global.css` react to `[data-theme="light"]`.

## Analytics

`src/components/Analytics.astro` loads the official PostHog JS snippet. It is **inert until build-time env vars are set**:

- `PUBLIC_POSTHOG_KEY` — PostHog project key (no snippet rendered if unset)
- `PUBLIC_POSTHOG_HOST` — defaults to `https://us.i.posthog.com` (EU: `https://eu.i.posthog.com`)

## Local Hooks

- `contrast-gate.js` — color-contrast gate on generated output.
- `portfolio-category-guard.js` — PostToolUse guard that blocks `src/content/posts/*.md` with a `category` outside the `BlogFilter.astro` taxonomy.

## Deployment

Pushing to `master` (or `main`) triggers `.github/workflows/deploy.yml`, which:

1. Installs Node dependencies.
2. Builds the site to `dist/`.
3. Runs `make check`.
4. Deploys `dist/` to GitHub Pages.

Do **not** push directly to `master` without confirming the workflow is enabled in the repository settings (`Settings → Pages → Build and deployment → GitHub Actions`).

## Legacy Files

`public/assets/` and `public/design/` are leftovers from the original HTML5 UP "Massively" template and are not referenced by the active site. They can be removed once confirmed unused.