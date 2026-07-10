import { constructWebhookEvent } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhooks
 *
 * Receives and processes Stripe webhook events, updating this app's
 * `subscriptions` table (see docs/DATA_MODEL.md — not the vibe-stack
 * template's `profiles`/`purchases` tables, which don't exist here).
 * Register this URL in your Stripe dashboard:
 *   https://dashboard.stripe.com/webhooks → add endpoint → /api/stripe/webhooks
 *
 * Required events to enable in Stripe dashboard:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_failed
 */
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    console.error("[stripe/webhooks] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      // ── Checkout completed — link the Stripe customer to our subscription row ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionRowId = session.metadata?.subscriptionRowId;
        if (!subscriptionRowId || !session.customer) break;

        await supabase
          .from("subscriptions")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : null,
            status: "active",
          })
          .eq("id", subscriptionRowId);
        break;
      }

      // ── Subscription created or updated ───────────────────────────────────
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === "active" || sub.status === "trialing" ? "active" : sub.status;

        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      // ── Subscription cancelled ────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      // ── Payment failed — leave status as-is, log for now ──────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("[stripe/webhooks] payment failed for customer:", invoice.customer);
        break;
      }

      default:
        // Unhandled event — safe to ignore
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhooks] error handling ${event.type}:`, err);
    // Return 200 anyway — Stripe will retry on 5xx, not on handler errors
  }

  return NextResponse.json({ received: true });
}
