import { notFound } from "next/navigation";
import { COLLECTIONS, isCollectionKey } from "@/lib/content/schema";
import { getCollectionItem } from "@/lib/content/store";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ContentForm from "@/components/admin/content/ContentForm";

export const dynamic = "force-dynamic";

export default async function ContentEditPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  if (!isCollectionKey(collection)) notFound();
  const def = COLLECTIONS[collection];

  const item = id === "new" ? null : await getCollectionItem(collection, id);
  if (id !== "new" && !item) notFound();

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title={item ? `Edit ${def.singular}` : `New ${def.singular}`}
        back={{ href: `/admin/content/${collection}`, label: def.label }}
      />
      <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-5 sm:p-8">
        <ContentForm collection={collection} item={item as unknown as (Record<string, unknown> & { id: string }) | null} />
      </div>
    </div>
  );
}
