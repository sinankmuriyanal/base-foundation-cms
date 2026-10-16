// Old static-site URLs (basefoundation.in, GitHub Pages) → new routes. 301s keep search rankings and shared links working.

export interface LegacyRedirect {
  source: string;
  destination: string;
}

// blog-postN.html → /blog/<slug>. Generated from scripts/blogs_raw.json by scripts/extract_content.py — do not edit by hand.
export const LEGACY_BLOG_REDIRECTS: Record<number, string> = {
  1: "need-assessment-conducted-by-base-foundation-in-schools-of-paikur-village",
  2: "drawing-competition-and-spoken-english-classes-to-empower-students-in-birbhum",
  3: "base-foundation-launched-the-madhyamik-sahayak",
  4: "empowerment-sessions-to-parents-of-bimpur-village-by-base-foundation",
  5: "conducted-one-day-english-language-teachers-training-program",
  6: "distributed-scholarships-to-four-orphaned-students",
  7: "first-milestone-achieved-successful-launch-of-the-map-bengal-test-exam-drive",
  8: "dreaming-is-your-responsibility-but-helping-you-realize-that-dream-is-ours-base",
  9: "congratulations-to-the-top-12-achievers-of-map-bengal-test-drive-2025",
  10: "base-foundation-launched-its-teachers-training-initiative",
  11: "visionary-ending-of-the-highly-creative-and-audacious-teachers-training-02",
  12: "base-classroom-hhr-01",
  13: "base-orientation-shibir-an-authentic-jerk-to-career-opportunities",
  14: "the-successful-accomplishment-teachcraft-01",
  15: "base-foundation-distributes-base-foundation-kits-to-60-impoverished-families-as",
  16: "teachcraft-04-home-or-classroom-management-is-key",
  17: "base-english-academy-a-flagship-spoken-english-project-for-rural-west-bengal",
  18: "base-computer-academy-digital-literacy-project-for-deprived-students",
  19: "teachcraft-03-a-teachers-training-initiative-by-base-foundation",
  20: "kalahpur-learning-centre-inauguration-of-another-base-classroom",
  21: "ground-report-amdole-high-school-visit-under-map-bengal-project",
  22: "base-foundation-launches-map-bengal-project-to-empower-marginalized-students",
  23: "base-foundation-s-visit-to-kalahapur-h-m-k-h-school",
};

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
