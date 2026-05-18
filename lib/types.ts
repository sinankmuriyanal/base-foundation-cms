export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
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

export const GALLERY_CATEGORIES = [
  "Drawing Competition",
  "Motivation Class",
  "Logo Revealing",
  "Spoken English Course",
  "General",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];
