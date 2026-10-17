import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase-admin";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { parseCategoryName } from "@/lib/validation";
import { FALLBACK_GALLERY_CATEGORY } from "@/lib/types";
import { GALLERY_CATEGORIES_COLLECTION, getGalleryCategories, sameName } from "@/lib/gallery-categories";

type Ctx = { params: Promise<{ id: string }> };

/** Moves every photo from one category name to another. Returns how many were updated. */
async function moveImages(from: string, to: string): Promise<number> {
  const snap = await getAdminDb().collection("gallery").where("category", "==", from).get();
  await Promise.all(snap.docs.map((d) => getAdminDb().collection("gallery").doc(d.id).update({ category: to })));
  return snap.docs.length;
}

async function loadCategory(id: string) {
  const ref = getAdminDb().collection(GALLERY_CATEGORIES_COLLECTION).doc(id);
  const doc = await ref.get();
  return doc.exists ? { ref, name: String(doc.data()!.name ?? "") } : null;
}

// PATCH /api/admin/gallery-categories/[id] — rename (photos follow the new name)
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  const category = await loadCategory(id);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (category.name === FALLBACK_GALLERY_CATEGORY)
    return NextResponse.json({ error: `"${FALLBACK_GALLERY_CATEGORY}" cannot be renamed` }, { status: 400 });

  const parsed = parseCategoryName((await readJson(req))?.name);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const name = parsed.data;

  const others = (await getGalleryCategories()).filter((c) => c.id !== id);
  if (others.some((c) => sameName(c.name, name)))
    return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });

  await category.ref.update({ name });
  const moved = name === category.name ? 0 : await moveImages(category.name, name);

  revalidatePath("/gallery");
  return NextResponse.json({ success: true, name, photosUpdated: moved });
}

// DELETE /api/admin/gallery-categories/[id]?moveTo=<name> — photos move to another category first
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  const category = await loadCategory(id);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (category.name === FALLBACK_GALLERY_CATEGORY)
    return NextResponse.json({ error: `"${FALLBACK_GALLERY_CATEGORY}" cannot be deleted` }, { status: 400 });

  const moveTo = req.nextUrl.searchParams.get("moveTo") || FALLBACK_GALLERY_CATEGORY;
  const target = (await getGalleryCategories()).find((c) => c.name === moveTo && c.id !== id);
  if (!target) return NextResponse.json({ error: "Choose an existing category to move the photos to" }, { status: 400 });

  const moved = await moveImages(category.name, target.name);
  await category.ref.delete();

  revalidatePath("/gallery");
  return NextResponse.json({ success: true, photosMoved: moved, movedTo: target.name });
}
