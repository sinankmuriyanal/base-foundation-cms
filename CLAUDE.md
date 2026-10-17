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
| Public site UI | The **original basefoundation.in template**: `public/legacy/` (styles.min.css, jQuery 2.2.4 + libs.min.js + common.min.js, fonts, layout images) and HTML fragments in `legacy/templates/` rendered server-side with CMS data |
| Admin UI | Tailwind CSS 3.4 — Fraunces + DM Sans; brand green `#1a6b3c`, gold `#f5a623` |
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

### Public — `app/(site)/` (own root layout: legacy CSS + `public/legacy/js/boot.js`, no Tailwind)
Every page wraps its body in `components/legacy/SiteShell.tsx` (template header/footer, `active` menu key) and renders a template from `legacy/templates/` via `renderTemplate()` (`lib/legacy/template.ts`: `{{x}}` escaped, `{{{x}}}` raw HTML). Card/banner markup for CMS data lives in `lib/legacy/partials.ts`. Links are plain `<a>` (full page loads) so the jQuery plugins re-initialise on every page.

| URL | Template | Data |
|---|---|---|
| `/` | `home` | latest 5 posts in the original card column pattern |
| `/blog` (`?category=`) | `blog` | all published posts (excerpt field, else auto) |
| `/blog/[slug]` | `blog-post` | post, real categories + 3 recent posts, share links |
| `/gallery` | `gallery` | Isotope filter + Fancybox; migrated photos keep the old wide tiles (`gallery-wide.json`) |
| `/about`, `/contact` | `about`, `contact` | static; contact form posts to Formspree (mailto fallback) |
| `/programmes`, `/programmes/[slug]` | `programmes` (old Education page), `programme` (old School Visit page) | `lib/programmes.ts` |
| `/join`, `/donate` | `join`, `donate` | built from the contact page markup; donate shows the SBI details from the old site |
| anything else | `not-found.tsx` via `[...missing]` | template 404 |

The templates were imported once from the old repo (rewritten links/assets, fixed tel: links, removed the map-embed spam link, compressed images) and are now the source of truth — edit them directly.

### Admin
- `app/admin/layout.tsx` is the admin root layout (Tailwind `globals.css`, noindex).
- `/admin/login` — signs in with the Firebase client SDK, POSTs the ID token to `/api/auth`, then signs the client out.
- `/admin/(protected)/*` — dashboard, blogs (list/new/[id]), gallery. `layout.tsx` verifies the session server-side and wraps pages in `components/admin/AdminShell.tsx` (fixed left sidebar on desktop, top bar + drawer on mobile). Pages use `AdminPageHeader`; the posts list is `components/admin/BlogTable.tsx` (thumbnails, status tabs, search, category filter).
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
| `lib/site.ts` | Contact details, donation (bank) details, Formspree endpoints |
| `legacy/templates/*.html` | Original site markup with `{{placeholders}}` (header, footer, sprite, one per page) |
| `lib/legacy/*` | Template loader/escaping/Cloudinary URL helper, CMS-data partials, form attributes |
| `lib/programmes.ts` | Programme content |
| `lib/legacy-redirects.ts` | Old static URLs → new routes; `LEGACY_BLOG_REDIRECTS` is **generated** by `scripts/extract_content.py` |
| `lib/validation.ts` | Request body parsing/validation + HTML sanitizing |
| `lib/auth.ts` | `checkAdminSession()` / `getAdminSession()` (session cookie + admin claim) |
| `lib/firebase-admin.ts` | Lazy Admin SDK init; `isFirebaseAdminConfigured()` lets credential-less builds succeed |
| `lib/blogs.ts`, `lib/gallery.ts` | Firestore reads (blogs sorted in memory — no composite index needed) |
| `firestore.rules` + `firebase.json` | Rules: public read of published blogs/gallery/settings; writes only with admin claim |

## Firestore Schema

- `blogs/{id}`: title, slug, category (one of `BLOG_CATEGORIES`), content (sanitized HTML), excerpt (card summary, optional), featuredImage, cloudinaryPublicId, tags[], author, publishedAt (ISO string), published, createdAt, updatedAt. Migrated docs use IDs `legacy-post-N`.
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
- [ ] Confirm the donation bank details (copied from the old contact page) and add a UPI ID / account name if wanted
- [ ] Review migrated posts in admin: approximate publish dates, categories for posts 5/6, add gallery captions
- [ ] Vercel deploy + env vars; then DNS cutover of basefoundation.in, remove `CNAME`/Pages from the old repo, archive `sinankmuriyanal/Base` (confirm first)

---

## Changelog

- **2026-05-18:** Initial build — Next.js 14 CMS with Firebase + Cloudinary, public site + admin panel, migration scripts.
- **2026-10-16:** Upgraded to Next 16/React 19/Tiptap 3 (the Next 14 build had been failing on `next.config.ts`). Replaced raw-ID-token cookie with revocable session cookies gated on an admin claim, added a server-side admin gate, signed Cloudinary uploads, input validation and HTML sanitizing, and fixed the gallery multi-upload and editor bugs. Ported the real old-site content (programmes, join, donate, about, contact) and removed placeholder contact details and unverified stats. Added legacy redirects, sitemap and robots, rewrote the migration scripts (proper parsing, per-post images, idempotent seeding), and added Vitest + Playwright suites.
- **2026-10-16 (later):** Ran the migration against the live Firebase + Cloudinary projects (23 posts, 66 gallery images), granted the admin claim, and deployed Firestore rules. Made gallery photos keyboard-accessible buttons with a labelled, Escape-closable lightbox, and hid empty category filters. The full suite passes with real data (24 unit + 34 e2e), plus a live admin round-trip.
- **2026-10-16 (admin UI):** Redesigned the admin as a sidebar CMS shell, with a dark green nav, gold active marker, signed-in user and logout. The posts list is now a table with featured-image thumbnails, status tabs with counts, search and a category filter, switching to cards on mobile. The dashboard shows stat cards, recent posts with thumbnails, quick actions and a missing-captions prompt. Replaced `AdminNav`.
- **2026-10-17:** Rebuilt the public site on the original basefoundation.in template, so it now looks exactly like the old site. It uses the old CSS, jQuery plugins, header and footer, with server-rendered fragments fed by Firestore and Cloudinary. Added Programmes, Join and Donate in the same style, an `excerpt` field (old listing excerpts backfilled for 21 posts), real share links, a working contact form, the bank details from the old site, and a template 404. Separate root layouts keep Tailwind confined to the admin. Rewrote the e2e suite against the template (41 passing).
