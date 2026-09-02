"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity as ActivityIcon,
  AlertCircle,
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Gauge,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { countryOptions } from "@/lib/countries";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Activity,
  CashLabNotification,
  Profile,
  TradingAccount,
} from "@/lib/supabase/types";

type AppState = {
  userId: string;
  email: string;
  admin: boolean;
  profile: Profile | null;
  accounts: TradingAccount[];
  activities: Activity[];
  notifications: CashLabNotification[];
};

const clientNav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["My Trading Accounts", "/dashboard/accounts", WalletCards],
  ["Markets", "/dashboard/markets", BarChart3],
  ["AI Research", "/dashboard/research", Bot],
  ["AI Trading", "/dashboard/ai", TrendingUp],
  ["Watchlist", "/dashboard/watchlist", Star],
] as const;

const accountNav = [
  ["Profile", "/dashboard/profile", UserRound],
  ["Subscription", "/dashboard/subscription", CircleDollarSign],
  ["Settings", "/dashboard/settings", Settings],
  ["Support", "/dashboard/support", Headphones],
] as const;

const adminNav = [
  ["Overview", "/admin", Gauge],
  ["Users", "/admin/users", Users],
  ["Trading Accounts", "/admin/accounts", BriefcaseBusiness],
  ["Settings", "/admin/settings", Settings],
] as const;

export function DashboardExperience() {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace(`/auth?tab=login&next=${encodeURIComponent(pathname)}`);
        return;
      }
      const user = authData.user;
      const admin = user.app_metadata?.role === "admin";
      if (pathname.startsWith("/admin") && !admin) {
        router.replace("/dashboard?notice=admin-denied");
        return;
      }
      const [profileResult, accountResult, activityResult, notificationResult] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase
            .from("trading_accounts")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("activity_log")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);
      const firstError = [
        profileResult,
        accountResult,
        activityResult,
        notificationResult,
      ]
        .map((result) => result.error)
        .find(Boolean);
      if (firstError) throw firstError;
      setState({
        userId: user.id,
        email: user.email ?? "",
        admin,
        profile: profileResult.data as Profile | null,
        accounts: (accountResult.data ?? []) as TradingAccount[],
        activities: (activityResult.data ?? []) as Activity[],
        notifications: (notificationResult.data ?? []) as CashLabNotification[],
      });
    } catch {
      setLoadError(
        "Cash Lab could not load your account data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    const supabase = getSupabaseBrowserClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/auth?tab=login");
    });
    return () => {
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, [load, router]);

  async function logout() {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace("/auth?tab=login");
  }

  if (loading) return <DashboardSkeleton />;
  if (loadError || !state) {
    return (
      <FullError
        message={loadError || "Your session has expired."}
        onRetry={load}
      />
    );
  }

  const isAdminArea = pathname.startsWith("/admin");
  const displayName =
    state.profile?.full_name?.trim() || state.email.split("@")[0] || "Trader";

  return (
    <div className="app-frame">
      <aside className={`app-sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="app-sidebar-head">
          <Link href="/dashboard" aria-label="Cash Lab dashboard">
            <Image
              src="/brand/cashlab-wordmark.png"
              alt="Cash Lab"
              width={154}
              height={40}
              priority
            />
          </Link>
          <button
            className="app-mobile-close"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <nav
          aria-label={isAdminArea ? "Admin navigation" : "Dashboard navigation"}
        >
          <NavGroup
            label={isAdminArea ? "Management" : "Main"}
            items={isAdminArea ? adminNav : clientNav}
            pathname={pathname}
          />
          {!isAdminArea && (
            <NavGroup label="Account" items={accountNav} pathname={pathname} />
          )}
          {!isAdminArea && state.admin && (
            <div className="app-nav-admin">
              <Link href="/admin">
                <ShieldCheck /> Admin Panel <ChevronRight />
              </Link>
            </div>
          )}
          {isAdminArea && (
            <div className="app-nav-admin">
              <Link href="/dashboard">
                <ChevronRight className="flip" /> Client dashboard
              </Link>
            </div>
          )}
        </nav>
        <div className="app-user-card">
          <Avatar profile={state.profile} name={displayName} />
          <div>
            <strong>{displayName}</strong>
            <span>{state.email}</span>
          </div>
          <button onClick={logout} aria-label="Log out">
            <LogOut />
          </button>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="app-sidebar-scrim"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="app-main">
        <header className="app-header">
          <button
            className="app-menu-button"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <div>
            <strong>
              {isAdminArea ? "Cash Lab Admin" : pageTitle(pathname)}
            </strong>
            <span>
              {isAdminArea
                ? "Secure management workspace"
                : "Your trading workspace"}
            </span>
          </div>
          <div className="app-header-actions">
            <ThemeToggle />
            <NotificationBell state={state} onChange={setState} />
            <Avatar profile={state.profile} name={displayName} small />
          </div>
        </header>
        <main className="app-content">
          {renderPage(pathname, state, setState, load)}
        </main>
      </div>
    </div>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: ReadonlyArray<readonly [string, string, typeof Gauge]>;
  pathname: string;
}) {
  return (
    <div className="app-nav-group">
      <span>{label}</span>
      {items.map(([name, href, Icon]) => {
        const active =
          href === "/dashboard" || href === "/admin"
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "active" : ""}>
            <Icon />
            {name}
          </Link>
        );
      })}
    </div>
  );
}

function renderPage(
  pathname: string,
  state: AppState,
  setState: (state: AppState) => void,
  reload: () => Promise<void>,
) {
  if (pathname === "/dashboard") return <DashboardHome state={state} />;
  if (pathname === "/dashboard/accounts")
    return <AccountsPage state={state} setState={setState} />;
  if (pathname === "/dashboard/profile")
    return <ProfilePage state={state} setState={setState} />;
  if (pathname === "/dashboard/settings")
    return <SettingsPage state={state} setState={setState} />;
  if (pathname === "/admin") return <AdminOverview />;
  if (pathname === "/admin/users") return <AdminUsers />;
  if (pathname.startsWith("/admin/users/"))
    return <AdminUserDetail id={pathname.split("/").pop() ?? ""} />;
  if (pathname === "/admin/accounts") return <AdminAccounts />;
  if (pathname.startsWith("/admin/accounts/"))
    return (
      <AdminAccountDetail
        id={pathname.split("/").pop() ?? ""}
        onChange={reload}
      />
    );
  return <ComingSoonPage pathname={pathname} />;
}

function DashboardHome({ state }: { state: AppState }) {
  const name =
    state.profile?.full_name?.split(" ")[0] || state.email.split("@")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const incomplete = !state.profile?.full_name || !state.profile?.phone;
  return (
    <>
      <PageIntro
        eyebrow="Account overview"
        title={`${greeting}, ${name}`}
        text="Here’s what’s happening with your trading accounts."
      />
      {(incomplete || state.accounts.length === 0) && (
        <Onboarding
          incomplete={incomplete}
          hasAccounts={state.accounts.length > 0}
        />
      )}
      <section className="metric-grid" aria-label="Account summary">
        <MetricCard
          label="Connected accounts"
          value={String(
            state.accounts.filter((a) => a.connection_status === "connected")
              .length,
          )}
          note={`${state.accounts.length} trading account${state.accounts.length === 1 ? "" : "s"}`}
          icon={<WalletCards />}
        />
        <MetricCard
          label="Total balance"
          value="Not synced"
          note="MetaTrader integration required"
          icon={<CircleDollarSign />}
          muted
        />
        <MetricCard
          label="Total equity"
          value="Not synced"
          note="Connect trading data"
          icon={<TrendingUp />}
          muted
        />
        <MetricCard
          label="Today’s P/L"
          value="Not synced"
          note="No fabricated performance"
          icon={<ActivityIcon />}
          muted
        />
      </section>
      <section className="dashboard-split">
        <Panel
          title="Market Overview"
          action={
            <span className="status-pill neutral">
              Data integration required
            </span>
          }
        >
          <MarketEmpty />
        </Panel>
        <AIResearchPanel />
      </section>
      <section className="dashboard-split lower">
        <Panel
          title="My Trading Accounts"
          action={
            <Link className="panel-link" href="/dashboard/accounts">
              Manage accounts <ChevronRight />
            </Link>
          }
        >
          {state.accounts.length ? (
            <CompactAccounts accounts={state.accounts.slice(0, 3)} />
          ) : (
            <MiniEmpty
              icon={<WalletCards />}
              title="No trading accounts yet"
              text="Add an MT4 or MT5 configuration to start the connection process."
              href="/dashboard/accounts"
              action="Add account"
            />
          )}
        </Panel>
        <Panel title="Recent Activity">
          <ActivityList activities={state.activities} />
        </Panel>
      </section>
    </>
  );
}

function Onboarding({
  incomplete,
  hasAccounts,
}: {
  incomplete: boolean;
  hasAccounts: boolean;
}) {
  return (
    <section className="onboarding-card">
      <div>
        <span className="section-kicker">First steps</span>
        <h2>Welcome to Cash Lab</h2>
        <p>Complete your account setup to unlock your trading workspace.</p>
      </div>
      <ol>
        <li className={!incomplete ? "done" : ""}>
          <span>1</span>Complete Profile
        </li>
        <li className={hasAccounts ? "done" : ""}>
          <span>2</span>Connect MT4 / MT5
        </li>
        <li>
          <span>3</span>Start using Cash Lab
        </li>
      </ol>
      <div className="onboarding-actions">
        <Link className="app-button secondary" href="/dashboard/profile">
          Complete profile
        </Link>
        <Link className="app-button" href="/dashboard/accounts">
          Connect trading account
        </Link>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon,
  muted,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  muted?: boolean;
}) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong className={muted ? "metric-muted" : ""}>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="app-panel">
      <header>
        <h2>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function MarketEmpty() {
  return (
    <div className="market-empty">
      <div className="market-toolbar">
        <strong>XAUUSD</strong>
        <span>1H</span>
        <span>4H</span>
        <span>1D</span>
        <span>1W</span>
      </div>
      <div className="chart-placeholder">
        <svg
          viewBox="0 0 600 180"
          role="img"
          aria-label="Market chart unavailable"
        >
          <path
            d="M0 135 C70 120 110 155 175 115 S270 84 335 106 S440 40 600 66"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M0 135 C70 120 110 155 175 115 S270 84 335 106 S440 40 600 66 V180 H0 Z"
            fill="url(#g)"
            opacity=".22"
          />
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="currentColor" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div>
          <BarChart3 />
          <strong>Market data integration required</strong>
          <span>
            Live prices will appear here after an approved provider is
            connected.
          </span>
        </div>
      </div>
    </div>
  );
}

function AIResearchPanel() {
  return (
    <Panel
      title="CashLab AI Research"
      action={<span className="status-pill neutral">API required</span>}
    >
      <p className="panel-subtitle">
        AI-powered market intelligence and trading research.
      </p>
      <div className="ai-quick-actions">
        {[
          "Analyze XAUUSD",
          "Market Outlook",
          "Compare Assets",
          "Risk Analysis",
        ].map((label) => (
          <button key={label} disabled>
            {label}
          </button>
        ))}
      </div>
      <div className="ai-input">
        <Bot />
        <span>Ask CashLab anything about the market…</span>
        <button disabled aria-label="Send question">
          <ChevronRight />
        </button>
      </div>
      <small className="integration-note">
        <AlertCircle />
        AI answers are disabled until a verified backend is connected.
      </small>
    </Panel>
  );
}

function CompactAccounts({ accounts }: { accounts: TradingAccount[] }) {
  return (
    <div className="compact-accounts">
      {accounts.map((account) => (
        <Link href="/dashboard/accounts" key={account.id}>
          <span className={`platform-badge ${account.platform.toLowerCase()}`}>
            {account.platform}
          </span>
          <div>
            <strong>{account.account_label}</strong>
            <span>
              {account.broker_name} · ••••{account.account_number.slice(-4)}
            </span>
          </div>
          <StatusBadge status={account.connection_status} />
          <ChevronRight />
        </Link>
      ))}
    </div>
  );
}

function ActivityList({ activities }: { activities: Activity[] }) {
  if (!activities.length)
    return (
      <MiniEmpty
        icon={<ClipboardList />}
        title="No recent activity"
        text="Account and profile updates will appear here."
      />
    );
  return (
    <div className="activity-list">
      {activities.map((activity) => (
        <div key={activity.id}>
          <span>
            <ActivityIcon />
          </span>
          <div>
            <strong>{activity.description}</strong>
            <small>{formatDate(activity.created_at, true)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountsPage({
  state,
  setState,
}: {
  state: AppState;
  setState: (state: AppState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TradingAccount | null>(null);
  const [message, setMessage] = useState("");
  async function remove(account: TradingAccount) {
    if (
      !window.confirm(`Remove ${account.account_label}? This cannot be undone.`)
    )
      return;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("trading_accounts")
      .delete()
      .eq("id", account.id);
    if (error)
      return setMessage("That account could not be removed. Please try again.");
    setState({
      ...state,
      accounts: state.accounts.filter((item) => item.id !== account.id),
    });
    setMessage("Trading account removed.");
  }
  return (
    <>
      <PageIntro
        eyebrow="Trading configuration"
        title="My Trading Accounts"
        text="Manage the MT4 and MT5 account information used for future secure synchronization."
        action={
          <button
            className="app-button"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus /> Add Trading Account
          </button>
        }
      />
      <Notice>
        Cash Lab stores configuration only. It does not request or store your
        MetaTrader password, and live balances require a separate approved
        integration.
      </Notice>
      {message && <InlineMessage>{message}</InlineMessage>}
      {state.accounts.length ? (
        <div className="account-card-grid">
          {state.accounts.map((account) => (
            <TradingAccountCard
              key={account.id}
              account={account}
              onEdit={() => {
                setEditing(account);
                setOpen(true);
              }}
              onRemove={() => void remove(account)}
            />
          ))}
        </div>
      ) : (
        <div className="large-empty">
          <WalletCards />
          <h2>Connect your first trading account</h2>
          <p>
            Connect your MT4 or MT5 account configuration to start using Cash
            Lab trading analytics and AI research.
          </p>
          <button className="app-button" onClick={() => setOpen(true)}>
            <Plus /> Add Trading Account
          </button>
        </div>
      )}
      {open && (
        <AccountModal
          state={state}
          account={editing}
          onClose={() => setOpen(false)}
          onSaved={(saved) => {
            const exists = state.accounts.some((a) => a.id === saved.id);
            setState({
              ...state,
              accounts: exists
                ? state.accounts.map((a) => (a.id === saved.id ? saved : a))
                : [saved, ...state.accounts],
            });
            setOpen(false);
            setMessage(
              exists
                ? "Trading account updated."
                : "Trading account added. Connection is pending.",
            );
          }}
        />
      )}
    </>
  );
}

function TradingAccountCard({
  account,
  onEdit,
  onRemove,
}: {
  account: TradingAccount;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="trading-account-card">
      <header>
        <span className={`platform-badge ${account.platform.toLowerCase()}`}>
          {account.platform}
        </span>
        <StatusBadge status={account.connection_status} />
      </header>
      <h2>{account.account_label}</h2>
      <p>{account.broker_name}</p>
      <dl>
        <div>
          <dt>Account</dt>
          <dd>••••{account.account_number.slice(-4)}</dd>
        </div>
        <div>
          <dt>Server</dt>
          <dd>{account.broker_server}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{titleCase(account.account_type)}</dd>
        </div>
        <div>
          <dt>Currency</dt>
          <dd>{account.currency}</dd>
        </div>
        <div>
          <dt>Balance</dt>
          <dd className="not-synced">Not synced</dd>
        </div>
        <div>
          <dt>Today’s P/L</dt>
          <dd className="not-synced">Not synced</dd>
        </div>
      </dl>
      <footer>
        <button onClick={onEdit}>Edit</button>
        <button disabled title="Requires a MetaTrader provider">
          Reconnect
        </button>
        <button className="danger-link" onClick={onRemove}>
          Remove
        </button>
      </footer>
    </article>
  );
}

function AccountModal({
  state,
  account,
  onClose,
  onSaved,
}: {
  state: AppState;
  account: TradingAccount | null;
  onClose: () => void;
  onSaved: (account: TradingAccount) => void;
}) {
  const [platform, setPlatform] = useState<"MT4" | "MT5">(
    account?.platform ?? "MT5",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      user_id: state.userId,
      platform,
      account_label: String(form.get("account_label") ?? "").trim(),
      broker_name: String(form.get("broker_name") ?? "").trim(),
      account_number: String(form.get("account_number") ?? "").trim(),
      broker_server: String(form.get("broker_server") ?? "").trim(),
      account_type: String(form.get("account_type")),
      currency: String(form.get("currency")),
      connection_type: String(form.get("connection_type")),
    };
    const supabase = getSupabaseBrowserClient();
    const query = account
      ? supabase.from("trading_accounts").update(payload).eq("id", account.id)
      : supabase.from("trading_accounts").insert(payload);
    const { data, error: saveError } = await query.select("*").single();
    if (saveError) {
      setError(
        saveError.code === "23505"
          ? "This trading account is already registered."
          : "The account could not be saved. Check the details and try again.",
      );
    } else onSaved(data as TradingAccount);
    setSaving(false);
  }
  return (
    <div
      className="modal-layer"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="app-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
      >
        <header>
          <div>
            <span className="section-kicker">Secure configuration</span>
            <h2 id="account-modal-title">
              {account ? "Edit Trading Account" : "Add Trading Account"}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X />
          </button>
        </header>
        <form ref={formRef} onSubmit={submit}>
          <fieldset>
            <legend>Choose platform</legend>
            <div className="platform-choices">
              {(["MT4", "MT5"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={platform === item ? "selected" : ""}
                  onClick={() => setPlatform(item)}
                >
                  <span>{item}</span>
                  <strong>MetaTrader {item.slice(-1)}</strong>
                  <small>Configuration record</small>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="app-form-grid">
            <FormField
              label="Account label"
              name="account_label"
              placeholder="My Gold Account"
              defaultValue={account?.account_label}
            />
            <FormField
              label="Broker name"
              name="broker_name"
              placeholder="Enter your broker"
              defaultValue={account?.broker_name}
            />
            <FormField
              label="Trading account number"
              name="account_number"
              placeholder="12345678"
              defaultValue={account?.account_number}
              inputMode="numeric"
              pattern="[0-9]{4,32}"
            />
            <FormField
              label="Broker server"
              name="broker_server"
              placeholder="Broker-Live01"
              defaultValue={account?.broker_server}
            />
            <SelectField
              label="Account type"
              name="account_type"
              defaultValue={account?.account_type ?? "live"}
              options={[
                ["live", "Live"],
                ["demo", "Demo"],
              ]}
            />
            <SelectField
              label="Currency"
              name="currency"
              defaultValue={account?.currency ?? "USD"}
              options={[
                "USD",
                "EUR",
                "GBP",
                "AED",
                "JPY",
                "AUD",
                "CAD",
                "CHF",
              ].map((v) => [v, v])}
            />
            <SelectField
              label="Connection method"
              name="connection_type"
              defaultValue={account?.connection_type ?? "read_only"}
              options={[
                ["read_only", "Read only"],
                ["trading_enabled", "Trading enabled (requires approval)"],
              ]}
            />
          </div>
          <div className="credential-warning">
            <ShieldCheck />
            <div>
              <strong>No password required</strong>
              <span>
                Never submit your master or investor password here. A secure
                connection provider will be configured separately.
              </span>
            </div>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <footer>
            <button
              type="button"
              className="app-button secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="app-button" disabled={saving}>
              {saving ? "Saving…" : account ? "Save changes" : "Add account"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function FormField({
  label,
  name,
  defaultValue,
  ...props
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  inputMode?: "numeric";
  pattern?: string;
}) {
  return (
    <label className="app-field">
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue} required {...props} />
    </label>
  );
}
function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[][];
}) {
  return (
    <label className="app-field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProfilePage({
  state,
  setState,
}: {
  state: AppState;
  setState: (state: AppState) => void;
}) {
  const profile = state.profile;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: String(form.get("full_name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim() || null,
      country: String(form.get("country")),
      timezone: String(form.get("timezone")),
      preferred_currency: String(form.get("preferred_currency")),
      trading_experience: String(form.get("trading_experience")),
      preferred_markets: String(form.get("preferred_markets") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const { data, error } = await getSupabaseBrowserClient()
      .from("profiles")
      .update(payload)
      .eq("id", state.userId)
      .select("*")
      .single();
    if (error) setMessage("Your profile could not be saved. Please try again.");
    else {
      setState({ ...state, profile: data as Profile });
      setMessage("Profile updated successfully.");
    }
    setSaving(false);
  }
  async function uploadAvatar(file: File) {
    if (
      !file.type.match(/^image\/(jpeg|png|webp)$/) ||
      file.size > 2 * 1024 * 1024
    ) {
      setMessage("Choose a JPEG, PNG, or WebP image under 2 MB.");
      return;
    }
    setAvatarBusy(true);
    setMessage("");
    const supabase = getSupabaseBrowserClient();
    const path = `${state.userId}/avatar-${Date.now()}.${file.name.split(".").pop()?.toLowerCase() || "png"}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setMessage("The photo could not be uploaded.");
      setAvatarBusy(false);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("id", state.userId)
      .select("*")
      .single();
    if (error) setMessage("The photo could not be attached to your profile.");
    else {
      setState({ ...state, profile: data as Profile });
      setMessage("Profile photo updated.");
    }
    setAvatarBusy(false);
  }
  async function removeAvatar() {
    if (!profile?.avatar_url) return;
    setAvatarBusy(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.storage.from("avatars").remove([profile.avatar_url]);
    const { data } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", state.userId)
      .select("*")
      .single();
    if (data) setState({ ...state, profile: data as Profile });
    setMessage("Profile photo removed.");
    setAvatarBusy(false);
  }
  return (
    <>
      <PageIntro
        eyebrow="Account"
        title="Your Profile"
        text="Keep your identity, location, and trading preferences up to date."
      />
      <div className="profile-layout">
        <section className="app-panel profile-avatar-panel">
          <Avatar
            profile={profile}
            name={profile?.full_name || state.email}
            large
          />
          <h2>{profile?.full_name || "Cash Lab member"}</h2>
          <p>{state.email}</p>
          <label className="app-button secondary file-button">
            {avatarBusy ? "Working…" : "Upload photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                e.target.files?.[0] && void uploadAvatar(e.target.files[0])
              }
              disabled={avatarBusy}
            />
          </label>
          {profile?.avatar_url && (
            <button
              className="danger-link"
              onClick={() => void removeAvatar()}
              disabled={avatarBusy}
            >
              Remove photo
            </button>
          )}
          <small>JPEG, PNG or WebP. Maximum 2 MB.</small>
        </section>
        <section className="app-panel">
          <form className="profile-form" onSubmit={save}>
            <div className="app-form-grid">
              <FormField
                label="Full name"
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                placeholder="Your full name"
              />
              <label className="app-field">
                <span>Email</span>
                <input value={state.email} disabled />
                <small>Email changes require Supabase confirmation.</small>
              </label>
              <FormField
                label="Phone"
                name="phone"
                defaultValue={profile?.phone ?? ""}
                placeholder="+971…"
              />
              <SelectField
                label="Country"
                name="country"
                defaultValue={profile?.country ?? "United Arab Emirates"}
                options={countryOptions.map((c) => [
                  c.name,
                  `${c.flag} ${c.name}`,
                ])}
              />
              <SelectField
                label="Timezone"
                name="timezone"
                defaultValue={
                  profile?.timezone ??
                  Intl.DateTimeFormat().resolvedOptions().timeZone
                }
                options={[
                  "Asia/Dubai",
                  "Asia/Kolkata",
                  "Europe/London",
                  "America/New_York",
                  "UTC",
                ].map((v) => [v, v])}
              />
              <SelectField
                label="Preferred currency"
                name="preferred_currency"
                defaultValue={profile?.preferred_currency ?? "USD"}
                options={["USD", "EUR", "GBP", "AED", "INR"].map((v) => [v, v])}
              />
              <SelectField
                label="Trading experience"
                name="trading_experience"
                defaultValue={profile?.trading_experience ?? "beginner"}
                options={[
                  ["beginner", "Beginner"],
                  ["intermediate", "Intermediate"],
                  ["advanced", "Advanced"],
                  ["professional", "Professional"],
                ]}
              />
              <FormField
                label="Preferred markets (comma separated)"
                name="preferred_markets"
                defaultValue={(profile?.preferred_markets ?? []).join(", ")}
                placeholder="XAUUSD, EURUSD"
              />
            </div>
            {message && <InlineMessage>{message}</InlineMessage>}
            <footer>
              <button className="app-button" disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </>
  );
}

function SettingsPage({
  state,
  setState,
}: {
  state: AppState;
  setState: (state: AppState) => void;
}) {
  const profile = state.profile;
  async function toggle(
    field: "email_alerts" | "account_notifications" | "market_alerts",
    checked: boolean,
  ) {
    const { data } = await getSupabaseBrowserClient()
      .from("profiles")
      .update({ [field]: checked })
      .eq("id", state.userId)
      .select("*")
      .single();
    if (data) setState({ ...state, profile: data as Profile });
  }
  return (
    <>
      <PageIntro
        eyebrow="Preferences"
        title="Settings"
        text="Manage notifications, appearance, and account security."
      />
      <div className="settings-grid">
        <Panel title="Notifications">
          <SettingToggle
            label="Email alerts"
            text="Important Cash Lab account emails."
            checked={profile?.email_alerts ?? true}
            onChange={(v) => void toggle("email_alerts", v)}
          />
          <SettingToggle
            label="Account notifications"
            text="Connection and synchronization updates."
            checked={profile?.account_notifications ?? true}
            onChange={(v) => void toggle("account_notifications", v)}
          />
          <SettingToggle
            label="Market alerts"
            text="Available after a market data provider is connected."
            checked={profile?.market_alerts ?? false}
            disabled
            onChange={() => {}}
          />
        </Panel>
        <Panel title="Appearance">
          <div className="setting-row">
            <div>
              <strong>Color theme</strong>
              <span>Switch between Cash Lab dark and light modes.</span>
            </div>
            <ThemeToggle />
          </div>
        </Panel>
        <Panel title="Security">
          <div className="security-setting">
            <ShieldCheck />
            <div>
              <strong>Passwordless email authentication</strong>
              <span>
                Your session is protected by Supabase OTP. Sign out on shared
                devices.
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function SettingToggle({
  label,
  text,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  text: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const id = `setting-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div className="setting-row">
      <div>
        <label htmlFor={id}>
          <strong>{label}</strong>
        </label>
        <span>{text}</span>
      </div>
      <input
        id={id}
        aria-label={label}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

function ComingSoonPage({ pathname }: { pathname: string }) {
  const config: Record<string, [string, string, ReactNode]> = {
    "/dashboard/markets": [
      "Markets",
      "Live market prices require an approved data provider.",
      <BarChart3 key="i" />,
    ],
    "/dashboard/research": [
      "AI Research",
      "CashLab AI is ready for a verified backend integration.",
      <Bot key="i" />,
    ],
    "/dashboard/ai": [
      "AI Trading",
      "Automated execution will only be enabled after a secure MetaTrader integration.",
      <TrendingUp key="i" />,
    ],
    "/dashboard/watchlist": [
      "Watchlist",
      "Market watchlists will activate with the data provider.",
      <Star key="i" />,
    ],
    "/dashboard/subscription": [
      "Subscription",
      "Your Cash Lab plan and billing controls will appear here.",
      <CircleDollarSign key="i" />,
    ],
    "/dashboard/support": [
      "Support",
      "Contact the Cash Lab team for account and connection help.",
      <Headphones key="i" />,
    ],
    "/admin/settings": [
      "Admin Settings",
      "Administrative platform settings are intentionally limited in this phase.",
      <Settings key="i" />,
    ],
  };
  const [title, text, icon] = config[pathname] ?? [
    "Cash Lab",
    "This workspace is being prepared.",
    <Gauge key="i" />,
  ];
  return (
    <>
      <PageIntro eyebrow="Cash Lab workspace" title={title} text={text} />
      <div className="large-empty">
        {icon}
        <h2>Integration-ready</h2>
        <p>
          No simulated information is shown. This section will activate when its
          genuine backend service is connected.
        </p>
      </div>
    </>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState({
    users: 0,
    accounts: 0,
    mt4: 0,
    mt5: 0,
    pending: 0,
    recent: 0,
  });
  useEffect(() => {
    void (async () => {
      const sb = getSupabaseBrowserClient();
      const week = new Date(Date.now() - 7 * 86400000).toISOString();
      const [users, accounts, mt4, mt5, pending, recent] = await Promise.all([
        sb.from("profiles").select("id", { count: "exact", head: true }),
        sb
          .from("trading_accounts")
          .select("id", { count: "exact", head: true }),
        sb
          .from("trading_accounts")
          .select("id", { count: "exact", head: true })
          .eq("platform", "MT4"),
        sb
          .from("trading_accounts")
          .select("id", { count: "exact", head: true })
          .eq("platform", "MT5"),
        sb
          .from("trading_accounts")
          .select("id", { count: "exact", head: true })
          .eq("connection_status", "pending"),
        sb
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", week),
      ]);
      setStats({
        users: users.count ?? 0,
        accounts: accounts.count ?? 0,
        mt4: mt4.count ?? 0,
        mt5: mt5.count ?? 0,
        pending: pending.count ?? 0,
        recent: recent.count ?? 0,
      });
    })();
  }, []);
  return (
    <>
      <PageIntro
        eyebrow="Management overview"
        title="Admin Dashboard"
        text="Real account and customer counts from the authorized Cash Lab database."
      />
      <section className="metric-grid admin-metrics">
        <MetricCard
          label="Total users"
          value={String(stats.users)}
          note={`${stats.recent} new in the last 7 days`}
          icon={<Users />}
        />
        <MetricCard
          label="Trading accounts"
          value={String(stats.accounts)}
          note={`${stats.pending} pending connection`}
          icon={<BriefcaseBusiness />}
        />
        <MetricCard
          label="MT4 accounts"
          value={String(stats.mt4)}
          note="Configuration records"
          icon={<WalletCards />}
        />
        <MetricCard
          label="MT5 accounts"
          value={String(stats.mt5)}
          note="Configuration records"
          icon={<WalletCards />}
        />
      </section>
      <section className="dashboard-split">
        <Panel title="Connection status">
          <div className="admin-status-chart">
            <div>
              <span
                style={{
                  width: `${stats.accounts ? (stats.pending / stats.accounts) * 100 : 0}%`,
                }}
              />
            </div>
            <strong>{stats.pending} pending</strong>
            <small>
              Live connectivity is unavailable until a MetaTrader provider is
              configured.
            </small>
          </div>
        </Panel>
        <Panel title="Security">
          <div className="security-setting">
            <ShieldCheck />
            <div>
              <strong>Protected administrator role</strong>
              <span>
                Access is verified from Supabase app metadata and enforced again
                by database RLS.
              </span>
            </div>
          </div>
          <div className="security-setting">
            <ClipboardList />
            <div>
              <strong>Shared source of truth</strong>
              <span>
                Client and admin dashboards read the same authorized records.
              </span>
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<
    Array<
      Profile & {
        trading_accounts: Array<{
          id: string;
          platform: string;
          connection_status: string;
        }>;
      }
    >
  >([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  useEffect(() => {
    void (async () => {
      let q = getSupabaseBrowserClient()
        .from("profiles")
        .select("*, trading_accounts(id, platform, connection_status)")
        .order("created_at", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);
      if (query.trim())
        q = q.or(
          `full_name.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%`,
        );
      const { data } = await q;
      setUsers((data ?? []) as typeof users);
    })();
  }, [page, query]);
  return (
    <>
      <PageIntro
        eyebrow="Customer management"
        title="Users"
        text="Search authorized customer profiles and inspect their trading-account records."
      />
      <div className="table-toolbar">
        <label>
          <Search />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search name or email"
            aria-label="Search users"
          />
        </label>
      </div>
      <DataTable
        headers={["User", "Email", "Joined", "MT Accounts", "Status", "Action"]}
      >
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              <strong>{user.full_name || "Profile incomplete"}</strong>
            </td>
            <td>{user.email}</td>
            <td>{formatDate(user.created_at)}</td>
            <td>{user.trading_accounts.length}</td>
            <td>
              <span className={`status-pill ${user.account_status}`}>
                {titleCase(user.account_status)}
              </span>
            </td>
            <td>
              <Link className="table-action" href={`/admin/users/${user.id}`}>
                View user <ChevronRight />
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
      {!users.length && <TableEmpty text="No users match this search." />}
      <Pagination
        page={page}
        hasNext={users.length === pageSize}
        onChange={setPage}
      />
    </>
  );
}

function AdminAccounts() {
  const [accounts, setAccounts] = useState<
    Array<
      TradingAccount & {
        profiles: { full_name: string | null; email: string } | null;
      }
    >
  >([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  useEffect(() => {
    void (async () => {
      let q = getSupabaseBrowserClient()
        .from("trading_accounts")
        .select("*, profiles(full_name,email)")
        .order("created_at", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);
      if (["MT4", "MT5"].includes(filter)) q = q.eq("platform", filter);
      else if (
        ["connected", "pending", "error", "disconnected"].includes(filter)
      )
        q = q.eq("connection_status", filter);
      if (query.trim())
        q = q.or(
          `broker_name.ilike.%${query.trim()}%,account_number.ilike.%${query.trim()}%,broker_server.ilike.%${query.trim()}%`,
        );
      const { data } = await q;
      setAccounts((data ?? []) as typeof accounts);
    })();
  }, [page, query, filter]);
  return (
    <>
      <PageIntro
        eyebrow="Connection operations"
        title="Trading Accounts"
        text="Review registered MT4 and MT5 configurations without exposing credentials."
      />
      <div className="table-toolbar">
        <label>
          <Search />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search broker, account or server"
            aria-label="Search accounts"
          />
        </label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
          aria-label="Filter accounts"
        >
          <option value="all">All accounts</option>
          <option>MT4</option>
          <option>MT5</option>
          <option value="connected">Connected</option>
          <option value="pending">Pending</option>
          <option value="error">Error</option>
          <option value="disconnected">Disconnected</option>
        </select>
      </div>
      <DataTable
        headers={[
          "Customer",
          "Platform",
          "Broker",
          "Account",
          "Server",
          "Type",
          "Status",
          "Added",
          "Action",
        ]}
      >
        {accounts.map((account) => (
          <tr key={account.id}>
            <td>
              <strong>
                {account.profiles?.full_name ||
                  account.profiles?.email ||
                  "Unknown"}
              </strong>
            </td>
            <td>
              <span
                className={`platform-badge ${account.platform.toLowerCase()}`}
              >
                {account.platform}
              </span>
            </td>
            <td>{account.broker_name}</td>
            <td>••••{account.account_number.slice(-4)}</td>
            <td>{account.broker_server}</td>
            <td>{titleCase(account.account_type)}</td>
            <td>
              <StatusBadge status={account.connection_status} />
            </td>
            <td>{formatDate(account.created_at)}</td>
            <td>
              <Link
                className="table-action"
                href={`/admin/accounts/${account.id}`}
              >
                View <ChevronRight />
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
      {!accounts.length && (
        <TableEmpty text="No trading accounts match these filters." />
      )}
      <Pagination
        page={page}
        hasNext={accounts.length === pageSize}
        onChange={setPage}
      />
    </>
  );
}

function AdminUserDetail({ id }: { id: string }) {
  const [data, setData] = useState<{
    profile: Profile;
    accounts: TradingAccount[];
  } | null>(null);
  useEffect(() => {
    void (async () => {
      const sb = getSupabaseBrowserClient();
      const [profile, accounts] = await Promise.all([
        sb.from("profiles").select("*").eq("id", id).single(),
        sb
          .from("trading_accounts")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
      ]);
      if (profile.data)
        setData({
          profile: profile.data as Profile,
          accounts: (accounts.data ?? []) as TradingAccount[],
        });
    })();
  }, [id]);
  if (!data) return <SectionSkeleton />;
  return (
    <>
      <PageIntro
        eyebrow="Customer detail"
        title={data.profile.full_name || "Profile incomplete"}
        text={data.profile.email}
        action={
          <Link className="app-button secondary" href="/admin/users">
            Back to users
          </Link>
        }
      />
      <div className="detail-grid">
        <Panel title="Customer Profile">
          <DescriptionList
            items={[
              ["Email", data.profile.email],
              ["Phone", data.profile.phone || "Not provided"],
              ["Country", data.profile.country || "Not provided"],
              ["Joined", formatDate(data.profile.created_at)],
              ["Status", titleCase(data.profile.account_status)],
            ]}
          />
        </Panel>
        <Panel title="Trading Accounts">
          {data.accounts.length ? (
            <CompactAccounts accounts={data.accounts} />
          ) : (
            <MiniEmpty
              icon={<WalletCards />}
              title="No accounts"
              text="This customer has not added a trading account."
            />
          )}
        </Panel>
      </div>
    </>
  );
}

function AdminAccountDetail({
  id,
  onChange,
}: {
  id: string;
  onChange: () => Promise<void>;
}) {
  const [account, setAccount] = useState<
    | (TradingAccount & {
        profiles: { full_name: string | null; email: string } | null;
      })
    | null
  >(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const { data } = await getSupabaseBrowserClient()
      .from("trading_accounts")
      .select("*, profiles(full_name,email)")
      .eq("id", id)
      .single();
    if (data) setAccount(data as typeof account);
  }, [id]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function status(
    connection_status: TradingAccount["connection_status"],
  ) {
    setBusy(true);
    await getSupabaseBrowserClient()
      .from("trading_accounts")
      .update({
        connection_status,
        last_connection_attempt_at: new Date().toISOString(),
      })
      .eq("id", id);
    await load();
    await onChange();
    setBusy(false);
  }
  if (!account) return <SectionSkeleton />;
  return (
    <>
      <PageIntro
        eyebrow="Account operations"
        title={account.account_label}
        text={`${account.platform} · ${account.broker_name}`}
        action={
          <Link className="app-button secondary" href="/admin/accounts">
            Back to accounts
          </Link>
        }
      />
      <div className="detail-grid">
        <Panel title="Account Owner">
          <DescriptionList
            items={[
              ["Customer", account.profiles?.full_name || "Profile incomplete"],
              ["Email", account.profiles?.email || "Unavailable"],
            ]}
          />
        </Panel>
        <Panel title="Trading Account">
          <DescriptionList
            items={[
              ["Platform", account.platform],
              ["Broker", account.broker_name],
              ["Account", `••••${account.account_number.slice(-4)}`],
              ["Server", account.broker_server],
              ["Type", titleCase(account.account_type)],
              ["Currency", account.currency],
              ["Connection", titleCase(account.connection_type)],
            ]}
          />
        </Panel>
        <Panel title="Connection">
          <DescriptionList
            items={[
              ["Status", titleCase(account.connection_status)],
              ["Created", formatDate(account.created_at)],
              [
                "Last attempt",
                account.last_connection_attempt_at
                  ? formatDate(account.last_connection_attempt_at, true)
                  : "Not attempted",
              ],
              [
                "Last sync",
                account.last_sync_at
                  ? formatDate(account.last_sync_at, true)
                  : "Not synced",
              ],
              ["Last error", account.last_error || "None recorded"],
            ]}
          />
          <div className="admin-actions">
            <button disabled={busy} onClick={() => void status("pending")}>
              Mark for connection
            </button>
            <button
              disabled={busy || account.connection_status !== "error"}
              onClick={() => void status("pending")}
            >
              Retry connection
            </button>
            <button
              disabled={busy}
              className="danger-link"
              onClick={() => void status("disconnected")}
            >
              Disable connection
            </button>
          </div>
        </Panel>
        <Panel title="Trading Metrics">
          <MiniEmpty
            icon={<BarChart3 />}
            title="No synchronized metrics"
            text="Balance, equity, margin and P/L will appear after a real MetaTrader integration is active."
          />
        </Panel>
      </div>
    </>
  );
}

function DescriptionList({ items }: { items: string[][] }) {
  return (
    <dl className="description-list">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function TableEmpty({ text }: { text: string }) {
  return <div className="table-empty">{text}</div>;
}
function Pagination({
  page,
  hasNext,
  onChange,
}: {
  page: number;
  hasNext: boolean;
  onChange: (page: number) => void;
}) {
  return (
    <div className="pagination">
      <button disabled={page === 0} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span>Page {page + 1}</span>
      <button disabled={!hasNext} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}

function NotificationBell({
  state,
  onChange,
}: {
  state: AppState;
  onChange: (state: AppState) => void;
}) {
  const [open, setOpen] = useState(false);
  const unread = state.notifications.filter((n) => !n.read_at).length;
  async function markRead(item: CashLabNotification) {
    if (item.read_at) return;
    const read_at = new Date().toISOString();
    const { error } = await getSupabaseBrowserClient()
      .from("notifications")
      .update({ read_at })
      .eq("id", item.id);
    if (!error)
      onChange({
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === item.id ? { ...n, read_at } : n,
        ),
      });
  }
  return (
    <div className="notification-wrap">
      <button
        className="icon-button app-bell"
        onClick={() => setOpen(!open)}
        aria-label={`${unread} unread notifications`}
      >
        <Bell />
        {unread > 0 && <span>{unread}</span>}
      </button>
      {open && (
        <div className="notification-menu">
          <header>
            <strong>Notifications</strong>
            <button onClick={() => setOpen(false)}>
              <X />
            </button>
          </header>
          {state.notifications.length ? (
            state.notifications.map((item) => (
              <button
                key={item.id}
                className={item.read_at ? "read" : ""}
                onClick={() => void markRead(item)}
              >
                <span className={`notification-dot ${item.category}`} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                  <small>{formatDate(item.created_at, true)}</small>
                </div>
              </button>
            ))
          ) : (
            <p>No notifications yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
function Avatar({
  profile,
  name,
  small,
  large,
}: {
  profile: Profile | null;
  name: string;
  small?: boolean;
  large?: boolean;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (profile?.avatar_url)
      void getSupabaseBrowserClient()
        .storage.from("avatars")
        .createSignedUrl(profile.avatar_url, 3600)
        .then(({ data }) => setUrl(data?.signedUrl ?? ""));
  }, [profile?.avatar_url]);
  const displayUrl = profile?.avatar_url ? url : "";
  return (
    <span
      className={`app-avatar ${small ? "small" : ""} ${large ? "large" : ""}`}
    >
      {displayUrl ? (
        <Image src={displayUrl} alt="" width={82} height={82} unoptimized />
      ) : (
        (name.trim()[0] || "C").toUpperCase()
      )}
    </span>
  );
}
function StatusBadge({
  status,
}: {
  status: TradingAccount["connection_status"];
}) {
  return (
    <span className={`status-pill ${status}`}>
      {status === "pending" ? "Pending connection" : titleCase(status)}
    </span>
  );
}
function PageIntro({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <header className="app-page-intro">
      <div>
        <span className="section-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </header>
  );
}
function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="app-notice">
      <ShieldCheck />
      {children}
    </div>
  );
}
function InlineMessage({ children }: { children: ReactNode }) {
  return (
    <div className="inline-message" role="status">
      {children}
    </div>
  );
}
function MiniEmpty({
  icon,
  title,
  text,
  href,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mini-empty">
      {icon}
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      {href && action && (
        <Link href={href}>
          {action}
          <ChevronRight />
        </Link>
      )}
    </div>
  );
}
function DashboardSkeleton() {
  return (
    <div className="app-loading">
      <aside />
      <main>
        <header />
        <div>
          <span />
          <span />
          <span />
          <span />
          <section />
          <section />
        </div>
      </main>
    </div>
  );
}
function SectionSkeleton() {
  return (
    <div className="section-skeleton">
      <span />
      <span />
      <span />
    </div>
  );
}
function FullError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <main className="full-error">
      <AlertCircle />
      <h1>We couldn’t load Cash Lab</h1>
      <p>{message}</p>
      <button className="app-button" onClick={() => void onRetry()}>
        Try again
      </button>
      <Link href="/auth?tab=login">Return to sign in</Link>
    </main>
  );
}
function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function formatDate(value: string, time = false) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    ...(time ? { timeStyle: "short" as const } : {}),
  }).format(new Date(value));
}
function pageTitle(pathname: string) {
  return (
    clientNav
      .concat(accountNav as never)
      .find(([, href]) => pathname === href)?.[0] ?? "Cash Lab"
  );
}
