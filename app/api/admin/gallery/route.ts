import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { parseGalleryInput } from "@/lib/validation";
import { getGalleryCategoryNames } from "@/lib/gallery-categories";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = parseGalleryInput(body, await getGalleryCategoryNames());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const db = getAdminDb();
  const snap = await db.collection("gallery").orderBy("order", "desc").limit(1).get();
  const nextOrder = snap.empty ? 0 : (snap.docs[0].data().order ?? 0) + 1;

  const ref = await db.collection("gallery").add({
    ...parsed.data,
    order: nextOrder,
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/gallery");
  return NextResponse.json({ id: ref.id, order: nextOrder });
}
