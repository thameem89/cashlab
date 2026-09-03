import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("keeps mobile forms at an accessible scale without viewport lockout", async () => {
  const [layout, css] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(layout, /export const viewport: Viewport/);
  assert.match(layout, /device-width, viewport-fit=cover/);
  assert.match(layout, /initialScale:\s*1/);
  assert.doesNotMatch(layout, /maximumScale|userScalable/);

  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /max-height:\s*calc\(100dvh - 16px\)/);
  assert.match(css, /textarea,[^]*select\s*\{\s*font-size:\s*16px/);
  assert.match(css, /\.auth-theme-button\s*\{\s*position:\s*absolute/);
});
