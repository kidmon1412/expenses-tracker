import type { SupabaseClient } from "@supabase/supabase-js";
import type { Subscription } from "@/lib/types";

export interface SubscriptionState {
  subscription: Subscription | null;
  isActive: boolean;
  isTrialExpired: boolean;
  trialDaysRemaining: number | null;
}

// v1 has no auth (see docs/TASKS.md Sprint 6), so the demo subscription is the
// single user_id IS NULL row. Post-lockdown this filters by auth.uid() instead.
export async function getSubscriptionState(
  supabase: SupabaseClient,
  userId: string | null,
): Promise<SubscriptionState> {
  const query = supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(1);
  const { data } = userId ? await query.eq("user_id", userId) : await query.is("user_id", null);

  const subscription = (data?.[0] as Subscription | undefined) ?? null;

  if (!subscription) {
    return { subscription: null, isActive: false, isTrialExpired: false, trialDaysRemaining: null };
  }

  const isActive = subscription.status === "active";
  let isTrialExpired = false;
  let trialDaysRemaining: number | null = null;

  if (subscription.status === "trial" && subscription.trial_ends_at) {
    const msRemaining = new Date(subscription.trial_ends_at).getTime() - Date.now();
    trialDaysRemaining = Math.ceil(msRemaining / 86400000);
    isTrialExpired = msRemaining <= 0;
  } else if (subscription.status === "expired" || subscription.status === "cancelled") {
    isTrialExpired = true;
  }

  return { subscription, isActive, isTrialExpired, trialDaysRemaining };
}

// Report export requires an active subscription or an unexpired trial.
export function canExport(state: SubscriptionState): boolean {
  return state.isActive || !state.isTrialExpired;
}
