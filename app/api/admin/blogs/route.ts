import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { readJson, requireAdmin } from "@/lib/admin-api";
import { parseBlogInput } from "@/lib/validation";
import { isSlugTaken } from "@/lib/blogs";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = parseBlogInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.data;

  if (await isSlugTaken(input.slug))
    return NextResponse.json({ error: "Another post already uses this slug" }, { status: 409 });

  const ref = await getAdminDb().collection("blogs").add({
    ...input,
    publishedAt: input.published ? new Date().toISOString() : null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/", "layout");
  return NextResponse.json({ id: ref.id, slug: input.slug });
}
