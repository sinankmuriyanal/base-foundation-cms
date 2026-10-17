import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogBySlug, getPublishedBlogs } from "@/lib/blogs";
import { BLOG_CATEGORIES } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { sanitizeContent } from "@/lib/validation";
import { SITE } from "@/lib/site";
import { cld, escapeHtml, renderTemplate } from "@/lib/legacy/template";
import { blogExcerpt } from "@/lib/legacy/partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const blogs = await getPublishedBlogs();
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogBySlug((await params).slug);
  if (!blog) return {};
  return {
    title: `${blog.title} | Base Foundation`,
    description: blogExcerpt(blog),
    openGraph: { title: blog.title, images: blog.featuredImage ? [cld(blog.featuredImage, 1200)] : [] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [blog, all] = await Promise.all([getBlogBySlug(slug), getPublishedBlogs()]);
  if (!blog) notFound();

  const url = `${SITE.url}/blog/${blog.slug}`;
  const usedCategories = BLOG_CATEGORIES.filter((c) => all.some((b) => b.category === c));
  const recent = all.filter((b) => b.id !== blog.id).slice(0, 3);

  const html = renderTemplate("blog-post", {
    image: blog.featuredImage
      ? `<div class="blog-post__img"><img class="img--bg" src="${escapeHtml(cld(blog.featuredImage, 1400))}" alt="${escapeHtml(blog.title)}" /></div>`
      : "",
    author: blog.author ?? "",
    date: blog.publishedAt ? formatDate(blog.publishedAt) : "",
    title: blog.title,
    content: sanitizeContent(blog.content),
    tags: [blog.category, ...blog.tags]
      .map((t) => `<a class="blog-post__tag" href="/blog?category=${encodeURIComponent(t)}">#${escapeHtml(t)}</a>`)
      .join(""),
    share_facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    share_twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(blog.title)}`,
    share_whatsapp: `https://wa.me/?text=${encodeURIComponent(`${blog.title} ${url}`)}`,
    categories: usedCategories
      .map((c) => `<li><a href="/blog?category=${encodeURIComponent(c)}">${escapeHtml(c)}</a></li>`)
      .join("\n"),
    recent: recent
      .map(
        (b) => `
            <div class="recent-posts__item">
              <div class="recent-posts__item-img">${
                b.featuredImage ? `<img class="img--bg" src="${escapeHtml(cld(b.featuredImage, 200))}" alt="" loading="lazy" />` : ""
              }</div>
              <div class="recent-posts__item-description">
                <a class="recent-posts__item-link" href="/blog/${encodeURIComponent(b.slug)}">${escapeHtml(b.title)}</a>
                <span class="recent-posts__item-value">${escapeHtml(b.publishedAt ? formatDate(b.publishedAt) : "")}</span>
              </div>
            </div>`
      )
      .join(""),
  });

  return (
    <SiteShell active="blog">
      <LegacyMain html={html} />
    </SiteShell>
  );
}
