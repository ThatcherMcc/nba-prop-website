"use client";

import { useRouter } from "next/navigation";
import type { PlayerGameLog } from "@/db/schema";
import type {
  BacktestResult,
  OverSeasonAvgLast5 as OverSeasonAvgLast5Type,
  TrendingPlayer,
  UnderSeasonAvgLast5,
} from "@/lib/data";
import BacktestResults from "./BacktestResults";
import ColdLast5 from "./ColdLast5";
import FeaturedPlayer from "./FeaturedPlayer";
import OverSeasonAvgLast5 from "./OverSeasonAvgLast5";
import TrendingPlayers from "./TrendingPlayers";

interface AnalyticsDeferredClientSectionsProps {
  featuredPlayerName: string;
  featuredPlayerData: PlayerGameLog[];
  overSeasonAvgLast5: OverSeasonAvgLast5Type[];
  underSeasonAvgLast5: UnderSeasonAvgLast5[];
  trendingPlayers: TrendingPlayer[];
  backtestResults: BacktestResult;
}

export default function AnalyticsDeferredClientSections({
  featuredPlayerName,
  featuredPlayerData,
  overSeasonAvgLast5,
  underSeasonAvgLast5,
  trendingPlayers,
  backtestResults,
}: AnalyticsDeferredClientSectionsProps) {
  const router = useRouter();

  const goToPlayer = (
    name: string,
    games = 5,
    stat?: string,
    line?: number
  ) => {
    const params = new URLSearchParams();
    params.set("games", String(games));
    if (stat) params.set("stat", stat);
    if (line != null && !Number.isNaN(line)) params.set("line", String(line));
    router.push(`/player/${encodeURIComponent(name)}?${params.toString()}`);
  };

  return (
    <>
      <OverSeasonAvgLast5
        players={overSeasonAvgLast5}
        onSelectPlayer={(name, seasonAvgPts) =>
          goToPlayer(name, 10, "pts", seasonAvgPts ?? undefined)
        }
      />
      <ColdLast5
        players={underSeasonAvgLast5}
        onSelectPlayer={(name, seasonAvgPts) =>
          goToPlayer(name, 10, "pts", seasonAvgPts ?? undefined)
        }
      />
      <TrendingPlayers
        players={trendingPlayers}
        onSelectPlayer={(name, last3AvgPts) =>
          goToPlayer(name, 10, "pts", last3AvgPts ?? undefined)
        }
      />
      <BacktestResults data={backtestResults} />

      <div className="border-t border-pe-border/5 my-10" />

      <FeaturedPlayer
        playerName={featuredPlayerName}
        data={featuredPlayerData}
      />
    </>
  );
}
