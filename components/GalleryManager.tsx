"use client";

import { useState } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { Trash2, Upload, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/types";

interface Props {
  initialImages: GalleryImage[];
  /** Category names in display order (managed on the Categories tab). */
  categories: string[];
}

export default function GalleryManager({ initialImages, categories }: Props) {
  const [images, setImages] = useState(initialImages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const allCats = ["All", ...categories];
  const filtered = filterCat === "All" ? images : images.filter((img) => img.category === filterCat);

  async function handleDelete(img: GalleryImage) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/gallery/${img.id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== img.id));
    }
  }

  function startEdit(img: GalleryImage) {
    setEditingId(img.id);
    setEditCategory(img.category);
    setEditCaption(img.caption);
  }

  async function saveEdit(imgId: string) {
    const res = await fetch(`/api/admin/gallery/${imgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: editCategory, caption: editCaption }),
    });
    if (res.ok) {
      setImages((prev) => prev.map((img) =>
        img.id === imgId ? { ...img, category: editCategory, caption: editCaption } : img
      ));
      setEditingId(null);
    }
  }

  async function handleUpload(result: unknown) {
    const info = (result as { info: { secure_url: string; public_id: string } }).info;
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: info.secure_url,
        cloudinaryPublicId: info.public_id,
        category: "General",
        caption: "",
      }),
    });
    if (res.ok) {
      const { id, order } = await res.json();
      const newImg: GalleryImage = {
        id,
        imageUrl: info.secure_url,
        cloudinaryPublicId: info.public_id,
        category: "General",
        caption: "",
        order,
        createdAt: new Date().toISOString(),
      };
      setImages((prev) => [...prev, newImg]);
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <CldUploadWidget
          signatureEndpoint="/api/admin/cloudinary-sign"
          onSuccess={handleUpload}
          options={{ folder: "base-foundation/gallery", multiple: true, maxFiles: 10, resourceType: "image" }}
        >
          {({ open }) => (
            <button
              onClick={() => open()}
              className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-brand-dark transition"
            >
              <Upload size={16} /> Upload Images
            </button>
          )}
        </CldUploadWidget>

        <div className="flex flex-wrap gap-2">
          {allCats.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition",
                filterCat === cat
                  ? "bg-brand text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-brand/30"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm">No images.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img) => (
            <div key={img.id} className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="aspect-square overflow-hidden bg-slate-100">
                <Image
                  src={img.imageUrl}
                  alt={img.caption || img.category}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>

              {editingId === img.id ? (
                <div className="p-3 space-y-2">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Caption"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(img.id)} className="flex-1 text-xs bg-brand text-white rounded-lg py-1.5 flex items-center justify-center gap-1">
                      <Check size={12} /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex-1 text-xs border border-slate-200 rounded-lg py-1.5 flex items-center justify-center gap-1 text-slate-500">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <p className="text-[11px] text-accent font-medium uppercase tracking-wide truncate">{img.category}</p>
                  {img.caption && <p className="text-xs text-slate-500 truncate">{img.caption}</p>}
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => startEdit(img)} className="flex-1 text-xs border border-slate-200 text-slate-500 rounded-lg py-1.5 flex items-center justify-center gap-1 hover:border-brand/30 hover:text-brand transition">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(img)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
