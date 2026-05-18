"""
Phase 1a: Extract all 23 blog posts from the Base Foundation GitHub repo.
Outputs: scripts/blogs_raw.json

Run from project root:
  python scripts/extract_blogs.py
"""

import json
import time
import requests
from bs4 import BeautifulSoup
from slugify import slugify

BASE_RAW = "https://raw.githubusercontent.com/sinankmuriyanal/Base/main"
NUM_POSTS = 23

CATEGORY_MAP = {
    "career mapping": "Career Mapping",
    "base classroom": "Base Classroom",
    "teachers' training": "Teachers' Training",
    "teachers training": "Teachers' Training",
    "skill enhancement": "Skill Enhancement",
    "language mastery": "Language Mastery",
    "community distribution": "Community Distribution",
    "map bengal": "Map Bengal",
}


def fetch_html(url: str) -> str:
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    return resp.text


def extract_blog(html: str, post_num: int) -> dict:
    soup = BeautifulSoup(html, "html.parser")

    # Title: look for the main content heading
    title = ""
    for selector in ["h2.blog-title", ".blog-details h2", ".post-content h2", "article h2", "h1"]:
        el = soup.select_one(selector)
        if el and el.get_text(strip=True):
            title = el.get_text(strip=True)
            break
    if not title:
        # fallback: first h2 or h1 in page
        h = soup.find(["h2", "h1"])
        title = h.get_text(strip=True) if h else f"Blog Post {post_num}"

    # Category
    category = "General"
    for el in soup.select(".post-cat a, .blog-cat, .category a, .cat-links a"):
        text = el.get_text(strip=True).lower()
        if text in CATEGORY_MAP:
            category = CATEGORY_MAP[text]
            break

    # Featured image — first <img> inside main content area
    featured_image_path = None
    content_area = soup.select_one(".blog-details, article, .post-content, main")
    if content_area:
        img = content_area.find("img")
        if img and img.get("src"):
            src = img["src"]
            # normalise relative path
            if src.startswith("img/") or src.startswith("./img/"):
                featured_image_path = src.lstrip("./")
    if not featured_image_path:
        img = soup.find("img", src=lambda s: s and "img/" in s)
        if img:
            src = img["src"]
            featured_image_path = src.lstrip("./")

    # Content — inner HTML of main article container
    content_html = ""
    for selector in [".blog-details", "article .entry-content", ".post-body", "article"]:
        el = soup.select_one(selector)
        if el:
            # remove header image duplication
            for img in el.select("img")[:1]:
                if img.get("src") == featured_image_path:
                    img.decompose()
            content_html = str(el)
            break

    # Tags
    tags = []
    for tag_el in soup.select(".tagcloud a, .post-tags a, .tags a"):
        t = tag_el.get_text(strip=True).lstrip("#")
        if t:
            tags.append(t)

    return {
        "postNumber": post_num,
        "title": title,
        "slug": slugify(title) or f"blog-post-{post_num}",
        "category": category,
        "content": content_html,
        "featuredImagePath": featured_image_path,
        "tags": tags,
        "author": None,
        "publishedAt": None,
        "published": True,
    }


def main():
    blogs = []
    for n in range(1, NUM_POSTS + 1):
        url = f"{BASE_RAW}/blog-post{n}.html"
        print(f"Fetching blog-post{n}.html ...")
        try:
            html = fetch_html(url)
            blog = extract_blog(html, n)
            print(f"  -> [{blog['category']}] {blog['title'][:70]}")
            blogs.append(blog)
        except Exception as e:
            print(f"  ERROR: {e}")
            blogs.append({
                "postNumber": n,
                "title": f"Blog Post {n}",
                "slug": f"blog-post-{n}",
                "category": "General",
                "content": "",
                "featuredImagePath": None,
                "tags": [],
                "author": None,
                "publishedAt": None,
                "published": True,
                "extractionError": str(e),
            })
        time.sleep(0.3)  # polite rate limit

    out_path = "scripts/blogs_raw.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(blogs, f, ensure_ascii=False, indent=2)
    print(f"\nDone. {len(blogs)} posts written to {out_path}")


if __name__ == "__main__":
    main()
