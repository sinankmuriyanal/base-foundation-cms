import { getAdminDb, isFirebaseAdminConfigured } from "./firebase-admin";
import { DEFAULT_GALLERY_CATEGORIES, FALLBACK_GALLERY_CATEGORY, type GalleryCategory } from "./types";

export const GALLERY_CATEGORIES_COLLECTION = "galleryCategories";

function defaults(): GalleryCategory[] {
  return DEFAULT_GALLERY_CATEGORIES.map((name, order) => ({ id: "", name, order }));
}

/** Categories in display order. The fallback category is always included. */
export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  if (!isFirebaseAdminConfigured()) return defaults();
  const snap = await getAdminDb().collection(GALLERY_CATEGORIES_COLLECTION).get();
  if (snap.empty) return defaults();

  const list = snap.docs
    .map((d) => ({ id: d.id, name: String(d.data().name ?? ""), order: Number(d.data().order ?? 0) }))
    .filter((c) => c.name)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  if (!list.some((c) => c.name === FALLBACK_GALLERY_CATEGORY))
    list.push({ id: "", name: FALLBACK_GALLERY_CATEGORY, order: list.length });
  return list;
}

export async function getGalleryCategoryNames(): Promise<string[]> {
  return (await getGalleryCategories()).map((c) => c.name);
}

export function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
