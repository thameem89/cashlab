import audit from "@/reference-pages.json";
import { AuditedArticle } from "@/components/AuditedArticle";
import { pageMetadata } from "@/lib/metadata";

const page = audit.pages.find((item) => item.url.endsWith("/about"))!;
export const metadata = pageMetadata(
  "About Cash Lab",
  "Learn about the reference-derived Cash Lab mission, AI trading platform, risk management, and account tools.",
);

export default function AboutPage() {
  return (
    <AuditedArticle
      title="About Cash Lab"
      intro="The Forex AI Gold Scalper Trading Bot built for real profits. Let our AI engine analyze the market, execute trades, and manage risk automatically on your MT4/MT5 account."
      text={page.text}
      headings={page.headings}
    />
  );
}
