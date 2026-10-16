"""
Step 2: Copy images from the old site (GitHub) into Cloudinary.

Reads:  scripts/blogs_raw.json, scripts/gallery_raw.json   (from extract_content.py)
        .env.local  (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
Writes: scripts/blogs_seeded.json, scripts/gallery_seeded.json

Safe to re-run: public IDs are deterministic and existing assets are not re-uploaded.
Each post gets its own copy of its featured image, so deleting a post in the CMS
(which deletes its Cloudinary image) can never break another post or the gallery.

Run from project root:
  python scripts/upload_images.py
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from urllib.parse import quote

import cloudinary
import cloudinary.uploader
from slugify import slugify

ROOT = Path(__file__).resolve().parent.parent
BASE_RAW = "https://raw.githubusercontent.com/sinankmuriyanal/Base/main"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$", line)
        if m and m.group(1) not in os.environ:
            os.environ[m.group(1)] = m.group(2).strip().strip('"').strip("'")


def configure() -> None:
    load_env_file(ROOT / ".env.local")
    cloud = os.environ.get("CLOUDINARY_CLOUD_NAME") or os.environ.get("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME")
    key, secret = os.environ.get("CLOUDINARY_API_KEY"), os.environ.get("CLOUDINARY_API_SECRET")
    if not (cloud and key and secret):
        raise SystemExit("Missing Cloudinary credentials in .env.local")
    cloudinary.config(cloud_name=cloud, api_key=key, api_secret=secret, secure=True)


def asset_name(path: str) -> str:
    return slugify(Path(path).stem) or "image"


_cache: dict[str, dict] = {}


def upload(path: str, public_id: str) -> dict | None:
    if public_id in _cache:
        return _cache[public_id]
    # Some old pages linked img/new/x.png when the file actually lives at img/x.png.
    candidates = [path] + ([f"img/{Path(path).name}"] if path != f"img/{Path(path).name}" else [])
    result = None
    for candidate in candidates:
        try:
            result = cloudinary.uploader.upload(
                f"{BASE_RAW}/{quote(candidate)}",
                public_id=public_id,
                overwrite=False,
                resource_type="image",
            )
            break
        except Exception as e:  # report and continue; the summary lists failures
            last_error = e
    if result is None:
        print(f"    FAILED {path}: {last_error}")
        return None
    out = {"secure_url": result["secure_url"], "public_id": result["public_id"]}
    _cache[public_id] = out
    time.sleep(0.2)
    return out


def main() -> None:
    configure()
    failures: list[str] = []

    blogs = json.loads((ROOT / "scripts" / "blogs_raw.json").read_text(encoding="utf-8"))
    print(f"=== {len(blogs)} blog posts ===")
    for blog in blogs:
        n = blog["postNumber"]
        print(f"  #{n} {blog['title'][:60]}")
        blog["featuredImage"] = blog["cloudinaryPublicId"] = None

        if blog.get("featuredImagePath"):
            res = upload(blog["featuredImagePath"], f"base-foundation/blogs/post-{n}-{asset_name(blog['featuredImagePath'])}")
            if res:
                blog["featuredImage"], blog["cloudinaryPublicId"] = res["secure_url"], res["public_id"]
            else:
                failures.append(blog["featuredImagePath"])

        for path in blog.get("inlineImagePaths", []):
            res = upload(path, f"base-foundation/blogs/inline/{asset_name(path)}")
            if res:
                blog["content"] = blog["content"].replace(f'src="{path}"', f'src="{res["secure_url"]}"')
            else:
                failures.append(path)

    (ROOT / "scripts" / "blogs_seeded.json").write_text(json.dumps(blogs, ensure_ascii=False, indent=2), encoding="utf-8")

    gallery = json.loads((ROOT / "scripts" / "gallery_raw.json").read_text(encoding="utf-8"))
    print(f"\n=== {len(gallery)} gallery images ===")
    seeded = []
    for item in gallery:
        res = upload(item["path"], f"base-foundation/gallery/{item['order']:03d}-{asset_name(item['path'])}")
        if not res:
            failures.append(item["path"])
            continue
        seeded.append({
            "legacyOrder": item["order"],
            "imageUrl": res["secure_url"],
            "cloudinaryPublicId": res["public_id"],
            "category": item["category"],
            "caption": item["caption"],
            "order": item["order"],
        })
        print(f"  [{item['order'] + 1}/{len(gallery)}] {item['path']}")

    (ROOT / "scripts" / "gallery_seeded.json").write_text(json.dumps(seeded, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nUploaded {len(_cache)} assets. {len(seeded)}/{len(gallery)} gallery images ready.")
    if failures:
        print(f"{len(failures)} FAILED: {failures}")
        raise SystemExit(1)
    print("Next: python scripts/seed_firebase.py")


if __name__ == "__main__":
    main()
