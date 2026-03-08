import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import PricingCards from "./PricingCards";

export const metadata: Metadata = {
  title: "Pricing | PropEdge",
  description:
    "Choose the plan that fits your edge. ML-powered NBA prop analytics from free to Sharp.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const [session, params] = await Promise.all([auth(), searchParams]);

  const user = session?.user;
  const userTier = user?.subscriptionTier ?? "free";
  const userStatus = user?.subscriptionStatus;
  const hasSubscription =
    !!user &&
    userTier !== "free" &&
    (userStatus === "active" || userStatus === "trialing");

  const showSuccess = params.success === "true";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success banner */}
      {showSuccess && (
        <div className="mb-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4 flex items-start gap-3">
          <span className="text-emerald-400 text-lg shrink-0">&#10003;</span>
          <div>
            <p className="text-sm font-bold text-emerald-400">
              Subscription activated
            </p>
            <p className="text-sm text-pe-text-muted mt-0.5">
              Welcome to PropEdge {userTier === "sharp" ? "Sharp" : "Pro"}. Your
              ML confidence scores are ready.{" "}
              <Link href="/slate" className="text-pe-accent underline underline-offset-2">
                View today&apos;s slate
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-pe-accent mb-3">
          Pricing
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-pe-text-primary mb-4">
          Find your edge.
          <br />
          <span className="text-pe-accent">Back it with data.</span>
        </h1>
        <p className="text-lg text-pe-text-muted max-w-xl mx-auto">
          PropEdge runs a live ML model on every NBA prop. Choose the plan that
          matches your conviction level.
        </p>
      </div>

      {/* Model performance callout */}
      <div className="mb-10 rounded-2xl bg-pe-surface-1 border border-pe-border/10 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-pe-text-faint mb-4 text-center">
          Verified model results — 2025-26 season
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Win rate", value: "65.8%", sub: "conf ≥ 0.15" },
            { label: "ROI", value: "+25.7%", sub: "conf ≥ 0.15" },
            { label: "Win rate", value: "78.0%", sub: "conf ≥ 0.30" },
            { label: "Top 25 picks", value: "96%", sub: "24 of 25 correct" },
          ].map(({ label, value, sub }) => (
            <div key={sub} className="text-center">
              <p className="text-2xl font-black text-pe-accent">{value}</p>
              <p className="text-xs font-bold text-pe-text-secondary mt-0.5">{label}</p>
              <p className="text-xs text-pe-text-faint">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive plan cards */}
      <PricingCards
        userTier={userTier}
        hasSubscription={hasSubscription}
        isSignedIn={!!user}
      />

      {/* Fine print */}
      <p className="text-center text-xs text-pe-text-faint mt-10">
        All plans auto-renew monthly. Cancel anytime from your{" "}
        <Link href="/profile" className="underline underline-offset-2 hover:text-pe-text-muted transition-colors">
          profile
        </Link>
        . No refunds on partial months.
      </p>
    </div>
  );
}
