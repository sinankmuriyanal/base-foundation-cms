import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createFakeDb, type FakeDb } from "./fakes";

let db: FakeDb;
const verifySessionCookie = vi.fn();

vi.mock("@/lib/firebase-admin", () => ({
  isFirebaseAdminConfigured: () => true,
  getAdminDb: () => db,
  getAdminAuth: () => ({ verifySessionCookie }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("firebase-admin/firestore", () => ({ FieldValue: { serverTimestamp: () => "SERVER_TS" }, Timestamp: class {} }));

const collection = await import("@/app/api/admin/gallery-categories/route");
const byId = await import("@/app/api/admin/gallery-categories/[id]/route");
const reorder = await import("@/app/api/admin/gallery-categories/reorder/route");
const galleryCreate = await import("@/app/api/admin/gallery/route");

function req(method: string, body?: unknown, { url = "http://localhost/api", session = "admin" } = {}) {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json", cookie: `base_admin_session=${session}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const cat = (name: string, order: number) => db.collection("galleryCategories").add({ name, order });
const photo = (category: string) => db.collection("gallery").add({ category, order: 0, imageUrl: "x", cloudinaryPublicId: "p" });
const categoryOf = async (id: string) => (await db.collection("gallery").doc(id).get()).data()!.category;

beforeEach(() => {
  db = createFakeDb();
  verifySessionCookie.mockImplementation(async (c: string) => (c === "admin" ? { uid: "u1", admin: true } : { uid: "u2" }));
});

describe("gallery categories API", () => {
  it("requires the admin claim", async () => {
    expect((await collection.POST(req("POST", { name: "X" }, { session: "user" }))).status).toBe(403);
  });

  it("creates categories at the end and rejects duplicates case-insensitively", async () => {
    await cat("Drawing Competition", 0);
    await cat("General", 1);
    const res = await collection.POST(req("POST", { name: "  Independence  Day " }));
    expect(await res.json()).toMatchObject({ name: "Independence Day", order: 2 });
    expect((await collection.POST(req("POST", { name: "general" }))).status).toBe(409);
    expect((await collection.POST(req("POST", { name: "" }))).status).toBe(400);
  });

  it("renames a category and moves its photos with it", async () => {
    const { id } = await cat("Drawing Competition", 0);
    await cat("General", 1);
    const a = (await photo("Drawing Competition")).id;
    const b = (await photo("General")).id;

    const res = await byId.PATCH(req("PATCH", { name: "Art Contest" }), ctx(id));
    expect(await res.json()).toMatchObject({ name: "Art Contest", photosUpdated: 1 });
    expect(await categoryOf(a)).toBe("Art Contest");
    expect(await categoryOf(b)).toBe("General");
  });

  it("protects the fallback category", async () => {
    const { id } = await cat("General", 0);
    expect((await byId.PATCH(req("PATCH", { name: "Misc" }), ctx(id))).status).toBe(400);
    expect((await byId.DELETE(req("DELETE"), ctx(id))).status).toBe(400);
  });

  it("deletes a category after moving its photos to the chosen one", async () => {
    const { id } = await cat("Logo Revealing", 0);
    await cat("Motivation Class", 1);
    await cat("General", 2);
    const p = (await photo("Logo Revealing")).id;

    const bad = await byId.DELETE(req("DELETE", undefined, { url: "http://localhost/api?moveTo=Nope" }), ctx(id));
    expect(bad.status).toBe(400);

    const res = await byId.DELETE(req("DELETE", undefined, { url: "http://localhost/api?moveTo=Motivation%20Class" }), ctx(id));
    expect(await res.json()).toMatchObject({ photosMoved: 1, movedTo: "Motivation Class" });
    expect(await categoryOf(p)).toBe("Motivation Class");
    expect((await db.collection("galleryCategories").doc(id).get()).exists).toBe(false);
  });

  it("reorders when every category is listed exactly once", async () => {
    const a = (await cat("A", 0)).id;
    const b = (await cat("B", 1)).id;
    const g = (await cat("General", 2)).id;
    expect((await reorder.POST(req("POST", { ids: [a, b] }))).status).toBe(400);
    expect((await reorder.POST(req("POST", { ids: [g, b, a] }))).status).toBe(200);
    expect((await db.collection("galleryCategories").doc(g).get()).data()!.order).toBe(0);
    expect((await db.collection("galleryCategories").doc(a).get()).data()!.order).toBe(2);
  });

  it("new photos only accept existing categories", async () => {
    await cat("Drawing Competition", 0);
    await cat("General", 1);
    const img = "https://res.cloudinary.com/demo/image/upload/v1/a.jpg";
    const ok = await galleryCreate.POST(req("POST", { imageUrl: img, cloudinaryPublicId: "p1", category: "Drawing Competition" }));
    const fallback = await galleryCreate.POST(req("POST", { imageUrl: img, cloudinaryPublicId: "p2", category: "Deleted Category" }));
    expect(await categoryOf((await ok.json()).id)).toBe("Drawing Competition");
    expect(await categoryOf((await fallback.json()).id)).toBe("General");
  });
});
