"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { BLOG_CATEGORIES } from "@/lib/types";
import { slugify } from "@/lib/utils";
import type { Blog } from "@/lib/types";
import { Save, Upload, X, Eye, EyeOff } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface Props {
  blog: Blog | null;
  basePath?: string;
}

export default function BlogEditor({ blog, basePath = "/admin" }: Props) {
  const router = useRouter();
  const isNew = !blog;

  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [category, setCategory] = useState(blog?.category ?? "General");
  const [content, setContent] = useState(blog?.content ?? "");
  const [featuredImage, setFeaturedImage] = useState(blog?.featuredImage ?? "");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState(blog?.cloudinaryPublicId ?? "");
  const [tags, setTags] = useState<string[]>(blog?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [author, setAuthor] = useState(blog?.author ?? "");
  const [published, setPublished] = useState(blog?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title for new posts
  useEffect(() => {
    if (isNew) setSlug(slugify(title));
  }, [title, isNew]);

  function addTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim();
      if (!tags.includes(t)) setTags([...tags, t]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSave() {
    if (!title.trim()) { setError("Title is required."); return; }
    setError("");
    setSaving(true);

    const payload = { title, slug, category, content, featuredImage, cloudinaryPublicId, tags, author: author || null, published };
    const url = isNew ? "/api/admin/blogs" : `/api/admin/blogs/${blog!.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      router.push(`${basePath}/blogs`);
      router.refresh();
    } else {
      setError("Failed to save. Try again.");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition"
          placeholder="Post title"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition"
          placeholder="url-friendly-slug"
        />
      </div>

      {/* Category + Author row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
          >
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Author</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
            placeholder="Author name (optional)"
          />
        </div>
      </div>

      {/* Featured image */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Featured Image</label>
        {featuredImage ? (
          <div className="relative inline-block">
            <img src={featuredImage} alt="Featured" className="h-40 w-60 object-cover rounded-xl border border-slate-200" />
            <button
              onClick={() => { setFeaturedImage(""); setCloudinaryPublicId(""); }}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border border-slate-200 text-slate-500 hover:text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <CldUploadWidget
            uploadPreset="blog_images"
            onSuccess={(result) => {
              if (result.info && typeof result.info === "object") {
                setFeaturedImage((result.info as { secure_url: string }).secure_url);
                setCloudinaryPublicId((result.info as { public_id: string }).public_id);
              }
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-brand/40 hover:text-brand transition"
              >
                <Upload size={16} /> Upload featured image
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <RichTextEditor content={content} onChange={setContent} />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags</label>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
          placeholder="Type a tag and press Enter"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-brand-50 text-brand border border-brand/15">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-10 h-5 rounded-full transition-colors ${published ? "bg-brand" : "bg-slate-200"} relative`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${published ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-slate-700 flex items-center gap-1">
            {published ? <Eye size={14} className="text-brand" /> : <EyeOff size={14} className="text-slate-400" />}
            {published ? "Published" : "Draft"}
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/blogs")}
            className="px-5 py-2.5 text-sm text-slate-600 hover:text-ink border border-slate-200 rounded-full transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
