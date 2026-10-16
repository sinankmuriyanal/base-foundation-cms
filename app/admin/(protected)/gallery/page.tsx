import { getAllGalleryImages } from "@/lib/gallery";
import AdminNav from "@/components/AdminNav";
import GalleryManager from "@/components/GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const images = await getAllGalleryImages();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink">Gallery</h1>
          <p className="text-slate-500 text-sm mt-1">{images.length} images</p>
        </div>
        <GalleryManager initialImages={images} />
      </div>
    </div>
  );
}
