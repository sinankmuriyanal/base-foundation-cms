import Link from "next/link";
import { getAllBlogs } from "@/lib/blogs";
import { getAllGalleryImages } from "@/lib/gallery";
import { BookOpen, Image as ImageIcon, Plus, ArrowRight } from "lucide-react";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [blogs, gallery] = await Promise.all([getAllBlogs(), getAllGalleryImages()]);

  const publishedCount = blogs.filter((b) => b.published).length;
  const draftCount = blogs.length - publishedCount;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Base Foundation CMS</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Posts", value: blogs.length, icon: BookOpen, color: "text-brand" },
            { label: "Published", value: publishedCount, icon: ArrowRight, color: "text-green-600" },
            { label: "Gallery Images", value: gallery.length, icon: ImageIcon, color: "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <stat.icon size={20} className={`${stat.color} mb-3`} />
              <div className="text-3xl font-display text-ink">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link href="/admin/blogs" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:border-brand/30 transition group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-ink mb-1">Manage Blogs</h3>
                <p className="text-xs text-slate-500">{draftCount} drafts, {publishedCount} published</p>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-brand transition-colors" />
            </div>
          </Link>
          <Link href="/admin/gallery" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:border-brand/30 transition group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-ink mb-1">Manage Gallery</h3>
                <p className="text-xs text-slate-500">{gallery.length} images</p>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-brand transition-colors" />
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-medium text-ink">Recent Posts</h2>
            <Link href="/admin/blogs/new" className="inline-flex items-center gap-1.5 text-xs text-brand font-medium hover:underline">
              <Plus size={14} /> New Post
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {blogs.slice(0, 8).map((blog) => (
              <div key={blog.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{blog.title}</p>
                  <p className="text-xs text-slate-400">{blog.category}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    blog.published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {blog.published ? "Published" : "Draft"}
                  </span>
                  <Link href={`/admin/blogs/${blog.id}`} className="text-xs text-brand hover:underline">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
