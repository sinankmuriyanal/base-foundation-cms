import type { NextConfig } from "next";
import { getLegacyRedirects } from "./lib/legacy-redirects";

const nextConfig: NextConfig = {
  // Keep the dev-mode badge off the admin sidebar
  devIndicators: { position: "bottom-right" },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async redirects() {
    return [
      ...getLegacyRedirects().map((r) => ({ ...r, permanent: true })),
      // Any blog-postN.html not in the generated map still lands somewhere useful.
      { source: "/blog-post:n(\\d+).html", destination: "/blog", permanent: true },
    ];
  },
};

export default nextConfig;
