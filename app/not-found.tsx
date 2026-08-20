import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="empty-state not-found container">
        <span className="section-eyebrow">404</span>
        <h1>That page isn’t in the lab.</h1>
        <p>The requested route could not be found.</p>
        <Link className="button" href="/">
          Return Home
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
