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
  TeamDefensiveRating,
} from "@/lib/data";
import BacktestResults from "./BacktestResults";
import OverSeasonAvgLast5 from "./OverSeasonAvgLast5";
import ColdLast5 from "./ColdLast5";
import TrendingPlayers from "./TrendingPlayers";
import FeaturedPlayer from "./FeaturedPlayer";
import TopPicks from "./TopPicks";
import UnderPicks from "./UnderPicks";

export interface HomepageContentProps {
  featuredPlayerName?: string;
  featuredPlayerData?: PlayerGameLog[];
  overSeasonAvgLast5?: OverSeasonAvgLast5Type[];
  underSeasonAvgLast5?: UnderSeasonAvgLast5[];
  trendingPlayers?: TrendingPlayer[];
  topPicks?: TopPick[];
  underPicks?: UnderPick[];
  defensiveRatings?: TeamDefensiveRating[];
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
  defensiveRatings = [],
  propDate = null,
  backtestResults = { gameDate: "", picks: [] },
  hasError = false,
}: {
  featuredPlayerName?: string;
  featuredPlayerData?: PlayerGameLog[];
  overSeasonAvgLast5?: OverSeasonAvgLast5Type[];
  underSeasonAvgLast5?: UnderSeasonAvgLast5[];
  trendingPlayers?: TrendingPlayer[];
  topPicks?: TopPick[];
  underPicks?: UnderPick[];
  defensiveRatings?: TeamDefensiveRating[];
  propDate?: string | null;
  backtestResults?: BacktestResult;
  lastUpdated?: string | null;
  hasError?: boolean;
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

  const allDataEmpty =
    topPicks.length === 0 &&
    underPicks.length === 0 &&
    overSeasonAvgLast5.length === 0 &&
    underSeasonAvgLast5.length === 0 &&
    trendingPlayers.length === 0;

  return (
    <>
      {/* Promo banner */}
      <a
        href="https://prizepicks.onelink.me/FjtC/e9fwt4jw"
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-8 rounded-xl border border-pe-accent/20 bg-gradient-to-r from-pe-accent/10 to-pe-surface-1 p-4 hover:border-pe-accent/40 transition-colors group"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-pe-accent">Promo</span>
            <p className="text-sm font-semibold text-pe-text-primary mt-0.5">
              Get $25 free on PrizePicks
            </p>
            <p className="text-xs text-pe-text-muted mt-0.5">
              Sign up with our code and get $25 in bonus funds when you deposit. Use code <span className="font-mono font-bold text-pe-accent">PR-5RMN2FT</span>
            </p>
          </div>
          <span className="shrink-0 px-4 py-2 rounded-lg bg-pe-accent/20 text-pe-accent text-xs font-bold uppercase tracking-wide group-hover:bg-pe-accent/30 transition-colors">
            Claim
          </span>
        </div>
      </a>

      {hasError && (
        <div className="bg-[#d1ad6a]/10 border border-[#d1ad6a]/20 rounded-xl p-4 mb-8 text-[#f5d89b] text-sm">
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

      {/* Divider */}
      <div className="border-t border-pe-border/5 my-10" />

      <FeaturedPlayer
        playerName={featuredPlayerName}
        data={featuredPlayerData}
      />
    </>
  );
}
