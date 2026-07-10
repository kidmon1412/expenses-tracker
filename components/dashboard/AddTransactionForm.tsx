"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, TransactionType, Channel } from "@/lib/types";
import { suggestCategory } from "@/lib/suggest-category";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function AddTransactionForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [channel, setChannel] = useState<Channel>("cash");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  const suggestion = useMemo(() => {
    if (suggestionDismissed) return null;
    return suggestCategory(note);
  }, [note, suggestionDismissed]);

  const suggestedCategory = suggestion
    ? categories.find((c) => c.name === suggestion.category)
    : null;

  function acceptSuggestion() {
    if (suggestedCategory) {
      setCategoryId(suggestedCategory.id);
      setSuggestionDismissed(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          type,
          category_id: categoryId,
          channel,
          txn_date: date,
          note: note || null,
          ai_category_suggestion: suggestion?.category ?? null,
          ai_category_source: suggestion?.source ?? null,
          ai_category_confidence: suggestion?.confidence ?? null,
          ai_category_review_status: suggestedCategory && categoryId === suggestedCategory.id
            ? "accepted"
            : "unreviewed",
        }),
      });

      if (!res.ok) {
        throw new Error("request failed");
      }

      setStatus("success");
      setAmount("");
      setNote("");
      setDate(todayISO());
      setSuggestionDismissed(false);
      router.refresh();
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-neutral-600">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Category</label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSuggestionDismissed(true);
            }}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Weekly shop"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {suggestion && suggestedCategory && suggestedCategory.id !== categoryId && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
          <span>
            Suggested category: <strong>{suggestion.category}</strong> ({Math.round(suggestion.confidence * 100)}% confidence)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={acceptSuggestion}
              className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => setSuggestionDismissed(true)}
              className="rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {status === "success" && <p className="text-sm text-emerald-600">Transaction added.</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {status === "submitting" ? "Adding…" : "Add transaction"}
      </button>
    </form>
  );
}
