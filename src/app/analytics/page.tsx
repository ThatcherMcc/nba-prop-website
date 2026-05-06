import { Suspense } from "react";
import {
  getTopPicks,
  getUnderPicks,
  getTeamDefensiveRatings,
} from "@/lib/data";
import AnalyticsDeferredSections from "@/app/components/AnalyticsDeferredSections";
import AnalyticsPageShell from "@/app/components/AnalyticsPageShell";

// Keep analytics request-driven instead of pre-rendering a large DB workload at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics | PropEdge",
  description:
    "NBA prop analytics — hot streaks, cold spells, top picks, and yesterday's scorecard.",
};

const FEATURED_PLAYER = "LeBron James";

export default async function AnalyticsPage() {
  let topPicks: Awaited<ReturnType<typeof getTopPicks>> = { picks: [], propDate: null };
  let underPicks: Awaited<ReturnType<typeof getUnderPicks>> = { picks: [], propDate: null };
  let defensiveRatings: Awaited<ReturnType<typeof getTeamDefensiveRatings>> = [];
  let hasError = false;

  try {
    [topPicks, underPicks, defensiveRatings] = await Promise.all([
      getTopPicks(25),
      getUnderPicks(25),
      getTeamDefensiveRatings(),
    ]);
  } catch (e) {
    console.error("Analytics page data load failed:", e);
    hasError = true;
  }

  return (
    <AnalyticsPageShell
      topPicks={topPicks.picks}
      underPicks={underPicks.picks}
      defensiveRatings={defensiveRatings}
      propDate={topPicks.propDate ?? underPicks.propDate}
      hasError={hasError}
    >
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`analytics-skeleton-${index}`}
                  className="h-40 animate-pulse rounded-2xl border border-pe-border/5 bg-pe-surface-1/50"
                />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl border border-pe-border/5 bg-pe-surface-1/50" />
            <div className="h-80 animate-pulse rounded-2xl border border-pe-border/5 bg-pe-surface-1/50" />
          </div>
        }
      >
        <AnalyticsDeferredSections featuredPlayerName={FEATURED_PLAYER} />
      </Suspense>
    </AnalyticsPageShell>
  );
}
