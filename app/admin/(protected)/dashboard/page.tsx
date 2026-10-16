import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, FileClock, Image as ImageIcon, ImageOff, Plus, Upload } from "lucide-react";
import { getAllBlogs } from "@/lib/blogs";
import { getAllGalleryImages } from "@/lib/gallery";
import { formatDate } from "@/lib/utils";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [blogs, gallery] = await Promise.all([getAllBlogs(), getAllGalleryImages()]);
  const published = blogs.filter((b) => b.published).length;
  const drafts = blogs.length - published;
  const uncaptioned = gallery.filter((g) => !g.caption).length;

  const stats = [
    { label: "Published posts", value: published, icon: BookOpen, href: "/admin/blogs" },
    { label: "Drafts", value: drafts, icon: FileClock, href: "/admin/blogs" },
    { label: "Gallery images", value: gallery.length, icon: ImageIcon, href: "/admin/gallery" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="An overview of what's on the website."
        actions={
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            <Plus size={16} /> New post
          </Link>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="group bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-5 hover:ring-brand/30 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
                <Icon size={16} />
              </span>
            </div>
            <p className="font-display text-4xl text-ink tabular-nums">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-6">
        <section className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-medium text-ink">Recent posts</h2>
            <Link href="/admin/blogs" className="inline-flex items-center gap-1 text-sm text-brand hover:gap-2 transition-all">
              All posts <ArrowRight size={14} />
            </Link>
          </div>
          {blogs.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500">No posts yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {blogs.slice(0, 6).map((blog) => (
                <li key={blog.id}>
                  <Link href={`/admin/blogs/${blog.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/70 transition-colors">
                    <div className="relative w-16 h-11 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-black/5">
                      {blog.featuredImage ? (
                        <Image src={blog.featuredImage} alt="" fill sizes="64px" className="object-cover" />
                      ) : (
                        <ImageOff size={14} className="absolute inset-0 m-auto text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{blog.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {blog.category} · {formatDate(blog.publishedAt ?? blog.createdAt)}
                      </p>
                    </div>
                    <span className={`hidden sm:inline text-xs font-medium ${blog.published ? "text-brand" : "text-amber-700"}`}>
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <div className="bg-brand-dark text-white rounded-xl p-5">
            <p className="font-display text-lg mb-1">Quick actions</p>
            <p className="text-sm text-white/60 mb-4">Common tasks for keeping the site fresh.</p>
            <div className="space-y-2">
              <Link href="/admin/blogs/new" className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2.5 text-sm transition">
                <Plus size={15} className="text-accent" /> Write a field report
              </Link>
              <Link href="/admin/gallery" className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2.5 text-sm transition">
                <Upload size={15} className="text-accent" /> Upload photos
              </Link>
            </div>
          </div>
          {uncaptioned > 0 && (
            <Link href="/admin/gallery" className="block bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-5 hover:ring-brand/30 transition">
              <p className="text-sm font-medium text-ink">{uncaptioned} photos need captions</p>
              <p className="text-xs text-slate-500 mt-1">Captions help visitors and search engines understand each photo.</p>
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
