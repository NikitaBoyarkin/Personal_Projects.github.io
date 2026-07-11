# Personal Portfolio

Static portfolio site for Nikita Boyarkin — Data / Product Analyst.

Built with [Astro](https://astro.build/) v5, TypeScript, and Markdown content collections.

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to dist/
npm run preview  # preview the build
npm run check    # astro type check
```

## Content

- **Projects:** `src/content/projects/*.md`
- **Posts:** `src/content/posts/*.md`

Frontmatter schemas are defined in `src/content/config.ts`.

## Deployment

GitHub Actions deploys the `dist/` folder to GitHub Pages on pushes to `master` (the repository default branch) or `main`.
