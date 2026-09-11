export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json | undefined };

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  timezone: string | null;
  preferred_currency: string | null;
  avatar_url: string | null;
  trading_experience: string | null;
  preferred_markets: string[];
  email_alerts: boolean;
  account_notifications: boolean;
  market_alerts: boolean;
  account_status: "active" | "disabled";
  created_at: string;
  updated_at: string;
};

export type TradingAccount = {
  id: string;
  user_id: string;
  platform: "MT4" | "MT5";
  account_label: string;
  broker_name: string;
  account_number: string;
  broker_server: string;
  account_type: "demo" | "live";
  currency: string;
  connection_type: "read_only" | "trading_enabled";
  connection_status: "pending" | "connected" | "error" | "disconnected";
  last_connection_attempt_at: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  user_id: string;
  event_type: string;
  description: string;
  metadata: Json;
  created_at: string;
};

export type CashLabNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: "info" | "success" | "warning" | "error" | "account";
  read_at: string | null;
  created_at: string;
};

export type TradingAccountMetric = {
  trading_account_id: string;
  balance: number | null;
  equity: number | null;
  floating_pl: number | null;
  daily_pl: number | null;
  currency: string;
  synced_at: string | null;
};

export type PerformancePoint = {
  id: string;
  trading_account_id: string;
  balance: number | null;
  equity: number | null;
  recorded_at: string;
};

export type FinancialRequest = {
  id: string;
  trading_account_id: string;
  request_type: "deposit" | "withdrawal";
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  created_at: string;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  starts_at: string | null;
  ends_at: string | null;
};

export type ReferralProfile = {
  user_id: string;
  referral_code: string;
  successful_referrals: number;
  reward_amount: number;
  reward_currency: string;
};

export type CustomerPlan = {
  user_id: string;
  plan: "standard" | "pro";
  status: "inactive" | "active" | "past_due" | "cancelled";
};
