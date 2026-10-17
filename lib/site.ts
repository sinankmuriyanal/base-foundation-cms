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

export interface DonationDetails {
  upiId?: string;
  bank?: { accountName?: string; accountNumber: string; ifsc: string; bankName: string; branch?: string };
}

// Bank details as published on the original basefoundation.in contact page. Add a UPI ID here if there is one.
export const DONATION: DonationDetails = {
  bank: { accountNumber: "41554536104", ifsc: "SBIN0014061", bankName: "State Bank of India", branch: "Nandigram" },
};

export const FORMSPREE = {
  contact: process.env.NEXT_PUBLIC_FORMSPREE_CONTACT ?? "",
  join: process.env.NEXT_PUBLIC_FORMSPREE_JOIN ?? "",
};
