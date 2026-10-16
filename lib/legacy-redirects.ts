// Old static-site URLs (basefoundation.in, GitHub Pages) → new routes. 301s keep search rankings and shared links working.

export interface LegacyRedirect {
  source: string;
  destination: string;
}

// blog-postN.html → /blog/<slug>. Generated from scripts/blogs_raw.json by scripts/extract_blogs.py — do not edit by hand.
export const LEGACY_BLOG_REDIRECTS: Record<number, string> = {};

const PAGE_REDIRECTS: Record<string, string> = {
  "/index.html": "/",
  "/blog.html": "/blog",
  "/blog-post.html": "/blog",
  "/gallery.html": "/gallery",
  "/about.html": "/about",
  "/contact us.html": "/contact",
  "/Education.html": "/programmes",
  "/school visit.html": "/programmes/school-visit",
  "/Madhyamik Sahayak.html": "/programmes/madhyamik-sahayak",
  "/team.html": "/about",
  "/causes.html": "/programmes",
  "/causes_2.html": "/programmes",
  "/causes_3.html": "/programmes",
  "/cause-details.html": "/donate",
  "/projects.html": "/programmes",
  "/events.html": "/blog",
  "/event-details.html": "/blog",
  "/storie-details.html": "/blog",
  "/faq.html": "/contact",
  "/front_2.html": "/",
  "/front_3.html": "/",
  "/typography.html": "/",
  "/icons.html": "/",
  "/counters.html": "/",
};

// Next matches redirect sources against the encoded path, so spaces must be %20.
function encodePath(path: string) {
  return path.replace(/ /g, "%20");
}

export function getLegacyRedirects(): LegacyRedirect[] {
  const pages = Object.entries(PAGE_REDIRECTS).map(([source, destination]) => ({
    source: encodePath(source),
    destination,
  }));
  const blogs = Object.entries(LEGACY_BLOG_REDIRECTS).map(([n, slug]) => ({
    source: `/blog-post${n}.html`,
    destination: `/blog/${slug}`,
  }));
  return [...blogs, ...pages];
}
