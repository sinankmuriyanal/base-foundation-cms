"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import { SINGLETONS } from "@/lib/content/schema";
import type { SingletonKey } from "@/lib/content/types";
import FieldInput, { type Values } from "./FieldInput";

export default function SettingsForm({ doc, initial }: { doc: SingletonKey; initial: Values }) {
  const def = SINGLETONS[doc];
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const res = await fetch(`/api/admin/settings/${doc}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      setStatus({ ok: true, text: "Saved. The website is updated." });
      router.refresh();
    } else {
      setStatus({ ok: false, text: (await res.json().catch(() => null))?.error ?? "Failed to save. Try again." });
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {def.groups.map((group) => (
        <section key={group.title} className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-5 sm:p-6">
          <h2 className="font-medium text-ink mb-5">{group.title}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {group.fields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
                <FieldInput field={field} values={values} onChange={(p) => setValues((v) => ({ ...v, ...p }))} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 bg-[#f6f4ee]/95 backdrop-blur flex flex-wrap items-center justify-end gap-3">
        {status && (
          <p role={status.ok ? "status" : "alert"} className={`text-sm flex items-center gap-1.5 ${status.ok ? "text-brand" : "text-red-700"}`}>
            {status.ok && <CheckCircle2 size={15} />} {status.text}
          </p>
        )}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition disabled:opacity-60">
          <Save size={15} /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
