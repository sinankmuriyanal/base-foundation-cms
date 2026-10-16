import BlogEditor from "@/components/BlogEditor";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function NewBlogPage() {
  return (
    <div className="max-w-4xl">
      <AdminPageHeader title="New post" back={{ href: "/admin/blogs", label: "Blog posts" }} />
      <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-5 sm:p-8">
        <BlogEditor blog={null} basePath="/admin" />
      </div>
    </div>
  );
}
