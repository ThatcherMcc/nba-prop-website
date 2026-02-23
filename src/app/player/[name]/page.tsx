import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import type { PLAYER_STAT_TYPE } from "@/db/schema";
import {
  getPlayerData,
  getPlayerExists,
  getPlayerLastGameStatus,
  getPlayerSplits,
  getPlayerMatchups,
  getPlayerPropLines,
  getPlayerTodaysGame,
} from "@/lib/data";
import PlayerPageContent from "@/app/components/PlayerPageContent";

const CACHE_TAG = "player-data";
const REVALIDATE_SECONDS = 86400; // 24h fallback; invalidate via POST /api/revalidate after scrape

import { PLAYER_STAT_NAMES } from "@/db/schema";

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ games?: string; stat?: string; line?: string }>;
}) {
  const { name: encodedName } = await params;
  const { games: gamesParam, stat: statParam, line: lineParam } = await searchParams;

  const playerName = decodeURIComponent(encodedName);
  const getCachedExists = unstable_cache(
    () => getPlayerExists(playerName),
    ["player-exists", encodedName],
    { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
  );
  const exists = await getCachedExists();
  if (!exists) notFound();

  const initialGameCount = gamesParam ? Math.min(20, Math.max(5, parseInt(gamesParam, 10) || 20)) : 20;
  const initialStat = statParam && PLAYER_STAT_NAMES.includes(statParam) ? statParam : undefined;
  const initialPropLine = lineParam != null ? parseFloat(lineParam) : undefined;
  const initialPropLineValid = initialPropLine != null && !Number.isNaN(initialPropLine);

  const getCachedPlayerData = unstable_cache(
    () => getPlayerData(playerName, initialGameCount),
    ["player", encodedName, String(initialGameCount)],
    { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
  );
  const getCachedLastGameStatus = unstable_cache(
    () => getPlayerLastGameStatus(playerName),
    ["player-last-game", encodedName],
    { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
  );
  const getCachedSplits = unstable_cache(
    () => getPlayerSplits(playerName),
    ["player-splits", encodedName],
    { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
  );
  const getCachedMatchups = unstable_cache(
    () => getPlayerMatchups(playerName),
    ["player-matchups", encodedName],
    { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
  );
  const getCachedPropLines = unstable_cache(
    () => getPlayerPropLines(playerName),
    ["player-props", encodedName],
    { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
  );
  const getCachedTodaysGame = unstable_cache(
    () => getPlayerTodaysGame(playerName),
    ["player-todays-game", encodedName],
    { revalidate: 3600, tags: [CACHE_TAG] }
  );

  const [initialData, lastGameStatus, splits, matchups, propLines, todaysGame] = await Promise.all([
    getCachedPlayerData(),
    getCachedLastGameStatus(),
    getCachedSplits(),
    getCachedMatchups(),
    getCachedPropLines(),
    getCachedTodaysGame(),
  ]);

  return (
    <PlayerPageContent
      playerName={playerName}
      initialData={initialData}
      initialGameCount={initialGameCount}
      lastGameStatus={lastGameStatus}
      initialStat={initialStat as PLAYER_STAT_TYPE | undefined}
      initialPropLine={initialPropLineValid ? initialPropLine : undefined}
      splits={splits}
      matchups={matchups}
      propLines={propLines}
      todaysGame={todaysGame}
    />
  );
}
