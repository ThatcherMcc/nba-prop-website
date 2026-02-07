import { unstable_cache } from "next/cache";
import PlayerSearch from "@/app/components/PlayerSearch";
import {
  getPlayerData,
  getPlayersOverSeasonAvgLast5,
} from "@/lib/data";

const FEATURED_PLAYER = "LeBron James";

// Cache until next scrape; revalidate on demand via POST /api/revalidate (e.g. from GitHub Actions).
const CACHE_TAG = "player-data";
const REVALIDATE_SECONDS = 86400; // 24h fallback if revalidate API isn't called

export default async function Page() {
  let featuredData: Awaited<ReturnType<typeof getPlayerData>> = [];
  let overSeasonAvgLast5: Awaited<ReturnType<typeof getPlayersOverSeasonAvgLast5>> = [];

  try {
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
    [featuredData, overSeasonAvgLast5] = await Promise.all([
      getCachedFeatured(),
      getCachedOverSeason(),
    ]);
  } catch (e) {
    console.error("Homepage data load failed:", e);
  }

  return (
    <div>
      <PlayerSearch
        featuredPlayerName={FEATURED_PLAYER}
        featuredPlayerData={featuredData}
        overSeasonAvgLast5={overSeasonAvgLast5}
      />
    </div>
  );
}
