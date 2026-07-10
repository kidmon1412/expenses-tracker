import Link from "next/link";
import type { SubscriptionState } from "@/lib/server/subscription";

export function TrialBanner({ state }: { state: SubscriptionState }) {
  if (!state.subscription || state.isActive) return null;
  if (!state.isTrialExpired && (state.trialDaysRemaining === null || state.trialDaysRemaining > 5)) {
    return null;
  }

  const message = state.isTrialExpired
    ? "Your free trial has ended. Upgrade to keep exporting reports."
    : `Your free trial ends in ${state.trialDaysRemaining} day${state.trialDaysRemaining === 1 ? "" : "s"}. Upgrade to keep exporting reports.`;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <span>{message}</span>
      <Link
        href="/upgrade"
        className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
      >
        Upgrade
      </Link>
    </div>
  );
}
