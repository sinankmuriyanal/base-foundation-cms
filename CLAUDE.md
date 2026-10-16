# Base Foundation CMS

NGO website + CMS for Base Foundation (Bhimpur, Paikar, Birbhum, West Bengal). Replaces the static GitHub Pages site in `sinankmuriyanal/Base` (served at basefoundation.in).

- **GitHub:** https://github.com/sinankmuriyanal/base-foundation-cms (branch `master`, commit directly — no PR workflow)
- **Local path:** `C:\Users\WINDOWS 11 PRO\Desktop\sinan\Base`
- **Push as `sinankmuriyanal`:** the default active gh account (`prikeralam`) is read-only here. Use
  `gh auth switch -u sinankmuriyanal; git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin master; gh auth switch -u prikeralam`
- No `Co-Authored-By` trailers (Vercel Hobby blocks deploys with them).

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router + React 19 + TypeScript (Turbopack) |
| Styling | Tailwind CSS 3.4 — Fraunces (display) + DM Sans (body); brand green `#1a6b3c`, gold `#f5a623`, cream `#fdf8f0` |
| Database | Firebase Firestore (Admin SDK only — the browser never reads/writes Firestore) |
| Auth | Firebase Auth email/password → server **session cookie**; `admin: true` custom claim required |
| Images | Cloudinary — signed uploads via `next-cloudinary` widget, server deletes via `cloudinary` v2 |
| Rich text | Tiptap 3 (StarterKit incl. Link + Image); HTML sanitized server-side with `sanitize-html` |
| Forms | Formspree (contact + join), endpoints via env |
| Tests | Vitest (unit, `tests/unit`) + Playwright (e2e smoke, `tests/e2e`, desktop + mobile) |
| Hosting | Vercel (planned) |

## Commands

```bash
npm run dev         # localhost:3000
npm run build       # production build (works without credentials: public data pages render empty)
npm run lint        # ESLint 10 flat config
npm run typecheck   # tsc --noEmit
npm test            # Vitest unit tests
npm run test:e2e    # Playwright — needs `npm run build` first; starts `next start` on :3100
```

---

## Route Map

### Public (`app/(public)/layout.tsx` adds Navbar + Footer; `app/page.tsx` adds them itself)
| URL | Notes |
|---|---|
| `/` | Hero, live stats (post count, programme count), latest 3 posts, programme links |
| `/programmes`, `/programmes/[slug]` | Static data in `lib/programmes.ts` (copy from old site); detail shows related posts by `blogCategory` |
| `/blog`, `/blog/[slug]` | Firestore; category filter via `?category=` + client search |
| `/gallery` | Masonry + category filter + lightbox |
| `/about` | Real mission, vision, team |
| `/join` | Volunteership / Internship forms (`NEXT_PUBLIC_FORMSPREE_JOIN`) |
| `/donate` | Reads `DONATION` in `lib/site.ts` — shows contact fallback until bank/UPI details are filled in |
| `/contact` | Formspree (`NEXT_PUBLIC_FORMSPREE_CONTACT`) + real contact details |
| `/sitemap.xml`, `/robots.txt` | `app/sitemap.ts`, `app/robots.ts` |

### Admin
- `/admin/login` — signs in with the Firebase client SDK, POSTs the ID token to `/api/auth`, then signs the client out.
- `/admin/(protected)/*` — dashboard, blogs (list/new/[id]), gallery. `layout.tsx` verifies the session server-side.
- `proxy.ts` — optimistic redirect to login when the cookie is missing (not a security boundary).

### API (all admin routes go through `requireAdmin` in `lib/admin-api.ts`: 401 no/invalid session, 403 no admin claim)
| Method | URL | Purpose |
|---|---|---|
| POST / DELETE | `/api/auth` | Create session cookie (admin + recent sign-in only) / revoke sessions + clear cookie |
| POST | `/api/admin/blogs` | Create (409 on duplicate slug) |
| PUT / DELETE | `/api/admin/blogs/[id]` | Update (keeps original `publishedAt`, deletes replaced Cloudinary image) / delete + image |
| POST | `/api/admin/gallery` | Add image (appended after highest `order`) |
| PATCH / DELETE | `/api/admin/gallery/[id]` | Update category/caption/order / delete + Cloudinary asset |
| POST | `/api/admin/cloudinary-sign` | Signs upload-widget params |

Mutations call `revalidatePath` so ISR pages update immediately.

## Key Files

| File | Purpose |
|---|---|
| `lib/site.ts` | Contact details, nav links, donation details, Formspree endpoints — single source for footer/contact/donate |
| `lib/programmes.ts` | Programme content |
| `lib/legacy-redirects.ts` | Old static URLs → new routes; `LEGACY_BLOG_REDIRECTS` is **generated** by `scripts/extract_content.py` |
| `lib/validation.ts` | Request body parsing/validation + HTML sanitizing |
| `lib/auth.ts` | `checkAdminSession()` / `getAdminSession()` (session cookie + admin claim) |
| `lib/firebase-admin.ts` | Lazy Admin SDK init; `isFirebaseAdminConfigured()` lets credential-less builds succeed |
| `lib/blogs.ts`, `lib/gallery.ts` | Firestore reads (blogs sorted in memory — no composite index needed) |
| `firestore.rules` + `firebase.json` | Rules: public read of published blogs/gallery/settings; writes only with admin claim |

## Firestore Schema

- `blogs/{id}`: title, slug, category (one of `BLOG_CATEGORIES`), content (sanitized HTML), featuredImage, cloudinaryPublicId, tags[], author, publishedAt (ISO string), published, createdAt, updatedAt. Migrated docs use IDs `legacy-post-N`.
- `gallery/{id}`: imageUrl, cloudinaryPublicId, category (one of `GALLERY_CATEGORIES`), caption, order, createdAt. Migrated: `legacy-gallery-NNN`.
- `settings/site`: siteName, tagline, contactEmail, updatedAt.

## Environment Variables

See `.env.local.example`: Firebase client config (`NEXT_PUBLIC_FIREBASE_*`), `FIREBASE_SERVICE_ACCOUNT` (full JSON string, server only), `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_FORMSPREE_CONTACT`, `NEXT_PUBLIC_FORMSPREE_JOIN`, optional `AUTH_COOKIE_NAME`.

---

## Content Migration (scripts/, Python venv)

```bash
python -m venv .venv && .venv\Scripts\pip install -r scripts/requirements.txt
.venv\Scripts\python scripts/extract_content.py   # no creds; writes blogs_raw.json, gallery_raw.json, regenerates lib/legacy-redirects.ts
.venv\Scripts\python scripts/upload_images.py     # needs Cloudinary keys in .env.local
.venv\Scripts\python scripts/seed_firebase.py     # needs scripts/serviceAccountKey.json; idempotent, --force to overwrite
.venv\Scripts\python scripts/set_admin_claim.py <admin email>
firebase deploy --only firestore:rules
```

Extraction notes: categories come from `blog.html` badges (posts 5 and 6 aren't listed there; set by content in `CATEGORY_OVERRIDES`). The old pages have no dates, so `publishedAt` = first commit of each `blog-postN.html` in the old repo (+N seconds to keep order) — approximate; correct in admin if needed. Template tags (#Donate, #Poor…) and the placeholder caption "He Need Your Protection" are dropped.

---

## Status (2026-10-16)

### Done
- Next 16 / React 19 upgrade; build, lint, typecheck, 24 unit + 32 e2e tests passing
- Auth hardening (session cookies, admin claim, server gate, signed uploads, sanitized HTML, validation)
- Real content ported: programmes (8), join, donate, about, contact; placeholder email/claims removed
- Legacy URL redirects (all 23 posts mapped), sitemap, robots
- Migration scripts rewritten and run

### Live data (Firebase project `base-cms-e3bfd`, Cloudinary cloud in `.env.local`)
- Firestore seeded: 23 posts (`legacy-post-N`), 66 gallery images (`legacy-gallery-NNN`; `img/blog_10B.jpg` never existed in the old repo), `settings/site`
- Admin: sinankmuriyanal@gmail.com has the `admin` claim; Firestore rules deployed via the Rules API (public read 200, anonymous write 403 verified)
- Verified end-to-end against live services: session login, dashboard, signed Cloudinary upload, create/publish/delete post, Cloudinary cleanup, logout, forged-cookie redirect

### Pending (needs the owner)
- [ ] Try the admin login form in a browser (only the server path was tested; password not available to Claude)
- [ ] Formspree endpoints for contact + join
- [ ] Donation bank/UPI details → `DONATION` in `lib/site.ts`
- [ ] Review migrated posts in admin: approximate publish dates, categories for posts 5/6, add gallery captions
- [ ] Vercel deploy + env vars; then DNS cutover of basefoundation.in, remove `CNAME`/Pages from the old repo, archive `sinankmuriyanal/Base` (confirm first)

---

## Changelog

- **2026-05-18:** Initial build — Next.js 14 CMS with Firebase + Cloudinary, public site + admin panel, migration scripts.
- **2026-10-16:** Upgraded to Next 16/React 19/Tiptap 3 (the Next 14 build had been failing on `next.config.ts`). Replaced raw-ID-token cookie with revocable session cookies gated on an admin claim, added a server-side admin gate, signed Cloudinary uploads, input validation and HTML sanitizing, and fixed the gallery multi-upload and editor bugs. Ported the real old-site content (programmes, join, donate, about, contact) and removed placeholder contact details and unverified stats. Added legacy redirects, sitemap and robots, rewrote the migration scripts (proper parsing, per-post images, idempotent seeding), and added Vitest + Playwright suites.
- **2026-10-16 (later):** Ran the migration against the live Firebase + Cloudinary projects (23 posts, 66 gallery images), granted the admin claim, and deployed Firestore rules. Made gallery photos keyboard-accessible buttons with a labelled, Escape-closable lightbox, and hid empty category filters. The full suite passes with real data (24 unit + 34 e2e), plus a live admin round-trip.
