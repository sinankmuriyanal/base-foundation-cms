import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { slugify } from "@/lib/utils";
import { COLLECTIONS, isCollectionKey, type CollectionDef } from "./schema";

/** Resolves the collection definition from a route param, or a 404 response. */
export function resolveCollection(key: string): CollectionDef | NextResponse {
  return isCollectionKey(key) ? COLLECTIONS[key] : NextResponse.json({ error: "Unknown content type" }, { status: 404 });
}

/** Picks a unique slug for collections that have one; returns an error response on conflict with an explicit slug. */
export async function uniqueSlug(
  def: CollectionDef,
  body: Record<string, unknown>,
  data: Record<string, unknown>,
  exceptId?: string
): Promise<{ slug: string } | NextResponse> {
  const explicit = typeof body.slug === "string" ? slugify(body.slug) : "";
  const slug = explicit || slugify(String(data[def.slugFrom!] ?? ""));
  if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });
  const snap = await getAdminDb().collection(def.collection).where("slug", "==", slug).limit(2).get();
  if (snap.docs.some((d) => d.id !== exceptId))
    return NextResponse.json({ error: `Another ${def.singular} already uses the address /${slug}` }, { status: 409 });
  return { slug };
}

