import Stripe from "stripe";

// Lazy singleton — instantiated on first use so the build doesn't fail
// without STRIPE_SECRET_KEY in the environment.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Convenience re-export so callers can write `stripe.checkout.sessions.create(...)`
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: "Pro",
    price: 19,
    tier: "pro",
    features: [
      "ML confidence scores on every prop",
      "Full Analytics dashboard",
      "Daily email digest of top picks",
      "Track Record access",
    ],
  },
  sharp: {
    priceId: process.env.STRIPE_SHARP_PRICE_ID!,
    name: "Sharp",
    price: 49,
    tier: "sharp",
    features: [
      "Everything in Pro",
      "Raw model probabilities",
      "Market-group breakdowns",
      "Historical backtests by market",
      "Early morning access (7:30 AM ET)",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
