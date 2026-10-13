import type { NextConfig } from "next";

/** Old flavour ids to the sitemap's product slugs (Phase 01). */
const OLD_PRODUCTS: Record<string, string> = {
  rasam: "rasam", "sweet-tamarind": "sweet-tamarind", "mac-cheese": "mac-n-cheese", tiramisu: "tiramisu",
  "curry-leaves": "curry-leaves", chettinadu: "chettinad", "thai-chilli": "sweet-thai-chilli",
};

const nextConfig: NextConfig = {
  redirects() {
    return [
      ...Object.entries(OLD_PRODUCTS).map(([from, to]) => ({ source: `/shop/${from}`, destination: `/products/${to}`, permanent: true })),
      { source: "/policies/:slug(shipping|returns|privacy|terms)", destination: "/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
