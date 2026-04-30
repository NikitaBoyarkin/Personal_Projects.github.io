# Repository Guidelines

## Project Structure & Module Organization
- `index.html` is the landing page and entry point for the portfolio.
- `project-style.css` holds the shared styling for the landing and project pages.
- `generator.js` renders project cards and per-project pages from Markdown.
- `projects/*.md` are the content sources for each project.
- `projects/<id>/index.html` are lightweight wrappers that load the Markdown content via `generator.js`.
- `images/` contains project and profile images used by Markdown and HTML.
- `assets/` contains vendor CSS/JS and webfonts from the base template.

## Build, Test, and Development Commands
- `python3 -m http.server 8000` starts a local static server from the repo root so relative paths resolve as on GitHub Pages. Open `http://localhost:8000/`.
- There is no build step; edits to HTML/CSS/JS/MD are read directly by the browser.
- No automated tests are configured at the moment.

## Coding Style & Naming Conventions
- Use 2-space indentation in HTML, CSS, and JS to match existing files.
- Prefer lowercase/kebab-case file names and CSS classes/ids (e.g., `project-style.css`, `.skill-badge`).
- Keep project IDs lowercase and consistent across `projects/<id>/`, `projects/<id>.md`, and the `projects` array in `generator.js`.
Markdown structure expectations for `projects/*.md`:
- Start with `# Title` (used as the page title).
- First paragraph should be a short summary (used on the cards).
- First image (if present) becomes the hero image on the project page.
- Include `## Impact` followed by a bullet list to populate the card's Impact line.

## Testing Guidelines
- Manual checks only: load `index.html` and at least one `projects/<id>/index.html` in a browser.
- When editing `generator.js`, verify card rendering, image paths, TOC generation, and the theme toggle.

## Commit & Pull Request Guidelines
- Git history shows short, informal messages (often a single word or `.`); there is no enforced convention.
- Prefer imperative, specific summaries (e.g., "add cohort project page").
- For PRs, include a brief summary, list affected project IDs, and attach screenshots for visual/CSS changes.

## Content Update Workflow
- Add a project: create `projects/<id>.md`, copy an existing `projects/<id>/index.html`, add the `{ id, md }` entry to `generator.js`, and place images in `images/`.
