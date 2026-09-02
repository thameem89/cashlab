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
    default: "Cash Lab — AI Forex Trading for MT4 & MT5",
    template: "%s | Cash Lab",
  },
  description:
    "AI-powered forex trading EA with real-time market intelligence and risk protection.",
  icons: {
    icon: [
      {
        url: "/brand/cashlab-favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/brand/cashlab-favicon-64.png",
        sizes: "64x64",
        type: "image/png",
      },
    ],
    shortcut: "/brand/cashlab-favicon-32.png",
    apple: "/brand/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Cash Lab",
    title: "Cash Lab — AI Forex Trading EA",
    description:
      "AI-powered forex trading EA with real-time market intelligence and risk protection.",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Cash Lab — AI Forex Trading EA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash Lab — AI Forex Trading EA",
    description: "AI-powered forex trading EA for MT4 and MT5.",
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
