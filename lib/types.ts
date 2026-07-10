export type TransactionType = "income" | "expense";
export type Channel = "cash" | "online";
export type ReviewStatus = "unreviewed" | "accepted" | "rejected";
export type AlertType = "budget_80" | "budget_100" | "target_met";
export type ReportFormat = "pdf" | "csv";
export type SubscriptionStatus = "trial" | "active" | "cancelled" | "expired";

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string | null;
  category_id: string | null;
  type: TransactionType;
  channel: Channel;
  amount: number;
  txn_date: string;
  note: string | null;
  ai_category_suggestion: string | null;
  ai_category_source: string | null;
  ai_category_confidence: number | null;
  ai_category_review_status: ReviewStatus;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string | null;
  category_id: string;
  month: string;
  limit_amount: number;
  created_at: string;
}

export interface SavingsTarget {
  id: string;
  user_id: string | null;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  user_id: string | null;
  budget_id: string | null;
  savings_target_id: string | null;
  alert_type: AlertType;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string | null;
  period_start: string;
  period_end: string;
  format: ReportFormat;
  storage_path: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string | null;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
}

export interface BudgetUsage {
  budget: Budget;
  category: Category | null;
  spent: number;
  percentUsed: number;
}
