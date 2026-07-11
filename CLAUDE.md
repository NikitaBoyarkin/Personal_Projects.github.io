# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an Astro-powered static portfolio site deployed to GitHub Pages. The source lives in `src/`, content is authored in Markdown with YAML frontmatter, and the production build is emitted to `dist/`.

The site is published at `https://nikitaboyarkin.github.io/Personal_Projects.github.io/`, so `base: '/Personal_Projects.github.io'` is configured in `astro.config.mjs`.

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

# Validate built site
make check
```

## Project Structure

```text
├── astro.config.mjs          # site, base path, output mode
├── package.json
├── tsconfig.json
├── public/                    # static assets copied as-is to dist/
│   ├── images/                # profile photo + project thumbnails
│   ├── assets/                # legacy HTML5 UP template assets
│   └── design/                # legacy design mockups
├── src/
│   ├── content/               # Markdown content collections
│   │   ├── config.ts          # Zod schemas for projects + posts
│   │   ├── projects/          # project markdown files
│   │   └── posts/             # blog post markdown files
│   ├── layouts/
│   │   ├── Base.astro         # nav, footer, fonts, meta, theme
│   │   └── Post.astro         # blog post wrapper
│   ├── components/
│   │   ├── ProjectCard.astro
│   │   ├── ProjectGrid.astro
│   │   ├── BlogCard.astro
│   │   ├── BlogFilter.astro   # client-side category filter
│   │   ├── InnerTOC.astro     # client-side TOC + scrollspy
│   │   └── IntroShader.astro  # Paper mesh gradient background
│   ├── pages/
│   │   ├── index.astro
│   │   ├── writing.astro
│   │   ├── contact.astro
│   │   ├── projects/[slug].astro
│   │   └── posts/[slug].astro
│   ├── styles/
│   │   ├── global.css         # ported from project-style.css
│   │   └── blog.css           # ported from blog-style.css
│   └── lib/
│       ├── date.ts            # formatting + read-time estimate
│       └── path.ts            # base-path aware URL helper
├── scripts/
│   └── check_site.py          # validates the dist/ build
└── .github/workflows/
    └── deploy.yml             # builds and deploys dist/ to GitHub Pages
```

## Content Collections

### Projects

Each project is a Markdown file in `src/content/projects/` with frontmatter matching the Zod schema in `src/content/config.ts`:

| Field | Purpose |
|---|---|
| `title` | Project title (also page `<title>`) |
| `description` | Short summary used on the project card |
| `hero` | Path to thumbnail/hero image relative to `public/` (e.g. `images/rfm.png`) |
| `impact` | Array of bullet points rendered as card subtitle |
| `tools` | Array of tools/technologies |
| `github` | URL to the project repository |
| `draft` | If `true`, omitted from the build |

### Posts

Each post is a Markdown file in `src/content/posts/` with frontmatter:

| Field | Purpose |
|---|---|
| `title` | Post title |
| `date` | Publication date (`YYYY-MM-DD`) |
| `category` | Used for filtering (e.g. `decision-log`) |
| `tags` | Array of tags |
| `excerpt` | Short description for cards and meta tags |
| `draft` | If `true`, omitted from the build |

## Adding Content

### Add a project

1. Create `src/content/projects/<id>.md` with the required frontmatter.
2. Add the project thumbnail to `public/images/`.
3. Run `npm run build` and `make check`.
4. No manual HTML wrappers or `generator.js` edits are needed.

### Add a blog post

1. Create `src/content/posts/<slug>.md` with the required frontmatter.
2. Run `npm run build` and `make check`.
3. No Python generation step is needed.

## Internal Links

Always use the `withBase()` helper from `src/lib/path.ts` for internal links and image paths so the `base` path is applied correctly:

```astro
import { withBase } from '../lib/path';

<a href={withBase('writing/')}>Writing</a>
<img src={withBase('images/00_profile.jpg')} alt="..." />
```

## Theme System

The theme toggle is implemented in `src/layouts/Base.astro`:

- An inline script in `<head>` reads `localStorage` or `prefers-color-scheme` and sets `data-theme` before first paint to avoid flashes.
- The toggle button updates `data-theme` and persists the choice.
- CSS custom properties in `src/styles/global.css` react to `[data-theme="light"]`.

## Deployment

Pushing to `master` (or `main`) triggers `.github/workflows/deploy.yml`, which:

1. Installs Node dependencies.
2. Builds the site to `dist/`.
3. Runs `make check`.
4. Deploys `dist/` to GitHub Pages.

Do **not** push directly to `master` without confirming the workflow is enabled in the repository settings (`Settings → Pages → Build and deployment → GitHub Actions`).

## Legacy Files

`public/assets/` and `public/design/` are leftovers from the original HTML5 UP "Massively" template and are not referenced by the active site. They are kept in `public/` for now but can be removed once confirmed unused.
