import { adminDb } from "./firebase-admin";
import type { Blog } from "./types";
import { Timestamp } from "firebase-admin/firestore";

function toISO(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === "string") return val;
  return new Date().toISOString();
}

function docToPost(id: string, data: FirebaseFirestore.DocumentData): Blog {
  return {
    id,
    title: data.title ?? "",
    slug: data.slug ?? id,
    category: data.category ?? "General",
    content: data.content ?? "",
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

export async function getAllBlogs(): Promise<Blog[]> {
  const snap = await adminDb
    .collection("blogs")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => docToPost(d.id, d.data()));
}

export async function getPublishedBlogs(): Promise<Blog[]> {
  const snap = await adminDb
    .collection("blogs")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => docToPost(d.id, d.data()));
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const snap = await adminDb
    .collection("blogs")
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return docToPost(doc.id, doc.data());
}

export async function getBlogById(id: string): Promise<Blog | null> {
  const doc = await adminDb.collection("blogs").doc(id).get();
  if (!doc.exists) return null;
  return docToPost(doc.id, doc.data()!);
}
