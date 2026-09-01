import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image
            src={siteConfig.brand.wordmark}
            alt="Cash Lab"
            width={190}
            height={48}
          />
          <p>{siteConfig.shortDescription}</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/#commission">Performance Fee</Link>
        </div>
        <div>
          <h3>Info</h3>
          <Link href="/changelog">Changelog</Link>
          <Link href="/user-guide">User Guide</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
        <div>
          <h3>Follow Us</h3>
          <p className="todo-copy">
            Social profiles are awaiting Cash Lab destinations.
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Cash Lab. All rights reserved.</span>
        <span>
          Trading involves risk. Past performance is not indicative of future
          results.
        </span>
      </div>
    </footer>
  );
}
