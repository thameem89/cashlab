import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BellRing,
  Bot,
  CheckCircle2,
  Clock3,
  CloudCog,
  Gauge,
  MonitorSmartphone,
  Power,
  Radio,
  Settings,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "About Cash Lab",
  "Learn how Cash Lab combines automated forex execution, AI-assisted market analysis, and comprehensive risk management for MT4 and MT5.",
);

const pillars = [
  {
    icon: Bot,
    tone: "green",
    title: "AI-Powered",
    copy: "Smart risk management with AI-assisted Stop Loss, Take Profit, and Auto Lot sizing based on your account balance.",
  },
  {
    icon: Zap,
    tone: "blue",
    title: "Automated",
    copy: "Automated forex trading on your MT4 or MT5 account, with trade execution managed according to your selected settings.",
  },
  {
    icon: ShieldCheck,
    tone: "violet",
    title: "Optimized",
    copy: "Flexible settings with customizable risk profiles, maximum lot limits, and position controls for each connected account.",
  },
] as const;

const riskFeatures = [
  {
    icon: Target,
    tone: "blue",
    title: "SL/TP Management",
    copy: "AI-assisted or manual Stop Loss and Take Profit settings.",
  },
  {
    icon: Settings,
    tone: "cyan",
    title: "Lot Size Management",
    copy: "AI Auto Lot or manual fixed lot sizing.",
  },
  {
    icon: ShieldCheck,
    tone: "violet",
    title: "Max Position Control",
    copy: "Limit open positions to help prevent overexposure.",
  },
  {
    icon: BarChart3,
    tone: "blue",
    title: "Risk Profile",
    copy: "Low, medium, or high risk-level settings.",
  },
  {
    icon: Clock3,
    tone: "cyan",
    title: "Time & News Filter",
    copy: "Trade during preferred sessions and avoid selected news events.",
  },
  {
    icon: BellRing,
    tone: "violet",
    title: "Trading Alerts",
    copy: "Receive timely notifications for trades and account alerts.",
  },
] as const;

const controls = [
  {
    icon: Power,
    title: "Enable or Disable the EA",
    copy: "Turn automated trading on or off whenever you need to.",
  },
  {
    icon: Radio,
    title: "Connection Status",
    copy: "Monitor the connection status of each account in real time.",
  },
  {
    icon: MonitorSmartphone,
    title: "MT4 & MT5 Accounts",
    copy: "Connect and manage your supported trading accounts in one place.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="about-page">
      <SiteHeader />

      <section className="about-hero">
        <div className="about-hero-glow" aria-hidden="true" />
        <div className="container about-hero-inner">
          <Link href="/" className="about-back-link">
            <ArrowLeft size={17} /> Back to Home
          </Link>
          <span className="about-eyebrow">About Cash Lab</span>
          <h1>
            Intelligent Forex Trading, <span>Built Around Risk</span>
          </h1>
          <p>
            Cash Lab brings automated forex execution, AI-assisted market
            analysis, and flexible risk controls together for MT4 and MT5
            accounts.
          </p>
        </div>
      </section>

      <section className="about-section about-mission">
        <div className="container">
          <div className="about-section-heading">
            <span>Our mission</span>
            <h2>Automation with clarity and control</h2>
            <p>
              Our goal is to give forex clients an intelligent automated system
              without removing control over risk, position sizing, or account
              settings.
            </p>
          </div>
          <div className="about-pillar-grid">
            {pillars.map(({ icon: Icon, tone, title, copy }) => (
              <article className="about-pillar-card" key={title}>
                <div className={`about-icon ${tone}`}>
                  <Icon size={30} strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-risk-section">
        <div className="container">
          <div className="about-feature-panel">
            <div className="about-section-heading compact">
              <span>Protection first</span>
              <h2>Comprehensive Risk Management</h2>
              <p>
                Professional controls designed to support trading performance
                while keeping exposure aligned with your selected risk profile.
              </p>
            </div>
            <div className="about-risk-list">
              {riskFeatures.map(({ icon: Icon, tone, title, copy }) => (
                <article className="about-risk-item" key={title}>
                  <div className={`about-icon ${tone}`}>
                    <Icon size={25} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-control-section">
        <div className="container">
          <div className="about-section-heading">
            <span>Simple controls</span>
            <h2>Easy EA Management</h2>
            <p>
              Manage automated trading and connected accounts through a clear,
              straightforward workflow.
            </p>
          </div>
          <div className="about-control-grid">
            {controls.map(({ icon: Icon, title, copy }) => (
              <article key={title}>
                <div className="about-control-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
                <CheckCircle2 size={18} aria-hidden="true" />
              </article>
            ))}
          </div>

          <h2 className="about-highlights-title">Why Choose Cash Lab?</h2>
          <div className="about-highlights" aria-label="Platform highlights">
            <div>
              <Gauge size={24} />
              <strong>Automated</strong>
              <span>Forex execution</span>
            </div>
            <div>
              <MonitorSmartphone size={24} />
              <strong>MT4 & MT5</strong>
              <span>Platform support</span>
            </div>
            <div>
              <CloudCog size={24} />
              <strong>Cloud</strong>
              <span>Managed access</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <span>Ready when you are</span>
          <h2>Ready to automate your forex trading?</h2>
          <p>
            Create your Cash Lab account and configure your preferred trading
            and risk settings.
          </p>
          <Link className="button" href="/auth?tab=register">
            Get Started Today <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
