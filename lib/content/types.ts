import type { BlogCategory } from "@/lib/types";

/** An image is either a Cloudinary URL (with its public id, so it can be deleted) or an original-site path under /legacy/img. */
export interface Highlight {
  title: string;
  body: string;
}

interface Ordered {
  id: string;
  order: number;
  published: boolean;
}

export interface Project extends Ordered {
  slug: string;
  title: string;
  area: "Education" | "Training" | "Community";
  summary: string;
  body: string;
  highlights: Highlight[];
  /** Blog category whose posts document this project ("" for none). */
  blogCategory: BlogCategory | "";
  image: string;
  imagePublicId: string | null;
  /** Image on the Programmes list; empty means use `image`. */
  listImage: string;
  listImagePublicId: string | null;
  /** Show in the homepage "Our Projects" slider. */
  showOnHome: boolean;
}

export interface Program extends Ordered {
  label: string;
  title: string;
  text: string;
  link: string;
  image: string;
  imagePublicId: string | null;
}

export interface HeroSlide extends Ordered {
  titleLine1: string;
  titleLine2: string;
  /** Put the light part of the heading on its own line. */
  titleBreak: boolean;
  subtitle: string;
  buttonLabel: string;
  buttonLink: string;
  layout: "left" | "center";
  image: string;
  imagePublicId: string | null;
}

export interface TeamMember extends Ordered {
  name: string;
  role: string;
  photo: string;
  photoPublicId: string | null;
}

export interface SiteSettings {
  email: string;
  phone1: string;
  phone2: string;
  address: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  bankBranch: string;
  upiId: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

export interface PageText {
  homeAboutHeading1: string;
  homeAboutHeading2: string;
  homeAboutLead: string;
  homeAboutBody: string;
  programsIntro: string;
  mission: string;
  vision: string;
  joinIntro: string;
  donateIntro: string;
}

export interface ContentTypes {
  projects: Project;
  programs: Program;
  heroSlides: HeroSlide;
  team: TeamMember;
}

export type CollectionKey = keyof ContentTypes;
export type SingletonKey = "site" | "pages";
