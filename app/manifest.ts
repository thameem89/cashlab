import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cash Lab",
    short_name: "Cash Lab",
    description: "AI forex trading EA for MT4 and MT5.",
    start_url: "/",
    display: "standalone",
    background_color: "#050706",
    theme_color: "#26C626",
    icons: [
      { src: "/brand/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
