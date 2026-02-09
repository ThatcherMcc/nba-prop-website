import { unstable_cache } from "next/cache";
import PlayerSearch from "@/app/components/PlayerSearch";
import {
  getPlayerData,
  getPlayerNames,
  getPlayersOverSeasonAvgLast5,
  getPlayersUnderSeasonAvgLast5,
  getTrendingPlayers,
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
      ["over-season-avg", "8"],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    const getCachedUnderSeason = unstable_cache(
      () => getPlayersUnderSeasonAvgLast5(8),
      ["under-season-avg", "8"],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    const getCachedTrending = unstable_cache(
      () => getTrendingPlayers(8),
      ["trending", "8"],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    [playerNames, featuredData, overSeasonAvgLast5, underSeasonAvgLast5, trendingPlayers] =
      await Promise.all([
        getCachedPlayerNames(),
        getCachedFeatured(),
        getCachedOverSeason(),
        getCachedUnderSeason(),
        getCachedTrending(),
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
      />
    </div>
  );
}
