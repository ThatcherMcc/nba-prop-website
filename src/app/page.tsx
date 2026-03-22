import HomepageContent from "@/app/components/HomepageContent";
import {
  getPlayerData,
  getPlayersOverSeasonAvgLast5,
  getPlayersUnderSeasonAvgLast5,
  getTrendingPlayers,
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
  let hasError = false;
  let lastUpdated: string | null = null;

  try {
    [
      featuredData,
      overSeasonAvgLast5,
      underSeasonAvgLast5,
      trendingPlayers,
      lastUpdated,
    ] = await Promise.all([
      getPlayerData(FEATURED_PLAYER, 10),
      getPlayersOverSeasonAvgLast5(8),
      getPlayersUnderSeasonAvgLast5(8),
      getTrendingPlayers(8),
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
      lastUpdated={lastUpdated}
      hasError={hasError}
    />
  );
}
