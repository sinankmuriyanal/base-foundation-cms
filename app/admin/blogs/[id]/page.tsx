import { getBlogById } from "@/lib/blogs";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/BlogEditor";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const blog = await getBlogById(params.id);
  if (!blog) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl text-ink mb-8">Edit Post</h1>
        <BlogEditor blog={blog} basePath="/admin" />
      </div>
    </div>
  );
}
