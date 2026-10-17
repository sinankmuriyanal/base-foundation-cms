"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink, EyeOff, Home, ImageOff, Pencil, Trash2 } from "lucide-react";
import { COLLECTIONS } from "@/lib/content/schema";
import type { CollectionKey } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  published: boolean;
  onHome?: boolean;
  viewHref?: string;
}

export default function ContentList({ collection, items }: { collection: CollectionKey; items: ListItem[] }) {
  const def = COLLECTIONS[collection];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function send(url: string, init: RequestInit) {
    setBusy(true);
    setError("");
    const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
    setBusy(false);
    if (!res.ok) setError((await res.json().catch(() => null))?.error ?? "Something went wrong. Try again.");
    else router.refresh();
    return res.ok;
  }

  function move(index: number, delta: -1 | 1) {
    const ids = items.map((i) => i.id);
    [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
    send(`/api/admin/content/${collection}/reorder`, { method: "POST", body: JSON.stringify({ ids }) });
  }

  async function remove(id: string) {
    if (await send(`/api/admin/content/${collection}/${id}`, { method: "DELETE" })) setConfirming(null);
  }

  return (
    <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm overflow-hidden">
      {error && <p role="alert" className="m-4 bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg">{error}</p>}
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-500">No {def.label.toLowerCase()} yet.</p>
          <Link href={`/admin/content/${collection}/new`} className="inline-block mt-3 text-sm text-brand font-medium hover:underline">
            Add the first {def.singular}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item, i) => (
            <li key={item.id} className="px-4 py-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex flex-col">
                  <button type="button" aria-label={`Move ${item.title} up`} disabled={busy || i === 0} onClick={() => move(i, -1)} className="p-0.5 text-slate-400 hover:text-brand disabled:opacity-25">
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" aria-label={`Move ${item.title} down`} disabled={busy || i === items.length - 1} onClick={() => move(i, 1)} className="p-0.5 text-slate-400 hover:text-brand disabled:opacity-25">
                    <ArrowDown size={14} />
                  </button>
                </div>
                <Link href={`/admin/content/${collection}/${item.id}`} className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 group">
                  <div className={cn("relative w-20 h-14 sm:w-28 sm:h-[4.5rem] shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-black/5", collection === "team" && "w-14 h-14 sm:w-14 sm:h-14 rounded-full")}>
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- original-site paths and Cloudinary URLs
                      <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <ImageOff size={16} className="absolute inset-0 m-auto text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink leading-snug line-clamp-2 group-hover:text-brand transition-colors">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                      {item.subtitle && <span className="capitalize">{item.subtitle}</span>}
                      {!item.published && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 font-medium"><EyeOff size={11} /> Hidden</span>
                      )}
                      {item.onHome && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand px-2 py-0.5 font-medium"><Home size={11} /> Homepage</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  {item.viewHref && item.published && (
                    <a href={item.viewHref} target="_blank" rel="noreferrer" aria-label={`View ${item.title} on the site`} className="hidden sm:inline-flex p-2 text-slate-400 hover:text-brand rounded-lg hover:bg-brand-50 transition">
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <Link href={`/admin/content/${collection}/${item.id}`} aria-label={`Edit ${item.title}`} className="p-2 text-slate-400 hover:text-brand rounded-lg hover:bg-brand-50 transition">
                    <Pencil size={15} />
                  </Link>
                  <button type="button" aria-label={`Delete ${item.title}`} onClick={() => setConfirming(item.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {confirming === item.id && (
                <div className="mt-3 sm:ml-8 rounded-lg bg-red-50/60 border border-red-100 p-3 text-sm flex flex-wrap items-center gap-3">
                  <span className="text-ink">Delete <strong>{item.title}</strong>? This also removes its uploaded images.</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={() => remove(item.id)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-60">Delete</button>
                    <button type="button" onClick={() => setConfirming(null)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white">Cancel</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
