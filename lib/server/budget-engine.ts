import type { SupabaseClient } from "@supabase/supabase-js";
import type { Budget, BudgetUsage, Category } from "@/lib/types";
import { monthRangeStr } from "@/lib/date";

// Recalculates spend-vs-limit for every budget in `month` ("YYYY-MM-DD", first of month).
export async function calculateBudgetUsage(
  supabase: SupabaseClient,
  month: string,
): Promise<BudgetUsage[]> {
  const { start, end } = monthRangeStr(month);

  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", start);

  if (!budgets || budgets.length === 0) return [];

  const { data: categories } = await supabase.from("categories").select("*");
  const categoryMap = new Map<string, Category>((categories ?? []).map((c) => [c.id, c]));

  const usage: BudgetUsage[] = [];
  for (const budget of budgets as Budget[]) {
    const { data: txns } = await supabase
      .from("transactions")
      .select("amount")
      .eq("category_id", budget.category_id)
      .eq("type", "expense")
      .gte("txn_date", start)
      .lt("txn_date", end);

    const spent = (txns ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
    const percentUsed = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;

    usage.push({
      budget,
      category: categoryMap.get(budget.category_id) ?? null,
      spent,
      percentUsed,
    });
  }

  return usage;
}

// Writes an alert row when a budget crosses 80% or 100%, skipping if an alert of that
// type already exists for this budget this month (avoids duplicate spam on every write).
export async function evaluateBudgetAlerts(
  supabase: SupabaseClient,
  usageList: BudgetUsage[],
  userId: string | null,
) {
  const created: { budgetId: string; alertType: "budget_80" | "budget_100"; message: string }[] = [];

  for (const usage of usageList) {
    const alertType: "budget_80" | "budget_100" | null =
      usage.percentUsed >= 100 ? "budget_100" : usage.percentUsed >= 80 ? "budget_80" : null;

    if (!alertType) continue;

    const { data: existing } = await supabase
      .from("alerts")
      .select("id")
      .eq("budget_id", usage.budget.id)
      .eq("alert_type", alertType)
      .limit(1);

    if (existing && existing.length > 0) continue;

    const categoryName = usage.category?.name ?? "this category";
    const message =
      alertType === "budget_100"
        ? `You've used 100% of your ${categoryName} budget.`
        : `You've used ${Math.round(usage.percentUsed)}% of your ${categoryName} budget.`;

    await supabase.from("alerts").insert({
      user_id: userId,
      budget_id: usage.budget.id,
      alert_type: alertType,
      message,
    });

    created.push({ budgetId: usage.budget.id, alertType, message });
  }

  return created;
}
