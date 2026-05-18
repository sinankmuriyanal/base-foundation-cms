# Base Foundation CMS

NGO website for Base Foundation (West Bengal, India) — rebuilt from a static HTML/CSS/JS site into a Next.js 14 CMS with a full admin panel.

---

## Project Overview

**Old site:** `sinankmuriyanal/Base` — 23 hardcoded blog-post HTML files, 71 gallery images in an `img/` folder. No CMS.

**New site:** Next.js 14 App Router + TypeScript, Firebase Firestore (data), Firebase Auth (admin login), Cloudinary (images), Tiptap rich text editor. Design: Fraunces display serif + DM Sans, deep forest green + gold on warm cream.

**GitHub:** https://github.com/sinankmuriyanal/base-foundation-cms

**Local path:** `C:\Users\hp\OneDrive\Desktop\claude\Base Foundation`

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS — Fraunces (display) + DM Sans (body) |
| Database | Firebase Firestore |
| Auth | Firebase Auth — email/password, single admin user |
| Images | Cloudinary (server delete via `cloudinary` v2, uploads via `next-cloudinary`) |
| Rich text | Tiptap editor (StarterKit + Image + Link) |
| Hosting | Vercel (planned) |

---

## Commands

```bash
npm run dev       # localhost:3000
npm run build     # production build
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript check (currently passing: 0 errors)
```

---

## Route Map

### Public (wrapped in Navbar + Footer via `app/(public)/layout.tsx`)
| URL | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Home — hero, stats, latest 3 posts, programme links |
| `/blog` | `app/(public)/blog/page.tsx` | Blog listing — category filter + search (client component) |
| `/blog/[slug]` | `app/(public)/blog/[slug]/page.tsx` | Blog detail — SSR with featured image hero |
| `/gallery` | `app/(public)/gallery/page.tsx` | Masonry grid, 4-category filter, lightbox |
| `/about` | `app/(public)/about/page.tsx` | Static — origin story, values |
| `/contact` | `app/(public)/contact/page.tsx` | Formspree form (replace action URL with real endpoint) |

### Admin (auth-gated via `app/admin/layout.tsx` → `AdminGuard` component)
| URL | File | Notes |
|---|---|---|
| `/admin/login` | `app/admin/login/page.tsx` | Firebase email/password login |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | Blog count, gallery count, recent posts table |
| `/admin/blogs` | `app/admin/blogs/page.tsx` | All posts — published/draft badge, edit/delete |
| `/admin/blogs/new` | `app/admin/blogs/new/page.tsx` | Create post (Tiptap + Cloudinary upload) |
| `/admin/blogs/[id]` | `app/admin/blogs/[id]/page.tsx` | Edit post |
| `/admin/gallery` | `app/admin/gallery/page.tsx` | Upload images, edit category/caption, delete |

### API Routes (all auth-protected via Firebase ID token cookie)
| Method | URL | Purpose |
|---|---|---|
| POST | `/api/auth` | Set session cookie from Firebase ID token |
| DELETE | `/api/auth` | Clear session cookie (logout) |
| POST | `/api/admin/blogs` | Create blog |
| PUT | `/api/admin/blogs/[id]` | Update blog |
| DELETE | `/api/admin/blogs/[id]` | Delete blog + Cloudinary image |
| POST | `/api/admin/gallery` | Add gallery image |
| PATCH | `/api/admin/gallery/[id]` | Update category/caption |
| DELETE | `/api/admin/gallery/[id]` | Delete gallery image + Cloudinary asset |

---

## Key Files

| File | Purpose |
|---|---|
| `lib/types.ts` | `Blog`, `GalleryImage`, `BLOG_CATEGORIES`, `GALLERY_CATEGORIES` |
| `lib/firebase.ts` | Firebase client SDK init (browser) |
| `lib/firebase-admin.ts` | Firebase Admin SDK init (server-side SSR + API routes) |
| `lib/cloudinary.ts` | Cloudinary server config + `deleteCloudinaryImage()` |
| `lib/auth.ts` | `getAdminSession()` — verifies ID token from cookie |
| `lib/blogs.ts` | `getAllBlogs()`, `getPublishedBlogs()`, `getBlogBySlug()`, `getBlogById()` |
| `lib/gallery.ts` | `getAllGalleryImages()` |
| `lib/utils.ts` | `cn()`, `formatDate()`, `slugify()` |
| `components/AdminGuard.tsx` | Client: checks Firebase auth state, redirects to `/admin/login` |
| `components/AdminNav.tsx` | Admin top bar with logout |
| `components/BlogEditor.tsx` | Create/edit form — title, slug, category, Tiptap, Cloudinary upload, tags, publish toggle |
| `components/RichTextEditor.tsx` | Tiptap wrapper with toolbar |
| `components/BlogListClient.tsx` | Client: blog listing with category filter + search |
| `components/GalleryGrid.tsx` | Client: masonry gallery with category filter + lightbox |
| `components/GalleryManager.tsx` | Client: admin gallery grid with inline edit + bulk upload |
| `firestore.rules` | Security rules — public read for published blogs + gallery; auth required to write |

---

## Firestore Schema

### `blogs` collection
```
title: string
slug: string          ← auto-generated from title via slugify()
category: string      ← one of BLOG_CATEGORIES
content: string       ← HTML from Tiptap
featuredImage: string | null    ← Cloudinary secure_url
cloudinaryPublicId: string | null
tags: string[]
author: string | null
publishedAt: string | null      ← ISO date string
published: boolean
createdAt: Timestamp
updatedAt: Timestamp
```

### `gallery` collection
```
imageUrl: string              ← Cloudinary secure_url
cloudinaryPublicId: string
category: string              ← one of GALLERY_CATEGORIES
caption: string
order: number
createdAt: Timestamp
```

### `settings/site` document
```
siteName: string
tagline: string
contactEmail: string
updatedAt: Timestamp
```

---

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

```bash
# Firebase client (safe for browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server only — NEVER expose to browser)
FIREBASE_SERVICE_ACCOUNT=    ← full JSON string of serviceAccountKey.json

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Session cookie
AUTH_COOKIE_NAME=base_admin_session
AUTH_COOKIE_SECRET=          ← random 32-char string
```

---

## Data Migration Scripts (one-time)

All scripts in `scripts/`. Run from project root.

```bash
pip install -r scripts/requirements.txt

# Step 1: Extract all 23 blog posts from old GitHub repo
python scripts/extract_blogs.py
# → writes scripts/blogs_raw.json

# Step 2: Upload images to Cloudinary
# Set env vars first: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
python scripts/upload_images.py
# → writes scripts/blogs_seeded.json + scripts/gallery_seeded.json

# Step 3: Seed Firestore
# Place Firebase service account key at scripts/serviceAccountKey.json first
python scripts/seed_firebase.py
# → writes 23 blog docs + 71 gallery docs + settings/site doc to Firestore
```

---

## Current Session Status (2026-05-18)

### Completed ✓
- [x] GitHub repo created: `sinankmuriyanal/base-foundation-cms`
- [x] Next.js 14 project scaffolded — TypeScript, Tailwind, all deps installed
- [x] Full public website: Home, Blog listing, Blog detail, Gallery, About, Contact
- [x] Admin panel: Login, Dashboard, Blog CRUD, Gallery CRUD
- [x] All API routes with Firebase Auth token verification
- [x] Firebase security rules written (`firestore.rules`)
- [x] Python migration scripts: extract_blogs.py, upload_images.py, seed_firebase.py
- [x] TypeScript: 0 errors (`npx tsc --noEmit`)
- [x] Initial commit pushed to GitHub

### Pending — Next Session
- [ ] **Firebase setup** (manual, user): Create Firebase project → enable Firestore + Auth → create admin user → download service account key
- [ ] **Cloudinary setup** (manual, user): Create account → create upload presets `blog_images` and `gallery_images`
- [ ] **Fill `.env.local`** from `.env.local.example`
- [ ] **Run migration scripts** in order: extract_blogs → upload_images → seed_firebase
- [ ] **Test locally** `npm run dev` — verify blog listing, gallery, admin login work end-to-end
- [ ] **Update contact form** — replace Formspree action URL in `app/(public)/contact/page.tsx` with real endpoint
- [ ] **Deploy to Vercel** — connect repo, add all env vars from `.env.local`
- [ ] **Apply Firestore security rules** — paste `firestore.rules` into Firebase Console → Firestore → Rules
- [ ] **Test admin panel** — create post, upload gallery image, delete, publish toggle
- [ ] **Verify Cloudinary cleanup** — delete a blog post and confirm image is removed from Cloudinary

### Known Items to Fix in Next Session
- `app/(public)/contact/page.tsx` line 15: Replace `https://formspree.io/f/placeholder` with actual Formspree endpoint (free at formspree.io)
- After running migration, review blog content quality — the HTML extracted from old site may have extra nav/footer markup inside `content` field; clean up via admin editor if needed
- Gallery images in the old site have identical captions ("He Need Your Protection") — update captions via admin panel after migration

---

## Changelog

- **2026-05-18:** Initial build — Next.js 14 CMS with Firebase + Cloudinary, public site + full admin panel, Python migration scripts for 23 blogs + 71 gallery images. TypeScript passing. Pushed to GitHub.

- [2026-05-18] docs: update CLAUDE.md with full project state and pending tasks for next session