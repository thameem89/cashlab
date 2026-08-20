import audit from "@/reference-pages.json";
import { AuditedArticle } from "@/components/AuditedArticle";
import { pageMetadata } from "@/lib/metadata";

const page = audit.pages.find((item) => item.url.endsWith("/terms"))!;
export const metadata = pageMetadata(
  "Terms of Service",
  "Reference-derived draft terms for Cash Lab. Legal review is required before publication.",
);
export default function TermsPage() {
  return (
    <AuditedArticle
      title="Terms of Service"
      intro="Reference-derived legal draft. Cash Lab must provide its legal entity, jurisdiction, effective date, and approved terms before publication."
      text={page.text}
      headings={page.headings}
    />
  );
}
