"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SavingsTarget } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

function trackStatus(target: SavingsTarget): { label: string; tone: string } {
  if (target.current_amount >= target.target_amount) {
    return { label: "Target met", tone: "bg-emerald-100 text-emerald-700" };
  }
  if (!target.deadline) {
    return { label: "On track", tone: "bg-blue-100 text-blue-700" };
  }
  const now = new Date();
  const deadline = new Date(target.deadline);
  const totalDays = Math.max(1, (deadline.getTime() - new Date(target.created_at).getTime()) / 86400000);
  const daysLeft = (deadline.getTime() - now.getTime()) / 86400000;
  const elapsedFraction = 1 - Math.max(daysLeft, 0) / totalDays;
  const progressFraction = target.current_amount / target.target_amount;

  if (daysLeft < 0) return { label: "Past deadline", tone: "bg-red-100 text-red-700" };
  if (progressFraction + 0.1 < elapsedFraction) return { label: "At risk", tone: "bg-amber-100 text-amber-700" };
  return { label: "On track", tone: "bg-emerald-100 text-emerald-700" };
}

function SavingsCard({ target, currency }: { target: SavingsTarget; currency?: string }) {
  const router = useRouter();
  const [contribution, setContribution] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const percent = Math.min(100, (target.current_amount / target.target_amount) * 100);
  const status = trackStatus(target);

  async function addFunds() {
    const value = Number(contribution);
    if (!value || value <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/savings-targets/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contribute: value }),
      });
      if (!res.ok) throw new Error("failed");
      setContribution("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteTarget() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/savings-targets/${target.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">{target.name}</h3>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.tone}`}>{status.label}</span>
          <button onClick={deleteTarget} disabled={busy} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50">
            Delete
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {formatCurrency(target.current_amount, currency)} / {formatCurrency(target.target_amount, currency)}
        {target.deadline ? ` · by ${formatDate(target.deadline)}` : ""}
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          placeholder="Add funds"
          className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-xs"
        />
        <button
          onClick={addFunds}
          disabled={busy}
          className="rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AddSavingsTargetForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a name for your goal.");
      return;
    }
    const value = Number(targetAmount);
    if (!value || value <= 0) {
      setError("Enter a target amount greater than 0.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/savings-targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, target_amount: value, deadline: deadline || null }),
      });
      if (!res.ok) throw new Error("failed");
      setName("");
      setTargetAmount("");
      setDeadline("");
      setStatus("idle");
      router.refresh();
    } catch {
      setStatus("idle");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-neutral-300 p-3">
      <div>
        <label className="text-xs font-medium text-neutral-600">Goal name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Holiday Fund"
          className="mt-1 block w-36 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-neutral-600">Target amount</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="0.00"
          className="mt-1 block w-28 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-neutral-600">Deadline (optional)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-1 block rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {status === "submitting" ? "Adding…" : "Add goal"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}

export function SavingsSection({
  savingsTargets,
  currency,
}: {
  savingsTargets: SavingsTarget[];
  currency?: string;
}) {
  return (
    <div className="space-y-3">
      {savingsTargets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center">
          <p className="text-neutral-500">Create a savings goal to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {savingsTargets.map((target) => (
            <SavingsCard key={target.id} target={target} currency={currency} />
          ))}
        </div>
      )}
      <AddSavingsTargetForm />
    </div>
  );
}
