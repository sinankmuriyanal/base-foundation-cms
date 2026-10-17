import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { imagePublicIds, parseFields } from "@/lib/content/validate";
import { resolveCollection, uniqueSlug } from "@/lib/content/admin";
import { revalidateContent } from "@/lib/cache";

type Ctx = { params: Promise<{ collection: string; id: string }> };

// PUT /api/admin/content/[collection]/[id] — replace the editable fields; deletes images that were replaced
export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { collection, id } = await params;
  const def = resolveCollection(collection);
  if (def instanceof NextResponse) return def;

  const ref = getAdminDb().collection(def.collection).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const parsed = parseFields(def.fields, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;

  if (def.slugFrom) {
    const slug = await uniqueSlug(def, { slug: body.slug || existing.data()!.slug }, data, id);
    if (slug instanceof NextResponse) return slug;
    data.slug = slug.slug;
  }

  await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });

  const kept = new Set(imagePublicIds(def.fields, data));
  await Promise.all(imagePublicIds(def.fields, existing.data()!).filter((pid) => !kept.has(pid)).map(deleteCloudinaryImage));

  revalidateContent();
  return NextResponse.json({ success: true, ...(data.slug ? { slug: data.slug } : {}) });
}

// DELETE /api/admin/content/[collection]/[id] — also removes its Cloudinary images
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { collection, id } = await params;
  const def = resolveCollection(collection);
  if (def instanceof NextResponse) return def;

  const ref = getAdminDb().collection(def.collection).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Promise.all(imagePublicIds(def.fields, existing.data()!).map(deleteCloudinaryImage));
  await ref.delete();

  revalidateContent();
  return NextResponse.json({ success: true });
}
