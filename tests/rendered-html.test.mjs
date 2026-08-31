import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Cash Lab landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Cash Lab/);
  assert.match(html, /AI Forex Trading Platform/);
  assert.match(html, /AI-Powered Forex Trading EA/);
  assert.match(html, /70\/30 Profit Split/);
  assert.match(html, /● LIVE/);
  assert.match(html, /●\s*(?:<!-- -->)?DEMO/);
  assert.match(html, /\$12,000/);
  assert.match(html, /Arjun R\*\*\*/);
  assert.match(html, /Fatima M\*\*\*/);
  assert.match(html, /Neha P\*\*\*/);
  assert.match(html, /Ahmed K\*\*\*/);
  assert.match(html, /\$1,000/);
  assert.match(html, /\$1,500/);
  assert.match(html, /\$2,000/);
  assert.match(html, /\$2,500/);
  assert.match(html, /\+17\.8%/);
  assert.match(html, /\+21\.6%/);
  assert.match(html, /\+25\.4%/);
  assert.match(html, /\+29\.2%/);
  assert.match(html, /minimum deposit to get started is \$1,000 USD/);
  assert.match(html, /Expected monthly returns range from 15%–30%/);
  assert.match(html, /View Live Performance/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /aria-expanded="true"/);
  assert.match(html, /id="faq-answer-0" class="faq-answer" hidden=""/);
  assert.match(
    html,
    /Automated Forex Trading with intelligent risk protection/,
  );
  assert.doesNotMatch(html, /currency trading/i);
  assert.match(html, /class="green">Aggressive/);
  assert.match(html, /class="blue">Moderate/);
  assert.match(html, /class="yellow">Conservative/);
  assert.match(html, /class="red">Off/);
  assert.match(html, /score-factor neutral/);
  assert.match(html, /score-factor blue/);
  assert.match(html, /score-factor green/);
  assert.match(html, /score-factor yellow/);
  assert.match(html, /score-factor red/);
  assert.match(html, /Last 30 Days Profit/);
  assert.match(
    html,
    /Which forex trading instruments can be used for EA trade\?[^]*XAUUSD \(Gold\)[^]*BTCUSD \(Bitcoin\)/,
  );
  assert.doesNotMatch(html, /30-Day Result/i);
  assert.match(html, /United Arab Emirates/);
  assert.match(html, /India/);
  assert.match(html, /\+22\.4%/);
  assert.match(html, /\+30\.0%/);
  assert.match(html, /\+18\.7%/);
  assert.match(html, /\+26\.8%/);
  assert.doesNotMatch(html, /example/i);
  assert.doesNotMatch(html, /customer/i);
  assert.doesNotMatch(
    html,
    /\$13,300|\$68,000|\$98,000|\$37,500|\+82\.4%|\+93\.1%|\+94\.8%|\+88\.6%|\+119\.2%|\+110\.7%/,
  );
  assert.doesNotMatch(html, /60\/40|infrastructure/i);
  assert.doesNotMatch(
    html,
    /Choose Your Trading Plan|id="pricing"|20% Lifetime Commission/,
  );
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("server-renders all audited public routes", async () => {
  const checks = [
    ["/about", /Comprehensive Risk Management/],
    ["/blog", /No articles yet/],
    ["/changelog", /Version 6\.0/],
    ["/user-guide", /Documentation/],
    ["/terms", /Terms of Service/],
    ["/privacy", /Privacy Policy/],
    ["/auth?tab=login", /Welcome back/],
  ];
  for (const [path, pattern] of checks) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, pattern, path);
    assert.doesNotMatch(html, /customer/i, path);
    assert.doesNotMatch(
      html,
      /gold|XAUUSD|60\/40|infrastructure|wallet/i,
      path,
    );
  }
});

test("shows the updated auth messaging and About navigation", async () => {
  const authResponse = await render("/auth?tab=register");
  assert.equal(authResponse.status, 200);
  const authHtml = await authResponse.text();
  assert.match(authHtml, /Cashlab AI Trading EA/);
  assert.match(authHtml, /Intelligent Risk Protection/);
  assert.match(authHtml, /Secure email verification/);
  assert.match(authHtml, /Send Verification Code/);
  assert.doesNotMatch(authHtml, /type="password"/);
  assert.doesNotMatch(authHtml, /Demo only|local demonstration/i);
  assert.match(authHtml, /<option value="Afghanistan">Afghanistan<\/option>/);
  assert.match(authHtml, /<option value="India">India<\/option>/);
  assert.match(authHtml, /<option value="Zimbabwe">Zimbabwe<\/option>/);

  const landingResponse = await render();
  assert.equal(landingResponse.status, 200);
  const landingHtml = await landingResponse.text();
  assert.match(landingHtml, /href="\/about"[^>]*>About</);
});

test("omits the removed zero-fee changelog entry", async () => {
  const response = await render("/changelog");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /0% Fee — Keep 100% of Your Profits/);
  assert.doesNotMatch(html, /Fees have been removed across all plans/);
  assert.doesNotMatch(html, /wallet/i);
  assert.doesNotMatch(html, /Cash Lab Wallet — AI Trading Without a Broker/);
  assert.doesNotMatch(html, /Consistent Execution for All Wallet Users/);
  assert.doesNotMatch(html, /End-of-Day Wallet Withdrawals/);
});

test("omits wallet-related User Guide sections", async () => {
  const response = await render("/user-guide");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /wallet/i);
});

test("describes performance commission instead of subscription billing", async () => {
  const response = await render("/terms");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /5\. Performance Commission and Payment/);
  assert.match(html, /does not charge a subscription fee/);
  assert.match(html, /No commission is collected in advance/);
  assert.match(html, /client retains 70%/);
  assert.match(html, /Cash Lab receives 30%/);
  assert.match(html, /no performance commission is due/);
  assert.doesNotMatch(html, /Subscription fees are charged in advance/);
});
