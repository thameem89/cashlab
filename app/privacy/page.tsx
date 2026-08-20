import audit from "@/reference-pages.json";
import { AuditedArticle } from "@/components/AuditedArticle";
import { pageMetadata } from "@/lib/metadata";

const page = audit.pages.find((item) => item.url.endsWith("/privacy"))!;
export const metadata = pageMetadata(
  "Privacy Policy",
  "Reference-derived draft privacy policy for Cash Lab. Legal review is required before publication.",
);
export default function PrivacyPage() {
  return (
    <AuditedArticle
      title="Privacy Policy"
      intro="Reference-derived legal draft. Cash Lab must confirm its data practices, providers, retention rules, contact details, and effective date before publication."
      text={page.text}
      headings={page.headings}
    />
  );
}
