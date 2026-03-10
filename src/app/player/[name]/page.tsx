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
  getTeamDefensiveRatings,
  getPlayersWithGameData,
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

  // noindex players with no game data (e.g. MLB players before season starts)
  const playersWithData = await getPlayersWithGameData();
  const hasData = playersWithData.some(
    (n) => n.toLowerCase() === playerName.toLowerCase()
  );

  return {
    title: `${playerName} — Prop Trends & Stats`,
    description: `View ${playerName}'s NBA prop trends, game logs, hot streaks, and betting analytics. Updated daily with the latest stats.`,
    alternates: { canonical: canonicalUrl },
    ...(hasData ? {} : { robots: { index: false, follow: false } }),
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

  const [initialData, lastGameStatus, splits, matchups, propLines, todaysGame, defensiveRatings] = await Promise.all([
    getPlayerData(playerName, initialGameCount),
    getPlayerLastGameStatus(playerName),
    getPlayerSplits(playerName),
    getPlayerMatchups(playerName),
    getPlayerPropLines(playerName),
    getPlayerTodaysGame(playerName),
    getTeamDefensiveRatings(),
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
      defensiveRatings={defensiveRatings}
    />
  );
}
