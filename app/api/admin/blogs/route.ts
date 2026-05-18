import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
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

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, category, content, featuredImage, cloudinaryPublicId, tags, author, published } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const slug = slugify(title);
  const ref = await adminDb.collection("blogs").add({
    title: title.trim(),
    slug,
    category: category || "General",
    content: content || "",
    featuredImage: featuredImage || null,
    cloudinaryPublicId: cloudinaryPublicId || null,
    tags: tags || [],
    author: author || null,
    publishedAt: published ? new Date().toISOString() : null,
    published: !!published,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: ref.id, slug });
}
