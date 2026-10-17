import type { DocumentData } from "firebase-admin/firestore";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { COLLECTIONS, SINGLETONS } from "./schema";
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_PAGES,
  DEFAULT_PROGRAMS,
  DEFAULT_PROJECTS,
  DEFAULT_SITE,
  DEFAULT_TEAM,
  withMeta,
} from "./defaults";
import type { CollectionKey, ContentTypes, PageText, SingletonKey, SiteSettings } from "./types";
import { cached } from "@/lib/cache";

const FALLBACKS: { [K in CollectionKey]: () => ContentTypes[K][] } = {
  projects: () => withMeta(DEFAULT_PROJECTS, "project"),
  programs: () => withMeta(DEFAULT_PROGRAMS, "program"),
  heroSlides: () => withMeta(DEFAULT_HERO_SLIDES, "slide"),
  team: () => withMeta(DEFAULT_TEAM, "member"),
};

// Empty values for every field, so documents missing newer fields still have the full shape.
function blank(key: CollectionKey): Record<string, unknown> {
  const out: Record<string, unknown> = { order: 0, published: true };
  for (const f of COLLECTIONS[key].fields) {
    if (f.type === "toggle") out[f.key] = false;
    else if (f.type === "highlights") out[f.key] = [];
    else if (f.type === "select") out[f.key] = f.options[0];
    else out[f.key] = "";
    if (f.type === "image") out[`${f.key}PublicId`] = null;
  }
  if (COLLECTIONS[key].slugFrom) out.slug = "";
  return out;
}

function toItem<K extends CollectionKey>(key: K, id: string, data: DocumentData): ContentTypes[K] {
  const { createdAt, updatedAt, ...rest } = data; // eslint-disable-line @typescript-eslint/no-unused-vars
  return { ...blank(key), ...rest, id } as ContentTypes[K];
}

const fetchCollection = cached(async (key: CollectionKey) => {
  const items = isFirebaseAdminConfigured()
    ? (await getAdminDb().collection(COLLECTIONS[key].collection).get()).docs.map((d) => toItem(key, d.id, d.data()))
    : FALLBACKS[key]();
  return items.sort((a, b) => a.order - b.order);
}, "content-collection");

export async function listCollection<K extends CollectionKey>(
  key: K,
  { includeHidden = false }: { includeHidden?: boolean } = {}
): Promise<ContentTypes[K][]> {
  const items = (await fetchCollection(key)) as ContentTypes[K][];
  return items.filter((i) => includeHidden || i.published);
}

export async function getCollectionItem<K extends CollectionKey>(key: K, id: string): Promise<ContentTypes[K] | null> {
  if (!isFirebaseAdminConfigured()) return FALLBACKS[key]().find((i) => i.id === id) ?? null;
  const doc = await getAdminDb().collection(COLLECTIONS[key].collection).doc(id).get();
  return doc.exists ? toItem(key, doc.id, doc.data()!) : null;
}

export async function getProjectBySlug(slug: string) {
  return (await listCollection("projects")).find((p) => p.slug === slug) ?? null;
}

const SINGLETON_DEFAULTS = { site: DEFAULT_SITE, pages: DEFAULT_PAGES } satisfies Record<SingletonKey, object>;

export async function getSingleton(key: "site"): Promise<SiteSettings>;
export async function getSingleton(key: "pages"): Promise<PageText>;
export async function getSingleton(key: SingletonKey): Promise<SiteSettings | PageText> {
  return fetchSingleton(key);
}

const fetchSingleton = cached(async (key: SingletonKey): Promise<SiteSettings | PageText> => {
  const defaults = SINGLETON_DEFAULTS[key];
  if (!isFirebaseAdminConfigured()) return defaults;
  const doc = await getAdminDb().collection("settings").doc(SINGLETONS[key].docId).get();
  const data = doc.exists ? doc.data()! : {};
  // Only fields the schema knows about; unset fields keep their defaults.
  const known = Object.fromEntries(Object.keys(defaults).filter((k) => typeof data[k] === "string").map((k) => [k, data[k]]));
  return { ...defaults, ...known };
}, "settings");
