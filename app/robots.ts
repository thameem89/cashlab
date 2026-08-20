import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = (siteConfig.canonicalBaseUrl ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/auth"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
