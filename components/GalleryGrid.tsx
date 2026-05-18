"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GALLERY_CATEGORIES } from "@/lib/types";
import type { GalleryImage } from "@/lib/types";

interface Props {
  images: GalleryImage[];
}

export default function GalleryGrid({ images }: Props) {
  const [category, setCategory] = useState("All");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  const allCats = ["All", ...GALLERY_CATEGORIES];

  const filtered = useMemo(() => {
    if (category === "All") return images;
    return images.filter((img) => img.category === category);
  }, [images, category]);

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {allCats.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all",
              category === cat
                ? "bg-brand text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand/30 hover:text-brand"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
        {filtered.map((img) => (
          <div
            key={img.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl bg-slate-100"
            onClick={() => setLightbox(img)}
          >
            <Image
              src={img.imageUrl}
              alt={img.caption || img.category}
              width={400}
              height={300}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-brand/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-xs text-white font-medium uppercase tracking-wider">
                {img.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-20 text-slate-400">No images in this category.</p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.imageUrl}
              alt={lightbox.caption || lightbox.category}
              width={1200}
              height={900}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
            {lightbox.caption && (
              <p className="text-center text-white/70 text-sm mt-3">{lightbox.caption}</p>
            )}
            <p className="text-center text-white/40 text-xs mt-1">{lightbox.category}</p>
          </div>
        </div>
      )}
    </>
  );
}
