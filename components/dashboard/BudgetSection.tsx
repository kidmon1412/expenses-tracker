"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BudgetUsage, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

function BudgetCard({ usage }: { usage: BudgetUsage }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(String(usage.budget.limit_amount));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const percent = Math.min(100, usage.percentUsed);
  const barColor =
    usage.percentUsed >= 100 ? "bg-red-500" : usage.percentUsed >= 80 ? "bg-amber-500" : "bg-emerald-500";

  async function saveLimit() {
    const value = Number(limit);
    if (!value || value <= 0) {
      setError("Enter a limit greater than 0.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/budgets/${usage.budget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit_amount: value }),
      });
      if (!res.ok) throw new Error("failed");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteBudget() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/budgets/${usage.budget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-900">
          {usage.category?.icon} {usage.category?.name ?? "Uncategorised"}
        </span>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <input
                type="number"
                min="0"
                step="0.01"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-24 rounded-md border border-neutral-300 px-2 py-1 text-xs"
              />
              <button
                onClick={saveLimit}
                disabled={busy}
                className="text-xs font-medium text-emerald-700 hover:underline disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs font-medium text-neutral-500 hover:underline"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="text-neutral-500">
                {formatCurrency(usage.spent)} / {formatCurrency(usage.budget.limit_amount)}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-medium text-neutral-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={deleteBudget}
                disabled={busy}
                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AddBudgetForm({
  categories,
  usedCategoryIds,
}: {
  categories: Category[];
  usedCategoryIds: string[];
}) {
  const router = useRouter();
  const available = categories.filter((c) => !usedCategoryIds.includes(c.id));
  const [categoryId, setCategoryId] = useState(available[0]?.id ?? "");
  const [limit, setLimit] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (available.length === 0) {
    return <p className="text-xs text-neutral-400">Every category already has a budget this month.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(limit);
    if (!value || value <= 0) {
      setError("Enter a limit greater than 0.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: categoryId, limit_amount: value }),
      });
      if (!res.ok) throw new Error("failed");
      setLimit("");
      setStatus("idle");
      router.refresh();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-neutral-300 p-3">
      <div>
        <label className="text-xs font-medium text-neutral-600">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 block rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        >
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-neutral-600">Monthly limit</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="0.00"
          className="mt-1 block w-28 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {status === "submitting" ? "Adding…" : "Add budget"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}

export function BudgetSection({
  budgetUsage,
  categories,
}: {
  budgetUsage: BudgetUsage[];
  categories: Category[];
}) {
  const usedCategoryIds = budgetUsage.map((u) => u.budget.category_id);

  return (
    <div className="space-y-3">
      {budgetUsage.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center">
          <p className="text-neutral-500">Set a budget to track your limits.</p>
        </div>
      ) : (
        budgetUsage.map((u) => <BudgetCard key={u.budget.id} usage={u} />)
      )}
      <AddBudgetForm categories={categories} usedCategoryIds={usedCategoryIds} />
    </div>
  );
}
