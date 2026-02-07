import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getPlayerData } from "@/lib/data";
import { ALL_PLAYER_NAMES } from "@/lib/playerNames";
import PlayerPageContent from "@/app/components/PlayerPageContent";

const CACHE_TAG = "player-data";
const REVALIDATE_SECONDS = 86400; // 24h fallback; invalidate via POST /api/revalidate after scrape

interface PageProps {
  params: Promise<{ name: string }> | { name: string };
  searchParams: Promise<{ games?: string }> | { games?: string };
}

export default async function PlayerPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const encodedName = resolvedParams.name;
  const gamesParam = resolvedSearchParams.games;

  const playerName = decodeURIComponent(encodedName);
  if (!ALL_PLAYER_NAMES.includes(playerName)) notFound();

  const initialGameCount = gamesParam ? Math.min(20, Math.max(5, parseInt(gamesParam, 10) || 20)) : 20;
  const getCachedPlayerData = unstable_cache(
    () => getPlayerData(playerName, initialGameCount),
    ["player", encodedName, String(initialGameCount)],
    { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
  );
  const initialData = await getCachedPlayerData();

  return (
    <PlayerPageContent
      playerName={playerName}
      initialData={initialData}
      initialGameCount={initialGameCount}
    />
  );
}
