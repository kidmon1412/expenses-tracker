import type { SupabaseClient } from "@supabase/supabase-js";
import type { Alert, Budget, Category, SavingsTarget, Transaction } from "@/lib/types";
import { calculateBudgetUsage } from "@/lib/server/budget-engine";
import { monthStart } from "@/lib/format";
import { monthRangeStr } from "@/lib/date";

export interface DashboardData {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  budgetUsage: Awaited<ReturnType<typeof calculateBudgetUsage>>;
  savingsTargets: SavingsTarget[];
  alerts: Alert[];
  totals: {
    totalSpentThisMonth: number;
    totalIncomeThisMonth: number;
    totalSaved: number;
    remainingBudget: number;
    hasBudgets: boolean;
  };
}

export async function fetchDashboardData(supabase: SupabaseClient): Promise<DashboardData> {
  const month = monthStart();
  const { end: monthEnd } = monthRangeStr(month);

  const [{ data: categories }, { data: transactions }, { data: budgets }, { data: savingsTargets }, { data: alerts }] =
    await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("transactions").select("*").order("txn_date", { ascending: false }),
      supabase.from("budgets").select("*").eq("month", month),
      supabase.from("savings_targets").select("*").order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").eq("read", false).order("created_at", { ascending: false }),
    ]);

  const txns = (transactions ?? []) as Transaction[];
  const thisMonth = txns.filter((t) => t.txn_date >= month && t.txn_date < monthEnd);

  const totalSpentThisMonth = thisMonth
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncomeThisMonth = thisMonth
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSaved = (savingsTargets ?? []).reduce((sum, s) => sum + Number(s.current_amount), 0);

  const budgetUsage = await calculateBudgetUsage(supabase, month);
  const remainingBudget = budgetUsage.reduce(
    (sum, u) => sum + Math.max(u.budget.limit_amount - u.spent, 0),
    0,
  );

  return {
    categories: (categories ?? []) as Category[],
    transactions: txns,
    budgets: (budgets ?? []) as Budget[],
    budgetUsage,
    savingsTargets: (savingsTargets ?? []) as SavingsTarget[],
    alerts: (alerts ?? []) as Alert[],
    totals: {
      totalSpentThisMonth,
      totalIncomeThisMonth,
      totalSaved,
      remainingBudget,
      hasBudgets: (budgets ?? []).length > 0,
    },
  };
}
