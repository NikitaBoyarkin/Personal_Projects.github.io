# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a static GitHub Pages portfolio site. It has **no build step** — the browser loads plain HTML/CSS/JS directly. The site is deployed from the `master` branch.

## Architecture

### Client-side rendering from Markdown

`generator.js` is the core engine. It does two things depending on the page:

1. **Landing page (`index.html`)**: `renderProjectCards()` fetches each `projects/<id>.md`, parses it with `marked.js`, and injects card HTML into `#project-list`. It extracts the `h1` as title, first paragraph as description, first `img` as thumbnail, and the bullet list under `## Impact` as impact text.
2. **Project pages (`projects/<id>/index.html`)**: `generateProjectPage()` fetches the corresponding `.md`, injects the full parsed HTML into `#project-content`, promotes the `h1` to the page title, and extracts the first image as a hero image.

### Dual file structure for projects

Each project requires **two files**:
- `projects/<id>.md` — the Markdown source.
- `projects/<id>/index.html` — a thin wrapper that loads `../../project-style.css`, `marked.js`, and `../../generator.js`. Use `_template.html` as the base for new wrappers.

### Image path rewriting

`generator.js` rewrites image paths depending on context:
- On the landing page, `../images/...` in Markdown is stripped to `images/...` so cards reference `images/<file>` from the site root.
- On project pages, `images/...` in Markdown is rewritten to `../../images/...` because the wrapper lives two levels deep.

If images break after adding a project, check the raw `src` in the `.md` and the rewritten path in the browser dev tools.

### Theme system

`project-style.css` uses CSS variables scoped to `:root` and `[data-theme="light"]`. The theme toggle in `generator.js` sets `data-theme` on `<html>` and persists the choice to `localStorage`. It also respects `prefers-color-scheme` when no saved preference exists.

## Development workflow

- **Run locally**: `python3 -m http.server 8000` from the repo root. Open `http://localhost:8000/`.
- **No build, test, or lint tools** are configured. Verify changes manually in the browser.
- **Add a project**:
  1. Create `projects/<id>.md` with the expected structure (see below).
  2. Copy `_template.html` to `projects/<id>/index.html` and adjust relative paths if necessary.
  3. Add `{ id: "<id>", md: "projects/<id>.md" }` to the `projects` array in `generator.js`.
  4. Place images in `images/`.
  5. Test both the landing page card and the project detail page.

## Markdown conventions for projects

The `projects/*.md` files are parsed with specific assumptions in `generator.js`:

- Start with `# Title` — used as the card title and page `<title>`.
- First paragraph is the card summary.
- First `![alt](images/...)` becomes the card thumbnail and project-page hero.
- Include `## Impact` followed by a bullet list. The list items are joined with commas for the card subtitle.
- Remaining headings (`h2`, `h3`) populate the inner TOC on the project page.

## Legacy files

`elements.html`, `generic.html`, and the `assets/` directory are leftovers from the original HTML5 UP "Massively" template. The active site uses `index.html`, `project-style.css`, and `generator.js` instead.
