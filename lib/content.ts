export type Plan = {
  name: string;
  monthly: string;
  yearly: string;
  yearlyNote?: string;
  badge?: string;
  features: string[];
  cta: string;
};

export const steps = [
  {
    title: "Connect Your Broker",
    copy: "Securely link your MT4 or MT5 trading account in under 2 minutes.",
  },
  {
    title: "Deploy the AI Bot",
    copy: "The system automatically configures optimal trading settings for your account.",
  },
  {
    title: "AI Executes Trades Automatically",
    copy: "Trades are executed automatically based on real-time market conditions.",
  },
] as const;

export const features = [
  {
    title: "AI Trading Intelligence",
    copy: "Understand current market risk in real time. Get insights based on volatility, trend, and news. Know when trading is safe or risky before any position is opened.",
  },
  {
    title: "AI Risk Protection System",
    copy: "Evaluates market conditions every 10 minutes. Detects high-impact news events (NFP, CPI, FOMC), monitors volatility, spread, trend, and adapts to global trading sessions automatically.",
  },
  {
    title: "Smart Trading Configuration",
    copy: "Configure your trading system with flexible risk control. AI-optimized automatic settings with adjustable risk levels, lot size, stop loss, and take profit per account.",
  },
  {
    title: "Multi-Account Trading",
    copy: "Run the system across multiple accounts with independent control. Each account has its own risk profile. Scale capital efficiently from one dashboard.",
  },
] as const;

export const results = [
  {
    flag: "🇨🇳",
    name: "Mei X***",
    country: "China",
    platform: "MT4",
    broker: "OneRoyal",
    plan: "Pro Plan",
    balance: "$13,300",
    profit: "+$15,847.15",
    gain: "+119.2%",
  },
  {
    flag: "🇸🇦",
    name: "Mohammed H***",
    country: "Saudi Arabia",
    platform: "MT4",
    broker: "IC Markets",
    plan: "Pro Plan",
    balance: "$68,000",
    profit: "+$63,296.82",
    gain: "+93.1%",
  },
  {
    flag: "🇵🇰",
    name: "Aisha D***",
    country: "Pakistan",
    platform: "MT5",
    broker: "OctaFX",
    plan: "Pro Plan",
    balance: "$98,000",
    profit: "+$92,921.95",
    gain: "+94.8%",
  },
  {
    flag: "🇬🇭",
    name: "Kwame A***",
    country: "Ghana",
    platform: "MT5",
    broker: "OctaFX",
    plan: "Pro Plan",
    balance: "$37,500",
    profit: "+$41,494.12",
    gain: "+110.7%",
  },
] as const;

export const plans: Plan[] = [
  {
    name: "Free",
    monthly: "$0",
    yearly: "$0",
    cta: "Get Started Free",
    features: [
      "Cash Lab Wallet Access",
      "AI Gold Trading Bot (XAUUSD)",
      "0% Fee",
      "Min $10 Deposit",
      "Up to $5,000 Balance",
      "24/7 Support",
    ],
  },
  {
    name: "Pro",
    monthly: "$299",
    yearly: "$1,799",
    yearlyNote: "~$150/mo — save 50%",
    badge: "Recommended",
    cta: "Unlock Pro Access",
    features: [
      "Cash Lab Wallet + 1 MT4/MT5",
      "AI Gold Trading Bot (XAUUSD)",
      "0% Fee",
      "Up to $20,000 Balance",
      "Premium Risk Management",
      "Priority Support",
    ],
  },
  {
    name: "Elite",
    monthly: "$999",
    yearly: "$5,999",
    yearlyNote: "~$500/mo — save 50%",
    badge: "★ Elite Access",
    cta: "Unlock Elite Access",
    features: [
      "Cash Lab Wallet + 2 MT4/MT5",
      "AI Gold Trading Bot (XAUUSD)",
      "0% Fee",
      "Unlimited Balance",
      "Premium Risk Management",
      "VIP Support & Account Manager",
    ],
  },
];

export const comparisonRows = [
  ["Cash Lab Wallet Account", "✓", "✓", "✓"],
  ["Any Broker MT4/MT5 Account", "—", "1 account", "2 accounts"],
  ["AI Gold Trading Bot", "✓", "✓", "✓"],
  ["Fee", "0 Free", "0 Free", "0 Free"],
  ["Max Managed Balance", "$5,000", "$20,000", "Unlimited"],
  ["Min Deposit", "$10", "$500", "$1,000"],
  ["Risk Management", "Standard", "Premium", "Premium"],
  ["Support", "24/7", "Priority", "VIP + Account Manager"],
] as const;

export const faqs = [
  [
    "Is this compatible with MT4 and MT5?",
    "Yes. The system works with both MT4 and MT5 accounts. Simply connect your account and everything runs automatically.",
  ],
  [
    "What is the minimum deposit to get started?",
    "It depends on your plan:\n\n• Free Plan — minimum $10\n• Pro Plan — minimum $500\n• Elite Plan — minimum $1,000\n\nThe Free plan is the easiest way to start. A higher balance means larger position sizes and bigger returns in dollar terms.",
  ],
  [
    "How does the AI decide when to trade?",
    "The system analyzes real-time market conditions including news, volatility, trend, spread, and session timing. It then generates a score (0–100) to guide trading decisions.",
  ],
  [
    "What do the risk levels mean?",
    "The system automatically adjusts trading based on market conditions:\n\n• Low Risk — Aggressive\n• Normal Risk — Moderate\n• High Risk — Conservative\n• Extreme Risk — Off",
  ],
  [
    "Why does the system sometimes stop trading?",
    "Trading is paused automatically during high-risk conditions such as major news events or unstable markets to protect your capital.",
  ],
  [
    "How much can I earn per month?",
    "Estimated daily targets by plan (gold trades Mon–Fri only, 22 trading days/month):\n\n• Free — up to 2%/day → up to 44%/month\n• Pro — up to 5%/day → up to 110%/month\n• Elite — up to 10%/day → up to 220%/month\n\nExample at $1,000 balance: Free = up to $440/month · Pro = up to $1,100/month · Elite = up to $2,200/month. These are estimated targets — actual results depend on live market conditions.",
  ],
  [
    "Do I need trading experience?",
    "No. The system is fully automated and handles analysis, decision-making, and execution for you.",
  ],
  [
    "Can I test with a demo account?",
    "Yes. You can test the system using a demo account before switching to a live account.",
  ],
  [
    "Are the results shown on the website real?",
    "The reference website states that its results reflect real trading performance. Cash Lab must independently verify any performance examples before publication. Past performance does not guarantee future results.",
  ],
  [
    "What is the difference between Free, Pro, and Elite?",
    "The key differences are daily profit targets and trading channels:\n\n• Free — up to 2%/day · Wallet only · up to $5,000 balance\n• Pro — up to 5%/day · Wallet + 1 MT4/MT5 account · up to $20,000 balance\n• Elite — up to 10%/day · Wallet + 2 MT4/MT5 accounts · Unlimited balance\n\nAll plans are described as charging 0% fee; Cash Lab must verify this before publication.",
  ],
] as const;
