import {
  getPlayerData,
  getPlayersOverSeasonAvgLast5,
  getPlayersUnderSeasonAvgLast5,
  getTrendingPlayers,
  getTopPicks,
  getUnderPicks,
  getBacktestResults,
  getLastDataUpdate,
} from "@/lib/data";
import { auth } from "@/lib/auth";
import { normalizeTier, canAccess } from "@/lib/access";
import HomepageContent from "@/app/components/HomepageContent";
import UpgradeGate from "@/app/components/UpgradeGate";

export const metadata = {
  title: "Analytics | PropEdge",
  description:
    "NBA prop analytics — hot streaks, cold spells, top picks, and yesterday's scorecard.",
};

const FEATURED_PLAYER = "LeBron James";

// Free users see a preview of top picks; Pro+ sees the full list.
const FREE_PICKS_LIMIT = 5;
const FULL_PICKS_LIMIT = 25;

export default async function AnalyticsPage() {
  let featuredData: Awaited<ReturnType<typeof getPlayerData>> = [];
  let overSeasonAvgLast5: Awaited<ReturnType<typeof getPlayersOverSeasonAvgLast5>> = [];
  let underSeasonAvgLast5: Awaited<ReturnType<typeof getPlayersUnderSeasonAvgLast5>> = [];
  let trendingPlayers: Awaited<ReturnType<typeof getTrendingPlayers>> = [];
  let topPicks: Awaited<ReturnType<typeof getTopPicks>> = { picks: [], propDate: null };
  let underPicks: Awaited<ReturnType<typeof getUnderPicks>> = { picks: [], propDate: null };
  let backtestResults: Awaited<ReturnType<typeof getBacktestResults>> = { gameDate: "", picks: [] };
  let lastUpdated: string | null = null;

  const [dataResults, session] = await Promise.all([
    Promise.all([
      getPlayerData(FEATURED_PLAYER, 10),
      getPlayersOverSeasonAvgLast5(8),
      getPlayersUnderSeasonAvgLast5(8),
      getTrendingPlayers(8),
      getTopPicks(FULL_PICKS_LIMIT),
      getUnderPicks(FULL_PICKS_LIMIT),
      getBacktestResults(),
      getLastDataUpdate(),
    ]).catch((e) => {
      console.error("Analytics page data load failed:", e);
      return null;
    }),
    auth(),
  ]);

  if (dataResults) {
    [
      featuredData,
      overSeasonAvgLast5,
      underSeasonAvgLast5,
      trendingPlayers,
      topPicks,
      underPicks,
      backtestResults,
      lastUpdated,
    ] = dataResults;
  }

  const userTier = normalizeTier(session?.user?.subscriptionTier);
  const isPro = canAccess(userTier, "pro");

  // Free users see only a preview of picks; upgrade gate appears below the preview.
  const visibleTopPicks = isPro
    ? topPicks.picks
    : topPicks.picks.slice(0, FREE_PICKS_LIMIT);
  const visibleUnderPicks = isPro
    ? underPicks.picks
    : underPicks.picks.slice(0, FREE_PICKS_LIMIT);

  return (
    <>
      <HomepageContent
        featuredPlayerName={FEATURED_PLAYER}
        featuredPlayerData={featuredData}
        overSeasonAvgLast5={overSeasonAvgLast5}
        underSeasonAvgLast5={underSeasonAvgLast5}
        trendingPlayers={trendingPlayers}
        topPicks={visibleTopPicks}
        underPicks={visibleUnderPicks}
        propDate={topPicks.propDate ?? underPicks.propDate}
        backtestResults={backtestResults}
        lastUpdated={lastUpdated}
      />
      {!isPro && (topPicks.picks.length > FREE_PICKS_LIMIT || underPicks.picks.length > FREE_PICKS_LIMIT) && (
        <div className="mt-4">
          <UpgradeGate
            userTier={userTier}
            requiredTier="pro"
            blurContent={false}
            featureName="Full Top Picks List"
          >{null}</UpgradeGate>
        </div>
      )}
    </>
  );
}
