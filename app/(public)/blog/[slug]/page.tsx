import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogBySlug, getPublishedBlogs } from "@/lib/blogs";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Tag } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateStaticParams() {
  const blogs = await getPublishedBlogs();
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) return {};
  return {
    title: `${blog.title} | Base Foundation`,
    description: blog.title,
    openGraph: { images: blog.featuredImage ? [blog.featuredImage] : [] },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) notFound();

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero image */}
      {blog.featuredImage && (
        <div className="relative h-[55vh] w-full overflow-hidden bg-brand-dark">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/10 to-transparent" />
        </div>
      )}

      <div className="container-narrow">
        {/* Back link */}
        <div className={blog.featuredImage ? "-mt-8 relative z-10 mb-8" : "pt-28 mb-8"}>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand transition-colors"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>

        {/* Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-accent font-medium">
            {blog.category}
          </span>
          {blog.publishedAt && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-400">{formatDate(blog.publishedAt)}</span>
            </>
          )}
          {blog.author && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-500">by {blog.author}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-ink mb-8">
          {blog.title}
        </h1>

        {/* Content */}
        <div
          className="prose-blog pb-16"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="border-t border-slate-200 pt-8 pb-16 flex flex-wrap gap-2 items-center">
            <Tag size={14} className="text-slate-400" />
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs rounded-full bg-brand-50 text-brand border border-brand/15"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
