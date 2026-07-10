"use client";

import { useState } from "react";

export default function UpgradePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg space-y-8 p-6">
      <header className="space-y-1">
        <a href="/" className="text-sm text-neutral-500 hover:underline">
          ← Back to dashboard
        </a>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Upgrade to paid</h1>
        <p className="text-sm text-neutral-500">
          Your 30-day free trial gives full access. Upgrade any time to keep exporting reports
          after it ends.
        </p>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-3xl font-bold text-neutral-900">Expenses Tracker Pro</p>
        <p className="mt-1 text-sm text-neutral-500">
          Unlimited transactions, budgets, savings targets, and monthly PDF/CSV exports.
        </p>
        <button
          onClick={handleSubscribe}
          disabled={status === "loading"}
          className="mt-6 w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {status === "loading" ? "Redirecting to checkout…" : "Subscribe with Stripe"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
