"use client";

import { useRouter } from "next/navigation";
import type { PlayerGameLog } from "@/db/schema";
import type {
  OverSeasonAvgLast5 as OverSeasonAvgLast5Type,
  UnderSeasonAvgLast5,
  TrendingPlayer,
  TopPick,
  UnderPick,
  BacktestResult,
} from "@/lib/data";
import HomeHero from "./HomeHero";
import BacktestResults from "./BacktestResults";
import OverSeasonAvgLast5 from "./OverSeasonAvgLast5";
import ColdLast5 from "./ColdLast5";
import TrendingPlayers from "./TrendingPlayers";
import FeaturedPlayer from "./FeaturedPlayer";
import TopPicks from "./TopPicks";
import UnderPicks from "./UnderPicks";

export default function HomepageContent({
  featuredPlayerName = "LeBron James",
  featuredPlayerData = [],
  overSeasonAvgLast5 = [],
  underSeasonAvgLast5 = [],
  trendingPlayers = [],
  topPicks = [],
  underPicks = [],
  propDate = null,
  backtestResults = { gameDate: "", picks: [] },
}: {
  featuredPlayerName?: string;
  featuredPlayerData?: PlayerGameLog[];
  overSeasonAvgLast5?: OverSeasonAvgLast5Type[];
  underSeasonAvgLast5?: UnderSeasonAvgLast5[];
  trendingPlayers?: TrendingPlayer[];
  topPicks?: TopPick[];
  underPicks?: UnderPick[];
  propDate?: string | null;
  backtestResults?: BacktestResult;
}) {
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
      <HomeHero />

      <TopPicks
        picks={topPicks}
        propDate={propDate}
        onSelectPlayer={(name, stat, line) =>
          goToPlayer(name, 10, stat, line ?? undefined)
        }
      />

      <UnderPicks
        picks={underPicks}
        propDate={propDate}
        onSelectPlayer={(name, stat, line) =>
          goToPlayer(name, 10, stat, line ?? undefined)
        }
      />

      <BacktestResults data={backtestResults} />

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

      {/* Divider */}
      <div className="border-t border-white/5 my-10" />

      <FeaturedPlayer
        playerName={featuredPlayerName}
        data={featuredPlayerData}
      />
    </>
  );
}
