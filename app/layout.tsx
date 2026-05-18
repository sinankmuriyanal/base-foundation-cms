import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Base Foundation",
  description: "Empowering marginalized students through education across rural West Bengal",
  keywords: ["NGO", "education", "West Bengal", "Base Foundation", "career mapping"],
  openGraph: {
    title: "Base Foundation",
    description: "Empowering marginalized students through education across rural West Bengal",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmSans.variable} font-sans antialiased bg-cream text-ink`}>
        {children}
      </body>
    </html>
  );
}
