import { getPublishedBlogs } from "@/lib/blogs";
import BlogListClient from "@/components/BlogListClient";

export const revalidate = 3600;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [blogs, { category }] = await Promise.all([getPublishedBlogs(), searchParams]);
  const activeCategory = category || "All";

  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-brand">Field Reports</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-4">Blog</h1>
          <p className="text-slate-500 max-w-xl">
            Ground-level documentation of our work — school visits, training events, and student milestones.
          </p>
        </div>

        {/* Client-side category filter + search */}
        <BlogListClient blogs={blogs} initialCategory={activeCategory} />
      </div>
    </div>
  );
}
