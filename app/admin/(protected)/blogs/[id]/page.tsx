import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getBlogById } from "@/lib/blogs";
import BlogEditor from "@/components/BlogEditor";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await getBlogById(id);
  if (!blog) notFound();

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title="Edit post"
        back={{ href: "/admin/blogs", label: "Blog posts" }}
        actions={
          blog.published && (
            <a
              href={`/blog/${blog.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 rounded-lg text-sm text-slate-600 hover:text-brand hover:border-brand/30 transition"
            >
              <ExternalLink size={15} /> View live
            </a>
          )
        }
      />
      <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-5 sm:p-8">
        <BlogEditor blog={blog} basePath="/admin" />
      </div>
    </div>
  );
}
