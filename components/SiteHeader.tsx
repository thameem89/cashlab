"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const nav = [
  ["About", "/about"],
  ["Features", "/#features"],
  ["Performance Fee", "/#commission"],
  ["FAQ", "/#faq"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let mounted = true;
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", data.user.id).maybeSingle();
        const name = profile?.full_name?.trim() || data.user.email?.split("@")[0] || "";
        setUser({ id: data.user.id, email: profile?.email || data.user.email || "", name });
      } else setUser(null);
      setAuthLoading(false);
    }
    void loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") { setUser(null); setAuthLoading(false); return; }
      if (session?.user) void loadUser();
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function logout() {
    await getSupabaseBrowserClient().auth.signOut();
    setUser(null);
    setOpen(false);
  }

  const initial = user?.name.trim().charAt(0).toUpperCase() || "C";

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
          <ThemeToggle />
          {!authLoading && !user && <>
            <Link className="button button-small" href="/auth?tab=register">Get Started</Link>
            <Link className="text-link" href="/auth?tab=login">Login</Link>
          </>}
          {!authLoading && user && <details className="site-account">
            <summary aria-label="Open account menu"><span className="site-account-avatar">{initial}</span><span className="site-account-name">{user.name || user.email}</span><ChevronDown size={15} /></summary>
            <div className="site-account-menu">
              <div className="site-account-identity"><strong>{user.name || "Cash Lab member"}</strong><small>{user.email}</small></div>
              <Link href="/dashboard"><LayoutDashboard /> Dashboard</Link>
              <Link href="/dashboard/profile"><UserRound /> My Profile</Link>
              <button type="button" onClick={() => void logout()}><LogOut /> Log out</button>
            </div>
          </details>}
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
        {!authLoading && !user && <Link href="/auth?tab=login" onClick={() => setOpen(false)}>Login</Link>}
        {!authLoading && !user && <Link href="/auth?tab=register" onClick={() => setOpen(false)}>Get Started</Link>}
        {!authLoading && user && <>
          <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/dashboard/profile" onClick={() => setOpen(false)}>My Profile</Link>
          <button className="mobile-account-logout" type="button" onClick={() => void logout()}><LogOut size={16} /> Log out</button>
        </>}
      </nav>
    </header>
  );
}
