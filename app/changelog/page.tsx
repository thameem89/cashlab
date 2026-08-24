import audit from "@/reference-pages.json";
import { AuditedArticle } from "@/components/AuditedArticle";
import { removeKeywordSections } from "@/lib/article-filters";
import { pageMetadata } from "@/lib/metadata";

const page = audit.pages.find((item) => item.url.endsWith("/changelog"))!;
const removedEntry = "0% Fee — Keep 100% of Your Profits";
const changelogLines = page.text.split("\n");
const removedEntryIndex = changelogLines.indexOf(removedEntry);
const nextEntryIndex = changelogLines.indexOf("•", removedEntryIndex + 1);
const changelogWithoutFee =
  removedEntryIndex === -1 || nextEntryIndex === -1
    ? page.text
    : [
        ...changelogLines.slice(0, Math.max(0, removedEntryIndex - 1)),
        ...changelogLines.slice(nextEntryIndex),
      ].join("\n");
const changelogHeadingsWithoutFee = page.headings.filter(
  (heading) => heading.text !== removedEntry,
);
const changelog = removeKeywordSections(
  changelogWithoutFee,
  changelogHeadingsWithoutFee,
  /\bwallet\b/i,
);

export const metadata = pageMetadata(
  "Changelog",
  "Reference-derived version history and roadmap for the Cash Lab platform.",
);
export default function ChangelogPage() {
  return (
    <AuditedArticle
      title="Changelog"
      intro="Version history and roadmap for Cash Lab"
      text={changelog.text}
      headings={changelog.headings}
    />
  );
}
