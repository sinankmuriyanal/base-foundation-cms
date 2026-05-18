# Base Foundation CMS

NGO website for Base Foundation (West Bengal, India) with a full admin panel.

## Stack
- **Framework**: Next.js 14+ App Router + TypeScript
- **Styling**: Tailwind CSS (Fraunces display font + DM Sans body)
- **Database**: Firebase Firestore (blogs + gallery collections)
- **Auth**: Firebase Auth (email/password, single admin)
- **Images**: Cloudinary (blog featured images + gallery)
- **Rich text**: Tiptap editor
- **Deployment**: Vercel

## Environment variables
Copy `.env.local.example` to `.env.local` and fill in:
- Firebase client config (`NEXT_PUBLIC_FIREBASE_*`)
- Firebase Admin service account (`FIREBASE_SERVICE_ACCOUNT` as JSON string)
- Cloudinary credentials (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)

## Commands
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
```

## Data migration (one-time)
```bash
cd scripts
pip install -r requirements.txt

# 1. Extract blogs from old GitHub repo
python extract_blogs.py

# 2. Upload all images to Cloudinary
export CLOUDINARY_CLOUD_NAME=...
export CLOUDINARY_API_KEY=...
export CLOUDINARY_API_SECRET=...
python upload_images.py

# 3. Seed Firestore (place serviceAccountKey.json in scripts/)
python seed_firebase.py
```

## Routes
### Public
- `/` — Home
- `/blog` — Blog listing (with category filter + search)
- `/blog/[slug]` — Blog detail
- `/gallery` — Gallery with masonry grid + lightbox
- `/about` — About page
- `/contact` — Contact form

### Admin (requires login)
- `/login` — Admin login
- `/dashboard` — Stats overview
- `/blogs` — Blog list with publish/draft toggle
- `/blogs/new` — Create blog post
- `/blogs/[id]` — Edit blog post
- `/gallery` — Gallery manager (upload, categorize, delete)

## Known setup steps before first run
1. Delete `app/(public)/page.tsx` — it conflicts with `app/page.tsx` (home is at `app/page.tsx`)
2. Create Firebase project, enable Firestore + Auth
3. Create Cloudinary account, add upload presets: `blog_images` and `gallery_images`
4. Fill in `.env.local`
5. Run migration scripts to seed data
6. Deploy to Vercel

## Firestore schema
### `blogs` collection
title, slug, category, content (HTML), featuredImage, cloudinaryPublicId, tags[], author, publishedAt, published, createdAt, updatedAt

### `gallery` collection
imageUrl, cloudinaryPublicId, category, caption, order, createdAt

### `settings/site` document
siteName, tagline, contactEmail, updatedAt

## Changelog
- 2026-05-18: Initial build — Next.js 14 CMS with Firebase + Cloudinary, public site + full admin panel, Python migration scripts for 23 blogs + 71 gallery images

- [2026-05-18] init: Base Foundation CMS — Next.js 14 + Firebase + Cloudinary