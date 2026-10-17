"""
Step 3: Seed Firestore with the migrated blogs, gallery and site settings.

Reads:  scripts/blogs_seeded.json, scripts/gallery_seeded.json   (from upload_images.py)
        scripts/serviceAccountKey.json  (Firebase Console -> Project settings -> Service accounts)

Safe to re-run: documents use fixed IDs (legacy-post-N, legacy-gallery-NNN) and existing ones
are skipped, so edits made in the admin panel are never overwritten. Pass --force to overwrite.

Run from project root:
  python scripts/seed_firebase.py [--force]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

ROOT = Path(__file__).resolve().parent.parent
SERVICE_ACCOUNT_PATH = ROOT / "scripts" / "serviceAccountKey.json"


def seed(collection, doc_id: str, data: dict, force: bool) -> bool:
    ref = collection.document(doc_id)
    if not force and ref.get().exists:
        return False
    ref.set({**data, "createdAt": firestore.SERVER_TIMESTAMP, **({"updatedAt": firestore.SERVER_TIMESTAMP} if "title" in data else {})})
    return True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="overwrite documents that already exist")
    args = parser.parse_args()

    firebase_admin.initialize_app(credentials.Certificate(str(SERVICE_ACCOUNT_PATH)))
    db = firestore.client()

    blogs = json.loads((ROOT / "scripts" / "blogs_seeded.json").read_text(encoding="utf-8"))
    created = 0
    for b in blogs:
        created += seed(db.collection("blogs"), f"legacy-post-{b['postNumber']}", {
            "title": b["title"],
            "slug": b["slug"],
            "category": b["category"],
            "content": b["content"],
            "excerpt": b.get("excerpt", ""),
            "featuredImage": b.get("featuredImage"),
            "cloudinaryPublicId": b.get("cloudinaryPublicId"),
            "tags": b.get("tags", []),
            "author": b.get("author"),
            "publishedAt": b.get("publishedAt"),
            "published": b.get("published", True),
        }, args.force)
    print(f"blogs: {created} written, {len(blogs) - created} already existed")

    gallery = json.loads((ROOT / "scripts" / "gallery_seeded.json").read_text(encoding="utf-8"))
    created = 0
    for g in gallery:
        created += seed(db.collection("gallery"), f"legacy-gallery-{g['legacyOrder']:03d}", {
            "imageUrl": g["imageUrl"],
            "cloudinaryPublicId": g["cloudinaryPublicId"],
            "category": g["category"],
            "caption": g["caption"],
            "order": g["order"],
        }, args.force)
    print(f"gallery: {created} written, {len(gallery) - created} already existed")

    db.collection("settings").document("site").set({
        "siteName": "Base Foundation",
        "tagline": "Empowering Rural Lives, Building a Strong Foundation",
        "contactEmail": "basefoundationwb@gmail.com",
        "updatedAt": firestore.SERVER_TIMESTAMP,
    }, merge=True)
    print("settings/site updated")
    print("\nNext: python scripts/set_admin_claim.py <admin email>")


if __name__ == "__main__":
    main()
