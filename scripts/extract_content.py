"""
Step 1: Extract blog posts and gallery images from the old static site (sinankmuriyanal/Base).

Writes:
  scripts/blogs_raw.json      23 posts: title, slug, category, cleaned HTML, image paths, publish date
  scripts/gallery_raw.json    gallery images with categories, in page order
  lib/legacy-redirects.ts     regenerates the blog-postN.html -> /blog/<slug> map

Needs no credentials. Publish dates come from the first commit of each blog-postN.html in the
old repo (the pages themselves carry no dates). Set GITHUB_TOKEN to avoid API rate limits.

Run from project root:
  python scripts/extract_content.py
"""

from __future__ import annotations

import json
import os
import re
import time
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup, Comment, NavigableString, Tag
from slugify import slugify

REPO = "sinankmuriyanal/Base"
BASE_RAW = f"https://raw.githubusercontent.com/{REPO}/main"
NUM_POSTS = 23
ROOT = Path(__file__).resolve().parent.parent

BLOG_CATEGORIES = {
    "career mapping": "Career Mapping",
    "base classroom": "Base Classroom",
    "teachers' training": "Teachers' Training",
    "teacher's training": "Teachers' Training",
    "teachers training": "Teachers' Training",
    "skill enhancement": "Skill Enhancement",
    "language mastery": "Language Mastery",
    "community distribution": "Community Distribution",
    "map bengal": "Map Bengal",
}

GALLERY_CATEGORIES = {
    "category_1": "Drawing Competition",
    "category_2": "Motivation Class",
    "category_3": "Logo Revealing",
    "category_4": "Spoken English Course",
}

# Posts that the old site never listed with a category badge; assigned by content.
CATEGORY_OVERRIDES = {
    5: "Teachers' Training",  # one-day English language teachers' training
    6: "Community Distribution",  # scholarships for orphaned students
}

# Template placeholder text that should never be imported as a caption.
PLACEHOLDER_CAPTIONS = {"he need your protection"}

HEADING_MAP = {"h1": "h2", "h5": "h3", "h6": "h3", "h7": "h3"}
BLOCK_TAGS = {"p", "h2", "h3", "h4", "ul", "ol", "blockquote", "img"}

KEEP_TAGS = {"p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "b", "i", "a", "img", "blockquote", "br"}


def decode(raw: bytes) -> str:
    """The old pages mix UTF-8 with stray Windows-1252 bytes (curly quotes, nbsp)."""
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        out, i = [], 0
        while i < len(raw):
            try:
                ch = raw[i:].decode("utf-8")
                out.append(ch)
                break
            except UnicodeDecodeError as e:
                out.append(raw[i : i + e.start].decode("utf-8"))
                out.append(raw[i + e.start : i + e.start + 1].decode("cp1252", errors="replace"))
                i += e.start + 1
        return "".join(out)


def fetch(path: str) -> str:
    resp = requests.get(f"{BASE_RAW}/{quote(path)}", timeout=20)
    resp.raise_for_status()
    return decode(resp.content)


def first_commit_date(path: str, n: int) -> str | None:
    headers = {"Accept": "application/vnd.github+json"}
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    url = f"https://api.github.com/repos/{REPO}/commits"
    try:
        resp = requests.get(url, params={"path": path, "per_page": 100}, headers=headers, timeout=20)
        resp.raise_for_status()
        commits = resp.json()
        if not commits:
            return None
        # Many posts were uploaded in one commit; add n seconds so they keep their original order.
        base = datetime.fromisoformat(commits[-1]["commit"]["author"]["date"].replace("Z", "+00:00"))
        return (base + timedelta(seconds=n)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    except requests.RequestException as e:
        print(f"    (no commit date for {path}: {e})")
        return None


def norm_path(src: str) -> str:
    return src.strip().lstrip("./")


def text_of(el: Tag) -> str:
    return re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()


def parse_listing() -> dict[int, dict]:
    """blog.html carries each post's category badge, card image and excerpt."""
    soup = BeautifulSoup(fetch("blog.html"), "html.parser")
    listing: dict[int, dict] = {}
    for order, item in enumerate(soup.select(".blog-item")):
        link = item.select_one(".blog-item__title a[href]")
        m = re.match(r"blog-post(\d+)\.html", link["href"]) if link else None
        if not m:
            continue
        badge = item.select_one(".blog-item__badge")
        img = item.select_one(".blog-item__img img")
        excerpt = item.select_one(".blog-item__content p")
        listing[int(m.group(1))] = {
            "order": order,
            "category": BLOG_CATEGORIES.get(text_of(badge).lower(), "General") if badge else "General",
            "cardImagePath": norm_path(img["src"]) if img and img.get("src") else None,
            "excerpt": text_of(excerpt) if excerpt else "",
            "listingTitle": text_of(link),
        }
    return listing


def wrap_loose_inline(soup: BeautifulSoup, wrapper: Tag) -> None:
    """Text that sat in template <div>s is bare after unwrapping; group each run into a <p>."""
    run: list = []

    def flush(before: Tag | None) -> None:
        if "".join(str(n) for n in run).strip():
            p = soup.new_tag("p")
            if before is None:
                wrapper.append(p)
            else:
                before.insert_before(p)
            for n in run:
                p.append(n.extract())
        else:
            for n in run:
                n.extract()
        run.clear()

    for child in list(wrapper.children):
        if isinstance(child, Tag) and child.name in BLOCK_TAGS:
            flush(child)
        else:
            run.append(child)
    flush(None)


def clean_content(nodes: list[Tag]) -> str:
    """Keep only simple semantic markup; drop template classes, styles and empty paragraphs."""
    soup = BeautifulSoup("<div></div>", "html.parser")
    wrapper = soup.div
    for node in nodes:
        wrapper.append(node)

    for c in wrapper.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    for el in wrapper.find_all(["script", "style", "svg", "picture", "source"]):
        el.decompose()
    for el in wrapper.find_all(list(HEADING_MAP)):
        el.name = HEADING_MAP[el.name]
    for text in wrapper.find_all(string=True):
        text.replace_with(re.sub(r"\s+", " ", str(text)))
    for el in wrapper.find_all(True):
        if el.name not in KEEP_TAGS:
            el.unwrap()
            continue
        attrs = {}
        if el.name == "a" and el.get("href") and not el["href"].startswith("#"):
            attrs["href"] = el["href"]
        if el.name == "img" and el.get("src"):
            attrs["src"] = norm_path(el["src"])
            attrs["alt"] = el.get("alt") if el.get("alt") not in (None, "img") else ""
        el.attrs = attrs
    for a in wrapper.find_all("a"):
        if not a.get("href"):
            a.unwrap()
    wrap_loose_inline(soup, wrapper)
    for el in wrapper.find_all(["p", "h2", "h3", "h4", "li"]):
        if not el.get_text(strip=True) and not el.find("img"):
            el.decompose()
            continue
        # trim whitespace left at block edges after collapsing
        if isinstance(el.contents[0], NavigableString):
            el.contents[0].replace_with(str(el.contents[0]).lstrip())
        if isinstance(el.contents[-1], NavigableString):
            el.contents[-1].replace_with(str(el.contents[-1]).rstrip())

    return "\n".join(str(c) for c in wrapper.contents if str(c).strip())


def extract_post(n: int, meta: dict) -> dict:
    soup = BeautifulSoup(fetch(f"blog-post{n}.html"), "html.parser")
    col = soup.select_one(".blog-post .col-md-8, .blog-post .col-lg-9") or soup.select_one(".blog-post")
    if col is None:
        raise ValueError("no .blog-post container")

    title_el = col.select_one(".blog-post__title")
    title = text_of(title_el) if title_el else meta.get("listingTitle") or f"Blog Post {n}"

    hero = col.select_one(".blog-post__img img")
    featured = norm_path(hero["src"]) if hero and hero.get("src") else meta.get("cardImagePath")

    body: list[Tag] = []
    if title_el:
        for sib in list(title_el.find_next_siblings()):
            if isinstance(sib, Tag) and "blog-post__details" in (sib.get("class") or []):
                break
            body.append(sib.extract())
    content = clean_content(body)
    images = [norm_path(m) for m in re.findall(r'<img[^>]+src="([^"]+)"', content)]

    return {
        "postNumber": n,
        "title": title,
        "slug": slugify(title, max_length=80, word_boundary=True) or f"blog-post-{n}",
        "category": CATEGORY_OVERRIDES.get(n, meta.get("category", "General")),
        "excerpt": meta.get("excerpt", ""),
        "content": content,
        "featuredImagePath": featured,
        "inlineImagePaths": images,
        "tags": [],
        "author": None,
        "publishedAt": first_commit_date(f"blog-post{n}.html", n),
        "published": True,
    }


def extract_gallery() -> list[dict]:
    soup = BeautifulSoup(fetch("gallery.html"), "html.parser")
    items, seen = [], set()
    for el in soup.select(".gallery-masonry__item"):
        a = el.select_one("a[href]")
        if not a:
            continue
        path = norm_path(a["href"])
        if path in seen:
            continue
        seen.add(path)
        cat = next((GALLERY_CATEGORIES[c] for c in el.get("class", []) if c in GALLERY_CATEGORIES), "General")
        desc = el.select_one(".gallery-masonry__description")
        caption = text_of(desc) if desc else ""
        if caption.lower() in PLACEHOLDER_CAPTIONS:
            caption = ""
        items.append({"path": path, "category": cat, "caption": caption, "order": len(items)})
    return items


def dedupe_slugs(posts: list[dict]) -> None:
    seen: dict[str, int] = {}
    for p in posts:
        base = p["slug"]
        seen[base] = seen.get(base, 0) + 1
        if seen[base] > 1:
            p["slug"] = f"{base}-{seen[base]}"


def write_redirect_map(posts: list[dict]) -> None:
    path = ROOT / "lib" / "legacy-redirects.ts"
    src = path.read_text(encoding="utf-8")
    entries = "\n".join(f'  {p["postNumber"]}: {json.dumps(p["slug"])},' for p in posts)
    block = f"export const LEGACY_BLOG_REDIRECTS: Record<number, string> = {{\n{entries}\n}};"
    new_src, count = re.subn(
        r"export const LEGACY_BLOG_REDIRECTS: Record<number, string> = \{.*?\};", block, src, flags=re.S
    )
    if count != 1:
        raise RuntimeError("LEGACY_BLOG_REDIRECTS block not found in lib/legacy-redirects.ts")
    path.write_text(new_src, encoding="utf-8", newline="\n")


def main() -> None:
    print("Reading blog.html listing ...")
    listing = parse_listing()
    print(f"  {len(listing)} posts listed")

    posts, failures = [], []
    for n in range(1, NUM_POSTS + 1):
        try:
            post = extract_post(n, listing.get(n, {}))
            posts.append(post)
            words = len(BeautifulSoup(post["content"], "html.parser").get_text(" ").split())
            print(f"  #{n:>2} [{post['category']}] {post['title'][:60]}  ({words} words, {post['publishedAt'] or 'no date'})")
        except Exception as e:  # keep going; report at the end
            failures.append((n, str(e)))
            print(f"  #{n:>2} ERROR: {e}")
        time.sleep(0.2)

    dedupe_slugs(posts)
    gallery = extract_gallery()

    (ROOT / "scripts" / "blogs_raw.json").write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "scripts" / "gallery_raw.json").write_text(json.dumps(gallery, ensure_ascii=False, indent=2), encoding="utf-8")
    write_redirect_map(posts)

    print(f"\n{len(posts)} posts -> scripts/blogs_raw.json, {len(gallery)} images -> scripts/gallery_raw.json")
    print("Updated lib/legacy-redirects.ts")
    if failures:
        print(f"FAILED posts: {failures}")
        raise SystemExit(1)
    print("Next: python scripts/upload_images.py")


if __name__ == "__main__":
    main()
