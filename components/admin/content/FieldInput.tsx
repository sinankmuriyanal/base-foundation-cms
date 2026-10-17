"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldDef } from "@/lib/content/schema";
import type { Highlight } from "@/lib/content/types";

export type Values = Record<string, unknown>;

export const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition";

interface Props {
  field: FieldDef;
  values: Values;
  onChange: (patch: Values) => void;
}

function Label({ field, htmlFor }: { field: FieldDef; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1.5">
      {field.label}
      {"required" in field && field.required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function Help({ text }: { text?: string }) {
  return text ? <p className="text-xs text-slate-400 mt-1.5">{text}</p> : null;
}

export default function FieldInput({ field, values, onChange }: Props) {
  const id = `field-${field.key}`;
  const value = values[field.key];

  switch (field.type) {
    case "text":
    case "link":
    case "email":
      return (
        <div>
          <Label field={field} htmlFor={id} />
          <input
            id={id}
            type={field.type === "email" ? "email" : "text"}
            value={String(value ?? "")}
            maxLength={field.type === "text" ? field.max : 500}
            placeholder={"placeholder" in field ? field.placeholder : undefined}
            onChange={(e) => onChange({ [field.key]: e.target.value })}
            className={inputClass}
          />
          <Help text={field.help} />
        </div>
      );

    case "textarea": {
      const text = String(value ?? "");
      return (
        <div>
          <Label field={field} htmlFor={id} />
          <textarea
            id={id}
            value={text}
            rows={field.rows ?? 4}
            maxLength={field.max}
            onChange={(e) => onChange({ [field.key]: e.target.value })}
            className={cn(inputClass, "resize-y leading-relaxed")}
          />
          <div className="flex justify-between gap-4">
            <Help text={field.help} />
            <p className="text-xs text-slate-400 mt-1.5 shrink-0 tabular-nums">
              {text.length}/{field.max}
            </p>
          </div>
        </div>
      );
    }

    case "select":
      return (
        <div>
          <Label field={field} htmlFor={id} />
          <select id={id} value={String(value ?? field.options[0])} onChange={(e) => onChange({ [field.key]: e.target.value })} className={inputClass}>
            {field.options.map((o) => (
              <option key={o} value={o}>
                {o === "" ? "None" : o.charAt(0).toUpperCase() + o.slice(1)}
              </option>
            ))}
          </select>
          <Help text={field.help} />
        </div>
      );

    case "toggle": {
      const on = value === true;
      return (
        <div className="flex items-start gap-3">
          <button
            id={id}
            type="button"
            role="switch"
            aria-checked={on}
            onClick={() => onChange({ [field.key]: !on })}
            className={cn("mt-0.5 w-10 h-6 rounded-full relative transition-colors shrink-0", on ? "bg-brand" : "bg-slate-200")}
          >
            <span className={cn("absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform", on ? "translate-x-5" : "translate-x-1")} />
          </button>
          <div>
            <label htmlFor={id} className="text-sm text-slate-700 cursor-pointer">
              {field.label}
            </label>
            <Help text={field.help} />
          </div>
        </div>
      );
    }

    case "image": {
      const url = String(value ?? "");
      return (
        <div>
          <Label field={field} />
          <div className="flex items-start gap-4">
            <div className="relative w-40 h-28 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-black/5 shrink-0">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element -- previews may be original-site paths or Cloudinary URLs
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus size={22} className="absolute inset-0 m-auto text-slate-300" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <CldUploadWidget
                signatureEndpoint="/api/admin/cloudinary-sign"
                options={{ folder: field.folder, multiple: false, resourceType: "image" }}
                onSuccess={(result) => {
                  const info = result.info as { secure_url?: string; public_id?: string } | undefined;
                  if (info?.secure_url) onChange({ [field.key]: info.secure_url, [`${field.key}PublicId`]: info.public_id ?? null });
                }}
              >
                {({ open }) => (
                  <button type="button" onClick={() => open()} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-brand/40 hover:text-brand transition">
                    <ImagePlus size={15} /> {url ? "Replace image" : "Upload image"}
                  </button>
                )}
              </CldUploadWidget>
              {url && !("required" in field && field.required) && (
                <button type="button" onClick={() => onChange({ [field.key]: "", [`${field.key}PublicId`]: null })} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition">
                  <X size={14} /> Remove
                </button>
              )}
            </div>
          </div>
          <Help text={field.help} />
        </div>
      );
    }

    case "highlights": {
      const items = (Array.isArray(value) ? value : []) as Highlight[];
      const set = (next: Highlight[]) => onChange({ [field.key]: next });
      return (
        <div>
          <Label field={field} />
          <div className="space-y-3">
            {items.map((h, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50/50">
                <div className="flex gap-2">
                  <input
                    aria-label={`Highlight ${i + 1} title`}
                    value={h.title}
                    maxLength={120}
                    placeholder="Title"
                    onChange={(e) => set(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                    className={inputClass}
                  />
                  <button type="button" aria-label={`Remove highlight ${i + 1}`} onClick={() => set(items.filter((_, j) => j !== i))} className="p-2.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  aria-label={`Highlight ${i + 1} text`}
                  value={h.body}
                  rows={2}
                  maxLength={1000}
                  placeholder="Text"
                  onChange={(e) => set(items.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))}
                  className={cn(inputClass, "resize-y")}
                />
              </div>
            ))}
            {items.length < 12 && (
              <button type="button" onClick={() => set([...items, { title: "", body: "" }])} className="inline-flex items-center gap-2 text-sm text-brand font-medium hover:underline">
                <Plus size={15} /> Add highlight
              </button>
            )}
          </div>
          <Help text={field.help} />
        </div>
      );
    }
  }
}
