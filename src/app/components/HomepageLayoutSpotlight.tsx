"use client";

import type { PlayerGameLog } from "@/db/schema";
import type {
  OverSeasonAvgLast5 as OverSeasonAvgLast5Type,
  UnderSeasonAvgLast5,
  TrendingPlayer,
  BacktestResult,
} from "@/lib/data";
import { HomepageLayoutProps, PickOfTheDayHero } from "./homepage-shared";
import HomeHero from "./HomeHero";
import TopPicks from "./TopPicks";
import UnderPicks from "./UnderPicks";
import BacktestResults from "./BacktestResults";
import OverSeasonAvgLast5 from "./OverSeasonAvgLast5";
import ColdLast5 from "./ColdLast5";
import TrendingPlayers from "./TrendingPlayers";
import FeaturedPlayer from "./FeaturedPlayer";

export default function HomepageLayoutSpotlight({
  featuredPlayerName = "LeBron James",
  featuredPlayerData = [] as PlayerGameLog[],
  overSeasonAvgLast5 = [] as OverSeasonAvgLast5Type[],
  underSeasonAvgLast5 = [] as UnderSeasonAvgLast5[],
  trendingPlayers = [] as TrendingPlayer[],
  topPicks = [],
  underPicks = [],
  defensiveRatings = [],
  propDate = null,
  backtestResults = { gameDate: "", picks: [] } as BacktestResult,
  lastUpdated = null,
  hasError = false,
  goToPlayer,
}: HomepageLayoutProps) {
  const allDataEmpty =
    topPicks.length === 0 &&
    underPicks.length === 0 &&
    overSeasonAvgLast5.length === 0 &&
    underSeasonAvgLast5.length === 0 &&
    trendingPlayers.length === 0;

  return (
    <>
      {/* Hero pick at the very top if available */}
      {!hasError && topPicks.length > 0 && (
        <PickOfTheDayHero
          pick={topPicks[0]}
          propDate={propDate}
          goToPlayer={goToPlayer}
        />
      )}

      <HomeHero lastUpdated={lastUpdated} />

      {/* Error state */}
      {hasError && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 text-amber-200 text-sm">
          We&apos;re having trouble loading data right now. Data updates daily at 3:00 AM ET — please try again shortly.
        </div>
      )}

      {/* Empty state */}
      {!hasError && allDataEmpty && (
        <div className="bg-pe-surface-2/50 border border-pe-border/5 rounded-xl p-6 mb-8 text-center text-pe-text-muted text-sm">
          No games scheduled today. Check back tomorrow for fresh picks.
        </div>
      )}

      <TopPicks
        picks={topPicks}
        defensiveRatings={defensiveRatings}
        propDate={propDate}
        onSelectPlayer={(name, stat, line) =>
          goToPlayer(name, 10, stat, line ?? undefined)
        }
      />
      <UnderPicks
        picks={underPicks}
        defensiveRatings={defensiveRatings}
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

      <div className="border-t border-pe-border/5 my-10" />

      <FeaturedPlayer
        playerName={featuredPlayerName}
        data={featuredPlayerData}
      />
    </>
  );
}
