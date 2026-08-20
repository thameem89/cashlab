import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/sora";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

const metadataBase = new URL(
  siteConfig.canonicalBaseUrl ?? "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Cash Lab — AI Gold Trading for MT4 & MT5",
    template: "%s | Cash Lab",
  },
  description:
    "AI-powered gold trading infrastructure with real-time market intelligence and risk protection.",
  icons: {
    icon: "/brand/favicon-32.png",
    apple: "/brand/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Cash Lab",
    title: "Cash Lab — AI Gold Trading Infrastructure",
    description:
      "AI-powered gold trading infrastructure with real-time market intelligence and risk protection.",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Cash Lab — AI Gold Trading Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash Lab — AI Gold Trading Infrastructure",
    description: "AI-powered gold trading infrastructure for MT4 and MT5.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cash Lab",
  };
  return (
    <html lang="en" data-theme="dark">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
      </body>
    </html>
  );
}
