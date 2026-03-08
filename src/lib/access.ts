export type Tier = "free" | "pro" | "sharp";

const TIER_ORDER: Tier[] = ["free", "pro", "sharp"];

export function canAccess(userTier: Tier, requiredTier: Tier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(requiredTier);
}

/**
 * Normalizes a raw session subscriptionTier string to a valid Tier.
 * Falls back to "free" for null, undefined, or unrecognized values.
 */
export function normalizeTier(raw: string | null | undefined): Tier {
  if (raw === "pro" || raw === "sharp") return raw;
  return "free";
}
