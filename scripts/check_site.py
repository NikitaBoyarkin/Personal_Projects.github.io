#!/usr/bin/env python3
"""check_site.py — validate the built Astro portfolio.

Checks:
- Required pages exist in dist/.
- All internal links in dist/ HTML resolve to existing files.
- Profile image exists and is under a size threshold.
- Images referenced in HTML exist in dist/.
- Required assets are present in index.html.
"""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
MAX_PROFILE_KB = 500


class LinkExtractor(HTMLParser):
    def __init__(self, page: Path):
        super().__init__()
        self.page = page
        self.links: list[tuple[str, int]] = []
        self.srcs: list[tuple[str, int]] = []

    def error(self, message):
        pass

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        line = self.getpos()[0]
        if "href" in attr:
            self.links.append((attr["href"], line))
        if "src" in attr:
            self.srcs.append((attr["src"], line))


def is_internal(url: str) -> bool:
    return bool(url) and not url.startswith(
        ("http://", "https://", "//", "mailto:", "tel:", "#", "data:")
    )


def strip_fragment(url: str) -> str:
    return url.split("#")[0]


def resolve_relative(page: Path, url: str) -> Path:
    url = strip_fragment(url)
    if url.startswith("/"):
        # The base path is part of the URL; strip it to resolve against dist/
        base = "/Personal_Projects.github.io"
        if url.startswith(base):
            url = url[len(base):]
        return (DIST / url.lstrip("/")).resolve()
    return (page.parent / url).resolve()


def check_required_pages() -> int:
    errors = 0
    required = [
        DIST / "index.html",
        DIST / "writing" / "index.html",
        DIST / "contact" / "index.html",
        DIST / "projects" / "rfm" / "index.html",
        DIST / "projects" / "bot" / "index.html",
        DIST / "projects" / "cohort" / "index.html",
        DIST / "projects" / "abtest" / "index.html",
        DIST / "posts" / "bayesian-ab-testing" / "index.html",
    ]
    print(f"Checking {len(required)} required page(s)...")
    for path in required:
        if not path.exists():
            print(f"  ERROR: missing required page {path.relative_to(DIST)}")
            errors += 1
        else:
            print(f"  OK    {path.relative_to(DIST)}")
    return errors


def check_internal_links() -> int:
    errors = 0
    html_files = list(DIST.rglob("*.html"))
    print(f"Checking internal links in {len(html_files)} HTML file(s)...")
    for page in html_files:
        text = page.read_text(encoding="utf-8")
        extractor = LinkExtractor(page)
        try:
            extractor.feed(text)
        except Exception as e:
            print(f"  ERROR parsing {page.relative_to(DIST)}: {e}")
            errors += 1
            continue

        for url, line in extractor.links + extractor.srcs:
            if not is_internal(url):
                continue
            # Skip CSS/JS assets handled by Astro bundler
            if url.startswith("/_astro/"):
                continue
            target = resolve_relative(page, url)
            if not target.exists():
                print(f"  ERROR {page.relative_to(DIST)}:{line} broken link: {url} -> {target.relative_to(ROOT)}")
                errors += 1
    return errors


def check_profile_image() -> int:
    errors = 0
    profile_candidates = ["images/00_profile.jpg", "images/00_profile.png"]
    profile = None
    for cand in profile_candidates:
        if (DIST / cand).exists():
            profile = DIST / cand
            break

    if not profile:
        print("  ERROR: profile image not found in dist/images/")
        return 1

    size_kb = profile.stat().st_size / 1024
    print(f"Profile image: {profile.name} ({size_kb:.1f} KB)")
    if size_kb > MAX_PROFILE_KB:
        print(f"  ERROR: profile image exceeds {MAX_PROFILE_KB} KB ({size_kb:.1f} KB)")
        errors += 1
    return errors


def check_index_assets() -> int:
    errors = 0
    index = DIST / "index.html"
    text = index.read_text(encoding="utf-8")
    required = ["_astro/", "theme-toggle"]
    for asset in required:
        if asset not in text:
            print(f"  ERROR: index.html missing reference to {asset}")
            errors += 1
    return errors


def main() -> int:
    if not DIST.exists():
        print("ERROR: dist/ not found. Run 'npm run build' first.")
        return 1

    print("=== Portfolio site validation ===\n")
    errors = 0
    errors += check_required_pages()
    errors += check_internal_links()
    errors += check_profile_image()
    errors += check_index_assets()

    print()
    if errors:
        print(f"FAILED: {errors} error(s)")
        return 1
    print("OK: all checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
