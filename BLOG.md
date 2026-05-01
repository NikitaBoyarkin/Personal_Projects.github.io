# Blog Workflow

Write posts in Obsidian → generate HTML → push to GitHub.

## Quick Start

```bash
# 1. Add a new .md file to posts/
# 2. Run generator
python3 generate_blog.py

# 3. Commit and push
git add -A && git commit -m "Publish blog posts"
git push origin master
```

## Post Format

Every `.md` file in `posts/` must have YAML frontmatter:

```yaml
---
title: "Post Title"
date: 2025-03-15
category: decision-log   # decision-log | framework | guide | note
tags: ["ab-testing", "statistics"]
excerpt: "Short description for cards"
draft: false             # set true to skip
---

Your markdown content here...
```

## Categories

| Category | Purpose |
|----------|---------|
| `decision-log` | Why X over Y — metric selection, experiment design |
| `framework` | Mental models with diagrams |
| `guide` | Annotated guides, SQL snippets, configs |
| `note` | Short musings, 200-400 words |

## Generated Files

Running `generate_blog.py` creates/updates:
- `posts/<slug>.html` — individual post pages
- `writing.html` — listing with category filters
- `index.html` — Latest Writing section (top 2 posts)

## Dependencies

```bash
pip3 install markdown pyyaml
```

## Customization

Edit `generate_blog.py` template string to change post layout.
Edit `blog-style.css` for styling.
