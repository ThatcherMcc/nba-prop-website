import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, PLANS } from "@/lib/stripe";
import { db } from "@/db";
import { authUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

// This route must NOT be behind auth middleware — Stripe signs its own requests
export const runtime = "nodejs";

function getTierFromPriceId(priceId: string): string {
  for (const [, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return plan.tier;
    }
  }
  return "free";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id ?? "";
        const tier = getTierFromPriceId(priceId);
        const userId = subscription.metadata?.userId;

        if (userId) {
          await db
            .update(authUsers)
            .set({
              subscriptionTier: tier,
              subscriptionStatus: subscription.status,
              subscriptionId: subscription.id,
              subscriptionCurrentPeriodEnd: subscription.items.data[0]
                ? new Date(subscription.items.data[0].current_period_end * 1000)
                : null,
              updatedAt: new Date(),
            })
            .where(eq(authUsers.id, userId));
        } else {
          // Fall back to looking up by Stripe customer ID
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;
          await db
            .update(authUsers)
            .set({
              subscriptionTier: tier,
              subscriptionStatus: subscription.status,
              subscriptionId: subscription.id,
              subscriptionCurrentPeriodEnd: subscription.items.data[0]
                ? new Date(subscription.items.data[0].current_period_end * 1000)
                : null,
              updatedAt: new Date(),
            })
            .where(eq(authUsers.stripeCustomerId, customerId));
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await db
            .update(authUsers)
            .set({
              subscriptionTier: "free",
              subscriptionStatus: "canceled",
              subscriptionId: null,
              subscriptionCurrentPeriodEnd: null,
              updatedAt: new Date(),
            })
            .where(eq(authUsers.id, userId));
        } else {
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;
          await db
            .update(authUsers)
            .set({
              subscriptionTier: "free",
              subscriptionStatus: "canceled",
              subscriptionId: null,
              subscriptionCurrentPeriodEnd: null,
              updatedAt: new Date(),
            })
            .where(eq(authUsers.stripeCustomerId, customerId));
        }
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
