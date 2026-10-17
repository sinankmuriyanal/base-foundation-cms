import { getPublishedBlogs } from "@/lib/blogs";
import { getSingleton, listCollection } from "@/lib/content/store";
import { renderTemplate } from "@/lib/legacy/template";
import { blogCard, emptyNotice } from "@/lib/legacy/partials";
import { heroSlides, paragraphs, phoneLinks, programSlides, projectSlides, socialItems } from "@/lib/legacy/content-partials";
import { escapeHtml } from "@/lib/legacy/template";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

// Renders per request from the tagged data cache (lib/cache.ts), so admin edits appear immediately.
export const dynamic = "force-dynamic";

// Column widths of the five homepage news cards on the original site
const HOME_CARD_COLUMNS = [
  "col-md-6 col-lg-7 col-xl-8",
  "col-md-6 col-lg-4",
  "col-md-6 col-lg-5 col-xl-4",
  "col-md-6 col-lg-4",
  "col-md-6 col-lg-4",
];

export default async function HomePage() {
  const [blogs, slides, projects, programs, site, pages] = await Promise.all([
    getPublishedBlogs(),
    listCollection("heroSlides"),
    listCollection("projects"),
    listCollection("programs"),
    getSingleton("site"),
    getSingleton("pages"),
  ]);

  const latest = blogs.slice(0, HOME_CARD_COLUMNS.length);
  const html = renderTemplate("home", {
    hero_slides: heroSlides(slides),
    email: site.email,
    phones_promo: phoneLinks(site, "promo-pannel__link"),
    socials_promo: socialItems(site, "promo-socials__item", "promo-socials__link"),
    about_heading1: pages.homeAboutHeading1,
    about_heading2: pages.homeAboutHeading2,
    about_paragraphs: [
      pages.homeAboutLead ? `<p><strong class="color--white">${escapeHtml(pages.homeAboutLead)}</strong></p>` : "",
      paragraphs(pages.homeAboutBody),
    ].join("\n"),
    project_slides: projectSlides(projects.filter((p) => p.showOnHome)),
    programs_intro: pages.programsIntro,
    program_slides: programSlides(programs),
    blog_cards: latest.length ? latest.map((b, i) => blogCard(b, HOME_CARD_COLUMNS[i])).join("") : emptyNotice("News coming soon."),
  });

  return (
    <SiteShell active="home">
      <LegacyMain html={html} />
    </SiteShell>
  );
}
