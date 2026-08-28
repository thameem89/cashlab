"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { countries } from "@/lib/countries";

export function AuthExperience({
  initialMode,
}: {
  initialMode: "login" | "register";
}) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setMessage(
      mode === "register"
        ? "Demo only — no account was created and no information was sent."
        : "Demo only — credentials were not sent and no sign-in was attempted.",
    );
    form.reset();
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link href="/" className="auth-logo">
          <Image
            src="/brand/cashlab-wordmark.png"
            alt="Cash Lab"
            width={190}
            height={48}
            priority
          />
        </Link>
        <div className="auth-card">
          <div className="auth-status">
            <span className="pulse-dot" /> Secure local demonstration
          </div>
          <h1>
            {mode === "register"
              ? "Create your Cash Lab account"
              : "Welcome back"}
          </h1>
          <p>
            {mode === "register"
              ? "Start with a local interface preview. No live backend is connected yet."
              : "Sign in to your trading dashboard interface preview."}
          </p>
          <form onSubmit={submit} noValidate={false}>
            {mode === "register" && (
              <div className="form-row">
                <label>
                  First Name
                  <input
                    name="firstName"
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                    minLength={2}
                  />
                </label>
                <label>
                  Last Name
                  <input
                    name="lastName"
                    placeholder="Last name"
                    autoComplete="family-name"
                    required
                    minLength={2}
                  />
                </label>
              </div>
            )}
            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </label>
            <div className="password-group">
              <label htmlFor="auth-password">Password</label>
              <div className="password-field">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "register"
                      ? "Create a password (min. 6 characters)"
                      : "Enter your password"
                  }
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {mode === "register" && (
              <label>
                Country
                <select
                  name="country"
                  defaultValue="United Arab Emirates"
                  required
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button className="button auth-submit" type="submit">
              {mode === "register" ? "Create Account" : "Sign In"}
            </button>
            {message && (
              <div className="demo-message" role="status">
                <ShieldCheck size={18} />
                {message}
              </div>
            )}
          </form>
          <p className="auth-switch">
            {mode === "register"
              ? "Already have an account?"
              : "Don’t have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "register" ? "login" : "register");
                setMessage("");
              }}
            >
              {mode === "register" ? "Sign in" : "Sign up"}
            </button>
          </p>
          {mode === "login" && (
            <button
              className="forgot-button"
              onClick={() =>
                setMessage(
                  "Password recovery is a demo only. Add a Cash Lab support destination before launch.",
                )
              }
            >
              Forgot your password?
            </button>
          )}
          <div className="secure-copy">
            <LockKeyhole size={14} /> Local demo — nothing leaves your device
          </div>
        </div>
      </section>
      <section className="auth-visual">
        <div className="auth-visual-grid" />
        <div className="auth-visual-inner">
          <span className="section-eyebrow">Cashlab AI Trading EA</span>
          <h2>
            AI Forex Trading Platform for <span>MT4 and MT5</span>
          </h2>
          <p>
            Deploy AI-powered forex trading in minutes with built-in risk
            protection.
          </p>
          <div className="auth-feature">
            <ShieldCheck />
            <div>
              <strong>Intelligent Risk Protection</strong>
              <small>SL/TP, News Filter &amp; Market Guard</small>
            </div>
          </div>
          <div className="auth-feature">
            <BotIcon />
            <div>
              <strong>Prop-Firm Ready</strong>
              <small>Configure and scale funded accounts</small>
            </div>
          </div>
          <div className="auth-mini-chart">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="tiny-note">
            All capability claims and account flows require Cash Lab
            verification and backend integration.
          </p>
        </div>
      </section>
    </main>
  );
}

function BotIcon() {
  return (
    <span className="bot-icon" aria-hidden="true">
      AI
    </span>
  );
}
