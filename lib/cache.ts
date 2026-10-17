import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

/** Tag on every public read of CMS data (posts, gallery, website content, settings). */
export const CONTENT_TAG = "cms-content";

/**
 * Caches a Firestore read across requests. Public pages render per request from this cache,
 * so admin changes show on the very next visit (see revalidateContent) without a database read per view.
 */
export function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) {
  return unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: 3600 });
}

/** Call after any admin write. `expire: 0` means stale data is never served, unlike revalidatePath alone. */
export function revalidateContent() {
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}
