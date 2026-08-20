export type TodoValue = `TODO: ${string}`;

export const siteConfig = {
  name: "Cash Lab",
  shortDescription:
    "AI Gold Scalping Platform for MT4 & MT5. Automated trading with intelligent risk protection.",
  canonicalBaseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  brand: {
    primaryGreen: "#26C626",
    wordmark: "/brand/cashlab-wordmark.png",
    icon: "/brand/cashlab-icon.png",
  },
  destinations: {
    supportEmail: "TODO: add Cash Lab support email" as TodoValue,
    supportUrl: "TODO: add Cash Lab support destination" as TodoValue,
    instagram: "TODO: add Cash Lab Instagram URL" as TodoValue,
    youtube: "TODO: add Cash Lab YouTube URL" as TodoValue,
    tiktok: "TODO: add Cash Lab TikTok URL" as TodoValue,
    telegram: "TODO: add Cash Lab Telegram URL" as TodoValue,
  },
  legal: {
    legalEntityName: "TODO: add Cash Lab legal entity name" as TodoValue,
    registeredAddress: "TODO: add Cash Lab registered address" as TodoValue,
    governingLaw: "TODO: add governing law and jurisdiction" as TodoValue,
    effectiveDate: "TODO: confirm legal-document effective date" as TodoValue,
  },
} as const;

export const publicationClaimsToVerify = [
  "Current trader or customer counts",
  "Displayed account balances, profit figures, and performance percentages",
  "Daily and monthly earnings targets for Free, Pro, and Elite plans",
  "The availability and terms of Cash Lab Wallet",
  "Plan prices, limits, included accounts, support levels, and 0% fee claims",
  "20% lifetime affiliate commission and payout terms",
  "24/7 automated trading and support availability",
  "AI analysis frequency, protection behavior, and market-score methodology",
  "MT4/MT5, broker, prop-firm, payment, and withdrawal compatibility",
  "All roadmap, changelog, security, encryption, and product-capability claims",
] as const;
