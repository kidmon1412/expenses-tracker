import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Called right after sign-up/sign-in to give a fresh account its own 30-day
// trial row (the seeded demo subscription is user_id IS NULL and only covers
// anonymous visitors — see docs/TASKS.md Sprint 6).
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ created: false });
  }

  const trialEndsAt = new Date(Date.now() + 30 * 86400000).toISOString();

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    stripe_customer_id: `pending_${user.id}`,
    status: "trial",
    trial_ends_at: trialEndsAt,
  });

  if (error) {
    console.error("[api/subscriptions/bootstrap] insert failed:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }

  return NextResponse.json({ created: true });
}
