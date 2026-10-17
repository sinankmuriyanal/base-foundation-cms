export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  /** Short summary for listing cards; empty means derive from content. */
  excerpt: string;
  featuredImage: string | null;
  cloudinaryPublicId: string | null;
  tags: string[];
  author: string | null;
  publishedAt: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  category: string;
  caption: string;
  order: number;
  createdAt: string;
}

export const BLOG_CATEGORIES = [
  "Career Mapping",
  "Base Classroom",
  "Teachers' Training",
  "Skill Enhancement",
  "Language Mastery",
  "Community Distribution",
  "Map Bengal",
  "General",
] as const;

/** Gallery categories are managed in Firestore (`galleryCategories`); these are the initial set. */
export const DEFAULT_GALLERY_CATEGORIES = [
  "Drawing Competition",
  "Motivation Class",
  "Logo Revealing",
  "Spoken English Course",
  "General",
] as const;

/** Fallback category: always exists, cannot be renamed or deleted. */
export const FALLBACK_GALLERY_CATEGORY = "General";

export interface GalleryCategory {
  id: string;
  name: string;
  order: number;
}

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
