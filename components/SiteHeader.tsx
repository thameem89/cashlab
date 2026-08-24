"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

const nav = [
  ["About", "/about"],
  ["Features", "/#features"],
  ["Commission", "/#commission"],
  ["FAQ", "/#faq"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Cash Lab home">
          <Image
            src="/brand/cashlab-wordmark.png"
            alt="Cash Lab"
            width={190}
            height={48}
            priority
          />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([label, href]) => (
            <Link key={label} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button theme-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${light ? "dark" : "light"} theme`}
          >
            {light ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <Link className="button button-small" href="/auth?tab=register">
            Get Started
          </Link>
          <Link className="text-link" href="/auth?tab=login">
            Login
          </Link>
          <button
            className="icon-button mobile-menu-button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <nav
        id="mobile-menu"
        className={`mobile-menu ${open ? "is-open" : ""}`}
        aria-label="Mobile navigation"
      >
        {nav.map(([label, href]) => (
          <Link key={label} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
        <Link href="/auth?tab=login" onClick={() => setOpen(false)}>
          Login
        </Link>
      </nav>
    </header>
  );
}
