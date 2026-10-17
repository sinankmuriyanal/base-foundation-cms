import { getAllGalleryImages } from "@/lib/gallery";
import { getGalleryCategoryNames } from "@/lib/gallery-categories";
import { FALLBACK_GALLERY_CATEGORY } from "@/lib/types";
import { cld, escapeHtml, renderTemplate } from "@/lib/legacy/template";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";
import WIDE_LEGACY_TILES from "@/legacy/templates/gallery-wide.json";

export const revalidate = 3600;

export const metadata = {
  title: "Gallery | Base Foundation",
  description: "Photos from Base Foundation programmes, competitions, classes and events.",
};

export default async function GalleryPage() {
  const [images, categories] = await Promise.all([getAllGalleryImages(), getGalleryCategoryNames()]);
  // Isotope filters on CSS classes; photos in an unknown category are grouped with the fallback.
  const categoryClass = (category: string) =>
    `category_${(categories.includes(category) ? categories.indexOf(category) : categories.indexOf(FALLBACK_GALLERY_CATEGORY)) + 1}`;
  const wide = new Set<number>(WIDE_LEGACY_TILES);

  const filters = [
    `<li class="filter-panel__item filter-panel__item--active" data-filter="*"><span>All Photos</span></li>`,
    ...categories.filter((c) => images.some((img) => categoryClass(img.category) === categoryClass(c))).map(
      (c) => `<li class="filter-panel__item" data-filter=".${categoryClass(c)}"><span>${escapeHtml(c)}</span></li>`
    ),
  ].join("\n");

  const items = images
    .map((img) => {
      // Migrated photos keep the old page's wide tiles; new uploads use the standard tile.
      const isWide = img.id.startsWith("legacy-gallery-") && wide.has(img.order);
      const full = escapeHtml(cld(img.imageUrl, 1600));
      const caption = img.caption ? `<h6 class="gallery-masonry__description">${escapeHtml(img.caption)}</h6>` : "";
      return `
      <div class="col-6 ${isWide ? "col-md-8" : "col-md-4"} gallery-masonry__item ${categoryClass(img.category)}">
        <a class="gallery-masonry__img gallery-masonry__item--height-2" href="${full}" data-fancybox="gallery" data-caption="${escapeHtml(img.caption || img.category)}"
          ><img class="img--bg" src="${escapeHtml(cld(img.imageUrl, isWide ? 1000 : 600))}" alt="${escapeHtml(img.caption || img.category)}" loading="lazy" />${caption}</a>
      </div>`;
    })
    .join("");

  return (
    <SiteShell active="gallery">
      <LegacyMain html={renderTemplate("gallery", { filters, items })} />
    </SiteShell>
  );
}
