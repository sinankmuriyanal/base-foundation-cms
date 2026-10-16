import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllBlogs } from "@/lib/blogs";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BlogTable from "@/components/admin/BlogTable";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const blogs = await getAllBlogs();

  return (
    <>
      <AdminPageHeader
        title="Blog posts"
        description="Field reports published on the website."
        actions={
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            <Plus size={16} /> New post
          </Link>
        }
      />
      <BlogTable blogs={blogs} />
    </>
  );
}
