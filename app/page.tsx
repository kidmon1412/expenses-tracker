import { createClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/server/dashboard-data";
import { formatCurrency } from "@/lib/format";
import { StatTile } from "@/components/dashboard/StatTile";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { BudgetSection } from "@/components/dashboard/BudgetSection";
import { SavingsSection } from "@/components/dashboard/SavingsSection";
import { AddTransactionForm } from "@/components/dashboard/AddTransactionForm";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { getSubscriptionState } from "@/lib/server/subscription";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [data, subState] = await Promise.all([
    fetchDashboardData(supabase),
    getSubscriptionState(supabase, user?.id ?? null),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-8 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Expenses Tracker</h1>
          <p className="text-sm text-neutral-500">
            Track spending, hit your savings goals, and stay under budget.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/reports"
            className="whitespace-nowrap rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Reports
          </a>
          {user ? (
            <LogoutButton />
          ) : (
            <>
              <a
                href="/login"
                className="whitespace-nowrap rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Sign up
              </a>
            </>
          )}
        </div>
      </header>

      {user && (
        <p className="-mt-6 text-xs text-neutral-500">
          Signed in as {user.email}
        </p>
      )}

      <TrialBanner state={subState} />
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
        <BudgetSection budgetUsage={data.budgetUsage} categories={data.categories} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Savings targets</h2>
        <SavingsSection savingsTargets={data.savingsTargets} />
      </section>
    </main>
  );
}
