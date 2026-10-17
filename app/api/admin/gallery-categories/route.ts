import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { parseCategoryName } from "@/lib/validation";
import { GALLERY_CATEGORIES_COLLECTION, getGalleryCategories, sameName } from "@/lib/gallery-categories";

// POST /api/admin/gallery-categories — create a category at the end of the list
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = await readJson(req);
  const parsed = parseCategoryName(body?.name);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const existing = await getGalleryCategories();
  if (existing.some((c) => sameName(c.name, parsed.data)))
    return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });

  const order = existing.reduce((max, c) => Math.max(max, c.order), -1) + 1;
  const ref = await getAdminDb().collection(GALLERY_CATEGORIES_COLLECTION).add({
    name: parsed.data,
    order,
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/gallery");
  return NextResponse.json({ id: ref.id, name: parsed.data, order });
}
