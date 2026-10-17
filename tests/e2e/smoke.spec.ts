import { expect, test, type Page } from "@playwright/test";

// Runs against `npm run build` output. The public site uses the original basefoundation.in template;
// data-dependent checks (posts, gallery) skip when the build has no Firebase credentials.

const PAGES = [
  { path: "/", title: /Empowering Rural Lives/ },
  { path: "/blog", title: "Blog" },
  { path: "/gallery", title: "Gallery" },
  { path: "/about", title: /About\s*Organization/ },
  { path: "/contact", title: "Contact Us" },
  { path: "/programmes", title: "Education" },
  { path: "/programmes/school-visit", title: "School Visit" },
  { path: "/programmes/madhyamik-sahayak", title: "Madhyamik Sahayak" },
  { path: "/join", title: "Join with us" },
  { path: "/donate", title: "Donate" },
];

async function waitForTemplateScripts(page: Page) {
  await page.waitForFunction(() => "jQuery" in window && typeof (window as unknown as { jQuery: { fn: { slick?: unknown } } }).jQuery.fn.slick === "function");
}

for (const { path, title } of PAGES) {
  test(`${path} renders the original template`, async ({ page }) => {
    const errors: string[] = [];
    const failed: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400 && new URL(r.url()).host === new URL(page.url() || "http://x").host) failed.push(`${r.status()} ${r.url()}`);
    });

    await page.goto(path);
    await expect(page.locator(".promo-primary__title, .promo-slider__title").first()).toContainText(title);
    await expect(page.locator("header.header .header-logo__img")).toBeVisible();
    await expect(page.locator("footer.footer")).toContainText("basefoundationwb@gmail.com");
    await expect(page.locator("footer.footer")).toContainText("+91 74785 73368");
    await waitForTemplateScripts(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
  });
}

test("header marks the current page and links to the new routes", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop menu");
  await page.goto("/gallery");
  await expect(page.locator(".main-menu__item--active")).toHaveCount(1);
  await expect(page.locator(".main-menu__item--active .main-menu__link")).toHaveAttribute("href", "/gallery");
  await expect(page.locator('.main-menu a[href="/join#internship"]')).toHaveCount(1);
  await expect(page.locator('header a.button[href="/donate"]')).toBeVisible();
});

test("side menu opens and closes (template jQuery)", async ({ page }) => {
  await page.goto("/about");
  await waitForTemplateScripts(page);
  await page.locator(".dropdown-trigger:visible").first().click();
  await expect(page.locator(".aside-dropdown")).toHaveClass(/aside-dropdown--active/);
  await page.locator(".aside-dropdown__close").click();
  await expect(page.locator(".aside-dropdown")).not.toHaveClass(/aside-dropdown--active/);
});

test("blog list shows CMS posts and filters by category", async ({ page }) => {
  await page.goto("/blog");
  const cards = page.locator(".blog-item__title a");
  test.skip((await cards.count()) === 0, "no blog data in this build");
  const total = await cards.count();
  await page.goto("/blog?category=Base%20Classroom");
  const filtered = await page.locator(".blog-item__badge").allTextContents();
  expect(filtered.length).toBeGreaterThan(0);
  expect(filtered.length).toBeLessThan(total);
  expect(filtered.every((t) => t.trim() === "Base Classroom")).toBe(true);
});

test("blog post renders content, sidebar and share links", async ({ page }) => {
  await page.goto("/blog");
  const first = page.locator(".blog-item__title a").first();
  test.skip((await first.count()) === 0, "no blog data in this build");
  const title = (await first.textContent())!.trim();
  await first.click();
  await expect(page.locator(".blog-post__title").first()).toHaveText(title);
  await expect(page.locator(".blog-post__content p").first()).toBeVisible();
  await expect(page.locator(".recent-posts__item")).toHaveCount(3);
  await expect(page.locator(".blog-post__socials a").first()).toHaveAttribute("href", /facebook\.com\/sharer/);
});

test("gallery filter and lightbox work", async ({ page }) => {
  await page.goto("/gallery");
  const items = page.locator(".gallery-masonry__item");
  test.skip((await items.count()) === 0, "no gallery data in this build");
  await waitForTemplateScripts(page);

  const filter = page.locator(".filter-panel__item").nth(1);
  const cls = (await filter.getAttribute("data-filter"))!.slice(1);
  await filter.click();
  await expect(filter).toHaveClass(/filter-panel__item--active/);
  await expect
    .poll(async () => page.locator(".gallery-masonry__item:visible").evaluateAll((els, c) => els.every((e) => e.classList.contains(c)), cls))
    .toBe(true);

  await page.locator(`.gallery-masonry__item.${cls} a`).first().click();
  await expect(page.locator(".fancybox-container")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".fancybox-container")).toHaveCount(0);
});

test("contact and join forms post somewhere real", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator("form.message-form")).toHaveAttribute("action", /^(https:\/\/formspree\.io\/|mailto:basefoundationwb@gmail\.com)/);
  await expect(page.locator("body")).not.toContainText("The Password Game");
  await page.goto("/join");
  await expect(page.locator("#volunteership form")).toHaveAttribute("method", "POST");
  await expect(page.locator("#internship input[name=track]")).toHaveValue("Internship");
});

test("donate shows the bank details from the old site", async ({ page }) => {
  await page.goto("/donate");
  await expect(page.locator("main")).toContainText("41554536104");
  await expect(page.locator("main")).toContainText("SBIN0014061");
});

test("unknown pages use the template 404", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  await expect(page.locator(".promo-primary__title")).toContainText("Page not found");
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
