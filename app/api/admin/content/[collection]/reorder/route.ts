import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { resolveCollection } from "@/lib/content/admin";
import { revalidateContent } from "@/lib/cache";

type Ctx = { params: Promise<{ collection: string }> };

// POST /api/admin/content/[collection]/reorder { ids } — sets display order
export async function POST(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const def = resolveCollection((await params).collection);
  if (def instanceof NextResponse) return def;

  const ids = (await readJson(req))?.ids;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string"))
    return NextResponse.json({ error: "ids must be an array of ids" }, { status: 400 });

  const col = getAdminDb().collection(def.collection);
  const known = new Set((await col.get()).docs.map((d) => d.id));
  if (ids.length !== known.size || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id)))
    return NextResponse.json({ error: "ids must list every item exactly once" }, { status: 400 });

  await Promise.all(ids.map((id, order) => col.doc(id).update({ order })));
  revalidateContent();
  return NextResponse.json({ success: true });
}
