"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Lock, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FALLBACK_GALLERY_CATEGORY, type GalleryCategory } from "@/lib/types";

interface Props {
  categories: GalleryCategory[];
  counts: Record<string, number>;
}

const input =
  "px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40";

export default function GalleryCategoriesPanel({ categories, counts }: Props) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; moveTo: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function call(url: string, init: RequestInit, success: (data: Record<string, unknown>) => string) {
    setBusy(true);
    setError("");
    setNotice("");
    const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Try again.");
      return false;
    }
    setNotice(success(data));
    router.refresh();
    return true;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (await call("/api/admin/gallery-categories", { method: "POST", body: JSON.stringify({ name: newName }) }, () => `Added "${newName.trim()}".`))
      setNewName("");
  }

  async function rename() {
    if (!editing) return;
    const ok = await call(
      `/api/admin/gallery-categories/${editing.id}`,
      { method: "PATCH", body: JSON.stringify({ name: editing.name }) },
      (d) => `Renamed. ${d.photosUpdated ?? 0} photo(s) updated.`
    );
    if (ok) setEditing(null);
  }

  async function remove() {
    if (!deleting) return;
    const ok = await call(
      `/api/admin/gallery-categories/${deleting.id}?moveTo=${encodeURIComponent(deleting.moveTo)}`,
      { method: "DELETE" },
      (d) => `Deleted. ${d.photosMoved ?? 0} photo(s) moved to "${d.movedTo}".`
    );
    if (ok) setDeleting(null);
  }

  async function move(index: number, delta: -1 | 1) {
    const ids = categories.map((c) => c.id);
    const target = index + delta;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await call("/api/admin/gallery-categories/reorder", { method: "POST", body: JSON.stringify({ ids }) }, () => "Order saved.");
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-6 items-start">
      <section className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-medium text-ink">Photo categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">The order here is the order of the filter buttons on the website gallery.</p>
        </div>

        {(error || notice) && (
          <p role={error ? "alert" : "status"} className={cn("mx-5 mt-4 rounded-lg px-4 py-2.5 text-sm", error ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand")}>
            {error || notice}
          </p>
        )}

        <ul className="divide-y divide-slate-100">
          {categories.map((c, i) => {
            const isFallback = c.name === FALLBACK_GALLERY_CATEGORY;
            const count = counts[c.name] ?? 0;
            return (
              <li key={c.id || c.name} className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <button type="button" aria-label={`Move ${c.name} up`} disabled={busy || i === 0 || !c.id} onClick={() => move(i, -1)} className="p-0.5 text-slate-400 hover:text-brand disabled:opacity-25">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" aria-label={`Move ${c.name} down`} disabled={busy || i === categories.length - 1 || !c.id} onClick={() => move(i, 1)} className="p-0.5 text-slate-400 hover:text-brand disabled:opacity-25">
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {editing?.id === c.id ? (
                    <form className="flex flex-1 items-center gap-2" onSubmit={(e) => { e.preventDefault(); rename(); }}>
                      <label className="sr-only" htmlFor={`rename-${c.id}`}>New name for {c.name}</label>
                      <input id={`rename-${c.id}`} autoFocus value={editing.name} maxLength={40} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={cn(input, "flex-1")} />
                      <button type="submit" disabled={busy} aria-label="Save name" className="p-2 rounded-lg bg-brand text-white disabled:opacity-60"><Check size={15} /></button>
                      <button type="button" onClick={() => setEditing(null)} aria-label="Cancel rename" className="p-2 rounded-lg border border-slate-200 text-slate-500"><X size={15} /></button>
                    </form>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate flex items-center gap-1.5">
                          {c.name}
                          {isFallback && <Lock size={12} className="text-slate-400" aria-label="Fallback category" />}
                        </p>
                        <p className="text-xs text-slate-400">{count} photo{count === 1 ? "" : "s"}</p>
                      </div>
                      {!isFallback && c.id && (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => { setDeleting(null); setEditing({ id: c.id, name: c.name }); }} aria-label={`Rename ${c.name}`} className="p-2 text-slate-400 hover:text-brand rounded-lg hover:bg-brand-50 transition">
                            <Pencil size={15} />
                          </button>
                          <button type="button" onClick={() => { setEditing(null); setDeleting({ id: c.id, moveTo: FALLBACK_GALLERY_CATEGORY }); }} aria-label={`Delete ${c.name}`} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {deleting?.id === c.id && (
                  <div className="mt-3 ml-8 rounded-lg bg-red-50/60 border border-red-100 p-3 text-sm">
                    <p className="text-ink mb-2">
                      Delete <strong>{c.name}</strong>?{" "}
                      {count > 0 ? `Its ${count} photo${count === 1 ? "" : "s"} will move to:` : "It has no photos."}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {count > 0 && (
                        <select aria-label="Move photos to" value={deleting.moveTo} onChange={(e) => setDeleting({ ...deleting, moveTo: e.target.value })} className={input}>
                          {categories.filter((o) => o.id !== c.id).map((o) => <option key={o.name}>{o.name}</option>)}
                        </select>
                      )}
                      <button type="button" disabled={busy} onClick={remove} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-60">Delete category</button>
                      <button type="button" onClick={() => setDeleting(null)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600">Cancel</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-5">
        <h2 className="font-medium text-ink mb-1">New category</h2>
        <p className="text-xs text-slate-500 mb-4">Appears as a filter on the gallery once it has photos.</p>
        <form onSubmit={add} className="space-y-3">
          <label className="sr-only" htmlFor="new-category">Category name</label>
          <input id="new-category" value={newName} maxLength={40} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Independence Day" className={cn(input, "w-full")} />
          <button type="submit" disabled={busy || !newName.trim()} className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition disabled:opacity-50">
            <Plus size={15} /> Add category
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-4 flex items-start gap-1.5">
          <Lock size={12} className="mt-0.5 shrink-0" /> &ldquo;{FALLBACK_GALLERY_CATEGORY}&rdquo; is the fallback for photos without a category, so it can&rsquo;t be renamed or deleted.
        </p>
      </aside>
    </div>
  );
}
