import audit from "@/reference-pages.json";
import { AuditedArticle } from "@/components/AuditedArticle";
import { pageMetadata } from "@/lib/metadata";

const page = audit.pages.find((item) => item.url.endsWith("/terms"))!;
const previousPaymentHeading = "5. Subscription and Payment";
const performanceCommissionHeading = "5. Performance Fee and Payment";
const previousPaymentTerms =
  "Subscription fees are charged in advance and are non-refundable. You may cancel your subscription at any time, but no refunds will be provided for unused portions of your subscription period.";
const performanceCommissionTerms =
  "Cash Lab provides the service on a performance-fee basis and does not charge a subscription fee. No performance fee is collected in advance. When eligible realized trading profit is generated, the client retains 70% and Cash Lab receives 30% as its performance fee. If no eligible realized trading profit is generated, no performance fee is due. The final client agreement defines calculation periods, settlement timing, eligible realized profit, loss treatment, and any exclusions.";
const termsText = page.text
  .replace(previousPaymentHeading, performanceCommissionHeading)
  .replace(previousPaymentTerms, performanceCommissionTerms);
const termsHeadings = page.headings.map((heading) =>
  heading.text === previousPaymentHeading
    ? { ...heading, text: performanceCommissionHeading }
    : heading,
);

export const metadata = pageMetadata(
  "Terms of Service",
  "Reference-derived draft terms for Cash Lab. Legal review is required before publication.",
);
export default function TermsPage() {
  return (
    <AuditedArticle
      title="Terms of Service"
      intro="Reference-derived legal draft. Cash Lab must provide its legal entity, jurisdiction, effective date, and approved terms before publication."
      text={termsText}
      headings={termsHeadings}
    />
  );
}
