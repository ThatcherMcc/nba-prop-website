"use client";

import Link from "next/link";
import { canAccess, normalizeTier } from "@/lib/access";
import type { Tier } from "@/lib/access";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface UpgradeGateProps {
  userTier: string;
  requiredTier: "pro" | "sharp";
  children?: React.ReactNode;
  /** If true, shows blurred children beneath the upgrade prompt. If false, hides children entirely. */
  blurContent?: boolean;
  /** Display name for the locked feature, e.g. "AI Confidence Scores" */
  featureName?: string;
}

const TIER_LABEL: Record<Exclude<Tier, "free">, string> = {
  pro: "Pro",
  sharp: "Sharp",
};

const TIER_ACCENT: Record<Exclude<Tier, "free">, string> = {
  pro: "border-blue-500/30 bg-blue-500/5",
  sharp: "border-amber-500/30 bg-amber-500/5",
};

const BUTTON_ACCENT: Record<Exclude<Tier, "free">, string> = {
  pro: "bg-blue-600 hover:bg-blue-500 text-white",
  sharp: "bg-amber-500 hover:bg-amber-400 text-zinc-900",
};

export default function UpgradeGate({
  userTier,
  requiredTier,
  children,
  blurContent = false,
  featureName,
}: UpgradeGateProps) {
  const tier = normalizeTier(userTier);
  const hasAccess = canAccess(tier, requiredTier);

  if (hasAccess) {
    return children ? <>{children}</> : null;
  }

  const label = TIER_LABEL[requiredTier];
  const cardBorder = TIER_ACCENT[requiredTier];
  const buttonClass = BUTTON_ACCENT[requiredTier];
  const featureLabel = featureName ?? "this feature";

  const prompt = (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border px-6 py-8 text-center ${cardBorder}`}
    >
      <p className="text-sm font-bold text-pe-text-primary">
        Unlock {featureLabel} with PropEdge{" "}
        <span className="capitalize">{label}</span>
      </p>
      <p className="text-xs text-pe-text-muted max-w-xs">
        Upgrade to access ML-powered predictions, confidence scores, and deeper
        analytics.
      </p>
      <Link
        href="/pricing"
        className={`inline-block rounded-lg px-5 py-2 text-xs font-bold transition-colors ${buttonClass}`}
        onClick={() => trackEvent(EVENTS.UPGRADE_CLICK, { requiredTier })}
      >
        Upgrade to {label}
      </Link>
    </div>
  );

  if (!blurContent) {
    return prompt;
  }

  // Show a blurred preview of the content with the prompt overlaid on top.
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-pe-bg/60 backdrop-blur-[2px] rounded-xl z-10">
        {prompt}
      </div>
    </div>
  );
}
