import type { PlayerGameLog } from "@/db/schema";
import type {
  BacktestResult,
  OverSeasonAvgLast5 as OverSeasonAvgLast5Type,
  TrendingPlayer,
  UnderSeasonAvgLast5,
} from "@/lib/data";
import {
  getBacktestResults,
  getPlayerData,
  getPlayersOverSeasonAvgLast5,
  getPlayersUnderSeasonAvgLast5,
  getTrendingPlayers,
} from "@/lib/data";
import AnalyticsDeferredClientSections from "./AnalyticsDeferredClientSections";

interface AnalyticsDeferredSectionsProps {
  featuredPlayerName: string;
}

export default async function AnalyticsDeferredSections({
  featuredPlayerName,
}: AnalyticsDeferredSectionsProps) {
  let featuredPlayerData: PlayerGameLog[] = [];
  let overSeasonAvgLast5: OverSeasonAvgLast5Type[] = [];
  let underSeasonAvgLast5: UnderSeasonAvgLast5[] = [];
  let trendingPlayers: TrendingPlayer[] = [];
  let backtestResults: BacktestResult = { gameDate: "", picks: [] };

  try {
    [
      featuredPlayerData,
      overSeasonAvgLast5,
      underSeasonAvgLast5,
      trendingPlayers,
      backtestResults,
    ] = await Promise.all([
      getPlayerData(featuredPlayerName, 10),
      getPlayersOverSeasonAvgLast5(8),
      getPlayersUnderSeasonAvgLast5(8),
      getTrendingPlayers(8),
      getBacktestResults(),
    ]);
  } catch (error) {
    console.error("Analytics deferred data load failed:", error);
  }

  return (
    <AnalyticsDeferredClientSections
      featuredPlayerName={featuredPlayerName}
      featuredPlayerData={featuredPlayerData}
      overSeasonAvgLast5={overSeasonAvgLast5}
      underSeasonAvgLast5={underSeasonAvgLast5}
      trendingPlayers={trendingPlayers}
      backtestResults={backtestResults}
    />
  );
}
