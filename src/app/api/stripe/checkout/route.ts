import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { db } from "@/db";
import { authUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { planKey } = body as { planKey: PlanKey };

  if (!planKey || !(planKey in PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = PLANS[planKey];

  // Fetch the user from DB to get their stripeCustomerId
  const [user] = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let stripeCustomerId = user.stripeCustomerId;

  // Create a Stripe customer if one doesn't exist yet
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;

    await db
      .update(authUsers)
      .set({ stripeCustomerId })
      .where(eq(authUsers.id, user.id));
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
