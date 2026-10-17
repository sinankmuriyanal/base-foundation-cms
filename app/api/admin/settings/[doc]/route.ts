import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { isSingletonKey, SINGLETONS, singletonFields } from "@/lib/content/schema";
import { parseFields } from "@/lib/content/validate";
import { revalidateContent } from "@/lib/cache";

type Ctx = { params: Promise<{ doc: string }> };

// PUT /api/admin/settings/[doc] — save site details or page text
export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { doc } = await params;
  if (!isSingletonKey(doc)) return NextResponse.json({ error: "Unknown settings" }, { status: 404 });

  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const parsed = parseFields(singletonFields(SINGLETONS[doc]), body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await getAdminDb()
    .collection("settings")
    .doc(SINGLETONS[doc].docId)
    .set({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

  revalidateContent();
  return NextResponse.json({ success: true });
}
