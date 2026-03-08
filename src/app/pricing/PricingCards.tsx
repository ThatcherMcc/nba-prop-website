"use client";

import { useState } from "react";
import Link from "next/link";
import type { PlanKey } from "@/lib/stripe";

interface PricingCardsProps {
  userTier: string | undefined;
  hasSubscription: boolean;
  isSignedIn: boolean;
}

export default function PricingCards({
  userTier,
  hasSubscription,
  isSignedIn,
}: PricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleSubscribe(planKey: PlanKey) {
    if (!isSignedIn) {
      window.location.href = "/auth/sign-in?callbackUrl=/pricing";
      return;
    }
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoadingPlan(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setPortalLoading(false);
    }
  }

  const isCurrentPlan = (tier: string) =>
    isSignedIn && userTier === tier;

  return (
    <div className="space-y-8">
      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free plan */}
        <div className="rounded-2xl bg-pe-surface-1 border border-pe-border/10 p-6 flex flex-col">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-pe-text-faint mb-1">
              Free
            </p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black text-pe-text-primary">$0</span>
              <span className="text-pe-text-muted text-sm mb-1">/mo</span>
            </div>
            <p className="text-sm text-pe-text-muted mt-2">
              Public stats and daily slate for casual bettors.
            </p>
          </div>

          <ul className="flex-1 space-y-2.5 mb-6">
            {[
              "Public player stats",
              "Today's slate view",
              "Player search",
              "Hot and cold streaks",
              "Game log history",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-pe-text-secondary">
                <span className="text-pe-text-faint mt-0.5 shrink-0">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>

          {isCurrentPlan("free") ? (
            <div className="w-full text-center rounded-xl border border-pe-border/10 bg-pe-surface-2 px-4 py-2.5 text-sm font-semibold text-pe-text-muted">
              Current Plan
            </div>
          ) : (
            <Link
              href="/auth/sign-in"
              className="w-full text-center block rounded-xl border border-pe-border/10 bg-pe-surface-2 px-4 py-2.5 text-sm font-semibold text-pe-text-secondary hover:text-pe-text-primary hover:bg-pe-surface-2/80 transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Pro plan — recommended */}
        <div className="rounded-2xl bg-pe-surface-1 border-2 border-pe-accent/40 p-6 flex flex-col relative shadow-[0_0_32px_0_rgba(59,130,246,0.12)]">
          {/* Recommended badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pe-accent px-3 py-0.5 text-xs font-bold text-white tracking-wide shadow-lg">
              RECOMMENDED
            </span>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-pe-accent mb-1">
              Pro
            </p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black text-pe-text-primary">$19</span>
              <span className="text-pe-text-muted text-sm mb-1">/mo</span>
            </div>
            <p className="text-sm text-pe-text-muted mt-2">
              ML-powered confidence scores and full analytics access.
            </p>
          </div>

          <ul className="flex-1 space-y-2.5 mb-6">
            {[
              "ML confidence scores on every prop",
              "Full Analytics dashboard",
              "Daily email digest of top picks",
              "Track Record access",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-pe-text-secondary">
                <span className="text-pe-accent mt-0.5 shrink-0">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>

          {isCurrentPlan("pro") ? (
            <div className="w-full text-center rounded-xl border border-pe-accent/30 bg-pe-accent/10 px-4 py-2.5 text-sm font-semibold text-pe-accent">
              Current Plan
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSubscribe("pro")}
              disabled={loadingPlan === "pro"}
              className="w-full rounded-xl bg-pe-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-pe-accent-strong transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingPlan === "pro" ? "Redirecting..." : "Subscribe to Pro"}
            </button>
          )}
        </div>

        {/* Sharp plan */}
        <div className="rounded-2xl bg-pe-surface-1 border border-pe-border/10 p-6 flex flex-col">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              Sharp
            </p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black text-pe-text-primary">$49</span>
              <span className="text-pe-text-muted text-sm mb-1">/mo</span>
            </div>
            <p className="text-sm text-pe-text-muted mt-2">
              Raw model data and early access for serious players.
            </p>
          </div>

          <ul className="flex-1 space-y-2.5 mb-6">
            {[
              "Everything in Pro",
              "Raw model probabilities",
              "Market-group breakdowns",
              "Historical backtests by market",
              "Early morning access (7:30 AM ET)",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-pe-text-secondary">
                <span className="text-amber-400 mt-0.5 shrink-0">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>

          {isCurrentPlan("sharp") ? (
            <div className="w-full text-center rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-400">
              Current Plan
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSubscribe("sharp")}
              disabled={loadingPlan === "sharp"}
              className="w-full rounded-xl bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 text-sm font-bold text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingPlan === "sharp" ? "Redirecting..." : "Subscribe to Sharp"}
            </button>
          )}
        </div>
      </div>

      {/* Manage subscription row */}
      {hasSubscription && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="text-sm text-pe-text-muted hover:text-pe-text-secondary underline underline-offset-2 transition-colors disabled:opacity-60"
          >
            {portalLoading ? "Opening billing portal..." : "Manage subscription"}
          </button>
        </div>
      )}
    </div>
  );
}
