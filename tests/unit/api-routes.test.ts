import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createFakeDb, type FakeDb } from "./fakes";

const IMG = "https://res.cloudinary.com/demo/image/upload/v1/a.jpg";

let db: FakeDb;
const verifySessionCookie = vi.fn();
const deleteCloudinaryImage = vi.fn();

vi.mock("@/lib/firebase-admin", () => ({
  isFirebaseAdminConfigured: () => true,
  getAdminDb: () => db,
  getAdminAuth: () => ({ verifySessionCookie }),
}));
vi.mock("@/lib/cloudinary", () => ({ deleteCloudinaryImage: (id: string) => deleteCloudinaryImage(id) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: () => "SERVER_TS" },
  Timestamp: class {},
}));

const blogs = await import("@/app/api/admin/blogs/route");
const blogById = await import("@/app/api/admin/blogs/[id]/route");
const gallery = await import("@/app/api/admin/gallery/route");
const galleryById = await import("@/app/api/admin/gallery/[id]/route");

function req(method: string, body?: unknown, session: string | null = "admin") {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (session) headers.cookie = `base_admin_session=${session}`;
  return new NextRequest("http://localhost/api", {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  db = createFakeDb();
  vi.clearAllMocks();
  verifySessionCookie.mockImplementation(async (cookie: string) => {
    if (cookie === "admin") return { uid: "u1", admin: true };
    if (cookie === "user") return { uid: "u2" };
    throw new Error("invalid");
  });
});

describe("auth on admin routes", () => {
  it("returns 401 without a session and for an invalid one", async () => {
    expect((await blogs.POST(req("POST", { title: "t" }, null))).status).toBe(401);
    expect((await blogs.POST(req("POST", { title: "t" }, "forged"))).status).toBe(401);
  });

  it("returns 403 for a signed-in user without the admin claim", async () => {
    expect((await blogs.POST(req("POST", { title: "t" }, "user"))).status).toBe(403);
    expect((await galleryById.DELETE(req("DELETE", undefined, "user"), ctx("x"))).status).toBe(403);
  });
});

describe("blog CRUD", () => {
  it("creates a post with sanitized content and a publish date", async () => {
    const res = await blogs.POST(req("POST", { title: "Map Bengal", content: "<p>a</p><script>x</script>", published: true }));
    expect(res.status).toBe(200);
    const { id, slug } = await res.json();
    expect(slug).toBe("map-bengal");
    const saved = (await db.collection("blogs").doc(id).get()).data()!;
    expect(saved.content).toBe("<p>a</p>");
    expect(typeof saved.publishedAt).toBe("string");
  });

  it("rejects duplicate slugs with 409", async () => {
    await blogs.POST(req("POST", { title: "Same" }));
    expect((await blogs.POST(req("POST", { title: "Same" }))).status).toBe(409);
  });

  it("keeps the original publish date and removes a replaced image on update", async () => {
    const { id } = await db.collection("blogs").add({
      title: "Old", slug: "old", publishedAt: "2023-01-01T00:00:00.000Z", published: true, cloudinaryPublicId: "old-img",
    });
    const res = await blogById.PUT(
      req("PUT", { title: "Old", published: true, featuredImage: IMG, cloudinaryPublicId: "new-img" }),
      ctx(id)
    );
    expect(res.status).toBe(200);
    const saved = (await db.collection("blogs").doc(id).get()).data()!;
    expect(saved.publishedAt).toBe("2023-01-01T00:00:00.000Z");
    expect(deleteCloudinaryImage).toHaveBeenCalledWith("old-img");
  });

  it("returns 404 when updating or deleting a missing post", async () => {
    expect((await blogById.PUT(req("PUT", { title: "x" }), ctx("missing"))).status).toBe(404);
    expect((await blogById.DELETE(req("DELETE"), ctx("missing"))).status).toBe(404);
  });

  it("deletes the post and its Cloudinary image", async () => {
    const { id } = await db.collection("blogs").add({ title: "t", slug: "t", cloudinaryPublicId: "img1" });
    expect((await blogById.DELETE(req("DELETE"), ctx(id))).status).toBe(200);
    expect((await db.collection("blogs").doc(id).get()).exists).toBe(false);
    expect(deleteCloudinaryImage).toHaveBeenCalledWith("img1");
  });

  it("rejects malformed JSON", async () => {
    const bad = new NextRequest("http://localhost/api", {
      method: "POST",
      headers: { cookie: "base_admin_session=admin" },
      body: "{nope",
    });
    expect((await blogs.POST(bad)).status).toBe(400);
  });
});

describe("gallery CRUD", () => {
  it("appends new images after the highest order", async () => {
    await db.collection("gallery").add({ order: 4 });
    const res = await gallery.POST(req("POST", { imageUrl: IMG, cloudinaryPublicId: "p1" }));
    expect(await res.json()).toMatchObject({ order: 5 });
  });

  it("updates caption/category and deletes with Cloudinary cleanup", async () => {
    const { id } = await db.collection("gallery").add({ order: 0, cloudinaryPublicId: "g1", caption: "" });
    expect((await galleryById.PATCH(req("PATCH", { caption: "Drawing day" }), ctx(id))).status).toBe(200);
    expect((await db.collection("gallery").doc(id).get()).data()!.caption).toBe("Drawing day");
    expect((await galleryById.PATCH(req("PATCH", { bogus: 1 }), ctx(id))).status).toBe(400);

    expect((await galleryById.DELETE(req("DELETE"), ctx(id))).status).toBe(200);
    expect(deleteCloudinaryImage).toHaveBeenCalledWith("g1");
  });
});
