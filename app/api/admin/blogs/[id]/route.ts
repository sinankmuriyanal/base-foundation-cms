import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { FieldValue } from "firebase-admin/firestore";
import { slugify } from "@/lib/utils";

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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, category, content, featuredImage, cloudinaryPublicId, tags, author, published } = body;

  const update: Record<string, unknown> = {
    category: category || "General",
    content: content || "",
    featuredImage: featuredImage || null,
    cloudinaryPublicId: cloudinaryPublicId || null,
    tags: tags || [],
    author: author || null,
    published: !!published,
    publishedAt: published ? new Date().toISOString() : null,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (title?.trim()) {
    update.title = title.trim();
    update.slug = slugify(title);
  }

  await adminDb.collection("blogs").doc(params.id).update(update);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await adminDb.collection("blogs").doc(params.id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = doc.data()!;
  if (data.cloudinaryPublicId) {
    await deleteCloudinaryImage(data.cloudinaryPublicId);
  }

  await adminDb.collection("blogs").doc(params.id).delete();
  return NextResponse.json({ success: true });
}
