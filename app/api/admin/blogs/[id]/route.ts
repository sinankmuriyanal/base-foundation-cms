import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { parseBlogInput } from "@/lib/validation";
import { isSlugTaken } from "@/lib/blogs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = parseBlogInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.data;

  const ref = getAdminDb().collection("blogs").doc(id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const prev = existing.data()!;

  if (await isSlugTaken(input.slug, id))
    return NextResponse.json({ error: "Another post already uses this slug" }, { status: 409 });

  // Keep the original publish date (migrated posts carry their real dates)
  const publishedAt = prev.publishedAt ?? (input.published ? new Date().toISOString() : null);

  await ref.update({ ...input, publishedAt, updatedAt: FieldValue.serverTimestamp() });

  if (prev.cloudinaryPublicId && prev.cloudinaryPublicId !== input.cloudinaryPublicId)
    await deleteCloudinaryImage(prev.cloudinaryPublicId);

  revalidatePath("/", "layout");
  return NextResponse.json({ success: true, slug: input.slug });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  const ref = getAdminDb().collection("blogs").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = doc.data()!;
  if (data.cloudinaryPublicId) await deleteCloudinaryImage(data.cloudinaryPublicId);

  await ref.delete();
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
