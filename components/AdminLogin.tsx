"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const identity = username.includes("@") ? username.trim() : `${username.trim()}@cashlab.tech`;
    const { data, error: signInError } = await getSupabaseBrowserClient().auth.signInWithPassword({ email: identity, password });
    if (signInError || !data.user || data.user.app_metadata?.role !== "admin") {
      await getSupabaseBrowserClient().auth.signOut();
      setError("Administrator access could not be verified.");
    } else {
      router.replace("/admin");
    }
    setBusy(false);
  }

  return (
    <main className="auth-shell">
      <section className="auth-card admin-login-card">
        <Link href="/" className="auth-brand" aria-label="Cash Lab home">
          <Image src="/brand/cashlab-wordmark.png" alt="Cash Lab" width={190} height={48} priority />
        </Link>
        <div className="auth-heading">
          <span className="section-kicker"><ShieldCheck /> Secure administration</span>
          <h1>Admin Login</h1>
          <p>Sign in with an authorized Cash Lab administrator identity.</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label className="app-field"><span>Username</span><input required value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="admin" /></label>
          <label className="app-field"><span>Password</span><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="app-button auth-submit" disabled={busy}>{busy ? "Verifying…" : "Sign in to Admin"}</button>
        </form>
        <Link href="/auth?tab=login" className="auth-switch">Customer login</Link>
      </section>
    </main>
  );
}
