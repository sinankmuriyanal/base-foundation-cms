import { getPublishedBlogs } from "@/lib/blogs";
import { BLOG_CATEGORIES } from "@/lib/types";
import { renderTemplate } from "@/lib/legacy/template";
import { blogCard, emptyNotice } from "@/lib/legacy/partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

export const metadata = {
  title: "Blog | Base Foundation",
  description: "Field reports from Base Foundation's programmes across rural West Bengal.",
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [all, { category }] = await Promise.all([getPublishedBlogs(), searchParams]);
  const active = BLOG_CATEGORIES.find((c) => c === category);
  const blogs = active ? all.filter((b) => b.category === active) : all;
  const cards = blogs.length ? blogs.map((b) => blogCard(b)).join("") : emptyNotice("No posts yet.");

  return (
    <SiteShell active="blog">
      <LegacyMain html={renderTemplate("blog", { cards })} />
    </SiteShell>
  );
}
