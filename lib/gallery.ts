import { adminDb } from "./firebase-admin";
import type { GalleryImage } from "./types";
import { Timestamp } from "firebase-admin/firestore";

function toISO(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === "string") return val;
  return new Date().toISOString();
}

function docToImage(id: string, data: FirebaseFirestore.DocumentData): GalleryImage {
  return {
    id,
    imageUrl: data.imageUrl ?? "",
    cloudinaryPublicId: data.cloudinaryPublicId ?? "",
    category: data.category ?? "General",
    caption: data.caption ?? "",
    order: data.order ?? 0,
    createdAt: toISO(data.createdAt),
  };
}

export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  const snap = await adminDb
    .collection("gallery")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((d) => docToImage(d.id, d.data()));
}
