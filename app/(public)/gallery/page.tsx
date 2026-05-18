import { getAllGalleryImages } from "@/lib/gallery";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 3600;

export default async function GalleryPage() {
  const images = await getAllGalleryImages();

  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-wide">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-brand">Visual Archive</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-4">Gallery</h1>
          <p className="text-slate-500 max-w-xl">
            Moments from our programmes — drawing competitions, motivation classes, school visits,
            and community events across West Bengal.
          </p>
        </div>
        <GalleryGrid images={images} />
      </div>
    </div>
  );
}
