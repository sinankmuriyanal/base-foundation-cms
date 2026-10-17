import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "../globals.css";
import { SITE } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Base Foundation CMS",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${fraunces.variable} ${dmSans.variable} font-sans antialiased bg-cream text-ink`}>
        {children}
      </body>
    </html>
  );
}
