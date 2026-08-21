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
  assert.match(html, /\$12,000/);
  assert.match(html, /30-Day Result/);
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
  assert.doesNotMatch(html, /gold|XAUUSD|60\/40|infrastructure/i);
  assert.doesNotMatch(
    html,
    /Choose Your Trading Plan|id="pricing"|20% Lifetime Commission/,
  );
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("server-renders all audited public routes", async () => {
  const checks = [
    ["/about", /About Cash Lab/],
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
    assert.doesNotMatch(html, /gold|XAUUSD|60\/40|infrastructure/i, path);
  }
});
