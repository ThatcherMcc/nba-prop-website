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
import HomepageContent from "@/app/components/HomepageContent";

export const metadata = {
  title: "Analytics | PropEdge",
  description:
    "NBA prop analytics — hot streaks, cold spells, top picks, and yesterday's scorecard.",
};

const FEATURED_PLAYER = "LeBron James";

export default async function AnalyticsPage() {
  let featuredData: Awaited<ReturnType<typeof getPlayerData>> = [];
  let overSeasonAvgLast5: Awaited<ReturnType<typeof getPlayersOverSeasonAvgLast5>> = [];
  let underSeasonAvgLast5: Awaited<ReturnType<typeof getPlayersUnderSeasonAvgLast5>> = [];
  let trendingPlayers: Awaited<ReturnType<typeof getTrendingPlayers>> = [];
  let topPicks: Awaited<ReturnType<typeof getTopPicks>> = { picks: [], propDate: null };
  let underPicks: Awaited<ReturnType<typeof getUnderPicks>> = { picks: [], propDate: null };
  let backtestResults: Awaited<ReturnType<typeof getBacktestResults>> = { gameDate: "", picks: [] };
  let lastUpdated: string | null = null;

  try {
    [
      featuredData,
      overSeasonAvgLast5,
      underSeasonAvgLast5,
      trendingPlayers,
      topPicks,
      underPicks,
      backtestResults,
      lastUpdated,
    ] = await Promise.all([
      getPlayerData(FEATURED_PLAYER, 10),
      getPlayersOverSeasonAvgLast5(8),
      getPlayersUnderSeasonAvgLast5(8),
      getTrendingPlayers(8),
      getTopPicks(25),
      getUnderPicks(25),
      getBacktestResults(),
      getLastDataUpdate(),
    ]);
  } catch (e) {
    console.error("Analytics page data load failed:", e);
  }

  return (
    <HomepageContent
      featuredPlayerName={FEATURED_PLAYER}
      featuredPlayerData={featuredData}
      overSeasonAvgLast5={overSeasonAvgLast5}
      underSeasonAvgLast5={underSeasonAvgLast5}
      trendingPlayers={trendingPlayers}
      topPicks={topPicks.picks}
      underPicks={underPicks.picks}
      propDate={topPicks.propDate ?? underPicks.propDate}
      backtestResults={backtestResults}
      lastUpdated={lastUpdated}
    />
  );
}
