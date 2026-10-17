import { NextRequest, NextResponse } from "next/server";
import { revalidateContent } from "@/lib/cache";
import { getAdminDb } from "@/lib/firebase-admin";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { GALLERY_CATEGORIES_COLLECTION, getGalleryCategories } from "@/lib/gallery-categories";

// POST /api/admin/gallery-categories/reorder { ids: string[] } — sets the display order
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const ids = (await readJson(req))?.ids;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string"))
    return NextResponse.json({ error: "ids must be an array of category ids" }, { status: 400 });

  const known = new Set((await getGalleryCategories()).map((c) => c.id).filter(Boolean));
  if (ids.length !== known.size || !ids.every((id) => known.has(id)) || new Set(ids).size !== ids.length)
    return NextResponse.json({ error: "ids must list every category exactly once" }, { status: 400 });

  const col = getAdminDb().collection(GALLERY_CATEGORIES_COLLECTION);
  await Promise.all(ids.map((id, order) => col.doc(id).update({ order })));

  revalidateContent();
  return NextResponse.json({ success: true });
}
