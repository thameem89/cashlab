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
