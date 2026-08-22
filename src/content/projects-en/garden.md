---
title: Digital Garden
description: A personal digital garden and Zettelkasten published as a website with Quartz v4 — linked notes, backlinks, graph view, and atomic evergreen notes instead of chronological blog posts.
track: engineering
hero: images/garden.svg
impact:
  - Linked-notes Zettelkasten with backlinks + graph view
  - Atomic evergreen notes over chronological posts
  - Quartz v4 — TypeScript-extensible, static output
  - Obsidian-flavored Markdown → public site
tools:
  - TypeScript
  - Quartz v4
  - Markdown
  - Obsidian
github: https://github.com/NikitaBoyarkin/digital_garden
---

# Digital Garden

## Business Context

Knowledge as chronological posts ages quickly and loses connections. A digital garden is the opposite of a blog: notes are not ordered by date but linked with `[[wikilinks]]`, have maturity stages (seedling → evergreen), and evolve over time. The task: publish a personal Zettelkasten as a static site with a link graph.

## Hypothesis

If we publish notes through Quartz v4 with backlinks, graph view, and full-text search, the reader sees not isolated texts but a network of ideas — and can navigate by meaning, not chronology. That is closer to how thoughts are actually structured than a post feed.

## Data & Method

**Content model:** atomic notes in Obsidian-flavored Markdown. Each note is one idea, with YAML frontmatter, tags, and `[[wikilinks]]` to neighboring concepts.

**Quartz v4:**
- TypeScript plugins for rendering — extensibility out of the box.
- Backlinks: each note shows everyone that links to it.
- Graph view: a visualization of the note graph (nodes = notes, edges = links).
- Full-text search, popover preview on `[[wikilink]]` hover.
- Static output — host on GitHub Pages, no server.

## Insight

The power of a digital garden is in the links, not the individual notes. Backlinks turn a note into a "node" and show which contexts include it. The graph turns note accumulation into a navigable structure: topic clusters and isolated islands are visible. A chronological blog answers "when"; a garden answers "how is this connected."

## Impact

- **Linked-notes Zettelkasten** — backlinks + graph view instead of a post feed.
- **Atomic evergreen notes** — content matures instead of aging by date.
- **Quartz v4 on TypeScript** — static output, extensible plugins, no server.
- **Obsidian-flavored Markdown → public site** — one source, two consumption paths.

## Documentation

- [GitHub → digital_garden](https://github.com/NikitaBoyarkin/digital_garden)