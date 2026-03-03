import HomepageContent from "@/app/components/HomepageContent";
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

const FEATURED_PLAYER = "LeBron James";

export default async function Page() {
  let featuredData: Awaited<ReturnType<typeof getPlayerData>> = [];
  let overSeasonAvgLast5: Awaited<
    ReturnType<typeof getPlayersOverSeasonAvgLast5>
  > = [];
  let underSeasonAvgLast5: Awaited<
    ReturnType<typeof getPlayersUnderSeasonAvgLast5>
  > = [];
  let trendingPlayers: Awaited<ReturnType<typeof getTrendingPlayers>> = [];
  let topPicks: Awaited<ReturnType<typeof getTopPicks>> = {
    picks: [],
    propDate: null,
  };
  let underPicks: Awaited<ReturnType<typeof getUnderPicks>> = {
    picks: [],
    propDate: null,
  };
  let backtestResults: Awaited<ReturnType<typeof getBacktestResults>> = {
    gameDate: "",
    picks: [],
  };
  let lastUpdated: string | null = null;
  let hasError = false;

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
    console.error("Homepage data load failed:", e);
    hasError = true;
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
      hasError={hasError}
    />
  );
}
