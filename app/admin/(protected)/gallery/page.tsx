import Link from "next/link";
import { getAllGalleryImages } from "@/lib/gallery";
import { getGalleryCategories } from "@/lib/gallery-categories";
import { cn } from "@/lib/utils";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import GalleryManager from "@/components/GalleryManager";
import GalleryCategoriesPanel from "@/components/admin/GalleryCategoriesPanel";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ tab }, images, categories] = await Promise.all([searchParams, getAllGalleryImages(), getGalleryCategories()]);
  const showCategories = tab === "categories";
  const counts = images.reduce<Record<string, number>>((acc, img) => ({ ...acc, [img.category]: (acc[img.category] ?? 0) + 1 }), {});

  const tabs = [
    { href: "/admin/gallery", label: "Photos", count: images.length, active: !showCategories },
    { href: "/admin/gallery?tab=categories", label: "Categories", count: categories.length, active: showCategories },
  ];

  return (
    <>
      <AdminPageHeader title="Gallery" description="Photos and categories shown on the website gallery." />
      <nav aria-label="Gallery sections" className="inline-flex p-1 rounded-lg bg-white ring-1 ring-black/5 mb-6">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.active ? "page" : undefined}
            className={cn("px-4 py-1.5 rounded-md text-sm transition", t.active ? "bg-brand text-white font-medium" : "text-slate-500 hover:text-ink")}
          >
            {t.label} <span className={cn("tabular-nums", t.active ? "text-white/70" : "text-slate-400")}>{t.count}</span>
          </Link>
        ))}
      </nav>
      {showCategories ? (
        <GalleryCategoriesPanel categories={categories} counts={counts} />
      ) : (
        <GalleryManager initialImages={images} categories={categories.map((c) => c.name)} />
      )}
    </>
  );
}
