import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createFakeDb, type FakeDb } from "./fakes";
import { COLLECTIONS, SINGLETONS, singletonFields } from "@/lib/content/schema";
import { isAllowedImage, parseFields } from "@/lib/content/validate";

let db: FakeDb;
const verifySessionCookie = vi.fn();
const deleteCloudinaryImage = vi.fn();

vi.mock("@/lib/firebase-admin", () => ({
  isFirebaseAdminConfigured: () => true,
  getAdminDb: () => db,
  getAdminAuth: () => ({ verifySessionCookie }),
}));
vi.mock("@/lib/cloudinary", () => ({ deleteCloudinaryImage: (id: string) => deleteCloudinaryImage(id) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("firebase-admin/firestore", () => ({ FieldValue: { serverTimestamp: () => "SERVER_TS" }, Timestamp: class {} }));

const create = await import("@/app/api/admin/content/[collection]/route");
const byId = await import("@/app/api/admin/content/[collection]/[id]/route");
const reorder = await import("@/app/api/admin/content/[collection]/reorder/route");
const settings = await import("@/app/api/admin/settings/[doc]/route");

const CLD = (id: string) => `https://res.cloudinary.com/demo/image/upload/v1/${id}.jpg`;

function req(method: string, body?: unknown, session = "admin") {
  return new NextRequest("http://localhost/api", {
    method,
    headers: { "content-type": "application/json", cookie: `base_admin_session=${session}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const col = (collection: string) => ({ params: Promise.resolve({ collection }) });
const item = (collection: string, id: string) => ({ params: Promise.resolve({ collection, id }) });

beforeEach(() => {
  db = createFakeDb();
  vi.clearAllMocks();
  verifySessionCookie.mockImplementation(async (c: string) => (c === "admin" ? { uid: "u1", admin: true } : { uid: "u2" }));
});

describe("parseFields", () => {
  const fields = COLLECTIONS.programs.fields;

  it("validates required fields, lengths and links", () => {
    expect(parseFields(fields, { text: "x", image: "/legacy/img/a.jpg" })).toEqual({ ok: false, error: "Title is required" });
    expect(parseFields(fields, { title: "t", text: "x", image: "/legacy/img/a.jpg", link: "javascript:alert(1)" }).ok).toBe(false);
    const ok = parseFields(fields, { title: "  T  ", text: "x", image: CLD("p"), imagePublicId: "p", link: "/programmes/a", published: true });
    expect(ok.ok && ok.data).toMatchObject({ title: "T", imagePublicId: "p", link: "/programmes/a", published: true });
  });

  it("only accepts Cloudinary or original-site images", () => {
    expect(isAllowedImage(CLD("x"))).toBe(true);
    expect(isAllowedImage("/legacy/img/new/team1.jpg")).toBe(true);
    expect(isAllowedImage("/legacy/img/../../.env")).toBe(false);
    expect(isAllowedImage("https://evil.example/a.jpg")).toBe(false);
  });

  it("keeps paragraph breaks and drops empty highlights", () => {
    const r = parseFields(COLLECTIONS.projects.fields, {
      title: "P",
      summary: "a",
      body: "one\r\n\r\n\r\ntwo",
      image: "/legacy/img/a.jpg",
      highlights: [{ title: "H", body: "b" }, { title: "", body: "" }],
      area: "Nope",
    });
    expect(r.ok && r.data).toMatchObject({ body: "one\n\ntwo", highlights: [{ title: "H", body: "b" }], area: "Education" });
  });

  it("validates settings emails and social links", () => {
    const fields = singletonFields(SINGLETONS.site);
    expect(parseFields(fields, { email: "nope", phone1: "1", address: "a" }).ok).toBe(false);
    expect(parseFields(fields, { email: "a@b.in", phone1: "1", address: "a", facebook: "ftp://x" }).ok).toBe(false);
  });
});

describe("content API", () => {
  const project = { title: "School Visit", area: "Education", summary: "s", image: "/legacy/img/a.jpg", published: true };

  it("requires admin and a known collection", async () => {
    expect((await create.POST(req("POST", project, "user"), col("projects"))).status).toBe(403);
    expect((await create.POST(req("POST", project), col("secrets"))).status).toBe(404);
  });

  it("creates projects with unique slugs and appends to the order", async () => {
    const a = await (await create.POST(req("POST", project), col("projects"))).json();
    expect(a.slug).toBe("school-visit");
    expect((await create.POST(req("POST", project), col("projects"))).status).toBe(409);
    const b = await (await create.POST(req("POST", { ...project, slug: "Visits 2" }), col("projects"))).json();
    expect(b.slug).toBe("visits-2");
    expect((await db.collection("projects").doc(b.id).get()).data()!.order).toBe(1);
  });

  it("deletes replaced Cloudinary images on update and all images on delete", async () => {
    const { id } = await db.collection("programs").add({ title: "T", text: "x", image: CLD("old"), imagePublicId: "old", order: 0 });
    const res = await byId.PUT(req("PUT", { title: "T", text: "x", image: CLD("new"), imagePublicId: "new" }), item("programs", id));
    expect(res.status).toBe(200);
    expect(deleteCloudinaryImage).toHaveBeenCalledWith("old");

    deleteCloudinaryImage.mockClear();
    expect((await byId.DELETE(req("DELETE"), item("programs", id))).status).toBe(200);
    expect(deleteCloudinaryImage).toHaveBeenCalledWith("new");
    expect((await db.collection("programs").doc(id).get()).exists).toBe(false);
  });

  it("keeps a project's slug when editing other fields", async () => {
    const { id } = await db.collection("projects").add({ ...project, slug: "school-visit", order: 0 });
    const res = await byId.PUT(req("PUT", { ...project, title: "School Visits Programme" }), item("projects", id));
    expect((await res.json()).slug).toBe("school-visit");
  });

  it("reorders only with the complete id list", async () => {
    const a = (await db.collection("teamMembers").add({ name: "A", order: 0 })).id;
    const b = (await db.collection("teamMembers").add({ name: "B", order: 1 })).id;
    expect((await reorder.POST(req("POST", { ids: [a] }), col("team"))).status).toBe(400);
    expect((await reorder.POST(req("POST", { ids: [b, a] }), col("team"))).status).toBe(200);
    expect((await db.collection("teamMembers").doc(a).get()).data()!.order).toBe(1);
  });

  it("saves settings documents and rejects unknown ones", async () => {
    const ok = await settings.PUT(req("PUT", { email: "a@b.in", phone1: "+91 1", address: "Paikar" }), { params: Promise.resolve({ doc: "site" }) });
    expect(ok.status).toBe(200);
    expect((await db.collection("settings").doc("site").get()).data()).toMatchObject({ email: "a@b.in", address: "Paikar" });
    expect((await settings.PUT(req("PUT", {}), { params: Promise.resolve({ doc: "other" }) })).status).toBe(404);
  });
});
