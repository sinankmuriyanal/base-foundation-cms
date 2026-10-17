import { Timestamp, type DocumentData } from "firebase-admin/firestore";
import { getAdminDb, isFirebaseAdminConfigured } from "./firebase-admin";
import type { GalleryImage } from "./types";
import { cached } from "./cache";

function toISO(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === "string") return val;
  return new Date().toISOString();
}

function docToImage(id: string, data: DocumentData): GalleryImage {
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

async function fetchGalleryImages(): Promise<GalleryImage[]> {
  if (!isFirebaseAdminConfigured()) return [];
  const snap = await getAdminDb().collection("gallery").orderBy("order", "asc").get();
  return snap.docs.map((d) => docToImage(d.id, d.data()));
}

export const getAllGalleryImages = cached(fetchGalleryImages, "gallery-images");
