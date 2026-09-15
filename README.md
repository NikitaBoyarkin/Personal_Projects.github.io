# Personal Portfolio

Static portfolio site for Nikita Boyarkin — Data / Product Analyst.

Built with [Astro](https://astro.build/) v5, TypeScript, and Markdown content collections.

## Development

```bash
bun install
bun run dev      # http://localhost:4321
bun run build    # static output to dist/
bun run preview  # preview the build
bun run check    # astro type check
bun test         # lib unit tests (bun:test)
```

## Content

- **Projects:** `src/content/projects/*.md`
- **Posts:** `src/content/posts/*.md`

Frontmatter schemas are defined in `src/content/config.ts`.

## Deployment

GitHub Actions deploys the `dist/` folder to GitHub Pages on pushes to `master` (the repository default branch) or `main`.
