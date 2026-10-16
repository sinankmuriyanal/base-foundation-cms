"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageOff, Pencil, Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { BLOG_CATEGORIES, type Blog } from "@/lib/types";
import BlogActions from "@/components/BlogActions";

type Status = "all" | "published" | "draft";

function shortDate(iso: string) {
  try {
    return format(parseISO(iso), "d MMM yyyy");
  } catch {
    return "";
  }
}

function Thumb({ blog, className }: { blog: Blog; className?: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-black/5", className)}>
      {blog.featuredImage ? (
        <Image src={blog.featuredImage} alt="" fill sizes="112px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
          <ImageOff size={18} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        published ? "bg-brand-50 text-brand" : "bg-amber-50 text-amber-700"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", published ? "bg-brand" : "bg-amber-500")} aria-hidden />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function BlogTable({ blogs }: { blogs: Blog[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [category, setCategory] = useState("All");

  const counts = useMemo(
    () => ({
      all: blogs.length,
      published: blogs.filter((b) => b.published).length,
      draft: blogs.filter((b) => !b.published).length,
    }),
    [blogs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogs.filter(
      (b) =>
        (status === "all" || b.published === (status === "published")) &&
        (category === "All" || b.category === category) &&
        (!q || b.title.toLowerCase().includes(q) || b.slug.includes(q))
    );
  }, [blogs, query, status, category]);

  return (
    <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between p-4 border-b border-slate-100">
        <div role="tablist" aria-label="Filter by status" className="inline-flex p-1 rounded-lg bg-slate-100 self-start">
          {(["all", "published", "draft"] as Status[]).map((s) => (
            <button
              key={s}
              role="tab"
              type="button"
              aria-selected={status === s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm capitalize transition",
                status === s ? "bg-white text-ink shadow-sm font-medium" : "text-slate-500 hover:text-ink"
              )}
            >
              {s} <span className="text-slate-400 tabular-nums">{counts[s]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="relative">
            <span className="sr-only">Search posts</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or slug"
              className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40"
            />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="All">All categories</option>
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-500 text-sm">{blogs.length === 0 ? "No posts yet." : "No posts match these filters."}</p>
          {blogs.length === 0 && (
            <Link href="/admin/blogs/new" className="inline-block mt-3 text-sm text-brand font-medium hover:underline">
              Write the first post
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <table className="hidden md:table w-full table-fixed text-sm">
            <colgroup>
              <col />
              <col className="w-40" />
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-32" />
            </colgroup>
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="font-medium px-4 py-3">Post</th>
                <th className="font-medium px-4 py-3">Category</th>
                <th className="font-medium px-4 py-3">Status</th>
                <th className="font-medium px-4 py-3">Date</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((blog) => (
                <tr key={blog.id} className="group hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blogs/${blog.id}`} className="flex items-center gap-4 min-w-0">
                      <Thumb blog={blog} className="w-28 h-[4.5rem]" />
                      <span className="min-w-0">
                        <span className="block font-medium text-ink leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                          {blog.title}
                        </span>
                        <span className="block text-xs text-slate-400 font-mono truncate mt-1">/blog/{blog.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 truncate" title={blog.category}>{blog.category}</td>
                  <td className="px-4 py-3"><StatusBadge published={blog.published} /></td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap tabular-nums">
                    {shortDate(blog.publishedAt ?? blog.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {blog.published && (
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-brand rounded-lg hover:bg-brand-50 transition"
                          title="View live"
                          aria-label={`View "${blog.title}" on the site`}
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                      <Link
                        href={`/admin/blogs/${blog.id}`}
                        className="p-2 text-slate-400 hover:text-brand rounded-lg hover:bg-brand-50 transition"
                        title="Edit"
                        aria-label={`Edit "${blog.title}"`}
                      >
                        <Pencil size={15} />
                      </Link>
                      <BlogActions blogId={blog.id} blogTitle={blog.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-slate-100">
            {filtered.map((blog) => (
              <li key={blog.id} className="flex gap-3 p-4">
                <Link href={`/admin/blogs/${blog.id}`} className="contents">
                  <Thumb blog={blog} className="w-24 h-16" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/blogs/${blog.id}`} className="block font-medium text-ink text-sm leading-snug line-clamp-2">
                    {blog.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-slate-500">
                    <StatusBadge published={blog.published} />
                    <span>{blog.category}</span>
                  </div>
                </div>
                <BlogActions blogId={blog.id} blogTitle={blog.title} />
              </li>
            ))}
          </ul>

          <p className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
            Showing {filtered.length} of {blogs.length} posts
          </p>
        </>
      )}
    </div>
  );
}
