import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";
import { NextResponse } from "next/server";

/**
 * POST /api/stripe/checkout
 * Body: { priceId?: string, successUrl?: string, cancelUrl?: string }
 *
 * Creates a Stripe Checkout Session to upgrade the demo/trial subscription
 * to paid. No auth wall in v1 (see docs/TASKS.md Sprint 6) — the checkout
 * targets the single demo subscription row until per-user auth lands.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe isn't configured yet. Add STRIPE_SECRET_KEY and price IDs in Vercel." },
        { status: 503 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { successUrl, cancelUrl } = body as { successUrl?: string; cancelUrl?: string };
    const priceId = body.priceId ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    const subQuery = supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(1);
    const { data: subs } = user ? await subQuery.eq("user_id", user.id) : await subQuery.is("user_id", null);
    const subscription = subs?.[0];

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const session = await createCheckoutSession({
      priceId,
      customerId:
        subscription?.stripe_customer_id && subscription.stripe_customer_id !== "demo_customer_seed"
          ? subscription.stripe_customer_id
          : undefined,
      userId: user?.id ?? "demo",
      subscriptionRowId: subscription?.id,
      successUrl: successUrl ?? `${origin}/?checkout=success`,
      cancelUrl: cancelUrl ?? `${origin}/upgrade?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
