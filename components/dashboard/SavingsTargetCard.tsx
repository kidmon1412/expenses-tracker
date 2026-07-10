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
  const totalDays = Math.max(
    1,
    (deadline.getTime() - new Date(target.created_at).getTime()) / 86400000,
  );
  const daysLeft = (deadline.getTime() - now.getTime()) / 86400000;
  const elapsedFraction = 1 - Math.max(daysLeft, 0) / totalDays;
  const progressFraction = target.current_amount / target.target_amount;

  if (daysLeft < 0) {
    return { label: "Past deadline", tone: "bg-red-100 text-red-700" };
  }
  if (progressFraction + 0.1 < elapsedFraction) {
    return { label: "At risk", tone: "bg-amber-100 text-amber-700" };
  }
  return { label: "On track", tone: "bg-emerald-100 text-emerald-700" };
}

export function SavingsTargetCard({ target }: { target: SavingsTarget }) {
  const percent = Math.min(100, (target.current_amount / target.target_amount) * 100);
  const status = trackStatus(target);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">{target.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.tone}`}>
          {status.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {formatCurrency(target.current_amount)} / {formatCurrency(target.target_amount)}
        {target.deadline ? ` · by ${formatDate(target.deadline)}` : ""}
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
