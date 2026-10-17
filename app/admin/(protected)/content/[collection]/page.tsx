import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { COLLECTIONS, isCollectionKey } from "@/lib/content/schema";
import { listCollection } from "@/lib/content/store";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ContentList, { type ListItem } from "@/components/admin/content/ContentList";

export const dynamic = "force-dynamic";

export default async function ContentListPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!isCollectionKey(collection)) notFound();
  const def = COLLECTIONS[collection];
  const items = await listCollection(collection, { includeHidden: true });

  const rows: ListItem[] = items.map((raw) => {
    const item = raw as unknown as Record<string, unknown>;
    return {
      id: String(item.id),
      title: String(item[def.titleField] ?? ""),
      subtitle: def.subtitleField ? String(item[def.subtitleField] ?? "") : "",
      image: def.imageField ? String(item[def.imageField] ?? "") : "",
      published: item.published === true,
      onHome: collection === "projects" ? item.showOnHome === true : undefined,
      viewHref: collection === "projects" ? `/programmes/${item.slug}` : collection === "team" ? "/about" : "/",
    };
  });

  return (
    <>
      <AdminPageHeader
        title={def.label}
        description={def.description}
        actions={
          <Link href={`/admin/content/${collection}/new`} className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
            <Plus size={16} /> New {def.singular}
          </Link>
        }
      />
      <ContentList collection={collection} items={rows} />
      <p className="text-xs text-slate-400 mt-3">Use the arrows to change the order shown on the website.</p>
    </>
  );
}
