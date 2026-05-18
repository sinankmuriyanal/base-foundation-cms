import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { FieldValue } from "firebase-admin/firestore";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(process.env.AUTH_COOKIE_NAME || "base_admin_session")?.value;
  if (!token) return false;
  try {
    await adminAuth.verifyIdToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (body.category !== undefined) update.category = body.category;
  if (body.caption !== undefined) update.caption = body.caption;
  if (body.order !== undefined) update.order = body.order;

  await adminDb.collection("gallery").doc(params.id).update(update);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await adminDb.collection("gallery").doc(params.id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = doc.data()!;
  if (data.cloudinaryPublicId) {
    await deleteCloudinaryImage(data.cloudinaryPublicId);
  }

  await adminDb.collection("gallery").doc(params.id).delete();
  return NextResponse.json({ success: true });
}
