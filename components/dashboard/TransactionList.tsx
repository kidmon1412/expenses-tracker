import type { Category, Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

export function TransactionList({
  transactions,
  categories,
  currency,
}: {
  transactions: Transaction[];
  categories: Category[];
  currency?: string;
}) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
        <p className="text-neutral-500">No transactions yet — add your first one.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white shadow-sm">
      {transactions.map((t) => {
        const category = t.category_id ? categoryMap.get(t.category_id) : null;
        const isExpense = t.type === "expense";
        return (
          <li key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden>
                {category?.icon ?? "💸"}
              </span>
              <div>
                <p className="font-medium text-neutral-900">
                  {t.note || category?.name || "Transaction"}
                </p>
                <p className="text-xs text-neutral-500">
                  {category?.name ?? "Uncategorised"} · {t.channel} · {formatDate(t.txn_date)}
                </p>
              </div>
            </div>
            <span
              className={`font-semibold ${isExpense ? "text-red-600" : "text-emerald-600"}`}
            >
              {isExpense ? "-" : "+"}
              {formatCurrency(Number(t.amount), currency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
