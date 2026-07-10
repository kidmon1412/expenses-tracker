import type { BudgetUsage } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function BudgetList({ budgetUsage }: { budgetUsage: BudgetUsage[] }) {
  if (budgetUsage.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center">
        <p className="text-neutral-500">Set a budget to track your limits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {budgetUsage.map((u) => {
        const percent = Math.min(100, u.percentUsed);
        const barColor =
          u.percentUsed >= 100 ? "bg-red-500" : u.percentUsed >= 80 ? "bg-amber-500" : "bg-emerald-500";
        return (
          <div key={u.budget.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-900">
                {u.category?.icon} {u.category?.name ?? "Uncategorised"}
              </span>
              <span className="text-neutral-500">
                {formatCurrency(u.spent)} / {formatCurrency(u.budget.limit_amount)}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
