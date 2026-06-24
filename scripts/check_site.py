#!/usr/bin/env python3
"""check_site.py — lightweight validation for the static portfolio.

Checks:
- Every project declared in generator.js has a .md source and an HTML wrapper.
- Every projects/*.md with a matching wrapper is registered in generator.js.
- Internal links in HTML files point to existing files.
- Profile image exists and is under a size threshold.
- Required JS/CSS assets are referenced on index.html.
"""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "images"
PROJECTS_DIR = ROOT / "projects"
MAX_PROFILE_KB = 500


class LinkExtractor(HTMLParser):
    def __init__(self, base_dir: Path, page: Path):
        super().__init__()
        self.base_dir = base_dir
        self.page = page
        self.links: list[tuple[str, int]] = []
        self.srcs: list[tuple[str, int]] = []

    def error(self, message):
        pass

    def getpos(self):
        return super().getpos()

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        line = self.getpos()[0]
        if "href" in attr:
            self.links.append((attr["href"], line))
        if "src" in attr:
            self.srcs.append((attr["src"], line))


def read_generator_projects() -> list[str]:
    """Extract the project id list from generator.js."""
    generator = (ROOT / "generator.js").read_text(encoding="utf-8")
    match = re.search(r"const\s+projects\s*=\s*\[(.*?)\];", generator, re.DOTALL)
    if not match:
        print("ERROR: cannot find projects array in generator.js")
        return []

    ids = re.findall(r'id:\s*"([^"]+)"', match.group(1))
    return ids


def check_projects(ids: list[str]) -> int:
    errors = 0
    print(f"Checking {len(ids)} project(s) from generator.js...")
    for pid in ids:
        md = PROJECTS_DIR / f"{pid}.md"
        wrapper = PROJECTS_DIR / pid / "index.html"
        if not md.exists():
            print(f"  ERROR: missing markdown source {md}")
            errors += 1
        if not wrapper.exists():
            print(f"  ERROR: missing project wrapper {wrapper}")
            errors += 1
        else:
            print(f"  OK    {pid}: {md.name} + {pid}/index.html")
    return errors


def check_orphan_wrappers(ids: list[str]) -> int:
    errors = 0
    registered = set(ids)
    wrappers = [d.name for d in PROJECTS_DIR.iterdir() if d.is_dir() and (d / "index.html").exists()]
    markdowns = [p.stem for p in PROJECTS_DIR.glob("*.md")]

    for pid in wrappers:
        if pid not in registered:
            print(f"  ERROR: wrapper {PROJECTS_DIR / pid / 'index.html'} exists but {pid} is not in generator.js")
            errors += 1

    for pid in markdowns:
        if pid not in registered:
            print(f"  ERROR: markdown {PROJECTS_DIR / (pid + '.md')} exists but {pid} is not in generator.js")
            errors += 1

    return errors


def is_internal(url: str) -> bool:
    return bool(url) and not url.startswith(("http://", "https://", "//", "mailto:", "tel:", "#"))


def strip_fragment(url: str) -> str:
    return url.split("#")[0]


def resolve_relative(page: Path, url: str) -> Path:
    url = strip_fragment(url)
    if url.startswith("/"):
        return (ROOT / url.lstrip("/")).resolve()
    return (page.parent / url).resolve()


def check_internal_links() -> int:
    errors = 0
    html_files = list(ROOT.rglob("*.html"))
    # Skip legacy/template artifacts we don't validate deeply
    skip = {ROOT / "elements.html", ROOT / "generic.html", ROOT / "_template.html"}
    html_files = [p for p in html_files if p not in skip and "assets/" not in str(p)]

    print(f"Checking internal links in {len(html_files)} HTML file(s)...")
    for page in html_files:
        text = page.read_text(encoding="utf-8")
        extractor = LinkExtractor(ROOT, page)
        try:
            extractor.feed(text)
        except Exception as e:
            print(f"  ERROR parsing {page}: {e}")
            errors += 1
            continue

        for url, line in extractor.links + extractor.srcs:
            if not is_internal(url):
                continue
            target = resolve_relative(page, url)
            if not target.exists():
                print(f"  ERROR {page}:{line} broken link: {url} -> {target}")
                errors += 1

    return errors


def check_profile_image() -> int:
    errors = 0
    profile_candidates = ["images/00_profile.jpg", "images/00_profile.png"]
    profile = None
    for cand in profile_candidates:
        if (ROOT / cand).exists():
            profile = ROOT / cand
            break

    if not profile:
        print("  ERROR: profile image not found (expected images/00_profile.jpg or .png)")
        return 1

    size_kb = profile.stat().st_size / 1024
    print(f"Profile image: {profile.name} ({size_kb:.1f} KB)")
    if size_kb > MAX_PROFILE_KB:
        print(f"  ERROR: profile image exceeds {MAX_PROFILE_KB} KB ({size_kb:.1f} KB)")
        errors += 1
    return errors


def check_index_assets() -> int:
    errors = 0
    index = ROOT / "index.html"
    text = index.read_text(encoding="utf-8")
    required = ["project-style.css", "theme.js", "generator.js", "marked.min.js"]
    for asset in required:
        if asset not in text:
            print(f"  ERROR: index.html missing reference to {asset}")
            errors += 1
    return errors


def main() -> int:
    print("=== Portfolio site validation ===\n")
    ids = read_generator_projects()
    errors = 0
    errors += check_projects(ids)
    errors += check_orphan_wrappers(ids)
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
