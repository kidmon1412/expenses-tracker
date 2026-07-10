import { createClient } from "@/lib/supabase/server";
import { createPortalSession } from "@/lib/stripe";
import { NextResponse } from "next/server";

/**
 * POST /api/stripe/portal
 *
 * Redirects to the Stripe Billing Portal for the demo/current subscription
 * so it can be managed, cancelled, or have its payment method updated.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe isn't configured yet." }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const subQuery = supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(1);
    const { data: subs } = user ? await subQuery.eq("user_id", user.id) : await subQuery.is("user_id", null);
    const subscription = subs?.[0];

    if (!subscription?.stripe_customer_id || subscription.stripe_customer_id === "demo_customer_seed") {
      return NextResponse.json(
        { error: "No billing account found. Subscribe first." },
        { status: 404 },
      );
    }

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const portalSession = await createPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl: `${origin}/`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[stripe/portal]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
