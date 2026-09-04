import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("dashboard protects sessions and sends OTP users to the dashboard", async () => {
  const [dashboard, auth] = await Promise.all([
    readFile(
      new URL("components/dashboard/DashboardExperience.tsx", root),
      "utf8",
    ),
    readFile(new URL("components/AuthExperience.tsx", root), "utf8"),
  ]);

  assert.match(dashboard, /supabase\.auth\.getUser\(\)/);
  assert.match(dashboard, /router\.replace\(`\/auth\?tab=login/);
  assert.match(dashboard, /user\.app_metadata\?\.role === "admin"/);
  assert.match(
    dashboard,
    /router\.replace\("\/dashboard\?notice=admin-denied"\)/,
  );
  assert.match(auth, /href="\/dashboard"/);
});

test("trading account credentials stay out of browser storage and account records", async () => {
  const [dashboard, migration] = await Promise.all([
    readFile(
      new URL("components/dashboard/DashboardExperience.tsx", root),
      "utf8",
    ),
    readFile(
      new URL(
        "supabase/migrations/20260904162238_trading_account_agreement_acceptances.sql",
        root,
      ),
      "utf8",
    ),
  ]);

  assert.match(dashboard, /name="master_password"/);
  assert.match(dashboard, /passwordInput\.value = ""/);
  assert.doesNotMatch(dashboard, /localStorage|sessionStorage/);
  assert.doesNotMatch(migration, /master_password|investor_password/);
  assert.match(migration, /trading_account_agreement_acceptances/);
  assert.match(migration, /connection_status[\s\S]*'pending'/);
  assert.match(dashboard, /No simulated information is shown/);
  assert.match(dashboard, /Market data integration required/);
});

test("dashboard consistently uses the spaced Cash Lab brand copy", async () => {
  const [dashboard, migration] = await Promise.all([
    readFile(
      new URL("components/dashboard/DashboardExperience.tsx", root),
      "utf8",
    ),
    readFile(
      new URL(
        "supabase/migrations/20260904013000_fix_cash_lab_activity_copy.sql",
        root,
      ),
      "utf8",
    ),
  ]);

  assert.match(dashboard, />Ask Cash Lab AI</);
  assert.match(dashboard, />Connect Your Trading Account</);
  assert.match(
    dashboard,
    /Connect your MT4 or MT5 trading account to start using the Cash Lab[^]*EA\./,
  );
  assert.match(dashboard, /replaceAll\(\/cashlab\/gi, "Cash Lab"\)/);
  assert.match(migration, /'Cash Lab account created\.'/);
});

test("Supabase migrations enforce ownership and protect system fields", async () => {
  const [schema, hardening] = await Promise.all([
    readFile(
      new URL("supabase/migrations/20260902150000_cashlab_phase2.sql", root),
      "utf8",
    ),
    readFile(
      new URL(
        "supabase/migrations/20260902161000_cashlab_phase2_hardening.sql",
        root,
      ),
      "utf8",
    ),
  ]);

  for (const table of [
    "profiles",
    "trading_accounts",
    "trading_account_metrics",
    "trading_positions",
    "activity_log",
    "notifications",
  ]) {
    assert.match(
      schema,
      new RegExp(`alter table public\\.${table} enable row level security`),
    );
  }
  assert.match(schema, /with check \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(schema, /auth\.jwt\(\) -> 'app_metadata' ->> 'role' = 'admin'/);
  assert.doesNotMatch(schema, /user_metadata.*admin/i);
  assert.match(hardening, /new\.connection_status = 'pending'/);
  assert.match(hardening, /new\.email = old\.email/);
  assert.match(hardening, /new\.account_status = old\.account_status/);
});
