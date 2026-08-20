import audit from "@/reference-pages.json";
import { AuditedArticle } from "@/components/AuditedArticle";
import { pageMetadata } from "@/lib/metadata";

const page = audit.pages.find((item) => item.url.endsWith("/user-guide"))!;
export const metadata = pageMetadata(
  "User Guide",
  "Set up and understand the reference-derived Cash Lab AI gold trading interface.",
);
export default function UserGuidePage() {
  return (
    <AuditedArticle
      title="Documentation"
      intro="Complete feature guide for the Cash Lab trading interface."
      text={page.text}
      headings={page.headings}
    />
  );
}
