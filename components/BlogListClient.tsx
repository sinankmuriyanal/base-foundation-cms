"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, BookOpen } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { BLOG_CATEGORIES } from "@/lib/types";
import type { Blog } from "@/lib/types";

interface Props {
  blogs: Blog[];
  initialCategory: string;
}

export default function BlogListClient({ blogs, initialCategory }: Props) {
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      const matchesCat = category === "All" || b.category === category;
      const matchesSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [blogs, category, search]);

  const allCats = ["All", ...BLOG_CATEGORIES];

  return (
    <>
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {allCats.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              category === cat
                ? "bg-brand text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand/30 hover:text-brand"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
          No posts found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block">
              <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-4">
                {blog.featuredImage ? (
                  <Image
                    src={blog.featuredImage}
                    alt={blog.title}
                    width={600}
                    height={450}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-50 flex items-center justify-center">
                    <BookOpen size={28} className="text-brand/30" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] uppercase tracking-widest text-accent font-medium">
                  {blog.category}
                </span>
                {blog.publishedAt && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{formatDate(blog.publishedAt)}</span>
                  </>
                )}
              </div>
              <h2 className="font-display text-lg leading-snug text-ink group-hover:text-brand transition-colors">
                {blog.title}
              </h2>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
