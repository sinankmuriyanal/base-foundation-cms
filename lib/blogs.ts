import { Timestamp, type DocumentData } from "firebase-admin/firestore";
import { getAdminDb, isFirebaseAdminConfigured } from "./firebase-admin";
import type { Blog } from "./types";
import { cached } from "./cache";

function toISO(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === "string") return val;
  return new Date().toISOString();
}

function docToPost(id: string, data: DocumentData): Blog {
  return {
    id,
    title: data.title ?? "",
    slug: data.slug ?? id,
    category: data.category ?? "General",
    content: data.content ?? "",
    excerpt: data.excerpt ?? "",
    featuredImage: data.featuredImage ?? null,
    cloudinaryPublicId: data.cloudinaryPublicId ?? null,
    tags: data.tags ?? [],
    author: data.author ?? null,
    publishedAt: data.publishedAt ?? null,
    published: data.published ?? false,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  };
}

// Newest first by publish date; drafts (no publishedAt) fall back to createdAt.
function byDateDesc(a: Blog, b: Blog): number {
  return (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
}

export async function getAllBlogs(): Promise<Blog[]> {
  const snap = await getAdminDb().collection("blogs").get();
  return snap.docs.map((d) => docToPost(d.id, d.data())).sort(byDateDesc);
}

async function fetchPublishedBlogs(): Promise<Blog[]> {
  if (!isFirebaseAdminConfigured()) return [];
  const snap = await getAdminDb().collection("blogs").where("published", "==", true).get();
  return snap.docs.map((d) => docToPost(d.id, d.data())).sort(byDateDesc);
}

async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  if (!isFirebaseAdminConfigured()) return null;
  const snap = await getAdminDb()
    .collection("blogs")
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return docToPost(doc.id, doc.data());
}

export const getPublishedBlogs = cached(fetchPublishedBlogs, "published-blogs");
export const getBlogBySlug = cached(fetchBlogBySlug, "blog-by-slug");

export async function getBlogById(id: string): Promise<Blog | null> {
  const doc = await getAdminDb().collection("blogs").doc(id).get();
  if (!doc.exists) return null;
  return docToPost(doc.id, doc.data()!);
}

export async function isSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const snap = await getAdminDb().collection("blogs").where("slug", "==", slug).limit(2).get();
  return snap.docs.some((d) => d.id !== exceptId);
}
