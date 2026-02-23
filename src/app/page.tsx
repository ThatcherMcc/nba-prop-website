import { unstable_cache } from "next/cache";
import PlayerSearch from "@/app/components/PlayerSearch";
import {
  getPlayerData,
  getPlayerNames,
  getPlayersOverSeasonAvgLast5,
  getPlayersUnderSeasonAvgLast5,
  getTrendingPlayers,
  getTopPicks,
  getUnderPicks,
  getBacktestResults,
} from "@/lib/data";

const FEATURED_PLAYER = "LeBron James";

// Cache until next scrape; revalidate on demand via POST /api/revalidate (e.g. from GitHub Actions).
// Use tag CACHE_TAG so pipeline revalidation updates player names and all homepage data.
const CACHE_TAG = "player-data";
const REVALIDATE_SECONDS = 86400; // 24h fallback if revalidate API isn't called

export default async function Page() {
  let featuredData: Awaited<ReturnType<typeof getPlayerData>> = [];
  let overSeasonAvgLast5: Awaited<ReturnType<typeof getPlayersOverSeasonAvgLast5>> = [];
  let underSeasonAvgLast5: Awaited<ReturnType<typeof getPlayersUnderSeasonAvgLast5>> = [];
  let trendingPlayers: Awaited<ReturnType<typeof getTrendingPlayers>> = [];
  let topPicks: Awaited<ReturnType<typeof getTopPicks>> = [];
  let underPicks: Awaited<ReturnType<typeof getUnderPicks>> = [];
  let backtestResults: Awaited<ReturnType<typeof getBacktestResults>> = { gameDate: "", picks: [] };
  let playerNames: string[] = [];

  try {
    const getCachedPlayerNames = unstable_cache(
      () => getPlayerNames(),
      ["player-names"],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    const getCachedFeatured = unstable_cache(
      () => getPlayerData(FEATURED_PLAYER, 10),
      ["featured", FEATURED_PLAYER],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    const getCachedOverSeason = unstable_cache(
      () => getPlayersOverSeasonAvgLast5(8),
      ["over-season-avg-v2", "8"],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    const getCachedUnderSeason = unstable_cache(
      () => getPlayersUnderSeasonAvgLast5(8),
      ["under-season-avg-v2", "8"],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    const getCachedTrending = unstable_cache(
      () => getTrendingPlayers(8),
      ["trending-v2", "8"],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    const getCachedTopPicks = unstable_cache(
      () => getTopPicks(25),
      ["top-picks", "25"],
      { revalidate: 3600, tags: [CACHE_TAG] }
    );
    const getCachedUnderPicks = unstable_cache(
      () => getUnderPicks(25),
      ["under-picks", "25"],
      { revalidate: 3600, tags: [CACHE_TAG] }
    );
    const getCachedBacktest = unstable_cache(
      () => getBacktestResults(),
      ["backtest-results"],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    [playerNames, featuredData, overSeasonAvgLast5, underSeasonAvgLast5, trendingPlayers, topPicks, underPicks, backtestResults] =
      await Promise.all([
        getCachedPlayerNames(),
        getCachedFeatured(),
        getCachedOverSeason(),
        getCachedUnderSeason(),
        getCachedTrending(),
        getCachedTopPicks(),
        getCachedUnderPicks(),
        getCachedBacktest(),
      ]);
  } catch (e) {
    console.error("Homepage data load failed:", e);
  }

  return (
    <div>
      <PlayerSearch
        playerNames={playerNames}
        featuredPlayerName={FEATURED_PLAYER}
        featuredPlayerData={featuredData}
        overSeasonAvgLast5={overSeasonAvgLast5}
        underSeasonAvgLast5={underSeasonAvgLast5}
        trendingPlayers={trendingPlayers}
        topPicks={topPicks}
        underPicks={underPicks}
        backtestResults={backtestResults}
      />
    </div>
  );
}
