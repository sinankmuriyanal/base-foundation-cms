"""
Phase 1b: Download all images from GitHub and upload to Cloudinary.

Reads:  scripts/blogs_raw.json
Writes: scripts/blogs_seeded.json   (blogs with Cloudinary URLs)
        scripts/gallery_seeded.json  (gallery with Cloudinary URLs)

Setup before running:
  export CLOUDINARY_CLOUD_NAME=your_cloud_name
  export CLOUDINARY_API_KEY=your_api_key
  export CLOUDINARY_API_SECRET=your_api_secret

Run from project root:
  python scripts/upload_images.py
"""

import json
import os
import time
import requests
import cloudinary
import cloudinary.uploader

BASE_RAW = "https://raw.githubusercontent.com/sinankmuriyanal/Base/main"

CATEGORY_LABELS = {
    "1": "Drawing Competition",
    "2": "Motivation Class",
    "3": "Logo Revealing",
    "4": "Spoken English Course",
}

# All 71 gallery images scraped from gallery.html with their category assignments
GALLERY_IMAGES = [
    ("img/blog_11.jpg", "1"), ("img/blog_11B.jpg", "1"), ("img/blog_11D.jpg", "1"),
    ("img/blog_11E.jpg", "1"), ("img/blog_11I.jpg", "2"), ("img/blog_11L.jpg", "2"),
    ("img/blog_11M.jpg", "1"), ("img/blog_22B.jpg", "1"), ("img/blog_12B.jpg", "1"),
    ("img/blog_7E.jpg", "1"), ("img/blog_10B.jpg", "2"), ("img/blog_15G.jpg", "2"),
    ("img/blog_20D.jpg", "1"), ("img/blog_20C.jpg", "1"), ("img/blog_13H.jpg", "1"),
    ("img/blog_13C.jpg", "1"), ("img/blog_17J.jpg", "2"), ("img/blog_18.jpg", "2"),
    ("img/blog_11H.jpg", "1"), ("img/blog_12D.jpg", "1"), ("img/blog_15E.jpg", "1"),
    ("img/blog_19B.jpg", "2"), ("img/blog_12G.jpg", "2"), ("img/blog_7D.jpg", "1"),
    ("img/blog_7A.jpg", "1"), ("img/blog_11F.jpg", "1"), ("img/blog_11C.jpg", "1"),
    ("img/blog_11G.jpg", "2"), ("img/blog_11K.jpg", "2"), ("img/blog_12F.jpg", "1"),
    ("img/blog_15F.jpg", "1"), ("img/blog_16E.jpg", "2"), ("img/blog_19C.jpg", "2"),
    ("img/new/blog5.jpg", "1"), ("img/new/blog5-3.jpg", "1"),
    ("img/drawing1.jpg", "1"), ("img/drawing2.jpg", "1"),
    ("img/motivation class.jpg", "2"), ("img/motivation 2.jpg", "2"),
    ("img/logoRevealing.jfif", "3"),
    ("img/english3.JPG", "4"), ("img/slider img.JPG", "4"),
    ("img/IMG_1131.jpg", "1"), ("img/IMG_0973.jpg", "1"),
    ("img/IMG_1137.jpg", "2"), ("img/IMG_1142.jpg", "2"),
    ("img/WhatsApp Image 2022-11-21 at 6.50.45 PM.jpeg", "3"),
    ("img/Lambapara Primary School (7).jpg", "4"),
    ("img/IMG_9608.jpg", "4"), ("img/IMG_0997.jpg", "4"),
    ("img/new/Madhyamik Sahayok Class (1).jpg", "1"),
    ("img/new/Scholarship Distribution (4).jpg", "1"),
    ("img/new/Scholarship Distribution (1).jpg", "2"),
    ("img/new/Motivation Class at RPH (3).jpg", "2"),
    ("img/new/Madhyamik Sahayok launching Event (1).jpg", "3"),
    ("img/new/Scholarship Distribution (3).jpg", "4"),
    ("img/new/Madhyamik Sahayok Class (2).jpg", "4"),
    ("img/new/Motivation Class at RPH (1).jpg", "1"),
    ("img/new/Motivation Class at RPH (2).jpg", "1"),
    ("img/drawing4.jpg", "4"), ("img/drawing5.jpg", "4"),
    ("img/f3_ig_4.png", "1"), ("img/f3_ig_5.png", "1"),
    ("img/f3_ig_1.png", "2"), ("img/f3_ig_7.png", "2"),
    ("img/new/team1.jpg", "4"), ("img/new/team3.jpg", "4"),
]


def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
        api_key=os.environ["CLOUDINARY_API_KEY"],
        api_secret=os.environ["CLOUDINARY_API_SECRET"],
        secure=True,
    )


def upload_from_url(github_path: str, folder: str, public_id: str) -> dict | None:
    url = f"{BASE_RAW}/{github_path}"
    try:
        result = cloudinary.uploader.upload(
            url,
            folder=folder,
            public_id=public_id,
            overwrite=False,
            resource_type="image",
        )
        return {"secure_url": result["secure_url"], "public_id": result["public_id"]}
    except Exception as e:
        print(f"    CLOUDINARY ERROR for {github_path}: {e}")
        return None


def make_public_id(path: str) -> str:
    # strip leading img/ or img/new/, replace spaces and special chars
    name = path.replace("img/new/", "").replace("img/", "")
    name = name.rsplit(".", 1)[0]  # remove extension
    name = name.replace(" ", "_").replace("(", "").replace(")", "")
    return name


def main():
    configure_cloudinary()

    # --- Blog featured images ---
    print("=== Uploading blog featured images ===")
    with open("scripts/blogs_raw.json", encoding="utf-8") as f:
        blogs = json.load(f)

    seen_paths: set[str] = set()
    path_to_cloudinary: dict[str, dict] = {}

    for blog in blogs:
        path = blog.get("featuredImagePath")
        if not path or path in seen_paths:
            continue
        seen_paths.add(path)
        public_id = make_public_id(path)
        print(f"  Uploading {path} ...")
        result = upload_from_url(path, "base-foundation/blogs", public_id)
        if result:
            path_to_cloudinary[path] = result
            print(f"    OK -> {result['secure_url'][:60]}...")
        time.sleep(0.5)

    for blog in blogs:
        path = blog.get("featuredImagePath")
        if path and path in path_to_cloudinary:
            blog["featuredImage"] = path_to_cloudinary[path]["secure_url"]
            blog["cloudinaryPublicId"] = path_to_cloudinary[path]["public_id"]
        else:
            blog["featuredImage"] = None
            blog["cloudinaryPublicId"] = None

    with open("scripts/blogs_seeded.json", "w", encoding="utf-8") as f:
        json.dump(blogs, f, ensure_ascii=False, indent=2)
    print(f"Blog images done. {len(path_to_cloudinary)} unique images uploaded.")

    # --- Gallery images ---
    print("\n=== Uploading gallery images ===")
    gallery_items = []
    seen_gallery: set[str] = set()

    for idx, (path, cat_num) in enumerate(GALLERY_IMAGES):
        if path in seen_gallery:
            continue
        seen_gallery.add(path)
        public_id = make_public_id(path)
        print(f"  [{idx+1}/{len(GALLERY_IMAGES)}] {path} ...")
        result = upload_from_url(path, "base-foundation/gallery", public_id)
        if result:
            gallery_items.append({
                "imageUrl": result["secure_url"],
                "cloudinaryPublicId": result["public_id"],
                "category": CATEGORY_LABELS.get(cat_num, "General"),
                "caption": "",
                "order": idx,
            })
            print(f"    OK")
        time.sleep(0.5)

    with open("scripts/gallery_seeded.json", "w", encoding="utf-8") as f:
        json.dump(gallery_items, f, ensure_ascii=False, indent=2)
    print(f"\nGallery done. {len(gallery_items)} images uploaded.")
    print("\nNext step: run scripts/seed_firebase.py")


if __name__ == "__main__":
    main()
