import { describe, expect, it } from "vitest";
import { getLegacyRedirects, LEGACY_BLOG_REDIRECTS } from "@/lib/legacy-redirects";
import { slugify } from "@/lib/utils";

describe("legacy redirects", () => {
  it("maps all 23 old blog posts to unique, URL-safe slugs", () => {
    const slugs = Object.values(LEGACY_BLOG_REDIRECTS);
    expect(Object.keys(LEGACY_BLOG_REDIRECTS).map(Number).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 23 }, (_, i) => i + 1)
    );
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slugify(slug)).toBe(slug);
  });

  it("encodes spaces in old page URLs and has no duplicate sources", () => {
    const redirects = getLegacyRedirects();
    const sources = redirects.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
    expect(sources.every((s) => !s.includes(" "))).toBe(true);
    expect(redirects).toContainEqual({ source: "/contact%20us.html", destination: "/contact" });
    expect(redirects).toContainEqual({ source: "/blog-post12.html", destination: "/blog/base-classroom-hhr-01" });
  });
});
