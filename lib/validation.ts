import sanitizeHtml from "sanitize-html";
import { BLOG_CATEGORIES, FALLBACK_GALLERY_CATEGORY } from "./types";
import { slugify } from "./utils";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export interface BlogInput {
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  cloudinaryPublicId: string | null;
  tags: string[];
  author: string | null;
  published: boolean;
}

export interface GalleryInput {
  imageUrl: string;
  cloudinaryPublicId: string;
  category: string;
  caption: string;
}

const CLOUDINARY_URL = /^https:\/\/res\.cloudinary\.com\//;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalStr(value: unknown): string | null {
  const s = str(value);
  return s || null;
}

function oneOf<T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number]): T[number] {
  return allowed.includes(value as T[number]) ? (value as T[number]) : fallback;
}

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h2", "h3", "h4", "figure", "figcaption"]),
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
  });
}

export function parseBlogInput(body: Record<string, unknown>): Result<BlogInput> {
  const title = str(body.title);
  if (!title) return { ok: false, error: "Title required" };
  if (title.length > 200) return { ok: false, error: "Title too long" };

  const slug = slugify(str(body.slug) || title);
  if (!slug) return { ok: false, error: "Slug required" };

  const featuredImage = optionalStr(body.featuredImage);
  if (featuredImage && !CLOUDINARY_URL.test(featuredImage))
    return { ok: false, error: "Featured image must be a Cloudinary URL" };

  const tags = Array.isArray(body.tags)
    ? Array.from(new Set(body.tags.map(str).filter(Boolean))).slice(0, 20)
    : [];

  return {
    ok: true,
    data: {
      title,
      slug,
      category: oneOf(body.category, BLOG_CATEGORIES, "General"),
      content: sanitizeContent(typeof body.content === "string" ? body.content : ""),
      excerpt: str(body.excerpt).replace(/\s+/g, " ").slice(0, 400),
      featuredImage,
      cloudinaryPublicId: featuredImage ? optionalStr(body.cloudinaryPublicId) : null,
      tags,
      author: optionalStr(body.author),
      published: body.published === true,
    },
  };
}

/** `categories` is the current list from Firestore; unknown values fall back to "General". */
export function parseGalleryInput(body: Record<string, unknown>, categories: readonly string[]): Result<GalleryInput> {
  const imageUrl = str(body.imageUrl);
  const cloudinaryPublicId = str(body.cloudinaryPublicId);
  if (!imageUrl || !cloudinaryPublicId)
    return { ok: false, error: "imageUrl and cloudinaryPublicId required" };
  if (!CLOUDINARY_URL.test(imageUrl)) return { ok: false, error: "imageUrl must be a Cloudinary URL" };

  return {
    ok: true,
    data: {
      imageUrl,
      cloudinaryPublicId,
      category: oneOf(body.category, categories, FALLBACK_GALLERY_CATEGORY),
      caption: str(body.caption).slice(0, 300),
    },
  };
}

export function parseGalleryUpdate(body: Record<string, unknown>, categories: readonly string[]): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  if (body.category !== undefined) update.category = oneOf(body.category, categories, FALLBACK_GALLERY_CATEGORY);
  if (body.caption !== undefined) update.caption = str(body.caption).slice(0, 300);
  if (typeof body.order === "number" && Number.isFinite(body.order)) update.order = body.order;
  return update;
}

export function parseCategoryName(value: unknown): Result<string> {
  const name = str(value).replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Category name required" };
  if (name.length > 40) return { ok: false, error: "Category name must be 40 characters or fewer" };
  return { ok: true, data: name };
}
