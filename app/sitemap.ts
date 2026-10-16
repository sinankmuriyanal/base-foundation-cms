import type { MetadataRoute } from "next";
import { getPublishedBlogs } from "@/lib/blogs";
import { PROGRAMMES } from "@/lib/programmes";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/programmes", "/blog", "/gallery", "/about", "/join", "/donate", "/contact"];
  const blogs = await getPublishedBlogs();

  return [
    ...staticPaths.map((path) => ({ url: `${SITE.url}${path}` })),
    ...PROGRAMMES.map((p) => ({ url: `${SITE.url}/programmes/${p.slug}` })),
    ...blogs.map((b) => ({ url: `${SITE.url}/blog/${b.slug}`, lastModified: b.updatedAt })),
  ];
}
