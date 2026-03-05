import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { PLAYER_STAT_NAMES } from "@/db/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name: encodedName } = await params;
  const playerName = decodeURIComponent(encodedName);
  const canonicalUrl = `https://propedge.bet/player/${encodeURIComponent(playerName)}`;

  return {
    title: `${playerName} — Prop Trends & Stats`,
    description: `View ${playerName}'s NBA prop trends, game logs, hot streaks, and betting analytics. Updated daily with the latest stats.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${playerName} — Prop Trends & Stats | PropEdge`,
      description: `View ${playerName}'s NBA prop trends, game logs, hot streaks, and betting analytics.`,
      url: canonicalUrl,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${playerName} — Prop Trends & Stats | PropEdge`,
      description: `View ${playerName}'s NBA prop trends, game logs, hot streaks, and betting analytics.`,
    },
  };
}

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
  const exists = await getPlayerExists(playerName);
  if (!exists) notFound();

  const initialGameCount = gamesParam ? Math.min(20, Math.max(5, parseInt(gamesParam, 10) || 20)) : 20;
  const initialStat = statParam && PLAYER_STAT_NAMES.includes(statParam) ? statParam : undefined;
  const initialPropLine = lineParam != null ? parseFloat(lineParam) : undefined;
  const initialPropLineValid = initialPropLine != null && !Number.isNaN(initialPropLine);

  const [initialData, lastGameStatus, splits, matchups, propLines, todaysGame] = await Promise.all([
    getPlayerData(playerName, initialGameCount),
    getPlayerLastGameStatus(playerName),
    getPlayerSplits(playerName),
    getPlayerMatchups(playerName),
    getPlayerPropLines(playerName),
    getPlayerTodaysGame(playerName),
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
