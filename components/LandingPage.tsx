"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronDown,
  Link2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { faqs, features, results, steps } from "@/lib/content";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

const featureIcons = [BrainCircuit, ShieldCheck, SlidersHorizontal, Users];
const stepIcons = [Link2, Bot, ArrowUpRight];

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  copy?: string;
}) {
  return (
    <div className="section-heading">
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main>
      <SiteHeader />
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="eyebrow">
            <span /> AI-Powered Forex Trading EA
          </div>
          <h1>
            AI Forex Trading Platform for <em>MT4 and MT5</em>
          </h1>
          <p className="hero-copy">
            Deploy AI-powered forex trading in minutes. The system analyzes
            real-time market conditions and executes trades on MT4 and MT5 with
            built-in risk protection.
          </p>
          <Link className="button hero-button" href="/auth?tab=register">
            Start Trading With AI <ArrowUpRight size={17} />
          </Link>
          <div className="trust-row" aria-label="Platform highlights">
            <span>✓ MT4 &amp; MT5 Compatible</span>
            <span>✓ AI Risk Protection</span>
            <span>✓ Instant Setup</span>
          </div>
          <div className="verified-note">
            <span className="pulse-dot" /> Reference-derived product claims
            require Cash Lab verification before publication.
          </div>
          <div
            className="market-stage"
            aria-label="Illustrative trading dashboard preview"
          >
            <div className="market-card market-card-side">
              <span className="live-dot">LIVE</span>
              <strong>MT4</strong>
              <p>Risk profile</p>
              <b>Balanced</b>
            </div>
            <div className="market-card market-card-main">
              <div className="market-card-top">
                <span>Cash Lab AI Forex Trading Bot</span>
                <span className="live-dot">● LIVE FOREX</span>
              </div>
              <div className="market-stats">
                <div>
                  <small>Starting balance</small>
                  <strong>$8,500</strong>
                </div>
                <div>
                  <small>30-day result</small>
                  <strong className="positive">+$1,904.00</strong>
                </div>
                <div>
                  <small>Market score</small>
                  <strong>84 / 100</strong>
                </div>
              </div>
              <div
                className="chart"
                role="img"
                aria-label="Decorative rising performance chart"
              >
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="market-card market-card-side">
              <span className="live-dot">LIVE</span>
              <strong>MT5</strong>
              <p>AI protection</p>
              <b>Active</b>
            </div>
          </div>
        </div>
      </section>

      <section
        id="performance"
        className="results-strip"
        aria-label="Performance results"
      >
        <div className="results-track">
          {[...results, ...results].map((item, i) => (
            <article className="result-card" key={`${item.name}-${i}`}>
              <div className="result-top">
                <span>{item.platform}</span>
                <b>● LIVE</b>
              </div>
              <div className="result-user">
                <span>{item.flag}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.country} · {item.broker}
                  </small>
                </div>
                <em>{item.plan}</em>
              </div>
              <div className="result-values">
                <div>
                  <small>Starting Balance</small>
                  <strong>{item.balance}</strong>
                </div>
                <div>
                  <small>30-Day Result</small>
                  <strong>{item.profit}</strong>
                  <b>{item.gain}</b>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section steps-section">
        <div className="container">
          <SectionHeading
            eyebrow="Quick setup"
            title={
              <>
                Start Automated Trading in <span>3 Simple Steps</span>
              </>
            }
          />
          <div className="steps-grid">
            {steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <article className="step-card" key={step.title}>
                  <div className="number-badge">{i + 1}</div>
                  <div className="feature-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              );
            })}
          </div>
          <div className="section-action">
            <Link className="button" href="/auth?tab=register">
              Start Trading Now <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="section surface-section">
        <div className="container">
          <SectionHeading
            eyebrow="Platform"
            title={
              <>
                A Complete <span>AI Trading Platform</span>
              </>
            }
          />
          <div className="feature-grid">
            {features.map((feature, i) => {
              const Icon = featureIcons[i];
              return (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-icon">
                    <Icon size={23} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section intelligence-section">
        <div className="container intelligence-grid">
          <div>
            <span className="section-eyebrow">Live context</span>
            <h2>
              Your <span>AI Trading Intelligence</span>
            </h2>
            <p>
              Ask the AI anything about your account, performance, or market
              conditions — and get instant, personalised answers. The system
              continuously analyzes the market and explains decisions clearly.
            </p>
            <ul className="check-list">
              <li>Understand current market risk in real time</li>
              <li>Get insights based on volatility, trend, and news</li>
              <li>Know when trading is safe or risky</li>
              <li>Ask anything about your account or performance</li>
            </ul>
            <Link className="button" href="/auth?tab=register">
              Try the Trading Agent <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="agent-panel">
            <div className="agent-bar">
              <span>
                <Sparkles size={15} /> Cash Lab AI Agent
              </span>
              <em>Online</em>
            </div>
            <div className="agent-message">
              <BrainCircuit size={19} />
              <div>
                <strong>How is realized profit shared?</strong>
                <p>
                  Customers retain 70% of commissionable realized profit, while
                  Cash Lab receives 30% as its performance commission.
                </p>
              </div>
            </div>
            <div className="agent-split">
              <span>Customer share · 70%</span>
              <span>Cash Lab share · 30%</span>
            </div>
            <div className="agent-input">
              Ask Trading Agent anything… <b>↗</b>
            </div>
          </div>
        </div>
      </section>

      <section className="section risk-section">
        <div className="container">
          <SectionHeading
            eyebrow="Dynamic protection"
            title={
              <>
                AI <span>Market Score Engine</span>
              </>
            }
            copy="Every 10 minutes, the system analyzes the full market and assigns a score from 0–100. This score determines how the system trades."
          />
          <div className="risk-grid">
            <article>
              <i className="green" />
              <div>
                <strong>
                  Low Risk <em>Aggressive</em>
                </strong>
                <p>
                  Market conditions are calm. System trades at full capacity.
                </p>
              </div>
            </article>
            <article>
              <i className="blue" />
              <div>
                <strong>
                  Normal Risk <em>Moderate</em>
                </strong>
                <p>Moderate conditions. System trades with balanced risk.</p>
              </div>
            </article>
            <article>
              <i className="yellow" />
              <div>
                <strong>
                  High Risk <em>Conservative</em>
                </strong>
                <p>
                  Elevated risk detected. System reduces exposure automatically.
                </p>
              </div>
            </article>
            <article>
              <i className="red" />
              <div>
                <strong>
                  Extreme Risk <em>Off</em>
                </strong>
                <p>
                  Dangerous conditions. All trading paused to protect capital.
                </p>
              </div>
            </article>
          </div>
          <div className="score-factors">
            <small>Score is based on</small>
            <div>
              {[
                "Economic News Events",
                "Market Volatility",
                "Trend Direction",
                "Spread Conditions",
                "Trading Session",
                "RSI Momentum",
                "Drawdown",
              ].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            <p>
              No fixed rules. The AI evaluates everything together in real time.
            </p>
          </div>
        </div>
      </section>

      <section id="commission" className="section commission-section">
        <div className="container">
          <SectionHeading
            eyebrow="Commission model"
            title={
              <>
                A Transparent <span>70/30 Profit Split</span>
              </>
            }
            copy="Customers keep 70% of commissionable realized profit. Cash Lab receives 30% as its performance commission."
          />
          <div className="commission-panel">
            <div
              className="commission-bar"
              role="img"
              aria-label="Profit split: 70 percent customer and 30 percent Cash Lab"
            >
              <div className="customer-share">
                <strong>70%</strong>
                <span>Customer</span>
              </div>
              <div className="cashlab-share">
                <strong>30%</strong>
                <span>Cash Lab</span>
              </div>
            </div>
            <div className="commission-details">
              <article>
                <div className="feature-icon">
                  <Users size={22} />
                </div>
                <div>
                  <h3>70% Customer Share</h3>
                  <p>
                    The customer receives the majority share of commissionable
                    realized trading profit.
                  </p>
                </div>
              </article>
              <article>
                <div className="feature-icon">
                  <BriefcaseBusiness size={22} />
                </div>
                <div>
                  <h3>30% Cash Lab Commission</h3>
                  <p>
                    Cash Lab receives 30% of commissionable realized profit as
                    its performance commission.
                  </p>
                </div>
              </article>
            </div>
          </div>
          <div className="section-action">
            <Link className="button" href="/auth?tab=register">
              Get Started With Cash Lab <ArrowUpRight size={17} />
            </Link>
          </div>
          <p className="tiny-note">
            The split applies to commissionable realized profit under the final
            Cash Lab customer agreement.
          </p>
        </div>
      </section>

      <section id="faq" className="section faq-section">
        <div className="container faq-container">
          <SectionHeading
            eyebrow="Support"
            title={
              <>
                Frequently Asked <span>Questions</span>
              </>
            }
          />
          <div className="faq-list">
            {faqs.map(([question, answer], i) => {
              const open = openFaq === i;
              return (
                <article
                  className={`faq-item ${open ? "open" : ""}`}
                  key={question}
                >
                  <h3>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-answer-${i}`}
                    >
                      {question}
                      <ChevronDown size={18} />
                    </button>
                  </h3>
                  <div
                    id={`faq-answer-${i}`}
                    className="faq-answer"
                    hidden={!open}
                  >
                    <p>{answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <span className="section-eyebrow">Ready when you are</span>
          <h2>
            Start Your AI Trading System <span>Today</span>
          </h2>
          <p>
            Deploy automated forex trading with intelligent AI risk protection
            and real-time trading insights.
          </p>
          <div>
            <Link className="button" href="/auth?tab=register">
              Create Your Account <ArrowUpRight size={17} />
            </Link>
            <a className="secondary-button" href="#performance">
              View Performance Results
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
