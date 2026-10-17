import { describe, expect, it } from "vitest";
import { parseBlogInput, parseCategoryName, parseGalleryInput, parseGalleryUpdate } from "@/lib/validation";

const IMG = "https://res.cloudinary.com/demo/image/upload/v1/a.jpg";
const CATS = ["Drawing Competition", "Logo Revealing", "General"];

describe("parseBlogInput", () => {
  it("requires a title", () => {
    expect(parseBlogInput({ title: "   " })).toEqual({ ok: false, error: "Title required" });
  });

  it("derives the slug from the title when none is given, and normalises a given one", () => {
    const a = parseBlogInput({ title: "School Visit in Paikar" });
    const b = parseBlogInput({ title: "x", slug: "My Custom Slug!" });
    expect(a.ok && a.data.slug).toBe("school-visit-in-paikar");
    expect(b.ok && b.data.slug).toBe("my-custom-slug");
  });

  it("strips scripts and event handlers from content", () => {
    const r = parseBlogInput({
      title: "t",
      content: '<p onclick="x()">Hi</p><script>alert(1)</script><img src="javascript:alert(1)"><a href="https://a.org">ok</a>',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.content).not.toMatch(/script|onclick|javascript:/);
    expect(r.data.content).toContain('<a href="https://a.org">ok</a>');
  });

  it("falls back to General for unknown categories and dedupes tags", () => {
    const r = parseBlogInput({ title: "t", category: "Hacking", tags: ["a", " a ", "", "b", 3] });
    expect(r.ok && r.data.category).toBe("General");
    expect(r.ok && r.data.tags).toEqual(["a", "b"]);
  });

  it("rejects non-Cloudinary featured images and drops the public id without an image", () => {
    expect(parseBlogInput({ title: "t", featuredImage: "https://evil.example/a.jpg" }).ok).toBe(false);
    const r = parseBlogInput({ title: "t", featuredImage: "", cloudinaryPublicId: "orphan" });
    expect(r.ok && r.data.cloudinaryPublicId).toBeNull();
  });

  it("only treats literal true as published", () => {
    const r = parseBlogInput({ title: "t", published: "true" });
    expect(r.ok && r.data.published).toBe(false);
  });
});

describe("parseGalleryInput", () => {
  it("requires a Cloudinary url and public id", () => {
    expect(parseGalleryInput({ imageUrl: IMG }, CATS).ok).toBe(false);
    expect(parseGalleryInput({ imageUrl: "https://x.org/a.jpg", cloudinaryPublicId: "p" }, CATS).ok).toBe(false);
    const r = parseGalleryInput({ imageUrl: IMG, cloudinaryPublicId: "p", category: "Nope" }, CATS);
    expect(r).toEqual({ ok: true, data: { imageUrl: IMG, cloudinaryPublicId: "p", category: "General", caption: "" } });
  });
});

describe("parseGalleryUpdate", () => {
  it("keeps only known, valid fields", () => {
    expect(parseGalleryUpdate({ caption: " hi ", order: "3", admin: true }, CATS)).toEqual({ caption: "hi" });
    expect(parseGalleryUpdate({ category: "Logo Revealing", order: 2 }, CATS)).toEqual({ category: "Logo Revealing", order: 2 });
  });
});

describe("parseCategoryName", () => {
  it("trims and collapses whitespace, rejects empty and over-long names", () => {
    expect(parseCategoryName("  Independence   Day ")).toEqual({ ok: true, data: "Independence Day" });
    expect(parseCategoryName("   ").ok).toBe(false);
    expect(parseCategoryName("x".repeat(41)).ok).toBe(false);
    expect(parseCategoryName(42).ok).toBe(false);
  });
});
