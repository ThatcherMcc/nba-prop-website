"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PlayerGameLog } from "@/db/schema";
import type { OverSeasonAvgLast5 as OverSeasonAvgLast5Type } from "@/lib/data";
import type { UnderSeasonAvgLast5 } from "@/lib/data";
import type { TrendingPlayer } from "@/lib/data";
import type { TopPick } from "@/lib/data";
import type { UnderPick } from "@/lib/data";
import type { BacktestResult } from "@/lib/data";
import HomeHero from "./HomeHero";
import BacktestResults from "./BacktestResults";
import OverSeasonAvgLast5 from "./OverSeasonAvgLast5";
import ColdLast5 from "./ColdLast5";
import TrendingPlayers from "./TrendingPlayers";
import FeaturedPlayer from "./FeaturedPlayer";
import TopPicks from "./TopPicks";
import UnderPicks from "./UnderPicks";

/** Normalize for match: lowercase, collapse spaces. */
function normalizeForMatch(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export default function PlayerSearch({
  playerNames = [],
  featuredPlayerName = "LeBron James",
  featuredPlayerData = [],
  overSeasonAvgLast5 = [],
  underSeasonAvgLast5 = [],
  trendingPlayers = [],
  topPicks = [],
  underPicks = [],
  backtestResults = { gameDate: "", picks: [] },
}: {
  playerNames?: string[];
  featuredPlayerName?: string;
  featuredPlayerData?: PlayerGameLog[];
  overSeasonAvgLast5?: OverSeasonAvgLast5Type[];
  underSeasonAvgLast5?: UnderSeasonAvgLast5[];
  trendingPlayers?: TrendingPlayer[];
  topPicks?: TopPick[];
  underPicks?: UnderPick[];
  backtestResults?: BacktestResult;
}) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim();
    if (!name) return;
    const normalized = normalizeForMatch(name);
    const match = playerNames.find((n) => normalizeForMatch(n) === normalized);
    if (match) router.push(`/player/${encodeURIComponent(match)}`);
  };

  const goToPlayer = (name: string, games = 5, stat?: string, line?: number) => {
    const params = new URLSearchParams();
    params.set("games", String(games));
    if (stat) params.set("stat", stat);
    if (line != null && !Number.isNaN(line)) params.set("line", String(line));
    router.push(`/player/${encodeURIComponent(name)}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      <nav className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg text-sm">🏀</span>
            PROP<span className="text-blue-500">ANALYZER</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-10 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
            <input
              type="text"
              list="player-suggestions"
              placeholder="Search any NBA player..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium placeholder:text-zinc-600 shadow-inner"
            />
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <HomeHero />

        <BacktestResults data={backtestResults} />

        <TopPicks
          picks={topPicks}
          onSelectPlayer={(name, stat, line) =>
            goToPlayer(name, 10, stat, line ?? undefined)
          }
        />

        <UnderPicks
          picks={underPicks}
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

        {/* Divider */}
        <div className="border-t border-white/5 my-10" />

        <FeaturedPlayer
          playerName={featuredPlayerName}
          data={featuredPlayerData}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="bg-blue-600 p-1 rounded text-xs">🏀</span>
            <span className="font-bold text-zinc-400">PROP<span className="text-blue-500">ANALYZER</span></span>
            <span className="text-zinc-600">·</span>
            <span>Built for smarter bets</span>
          </div>
          <p className="text-xs text-zinc-600">
            Data updated daily from Basketball Reference. Not financial advice. Gamble responsibly.
          </p>
        </div>
      </footer>

      <datalist id="player-suggestions">
        {playerNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
