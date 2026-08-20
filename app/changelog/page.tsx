import audit from "@/reference-pages.json";
import { AuditedArticle } from "@/components/AuditedArticle";
import { pageMetadata } from "@/lib/metadata";

const page = audit.pages.find((item) => item.url.endsWith("/changelog"))!;
export const metadata = pageMetadata(
  "Changelog",
  "Reference-derived version history and roadmap for the Cash Lab platform.",
);
export default function ChangelogPage() {
  return (
    <AuditedArticle
      title="Changelog"
      intro="Version history and roadmap for Cash Lab"
      text={page.text}
      headings={page.headings}
    />
  );
}
