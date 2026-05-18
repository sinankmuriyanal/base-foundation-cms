import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
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

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { imageUrl, cloudinaryPublicId, category, caption } = body;

  if (!imageUrl || !cloudinaryPublicId)
    return NextResponse.json({ error: "imageUrl and cloudinaryPublicId required" }, { status: 400 });

  const snap = await adminDb.collection("gallery").orderBy("order", "desc").limit(1).get();
  const lastOrder = snap.empty ? 0 : (snap.docs[0].data().order ?? 0) + 1;

  const ref = await adminDb.collection("gallery").add({
    imageUrl,
    cloudinaryPublicId,
    category: category || "General",
    caption: caption || "",
    order: lastOrder,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: ref.id });
}
