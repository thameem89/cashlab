import type { Metadata } from "next";

export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title: `${title} | Cash Lab`, description, images: [] },
    twitter: {
      card: "summary",
      title: `${title} | Cash Lab`,
      description,
      images: [],
    },
  };
}
