import { createClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/server/dashboard-data";
import { formatCurrency } from "@/lib/format";
import { StatTile } from "@/components/dashboard/StatTile";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { SavingsTargetCard } from "@/components/dashboard/SavingsTargetCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { BudgetList } from "@/components/dashboard/BudgetList";
import { AddTransactionForm } from "@/components/dashboard/AddTransactionForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const data = await fetchDashboardData(supabase);

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-8 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Expenses Tracker</h1>
        <p className="text-sm text-neutral-500">
          Track spending, hit your savings goals, and stay under budget.
        </p>
      </header>

      <AlertBanner alerts={data.alerts} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Spent this month" value={formatCurrency(data.totals.totalSpentThisMonth)} tone="negative" />
        <StatTile label="Total saved" value={formatCurrency(data.totals.totalSaved)} tone="positive" />
        <StatTile
          label="Remaining budget"
          value={data.totals.hasBudgets ? formatCurrency(data.totals.remainingBudget) : "—"}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Add a transaction</h2>
        <AddTransactionForm categories={data.categories} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Transactions</h2>
        <TransactionList transactions={data.transactions} categories={data.categories} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Budgets this month</h2>
        <BudgetList budgetUsage={data.budgetUsage} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Savings targets</h2>
        {data.savingsTargets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center">
            <p className="text-neutral-500">Create a savings goal to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.savingsTargets.map((target) => (
              <SavingsTargetCard key={target.id} target={target} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
