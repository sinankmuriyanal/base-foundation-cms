"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { COLLECTIONS } from "@/lib/content/schema";
import type { CollectionKey } from "@/lib/content/types";
import FieldInput, { inputClass, type Values } from "./FieldInput";

interface Props {
  collection: CollectionKey;
  /** Existing item, or null to create */
  item: (Values & { id: string }) | null;
}

export default function ContentForm({ collection, item }: Props) {
  const def = COLLECTIONS[collection];
  const router = useRouter();
  const [values, setValues] = useState<Values>(item ?? { published: true, ...(collection === "heroSlides" ? { layout: "left", buttonLabel: "Discover", buttonLink: "#about" } : {}) });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const listHref = `/admin/content/${collection}`;
  const patch = (p: Values) => setValues((v) => ({ ...v, ...p }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(item ? `/api/admin/content/${collection}/${item.id}` : `/api/admin/content/${collection}`, {
      method: item ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      router.push(listHref);
      router.refresh();
    } else {
      setError((await res.json().catch(() => null))?.error ?? "Failed to save. Try again.");
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {error && <p role="alert" className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</p>}

      {def.fields.map((field, i) => (
        <div key={field.key} className="space-y-6">
          <FieldInput field={field} values={values} onChange={patch} />
          {def.slugFrom && i === 0 && (
            <div>
              <label htmlFor="field-slug" className="block text-sm font-medium text-slate-700 mb-1.5">Page address</label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-brand/20">
                <span className="pl-3.5 text-sm text-slate-400 whitespace-nowrap">/programmes/</span>
                <input
                  id="field-slug"
                  value={String(values.slug ?? "")}
                  onChange={(e) => patch({ slug: e.target.value })}
                  placeholder="generated from the title"
                  className={`${inputClass} border-0 bg-transparent focus:ring-0 font-mono`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Changing this breaks links people may have saved to the old address.</p>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
        <button type="button" onClick={() => router.push(listHref)} className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:text-ink transition">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition disabled:opacity-60">
          <Save size={15} /> {saving ? "Saving…" : item ? "Save changes" : `Create ${def.singular}`}
        </button>
      </div>
    </form>
  );
}
