"use client";

import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { countries } from "@/lib/countries";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthStep = "details" | "verify" | "verified";
type AuthMessage = {
  kind: "error" | "info" | "success";
  text: string;
};

export function AuthExperience({
  initialMode,
}: {
  initialMode: "login" | "register";
}) {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState<AuthStep>("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("United Arab Emirates");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (step === "verify") {
      await verifyOtp();
      return;
    }

    await sendOtp();
  }

  async function sendOtp() {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: mode === "register",
          ...(mode === "register"
            ? {
                data: {
                  country,
                  first_name: firstName.trim(),
                  last_name: lastName.trim(),
                },
              }
            : {}),
        },
      });

      if (error) throw error;

      setEmail(normalizedEmail);
      setOtp("");
      setStep("verify");
      setMessage({
        kind: "info",
        text: `A six-digit verification code was sent to ${normalizedEmail}.`,
      });
    } catch (error) {
      setMessage({ kind: "error", text: authErrorMessage(error, mode) });
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      setStep("verified");
      setMessage({
        kind: "success",
        text:
          mode === "register"
            ? "Your Cash Lab account has been verified and created."
            : "You are signed in successfully.",
      });
    } catch (error) {
      setMessage({ kind: "error", text: authErrorMessage(error, mode) });
    } finally {
      setLoading(false);
    }
  }

  function changeMode() {
    setMode((currentMode) =>
      currentMode === "register" ? "login" : "register",
    );
    setStep("details");
    setOtp("");
    setMessage(null);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-shell">
          <div className="auth-topbar">
            <Link href="/" className="auth-logo" aria-label="Cash Lab home">
              <Image
                src="/brand/cashlab-wordmark.png"
                alt="Cash Lab"
                width={190}
                height={48}
                priority
              />
            </Link>
            <ThemeToggle className="auth-theme-button" />
          </div>
          <div className="auth-card">
            <div className="auth-status">
              <span className="pulse-dot" /> Secure email verification
            </div>
            <h1>
              {step === "verified"
                ? "Account verified"
                : mode === "register"
                  ? "Create your Cash Lab account"
                  : "Welcome back"}
            </h1>
            <p>
              {step === "verified"
                ? "Your secure Supabase session is active on this device."
                : step === "verify"
                  ? `Enter the code sent to ${email}.`
                  : mode === "register"
                    ? "Register with your email and verify it using a one-time code."
                    : "Sign in with the one-time code sent to your email."}
            </p>
            {step !== "verified" ? (
              <form onSubmit={submit} noValidate={false}>
                {mode === "register" && step === "details" && (
                  <div className="form-row">
                    <label>
                      First Name
                      <input
                        name="firstName"
                        placeholder="First name"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
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
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                        minLength={2}
                      />
                    </label>
                  </div>
                )}
                {step === "details" ? (
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </label>
                ) : (
                  <label>
                    Verification Code
                    <input
                      className="otp-input"
                      name="otp"
                      type="text"
                      placeholder="000000"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      required
                      aria-describedby="otp-help"
                    />
                    <small id="otp-help">
                      Enter the six-digit code from your email.
                    </small>
                  </label>
                )}
                {mode === "register" && step === "details" && (
                  <label>
                    Country
                    <select
                      name="country"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      required
                    >
                      {countries.map((countryName) => (
                        <option key={countryName} value={countryName}>
                          {countryName}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <button
                  className="button auth-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait…"
                    : step === "verify"
                      ? "Verify Code"
                      : mode === "register"
                        ? "Send Verification Code"
                        : "Send Login Code"}
                </button>
                {step === "verify" && (
                  <div className="otp-actions">
                    <button type="button" onClick={sendOtp} disabled={loading}>
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("details");
                        setOtp("");
                        setMessage(null);
                      }}
                    >
                      Change email
                    </button>
                  </div>
                )}
                {message && (
                  <div
                    className={`auth-message auth-message-${message.kind}`}
                    role={message.kind === "error" ? "alert" : "status"}
                  >
                    {message.kind === "error" ? (
                      <ShieldCheck size={18} />
                    ) : (
                      <MailCheck size={18} />
                    )}
                    {message.text}
                  </div>
                )}
              </form>
            ) : (
              <div className="auth-success">
                <div className="auth-success-icon">
                  <MailCheck size={26} />
                </div>
                {message && <p role="status">{message.text}</p>}
                <Link className="button auth-submit" href="/">
                  Continue to Cash Lab
                </Link>
              </div>
            )}
            {step === "details" && (
              <p className="auth-switch">
                {mode === "register"
                  ? "Already have an account?"
                  : "Don’t have an account?"}{" "}
                <button type="button" onClick={changeMode}>
                  {mode === "register" ? "Sign in" : "Sign up"}
                </button>
              </p>
            )}
            <div className="secure-copy">
              <LockKeyhole size={14} /> Passwordless access secured by Supabase
            </div>
          </div>
        </div>
      </section>
      <section className="auth-visual">
        <div className="auth-visual-grid" />
        <div className="auth-visual-inner">
          <span className="section-eyebrow">Cash Lab AI Trading EA</span>
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
            Account access is protected with one-time email verification.
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

function authErrorMessage(error: unknown, mode: "login" | "register") {
  const fallback = "We could not complete that request. Please try again.";
  if (!(error instanceof Error)) return fallback;

  const message = error.message.toLowerCase();
  if (message.includes("rate limit") || message.includes("seconds")) {
    return "Please wait a moment before requesting another code.";
  }
  if (
    message.includes("token") &&
    (message.includes("expired") || message.includes("invalid"))
  ) {
    return "That verification code is invalid or has expired. Request a new code and try again.";
  }
  if (mode === "login" && message.includes("signups not allowed")) {
    return "No account was found for this email. Please create an account first.";
  }
  if (message.includes("not configured")) {
    return "Account access is temporarily unavailable. Please try again later.";
  }

  return fallback;
}
