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
import { useThemeLayout } from "./ThemeLayoutContext";
import HomepageLayoutSpotlight from "./HomepageLayoutSpotlight";
import HomepageLayoutEditorial from "./HomepageLayoutEditorial";
import HomepageLayoutActionBoard from "./HomepageLayoutActionBoard";
import HomepageLayoutTickerFeed from "./HomepageLayoutTickerFeed";

export interface HomepageContentProps {
  featuredPlayerName?: string;
  featuredPlayerData?: PlayerGameLog[];
  overSeasonAvgLast5?: OverSeasonAvgLast5Type[];
  underSeasonAvgLast5?: UnderSeasonAvgLast5[];
  trendingPlayers?: TrendingPlayer[];
  topPicks?: TopPick[];
  underPicks?: UnderPick[];
  propDate?: string | null;
  backtestResults?: BacktestResult;
  lastUpdated?: string | null;
  hasError?: boolean;
}

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
  lastUpdated = null,
  hasError = false,
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
  lastUpdated?: string | null;
  hasError?: boolean;
}) {
  const router = useRouter();
  const { layoutVariant } = useThemeLayout();

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

  const allDataEmpty =
    topPicks.length === 0 &&
    underPicks.length === 0 &&
    overSeasonAvgLast5.length === 0 &&
    underSeasonAvgLast5.length === 0 &&
    trendingPlayers.length === 0;

  const allProps: HomepageContentProps = {
    featuredPlayerName,
    featuredPlayerData,
    overSeasonAvgLast5,
    underSeasonAvgLast5,
    trendingPlayers,
    topPicks,
    underPicks,
    propDate,
    backtestResults,
    lastUpdated,
    hasError,
  };

  if (layoutVariant === "spotlight")
    return <HomepageLayoutSpotlight {...allProps} goToPlayer={goToPlayer} />;
  if (layoutVariant === "editorial")
    return <HomepageLayoutEditorial {...allProps} goToPlayer={goToPlayer} />;
  if (layoutVariant === "action-board")
    return <HomepageLayoutActionBoard {...allProps} goToPlayer={goToPlayer} />;
  if (layoutVariant === "ticker-feed")
    return <HomepageLayoutTickerFeed {...allProps} goToPlayer={goToPlayer} />;
  return (
    <>
      <HomeHero lastUpdated={lastUpdated} />

      {hasError && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 text-amber-200 text-sm">
          We&apos;re having trouble loading data right now. Data updates daily at 3:00 AM ET — please try again shortly.
        </div>
      )}

      {!hasError && allDataEmpty && (
        <div className="bg-pe-surface-2/50 border border-pe-border/5 rounded-xl p-6 mb-8 text-center text-pe-text-muted text-sm">
          No games scheduled today. Check back tomorrow for fresh picks.
        </div>
      )}

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
      <div className="border-t border-pe-border/5 my-10" />

      <FeaturedPlayer
        playerName={featuredPlayerName}
        data={featuredPlayerData}
      />

      {/* SEO content section */}
      <section className="mt-16 mb-8 max-w-3xl">
        <h2 className="text-xl font-bold text-pe-text-secondary mb-4">
          NBA Player Prop Analytics — Powered by Data
        </h2>
        <div className="space-y-3 text-sm text-pe-text-muted leading-relaxed">
          <p>
            PropEdge tracks over 515 NBA players across 26 stat categories, updated daily with the latest game data from Basketball Reference. Whether you&apos;re researching points, rebounds, assists, threes, or steals, every prop trend is backed by real box-score data.
          </p>
          <p>
            Our hot streak and cold spell detection compares each player&apos;s recent performance against their season averages. When a player beats their season average in their last five games, they show up on the hot list. When they fall short, they land on the cold list. Trending players are those on sustained multi-game runs that signal a shift in performance.
          </p>
          <p>
            Every player page includes a full game log, home and away splits, matchup history, and prop line overlays. Use the edge finder to compare a player&apos;s recent output against specific prop lines and see hit rates at a glance. PropEdge is free, fast, and built for anyone who wants to bet smarter with data.
          </p>
        </div>
      </section>
    </>
  );
}
