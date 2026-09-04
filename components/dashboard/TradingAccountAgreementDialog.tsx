"use client";

import { ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const TRADING_AGREEMENT_VERSION = "1.0";
export const TRADING_AGREEMENT_HASH =
  "8047d863120a3f8bb41df44e179ed9067180fea3b044b47905aa8e6594c1a9a5";

type AgreementDetails = {
  fullName: string;
  email: string;
  accountNumber: string;
  broker: string;
};

export function TradingAccountAgreementDialog({
  details,
  effectiveDate,
  onCancel,
  onAgree,
}: {
  details: AgreementDetails;
  effectiveDate: string;
  onCancel: () => void;
  onAgree: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const [agreement, setAgreement] = useState("");

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const controller = new AbortController();
    fetch("/legal/cash-lab-client-agreement-v1.txt", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Agreement unavailable");
        return response.text();
      })
      .then(setAgreement)
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setAgreement("");
      });
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      controller.abort();
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onCancel]);

  const lines = agreement
    .split("\n")
    .filter((line) => line.trim())
    .map((line) =>
      line.trim() === "Effective Date:"
        ? `Effective Date: ${effectiveDate || "Date of acceptance"}`
        : line,
    );

  return (
    <div className="modal-layer agreement-layer" role="presentation">
      <section
        ref={dialogRef}
        className="agreement-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agreement-title"
      >
        <header>
          <div>
            <span className="section-kicker">CASH LAB LLC</span>
            <h2 id="agreement-title">
              Client Risk Acknowledgment, Expected Performance &amp; Limited
              Liability Agreement
            </h2>
            <div className="agreement-meta">
              <span>Jurisdiction: United Arab Emirates</span>
              <span>Agreement Version: {TRADING_AGREEMENT_VERSION}</span>
              <span>
                Effective Date: {effectiveDate || "Date of acceptance"}
              </span>
            </div>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close agreement">
            <X />
          </button>
        </header>
        <div className="agreement-client-details" aria-label="Client details">
          <strong>Client details</strong>
          <span>Full name: {details.fullName || "Unavailable"}</span>
          <span>Email: {details.email || "Unavailable"}</span>
          <span>
            Trading Account No: {details.accountNumber || "Unavailable"}
          </span>
          <span>Broker: {details.broker || "Unavailable"}</span>
          <span>Initial Capital: Unavailable</span>
          <span>Currency: Unavailable</span>
        </div>
        <div className="agreement-body">
          {agreement ? (
            lines.map((line, index) => {
              const heading =
                /^(?:\d{1,2}\.\s|CLIENT DETAILS|FOR CASH LAB LLC)/.test(
                  line.trim(),
                );
              return heading ? (
                <h3 key={`${index}-${line}`}>{line.trim()}</h3>
              ) : (
                <p key={`${index}-${line}`}>{line.trim()}</p>
              );
            })
          ) : (
            <p role="alert">
              The agreement could not be loaded. Please try again.
            </p>
          )}
        </div>
        <footer>
          <div className="agreement-final-note">
            <ShieldCheck />
            <span>
              By continuing, you confirm that you have fully read, understood,
              and voluntarily accepted this Agreement.
            </span>
          </div>
          <div>
            <button
              type="button"
              className="app-button secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="app-button"
              disabled={!agreement}
              onClick={onAgree}
            >
              I Agree &amp; Continue
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
