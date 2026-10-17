import { getPublishedBlogs } from "@/lib/blogs";
import { renderTemplate } from "@/lib/legacy/template";
import { blogCard, emptyNotice } from "@/lib/legacy/partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

export const revalidate = 3600;

// Column widths of the five homepage news cards on the original site
const HOME_CARD_COLUMNS = [
  "col-md-6 col-lg-7 col-xl-8",
  "col-md-6 col-lg-4",
  "col-md-6 col-lg-5 col-xl-4",
  "col-md-6 col-lg-4",
  "col-md-6 col-lg-4",
];

export default async function HomePage() {
  const latest = (await getPublishedBlogs()).slice(0, HOME_CARD_COLUMNS.length);
  const blog_cards = latest.length
    ? latest.map((b, i) => blogCard(b, HOME_CARD_COLUMNS[i])).join("")
    : emptyNotice("News coming soon.");

  return (
    <SiteShell active="home">
      <LegacyMain html={renderTemplate("home", { blog_cards })} />
    </SiteShell>
  );
}
