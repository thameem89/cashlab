import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Blog",
  "Articles, guides and updates from Cash Lab.",
);

export default function BlogPage() {
  return (
    <main>
      <SiteHeader />
      <section className="article-hero blog-hero">
        <div className="container">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} /> Back to store
          </Link>
          <span className="section-eyebrow">Insights</span>
          <h1>Blog</h1>
          <p>Articles, guides and updates from Cash Lab.</p>
        </div>
      </section>
      <section className="empty-state container">
        <BookOpen size={36} />
        <h2>No articles yet — check back soon.</h2>
        <p>Cash Lab has not supplied publication-ready articles.</p>
        <Link href="/" className="secondary-button">
          Return to store
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
