import { BLOG_CATEGORIES } from "@/lib/types";
import type { CollectionKey, SingletonKey } from "./types";

// One definition per editable content type. Drives both the admin forms and server-side validation.

export type FieldDef =
  | { key: string; label: string; type: "text"; max: number; required?: boolean; help?: string; placeholder?: string }
  | { key: string; label: string; type: "textarea"; max: number; required?: boolean; help?: string; rows?: number }
  | { key: string; label: string; type: "link"; required?: boolean; help?: string; placeholder?: string }
  | { key: string; label: string; type: "email"; required?: boolean; help?: string }
  | { key: string; label: string; type: "select"; options: readonly string[]; required?: boolean; help?: string }
  | { key: string; label: string; type: "toggle"; help?: string }
  | { key: string; label: string; type: "image"; required?: boolean; help?: string; folder: string }
  | { key: string; label: string; type: "highlights"; help?: string };

export interface CollectionDef {
  key: CollectionKey;
  /** Firestore collection name */
  collection: string;
  label: string;
  singular: string;
  description: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  /** Collection has a unique, URL-safe `slug` derived from the title. */
  slugFrom?: string;
  /** Public pages to revalidate after a change */
  paths: string[];
  fields: FieldDef[];
}

export interface SingletonDef {
  key: SingletonKey;
  /** Firestore document path: settings/<docId> */
  docId: string;
  label: string;
  description: string;
  groups: { title: string; fields: FieldDef[] }[];
}

const published: FieldDef = { key: "published", label: "Visible on the website", type: "toggle" };

export const COLLECTIONS: Record<CollectionKey, CollectionDef> = {
  projects: {
    key: "projects",
    collection: "projects",
    label: "Projects",
    singular: "project",
    description: "Each project has its own page under Programmes. Toggle “Homepage” to show it in the Our Projects slider.",
    titleField: "title",
    subtitleField: "area",
    imageField: "image",
    slugFrom: "title",
    paths: ["/", "/programmes", "/donate"],
    fields: [
      { key: "title", label: "Title", type: "text", max: 120, required: true },
      { key: "area", label: "Area", type: "select", options: ["Education", "Training", "Community"], required: true },
      { key: "summary", label: "Summary", type: "textarea", max: 700, required: true, rows: 4, help: "Shown on the homepage slider, the Programmes list and at the top of the project page." },
      { key: "body", label: "More details", type: "textarea", max: 3000, rows: 5, help: "Optional extra paragraphs on the project page. Leave a blank line between paragraphs." },
      { key: "highlights", label: "Programme highlights", type: "highlights", help: "Optional headed points shown on the project page." },
      { key: "image", label: "Main image", type: "image", required: true, folder: "base-foundation/projects" },
      { key: "listImage", label: "Programmes list image", type: "image", folder: "base-foundation/projects", help: "Optional. Defaults to the main image." },
      { key: "blogCategory", label: "Related blog category", type: "select", options: ["", ...BLOG_CATEGORIES], help: "Adds a “Read field reports” button linking to posts in this category." },
      { key: "showOnHome", label: "Show in the homepage “Our Projects” slider", type: "toggle" },
      published,
    ],
  },
  programs: {
    key: "programs",
    collection: "programs",
    label: "BASE Programs",
    singular: "program",
    description: "Cards in the homepage “BASE Programs” slider.",
    titleField: "title",
    subtitleField: "label",
    imageField: "image",
    paths: ["/"],
    fields: [
      { key: "title", label: "Title", type: "text", max: 120, required: true },
      { key: "label", label: "Badge", type: "text", max: 40, placeholder: "Skill development" },
      { key: "text", label: "Description", type: "textarea", max: 1000, required: true, rows: 5 },
      { key: "link", label: "Title link", type: "link", placeholder: "/programmes/teachcraft", help: "Optional. A page on this site (starting with /) or a full https:// address." },
      { key: "image", label: "Image", type: "image", required: true, folder: "base-foundation/programs" },
      published,
    ],
  },
  heroSlides: {
    key: "heroSlides",
    collection: "heroSlides",
    label: "Hero slides",
    singular: "slide",
    description: "The large rotating slides at the top of the homepage.",
    titleField: "titleLine1",
    subtitleField: "titleLine2",
    imageField: "image",
    paths: ["/"],
    fields: [
      { key: "titleLine1", label: "Heading (bold part)", type: "text", max: 80, required: true },
      { key: "titleLine2", label: "Heading (light part)", type: "text", max: 80 },
      { key: "titleBreak", label: "Start the light part on a new line", type: "toggle" },
      { key: "subtitle", label: "Text", type: "textarea", max: 400, rows: 3 },
      { key: "buttonLabel", label: "Button label", type: "text", max: 30, placeholder: "Discover", help: "Leave empty to hide the button." },
      { key: "buttonLink", label: "Button link", type: "link", placeholder: "#about" },
      { key: "layout", label: "Text position", type: "select", options: ["left", "center"], required: true },
      { key: "image", label: "Background image", type: "image", required: true, folder: "base-foundation/hero" },
      published,
    ],
  },
  team: {
    key: "team",
    collection: "teamMembers",
    label: "Team",
    singular: "team member",
    description: "People shown under “Meet our Team” on the About page.",
    titleField: "name",
    subtitleField: "role",
    imageField: "photo",
    paths: ["/about"],
    fields: [
      { key: "name", label: "Name", type: "text", max: 80, required: true },
      { key: "role", label: "Role", type: "text", max: 80, required: true },
      { key: "photo", label: "Photo", type: "image", required: true, folder: "base-foundation/team" },
      published,
    ],
  },
};

export const SINGLETONS: Record<SingletonKey, SingletonDef> = {
  site: {
    key: "site",
    docId: "site",
    label: "Site details",
    description: "Contact details, bank details and social links used in the header, footer, Contact and Donate pages.",
    groups: [
      {
        title: "Contact",
        fields: [
          { key: "email", label: "Email", type: "email", required: true },
          { key: "phone1", label: "Phone 1", type: "text", max: 30, required: true },
          { key: "phone2", label: "Phone 2", type: "text", max: 30 },
          { key: "address", label: "Address", type: "text", max: 200, required: true },
        ],
      },
      {
        title: "Donations",
        fields: [
          { key: "bankAccountName", label: "Account name", type: "text", max: 120 },
          { key: "bankAccountNumber", label: "Account number", type: "text", max: 30 },
          { key: "bankIfsc", label: "IFSC code", type: "text", max: 20 },
          { key: "bankName", label: "Bank", type: "text", max: 80 },
          { key: "bankBranch", label: "Branch", type: "text", max: 80 },
          { key: "upiId", label: "UPI ID", type: "text", max: 80, help: "Optional. Shown on the Donate page." },
        ],
      },
      {
        title: "Social media",
        fields: [
          { key: "facebook", label: "Facebook", type: "link", placeholder: "https://facebook.com/…" },
          { key: "instagram", label: "Instagram", type: "link", placeholder: "https://instagram.com/…" },
          { key: "twitter", label: "Twitter / X", type: "link", placeholder: "https://x.com/…" },
          { key: "youtube", label: "YouTube", type: "link", placeholder: "https://youtube.com/…" },
        ],
      },
    ],
  },
  pages: {
    key: "pages",
    docId: "pages",
    label: "Page text",
    description: "Text blocks on the homepage, About, Join and Donate pages. Leave a blank line between paragraphs.",
    groups: [
      {
        title: "Homepage — About section",
        fields: [
          { key: "homeAboutHeading1", label: "Heading (bold part)", type: "text", max: 60, required: true },
          { key: "homeAboutHeading2", label: "Heading (light part)", type: "text", max: 60 },
          { key: "homeAboutLead", label: "Highlighted first paragraph", type: "textarea", max: 1000, rows: 4 },
          { key: "homeAboutBody", label: "Other paragraphs", type: "textarea", max: 3000, rows: 7 },
        ],
      },
      {
        title: "Homepage — BASE Programs",
        fields: [{ key: "programsIntro", label: "Intro text", type: "textarea", max: 500, rows: 3 }],
      },
      {
        title: "About page",
        fields: [
          { key: "mission", label: "Our Mission", type: "textarea", max: 2000, rows: 5 },
          { key: "vision", label: "Our Vision", type: "textarea", max: 2000, rows: 5 },
        ],
      },
      {
        title: "Join & Donate pages",
        fields: [
          { key: "joinIntro", label: "Join with us intro", type: "textarea", max: 800, rows: 3 },
          { key: "donateIntro", label: "Donate intro", type: "textarea", max: 800, rows: 3 },
        ],
      },
    ],
  },
};

export function isCollectionKey(key: string): key is CollectionKey {
  return key in COLLECTIONS;
}

export function isSingletonKey(key: string): key is SingletonKey {
  return key in SINGLETONS;
}

export function singletonFields(def: SingletonDef): FieldDef[] {
  return def.groups.flatMap((g) => g.fields);
}
