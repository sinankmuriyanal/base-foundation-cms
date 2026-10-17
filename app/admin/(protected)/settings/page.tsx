import Link from "next/link";
import { SINGLETONS } from "@/lib/content/schema";
import { getSingleton } from "@/lib/content/store";
import type { SingletonKey } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SettingsForm from "@/components/admin/content/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab: SingletonKey = (await searchParams).tab === "pages" ? "pages" : "site";
  const def = SINGLETONS[tab];
  const values = tab === "site" ? await getSingleton("site") : await getSingleton("pages");

  return (
    <div className="max-w-4xl">
      <AdminPageHeader title="Settings" description={def.description} />
      <nav aria-label="Settings sections" className="inline-flex p-1 rounded-lg bg-white ring-1 ring-black/5 mb-6">
        {(Object.keys(SINGLETONS) as SingletonKey[]).map((key) => (
          <Link
            key={key}
            href={key === "site" ? "/admin/settings" : `/admin/settings?tab=${key}`}
            aria-current={tab === key ? "page" : undefined}
            className={cn("px-4 py-1.5 rounded-md text-sm transition", tab === key ? "bg-brand text-white font-medium" : "text-slate-500 hover:text-ink")}
          >
            {SINGLETONS[key].label}
          </Link>
        ))}
      </nav>
      <SettingsForm key={tab} doc={tab} initial={values as unknown as Record<string, unknown>} />
    </div>
  );
}
