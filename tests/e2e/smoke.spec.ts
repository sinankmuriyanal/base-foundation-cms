import { expect, test } from "@playwright/test";

// Runs against `npm run build` output. Content-dependent checks (blog posts, gallery images)
// only assert when data exists, so the suite also passes on a build without Firebase credentials.

const PAGES = [
  { path: "/", heading: /foundation/i },
  { path: "/programmes", heading: "Our programmes" },
  { path: "/programmes/school-visit", heading: "School Visit" },
  { path: "/programmes/madhyamik-sahayak", heading: "Madhyamik Sahayak" },
  { path: "/blog", heading: "Blog" },
  { path: "/gallery", heading: "Gallery" },
  { path: "/about", heading: "About Base Foundation" },
  { path: "/join", heading: /make a difference/i },
  { path: "/donate", heading: /change the world/i },
  { path: "/contact", heading: "Contact us" },
];

for (const { path, heading } of PAGES) {
  test(`${path} renders without horizontal scroll`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText("basefoundationwb@gmail.com");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("navigation reaches programmes and marks the active link", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Toggle menu" }).click();
  await page.getByRole("link", { name: "Programmes", exact: true }).first().click();
  await expect(page).toHaveURL(/\/programmes$/);
  if (!isMobile) await expect(page.getByRole("navigation").getByRole("link", { name: "Programmes", exact: true })).toHaveAttribute("aria-current", "page");
});

test("join form switches between volunteer and internship", async ({ page }) => {
  await page.goto("/join");
  await expect(page.getByRole("tab", { name: "Volunteership" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Internship" }).click();
  await expect(page.getByRole("tab", { name: "Internship" })).toHaveAttribute("aria-selected", "true");
});

test("blog category filter and search narrow the list", async ({ page }) => {
  await page.goto("/blog?category=Base%20Classroom");
  await expect(page.getByRole("button", { name: "Base Classroom" })).toHaveClass(/bg-brand/);
  await page.getByPlaceholder("Search posts...").fill("zzzz-no-such-post");
  await expect(page.getByText("No posts found.")).toBeVisible();
});

test("gallery lightbox opens when images exist", async ({ page }) => {
  await page.goto("/gallery");
  const photos = page.getByRole("button", { name: /^View .* photo$/ });
  test.skip((await photos.count()) === 0, "no gallery data in this build");
  await photos.first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("admin pages redirect to login when signed out", async ({ page }) => {
  for (const path of ["/admin", "/admin/dashboard", "/admin/blogs/new", "/admin/gallery"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
  await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
});

test("admin API rejects unauthenticated writes", async ({ request }) => {
  const res = await request.post("/api/admin/blogs", { data: { title: "x" } });
  expect(res.status()).toBe(401);
});

test("legacy static-site URLs redirect permanently", async ({ request }) => {
  const cases: [string, string][] = [
    ["/blog.html", "/blog"],
    ["/about.html", "/about"],
    ["/contact%20us.html", "/contact"],
    ["/Education.html", "/programmes"],
    ["/school%20visit.html", "/programmes/school-visit"],
    ["/Madhyamik%20Sahayak.html", "/programmes/madhyamik-sahayak"],
    ["/typography.html", "/"],
  ];
  for (const [from, to] of cases) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(308);
    expect(new URL(res.headers()["location"], "http://x").pathname, from).toBe(to);
  }
  const post = await request.get("/blog-post7.html", { maxRedirects: 0 });
  expect(post.status()).toBe(308);
  expect(post.headers()["location"]).toBe("/blog/first-milestone-achieved-successful-launch-of-the-map-bengal-test-exam-drive");
});
