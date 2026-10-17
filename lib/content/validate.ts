import type { FieldDef } from "./schema";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const CLOUDINARY_URL = /^https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\//;
const LEGACY_IMAGE = /^\/legacy\/img\/[\w./-]+$/;
const SAFE_LINK = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function line(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function paragraphs(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()
    : "";
}

export function isAllowedImage(url: string): boolean {
  return CLOUDINARY_URL.test(url) || (LEGACY_IMAGE.test(url) && !url.includes(".."));
}

/** Validates `body` against field definitions. Image fields also yield `<key>PublicId`. */
export function parseFields(fields: FieldDef[], body: Record<string, unknown>): Result<Record<string, unknown>> {
  const data: Record<string, unknown> = {};

  for (const f of fields) {
    const raw = body[f.key];
    switch (f.type) {
      case "text":
      case "textarea": {
        const v = f.type === "text" ? line(raw) : paragraphs(raw);
        if (f.required && !v) return { ok: false, error: `${f.label} is required` };
        if (v.length > f.max) return { ok: false, error: `${f.label} must be ${f.max} characters or fewer` };
        data[f.key] = v;
        break;
      }
      case "link": {
        const v = line(raw);
        if (f.required && !v) return { ok: false, error: `${f.label} is required` };
        if (v && (!SAFE_LINK.test(v) || v.length > 500))
          return { ok: false, error: `${f.label} must start with /, #, https://, mailto: or tel:` };
        data[f.key] = v;
        break;
      }
      case "email": {
        const v = line(raw);
        if (f.required && !v) return { ok: false, error: `${f.label} is required` };
        if (v && !EMAIL.test(v)) return { ok: false, error: `${f.label} must be a valid email address` };
        data[f.key] = v;
        break;
      }
      case "select": {
        const v = typeof raw === "string" && f.options.includes(raw) ? raw : f.options[0];
        if (f.required && !v) return { ok: false, error: `${f.label} is required` };
        data[f.key] = v;
        break;
      }
      case "toggle":
        data[f.key] = raw === true;
        break;
      case "image": {
        const v = line(raw);
        if (f.required && !v) return { ok: false, error: `${f.label} is required` };
        if (v && !isAllowedImage(v)) return { ok: false, error: `${f.label} must be uploaded through the image picker` };
        data[f.key] = v;
        const publicId = line(body[`${f.key}PublicId`]);
        data[`${f.key}PublicId`] = v && CLOUDINARY_URL.test(v) && publicId ? publicId : null;
        break;
      }
      case "highlights": {
        const list = Array.isArray(raw) ? raw : [];
        const items = list
          .map((h) => (h && typeof h === "object" ? (h as Record<string, unknown>) : {}))
          .map((h) => ({ title: line(h.title), body: paragraphs(h.body) }))
          .filter((h) => h.title || h.body);
        if (items.length > 12) return { ok: false, error: `${f.label}: at most 12 items` };
        if (items.some((h) => h.title.length > 120 || h.body.length > 1000))
          return { ok: false, error: `${f.label}: titles up to 120 and text up to 1000 characters` };
        data[f.key] = items;
        break;
      }
    }
  }
  return { ok: true, data };
}

/** Cloudinary public ids held by a document's image fields. */
export function imagePublicIds(fields: FieldDef[], doc: Record<string, unknown>): string[] {
  return fields
    .filter((f) => f.type === "image")
    .map((f) => doc[`${f.key}PublicId`])
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}
