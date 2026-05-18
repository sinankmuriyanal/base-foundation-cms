"""
Phase 1c: Seed Firestore with blog and gallery data.

Reads:  scripts/blogs_seeded.json
        scripts/gallery_seeded.json

Setup before running:
  Place your Firebase service account key at: scripts/serviceAccountKey.json
  (Download from Firebase Console → Project Settings → Service Accounts)

Run from project root:
  python scripts/seed_firebase.py
"""

import json
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

SERVICE_ACCOUNT_PATH = "scripts/serviceAccountKey.json"


def init_firebase():
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
    return firestore.client()


def seed_blogs(db, blogs: list[dict]):
    print(f"Seeding {len(blogs)} blogs...")
    collection = db.collection("blogs")
    for blog in blogs:
        doc_data = {
            "title": blog["title"],
            "slug": blog["slug"],
            "category": blog["category"],
            "content": blog["content"],
            "featuredImage": blog.get("featuredImage"),
            "cloudinaryPublicId": blog.get("cloudinaryPublicId"),
            "tags": blog.get("tags", []),
            "author": blog.get("author"),
            "publishedAt": blog.get("publishedAt"),
            "published": blog.get("published", True),
            "createdAt": SERVER_TIMESTAMP,
            "updatedAt": SERVER_TIMESTAMP,
        }
        ref = collection.add(doc_data)
        print(f"  [{blog['category']}] {blog['title'][:60]}")
    print(f"  -> {len(blogs)} blog docs created.")


def seed_gallery(db, images: list[dict]):
    print(f"\nSeeding {len(images)} gallery images...")
    collection = db.collection("gallery")
    for img in images:
        doc_data = {
            "imageUrl": img["imageUrl"],
            "cloudinaryPublicId": img["cloudinaryPublicId"],
            "category": img["category"],
            "caption": img.get("caption", ""),
            "order": img.get("order", 0),
            "createdAt": SERVER_TIMESTAMP,
        }
        collection.add(doc_data)
    print(f"  -> {len(images)} gallery docs created.")


def seed_settings(db):
    print("\nSeeding settings...")
    db.collection("settings").document("site").set({
        "siteName": "Base Foundation",
        "tagline": "Empowering marginalized students through education",
        "contactEmail": "contact@basefoundation.org",
        "updatedAt": SERVER_TIMESTAMP,
    })
    print("  -> settings/site created.")


def main():
    db = init_firebase()

    with open("scripts/blogs_seeded.json", encoding="utf-8") as f:
        blogs = json.load(f)
    with open("scripts/gallery_seeded.json", encoding="utf-8") as f:
        gallery = json.load(f)

    seed_blogs(db, blogs)
    seed_gallery(db, gallery)
    seed_settings(db)

    print("\nAll done! Check your Firestore console.")


if __name__ == "__main__":
    main()
