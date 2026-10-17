import fs from "node:fs";
import path from "node:path";

// HTML fragments imported from the original basefoundation.in template (legacy/templates/*.html).
// `{{name}}` inserts an HTML-escaped value, `{{{name}}}` inserts trusted HTML.

const DIR = path.join(process.cwd(), "legacy", "templates");
const cache = new Map<string, string>();

export type TemplateVars = Record<string, string | number>;

export function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function loadTemplate(name: string): string {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;
  const html = fs.readFileSync(path.join(DIR, `${name}.html`), "utf8");
  if (process.env.NODE_ENV === "production") cache.set(name, html);
  return html;
}

export function fill(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\{)?\s*([\w.]+)\s*\}?\}\}/g, (match, raw: string | undefined, key: string) => {
    if (!(key in vars)) throw new Error(`Template variable "${key}" was not provided`);
    return raw ? String(vars[key]) : escapeHtml(vars[key]);
  });
}

export function renderTemplate(name: string, vars: TemplateVars = {}): string {
  return fill(loadTemplate(name), vars);
}

/** Strips the outer <main class="main"> so pages can render it as a real element. */
export function mainInner(html: string): string {
  return html.replace(/^\s*<main class="main">/, "").replace(/<\/main>\s*$/, "");
}

/** Cloudinary delivery URL with automatic format/quality and a width cap. */
export function cld(url: string | null | undefined, width: number): string {
  if (!url) return "";
  return url.includes("/image/upload/") ? url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`) : url;
}

export function textExcerpt(html: string, words = 40): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const parts = text.split(" ");
  return parts.length > words ? `${parts.slice(0, words).join(" ")}…` : text;
}
