#!/usr/bin/env python3
"""generate_blog.py — Convert Markdown posts to HTML blog pages.

Usage:
    python3 generate_blog.py
    python3 generate_blog.py --source /path/to/posts --output /path/to/blog

Reads .md files with YAML frontmatter from posts/ directory,
converts them to HTML, and updates writing.html + index.html.

Frontmatter fields:
    title       — Post title
    date        — Publication date (YYYY-MM-DD)
    category    — decision-log | framework | guide | note
    tags        — List of tags
    excerpt     — Short description (auto-generated if missing)
    draft       — If true, skip this post
"""

import os
import re
import sys
import glob
import argparse
from datetime import datetime
from pathlib import Path

try:
    import markdown
    import yaml
except ImportError:
    print("Install dependencies: pip3 install markdown pyyaml")
    sys.exit(1)

# ─── Configuration ──────────────────────────────────────────────────────────

DEFAULT_SOURCE = "posts"
DEFAULT_OUTPUT = "."
POSTS_DIR = "posts"  # where individual post HTMLs go
TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{title} | Nikita Boyarkin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="{excerpt}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{excerpt}" />
  <meta property="og:type" content="article" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="project-style.css" />
  <link rel="stylesheet" href="blog-style.css" />
</head>

<body>

  <nav>
    <a href="index.html" style="text-decoration: none; color: inherit;"><b>Portfolio</b></a>
    <ul class="links">
      <li><a href="writing.html" class="active">Writing</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
      <span class="theme-icon">🌙</span>
    </button>
  </nav>

  <main>
    <article class="post-content">
      <header class="post-header">
        <span class="post-tag">{category_display}</span>
        <h1 class="post-title">{title}</h1>
        <div class="post-meta">{date_display} · {read_time} min read · Nikita Boyarkin</div>
      </header>

      {content}

      <a href="writing.html" class="post-back">← Back to Writing</a>
    </article>
  </main>

  <footer>
    <a href="https://github.com/NikitaBoyarkin">GitHub</a> ·
    <a href="https://www.linkedin.com/in/nikita-boyarkin">LinkedIn</a> ·
    <a href="https://t.me/lofinibo">Telegram</a>
    <p>© {year} Nikita Boyarkin</p>
  </footer>

  <script src="theme.js"></script>
</body>
</html>
"""

CATEGORY_MAP = {
    "decision-log": "Decision Log",
    "framework": "Framework",
    "guide": "Annotated Guide",
    "note": "Note",
}


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Extract YAML frontmatter and body from markdown text."""
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            try:
                frontmatter = yaml.safe_load(parts[1]) or {}
                return frontmatter, parts[2].strip()
            except yaml.YAMLError:
                pass
    return {}, text


def md_to_html(md_text: str) -> str:
    """Convert markdown to HTML with code highlighting support."""
    md = markdown.Markdown(
        extensions=[
            "fenced_code",
            "tables",
            "toc",
            "nl2br",
        ]
    )
    html = md.convert(md_text)
    return html


def estimate_read_time(text: str) -> int:
    """Estimate read time in minutes (200 words per minute)."""
    words = len(text.split())
    return max(1, round(words / 200))


def slugify(title: str) -> str:
    """Convert title to URL-friendly slug."""
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    slug = re.sub(r"[-\s]+", "-", slug)
    return slug.strip("-")


def generate_post_html(post: dict, output_dir: str) -> str:
    """Generate individual post HTML file. Returns relative filename."""
    slug = post.get("slug") or slugify(post["title"])
    filename = f"{slug}.html"
    filepath = os.path.join(output_dir, POSTS_DIR, filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    category = post.get("category", "note")
    category_display = CATEGORY_MAP.get(category, category.replace("-", " ").title())

    html = TEMPLATE.format(
        title=post["title"],
        excerpt=post.get("excerpt", ""),
        content=post["html_content"],
        category_display=category_display,
        date_display=post.get("date_display", ""),
        read_time=post["read_time"],
        year=datetime.now().year,
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)

    return filename


def generate_writing_page(posts: list[dict], output_dir: str) -> None:
    """Regenerate writing.html with all posts."""
    cards_html = []
    for post in posts:
        category = post.get("category", "note")
        category_display = CATEGORY_MAP.get(category, category.replace("-", " ").title())
        excerpt = post.get("excerpt", "")
        if len(excerpt) > 160:
            excerpt = excerpt[:160].rsplit(" ", 1)[0] + "..."

        card = f'''      <a href="posts/{post["filename"]}" class="blog-card" data-category="{category}">
        <span class="blog-card-tag">{category_display}</span>
        <div class="blog-card-title">{post["title"]}</div>
        <div class="blog-card-meta">{post["read_time"]} min read · {post.get("date_display", "")}</div>
        <div class="blog-card-excerpt">{excerpt}</div>
      </a>'''
        cards_html.append(card)

    # Build filter tags
    categories = sorted(set(p.get("category", "note") for p in posts))
    filter_buttons = ['      <button class="filter-tag active" data-filter="all">All</button>']
    for cat in categories:
        display = CATEGORY_MAP.get(cat, cat.replace("-", " ").title())
        filter_buttons.append(f'      <button class="filter-tag" data-filter="{cat}">{display}s</button>')

    # Read existing writing.html to preserve structure, or use template
    writing_path = os.path.join(output_dir, "writing.html")

    page = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Writing | Nikita Boyarkin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Articles on product analytics, A/B testing, and data science by Nikita Boyarkin." />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="project-style.css" />
  <link rel="stylesheet" href="blog-style.css" />
</head>

<body>

  <nav>
    <a href="index.html" style="text-decoration: none; color: inherit;"><b>Portfolio</b></a>
    <ul class="links">
      <li><a href="writing.html" class="active">Writing</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
      <span class="theme-icon">🌙</span>
    </button>
  </nav>

  <main>
    <h1 class="page-title reveal">Writing</h1>

    <div class="filter-row reveal reveal-delay-1">
{"\n".join(filter_buttons)}
    </div>

    <div class="blog-list reveal reveal-delay-2">
{"\n\n".join(cards_html)}
    </div>
  </main>

  <footer>
    <a href="https://github.com/NikitaBoyarkin">GitHub</a> ·
    <a href="https://www.linkedin.com/in/nikita-boyarkin">LinkedIn</a> ·
    <a href="https://t.me/lofinibo">Telegram</a>
    <p>© {datetime.now().year} Nikita Boyarkin</p>
  </footer>

  <script src="theme.js"></script>
  <script>
    const filterTags = document.querySelectorAll('.filter-tag');
    const cards = document.querySelectorAll('.blog-card');
    filterTags.forEach(tag => {{
      tag.addEventListener('click', () => {{
        filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        const filter = tag.dataset.filter;
        cards.forEach(card => {{
          card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
        }});
      }});
    }});
  </script>

</body>
</html>
'''

    with open(writing_path, "w", encoding="utf-8") as f:
        f.write(page)


def update_index_latest(posts: list[dict], output_dir: str) -> None:
    """Update index.html Latest Writing section with top 2 posts."""
    index_path = os.path.join(output_dir, "index.html")
    if not os.path.exists(index_path):
        return

    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the writing section and replace its content
    latest = posts[:2]
    cards = []
    for post in latest:
        category = post.get("category", "note")
        category_display = CATEGORY_MAP.get(category, category.replace("-", " ").title())
        excerpt = post.get("excerpt", "")
        if len(excerpt) > 140:
            excerpt = excerpt[:140].rsplit(" ", 1)[0] + "..."
        cards.append(f'''      <a href="posts/{post["filename"]}" class="blog-card">
        <span class="blog-card-tag">{category_display}</span>
        <div class="blog-card-title">{post["title"]}</div>
        <div class="blog-card-meta">{post["read_time"]} min read · {post.get("date_display", "")}</div>
        <div class="blog-card-excerpt">{excerpt}</div>
      </a>''')

    new_section = f'''<!-- LATEST WRITING -->
  <section id="writing">
    <h2>Latest Writing</h2>
    <div class="blog-list">
{"\n".join(cards)}
    </div>
    <p style="margin-top: 1.5rem;"><a href="writing.html">View all writing →</a></p>
  </section>
'''

    # Replace existing writing section
    pattern = r'<!-- LATEST WRITING -->.*?<!-- PROJECTS -->'
    replacement = new_section + '\n  <!-- PROJECTS -->'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    parser = argparse.ArgumentParser(description="Generate blog HTML from Markdown")
    parser.add_argument("--source", default=DEFAULT_SOURCE, help="Source directory with .md files")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output directory for HTML files")
    args = parser.parse_args()

    source_dir = Path(args.source)
    output_dir = Path(args.output)

    if not source_dir.exists():
        print(f"Source directory not found: {source_dir}")
        print(f"Create it and add .md files with YAML frontmatter.")
        sys.exit(1)

    md_files = sorted(glob.glob(str(source_dir / "*.md")))
    if not md_files:
        print(f"No .md files found in {source_dir}")
        sys.exit(0)

    posts = []
    for md_path in md_files:
        with open(md_path, "r", encoding="utf-8") as f:
            text = f.read()

        frontmatter, body = parse_frontmatter(text)

        if frontmatter.get("draft"):
            continue

        title = frontmatter.get("title", Path(md_path).stem.replace("-", " ").title())
        date_str = frontmatter.get("date", "")
        category = frontmatter.get("category", "note")

        # Parse date
        date_display = ""
        if date_str:
            try:
                dt = datetime.strptime(str(date_str), "%Y-%m-%d")
                date_display = dt.strftime("%b %d, %Y")
            except ValueError:
                date_display = str(date_str)

        # Generate excerpt
        excerpt = frontmatter.get("excerpt", "")
        if not excerpt:
            # First paragraph
            paragraphs = [p.strip() for p in body.split("\n\n") if p.strip()]
            if paragraphs:
                excerpt = re.sub(r"[#*_`\[\]]", "", paragraphs[0])
                if len(excerpt) > 200:
                    excerpt = excerpt[:200].rsplit(" ", 1)[0] + "..."

        html_content = md_to_html(body)
        read_time = estimate_read_time(body)
        slug = frontmatter.get("slug") or slugify(title)

        post = {
            "title": title,
            "date": date_str,
            "date_display": date_display,
            "category": category,
            "tags": frontmatter.get("tags", []),
            "excerpt": excerpt,
            "read_time": read_time,
            "html_content": html_content,
            "slug": slug,
            "filename": f"{slug}.html",
        }
        posts.append(post)

    # Sort by date descending
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)

    # Generate individual post pages
    for post in posts:
        generate_post_html(post, str(output_dir))
        print(f"  ✓ posts/{post['filename']} — {post['title']}")

    # Regenerate listing pages
    generate_writing_page(posts, str(output_dir))
    update_index_latest(posts, str(output_dir))

    print(f"\nGenerated {len(posts)} post(s).")
    print(f"Updated: writing.html, index.html")
    print(f"\nNext: git add -A && git commit -m 'Publish blog posts'")


if __name__ == "__main__":
    main()
