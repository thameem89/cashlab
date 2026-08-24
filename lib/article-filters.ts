type Heading = { tag: string; text: string };

const headingLevel = (tag: string) => Number(tag.slice(1));

export function removeKeywordSections(
  text: string,
  headings: Heading[],
  keyword: RegExp,
) {
  const lines = text.split("\n");
  const locatedHeadings: Array<Heading & { index: number }> = [];
  let cursor = 0;

  for (const heading of headings) {
    const index = lines.findIndex(
      (line, lineIndex) => lineIndex >= cursor && line.trim() === heading.text,
    );
    if (index === -1) continue;
    locatedHeadings.push({ ...heading, index });
    cursor = index + 1;
  }

  const removedLines = new Set<number>();
  const removedHeadings = new Set<string>();

  for (let position = 0; position < locatedHeadings.length; position += 1) {
    const heading = locatedHeadings[position];
    const level = headingLevel(heading.tag);
    let end = lines.length;

    for (let next = position + 1; next < locatedHeadings.length; next += 1) {
      if (headingLevel(locatedHeadings[next].tag) <= level) {
        end = locatedHeadings[next].index;
        break;
      }
    }

    const removesSection =
      (level === 2 && keyword.test(heading.text)) ||
      (level >= 3 && keyword.test(lines.slice(heading.index, end).join("\n")));

    if (!removesSection) continue;

    let start = heading.index;
    if (start > 0 && lines[start - 1].trim() === "•") start -= 1;
    for (let index = start; index < end; index += 1) removedLines.add(index);
    for (const candidate of locatedHeadings) {
      if (candidate.index >= start && candidate.index < end) {
        removedHeadings.add(candidate.text);
      }
    }
  }

  return {
    text: lines.filter((_, index) => !removedLines.has(index)).join("\n"),
    headings: headings.filter((heading) => !removedHeadings.has(heading.text)),
  };
}
