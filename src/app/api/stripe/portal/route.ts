import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { authUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.id, session.user.id))
    .limit(1);

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 }
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
  });

  return NextResponse.json({ url: portalSession.url });
}
