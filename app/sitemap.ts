import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (siteConfig.canonicalBaseUrl ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return [
    "",
    "/about",
    "/blog",
    "/changelog",
    "/user-guide",
    "/terms",
    "/privacy",
    "/auth",
  ].map((route) => ({
    url: `${base}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
