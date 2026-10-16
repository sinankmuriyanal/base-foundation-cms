import Link from "next/link";
import { getAllBlogs } from "@/lib/blogs";
import { Plus, Pencil } from "lucide-react";
import AdminNav from "@/components/AdminNav";
import BlogActions from "@/components/BlogActions";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink">Blog Posts</h1>
            <p className="text-slate-500 text-sm mt-1">{blogs.length} total posts</p>
          </div>
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            <Plus size={16} /> New Post
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {blogs.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm">No posts yet.</div>
            )}
            {blogs.map((blog) => (
              <div key={blog.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-ink truncate">{blog.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{blog.category}</span>
                    <span className="text-slate-200">·</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      blog.published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/blogs/${blog.id}`}
                    className="p-2 text-slate-400 hover:text-brand rounded-lg hover:bg-brand-50 transition"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </Link>
                  <BlogActions blogId={blog.id} blogTitle={blog.title} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
