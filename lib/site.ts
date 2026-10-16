export const SITE = {
  name: "Base Foundation",
  url: "https://basefoundation.in",
  tagline: "Empowering Rural Lives, Building a Strong Foundation",
  description:
    "A non-governmental organization in Birbhum, West Bengal dedicated to rural development through education and social welfare.",
  email: "basefoundationwb@gmail.com",
  phones: ["+91 83718 26110", "+91 74785 73368"],
  address: ["Bhimpur, Paikar", "Birbhum, West Bengal 731219"],
};

export function telHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export interface DonationDetails {
  upiId?: string;
  bank?: { accountName: string; accountNumber: string; ifsc: string; bankName: string; branch?: string };
}

// TODO(owner): fill in the foundation's real UPI / bank details. Until then the donate page asks people to get in touch.
export const DONATION: DonationDetails = {};

export const FORMSPREE = {
  contact: process.env.NEXT_PUBLIC_FORMSPREE_CONTACT ?? "",
  join: process.env.NEXT_PUBLIC_FORMSPREE_JOIN ?? "",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/programmes", label: "Programmes" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/join", label: "Join us" },
  { href: "/contact", label: "Contact" },
];
