import { NextRequest, NextResponse } from "next/server";
import { revalidateContent } from "@/lib/cache";
import { getAdminDb } from "@/lib/firebase-admin";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { parseGalleryUpdate } from "@/lib/validation";
import { getGalleryCategoryNames } from "@/lib/gallery-categories";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const update = parseGalleryUpdate(body, await getGalleryCategoryNames());
  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const ref = getAdminDb().collection("gallery").doc(id);
  if (!(await ref.get()).exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await ref.update(update);
  revalidateContent();
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  const ref = getAdminDb().collection("gallery").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = doc.data()!;
  if (data.cloudinaryPublicId) await deleteCloudinaryImage(data.cloudinaryPublicId);

  await ref.delete();
  revalidateContent();
  return NextResponse.json({ success: true });
}
