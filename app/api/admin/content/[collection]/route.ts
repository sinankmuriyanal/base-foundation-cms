import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { parseFields } from "@/lib/content/validate";
import { resolveCollection, uniqueSlug } from "@/lib/content/admin";
import { revalidateContent } from "@/lib/cache";

type Ctx = { params: Promise<{ collection: string }> };

// POST /api/admin/content/[collection] — create an item at the end of the list
export async function POST(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const def = resolveCollection((await params).collection);
  if (def instanceof NextResponse) return def;

  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const parsed = parseFields(def.fields, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;

  if (def.slugFrom) {
    const slug = await uniqueSlug(def, body, data);
    if (slug instanceof NextResponse) return slug;
    data.slug = slug.slug;
  }

  const col = getAdminDb().collection(def.collection);
  const existing = await col.get();
  const order = existing.docs.reduce((max, d) => Math.max(max, Number(d.data().order ?? 0)), -1) + 1;
  const ref = await col.add({ ...data, order, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });

  revalidateContent();
  return NextResponse.json({ id: ref.id, ...(data.slug ? { slug: data.slug } : {}) });
}
