import type { Metadata } from "next";
import Script from "next/script";
import { SITE } from "@/lib/site";
import { loadTemplate } from "@/lib/legacy/template";

// The public site uses the original basefoundation.in template (public/legacy) — no Tailwind here.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Base foundation",
  description:
    "The Base Foundation is a non-governmental organization dedicated to rural development through education and social welfare situated in Birbhum district, West Bengal",
  keywords: ["Base Foundation", "NGO", "Education", "West Bengal", "Birbhum"],
  icons: { icon: "/legacy/img/logo-white.png", apple: "/legacy/img/logo-white.png" },
  openGraph: { images: ["/legacy/img/logo-white.png"], type: "website", siteName: SITE.name },
};

export default function SiteRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Quicksand:wght@300;400;500;700&display=swap"
        />
        {/* eslint-disable-next-line @next/next/no-css-tags -- original site stylesheet, served as-is */}
        <link rel="stylesheet" href="/legacy/css/styles.min.css" />
      </head>
      <body>
        <div className="page-wrapper">{children}</div>
        <div dangerouslySetInnerHTML={{ __html: loadTemplate("sprite") }} style={{ display: "none" }} />
        <Script src="/legacy/js/boot.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
