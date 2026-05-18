import BlogEditor from "@/components/BlogEditor";
import AdminNav from "@/components/AdminNav";

export default function NewBlogPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl text-ink mb-8">New Post</h1>
        <BlogEditor blog={null} basePath="/admin" />
      </div>
    </div>
  );
}
