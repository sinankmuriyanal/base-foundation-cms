import { getAllGalleryImages } from "@/lib/gallery";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import GalleryManager from "@/components/GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const images = await getAllGalleryImages();

  return (
    <>
      <AdminPageHeader title="Gallery" description={`${images.length} photos on the website gallery.`} />
      <GalleryManager initialImages={images} />
    </>
  );
}
