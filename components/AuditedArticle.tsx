import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

type Heading = { tag: string; text: string };

function rebrand(value: string) {
  return value
    .replaceAll("MevTrading", "Cash Lab")
    .replaceAll("MEV Trading", "Cash Lab")
    .replaceAll("Forex AI Gold Scalper Trading Bot", "AI Forex Trading Bot")
    .replaceAll(
      "AI Gold Scalping Trading Platform",
      "AI Forex Trading Platform",
    )
    .replaceAll("AI Gold Scalping Platform", "AI Forex Trading Platform")
    .replaceAll("AI Gold Scalping Bot", "AI Forex Trading Bot")
    .replaceAll("AI Gold Scalper", "AI Forex Trading Bot")
    .replaceAll("Gold (XAUUSD)", "major forex pairs")
    .replaceAll("Gold/US Dollar", "forex")
    .replaceAll("XAUUSD", "major currency pairs")
    .replaceAll("Gold, Forex, and Cryptocurrency markets", "Forex markets")
    .replaceAll("gold scalping", "forex trading")
    .replaceAll("Gold trading", "Forex trading")
    .replaceAll("gold trading", "forex trading")
    .replaceAll("AI Gold", "AI Forex")
    .replaceAll("Gold", "Forex")
    .replaceAll("gold", "forex")
    .replaceAll("Infrastructure", "EA")
    .replaceAll("infrastructure", "EA");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AuditedArticle({
  title,
  intro,
  text,
  headings,
  showVerification = true,
}: {
  title: string;
  intro: string;
  text: string;
  headings: Heading[];
  showVerification?: boolean;
}) {
  const brandedHeadings = headings.map((heading) => ({
    ...heading,
    text: rebrand(heading.text),
  }));
  const headingTags = new Map(
    brandedHeadings.map((heading) => [heading.text, heading.tag]),
  );
  const lines = rebrand(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== "Back to Home" && line !== title);
  const navItems = brandedHeadings.filter((heading) => heading.tag === "H2");

  return (
    <main>
      <SiteHeader />
      <section className="article-hero">
        <div className="container">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1>{title}</h1>
          <p>{intro}</p>
          {showVerification && (
            <div className="claim-warning article-warning">
              <ShieldAlert size={18} /> Reference-derived company and product
              claims require Cash Lab verification before publication.
            </div>
          )}
        </div>
      </section>
      <section className="article-layout container">
        {navItems.length > 2 && (
          <aside className="article-nav">
            <strong>On this page</strong>
            {navItems.map((item) => (
              <a key={item.text} href={`#${slugify(item.text)}`}>
                {item.text}
              </a>
            ))}
          </aside>
        )}
        <article className="article-content">
          {lines.map((line, i) => {
            const tag = headingTags.get(line);
            const id = slugify(line);
            if (tag === "H1") return null;
            if (tag === "H2")
              return (
                <h2 id={id} key={`${line}-${i}`}>
                  {line}
                </h2>
              );
            if (tag === "H3")
              return (
                <h3 id={id} key={`${line}-${i}`}>
                  {line}
                </h3>
              );
            if (tag === "H4")
              return (
                <h4 id={id} key={`${line}-${i}`}>
                  {line}
                </h4>
              );
            if (line.startsWith("•"))
              return (
                <p className="article-bullet" key={`${line}-${i}`}>
                  {line}
                </p>
              );
            if (/^Version \d/.test(line) || /^\d{1,2}[- ]/.test(line))
              return (
                <p className="article-meta" key={`${line}-${i}`}>
                  {line}
                </p>
              );
            return <p key={`${line}-${i}`}>{line}</p>;
          })}
        </article>
      </section>
      <SiteFooter />
    </main>
  );
}
