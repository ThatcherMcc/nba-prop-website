"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PlayerGameLog } from "@/db/schema";
import type { OverSeasonAvgLast5 as OverSeasonAvgLast5Type } from "@/lib/data";
import { ALL_PLAYER_NAMES } from "@/lib/playerNames";
import HomeHero from "./HomeHero";
import OverSeasonAvgLast5 from "./OverSeasonAvgLast5";
import FeaturedPlayer from "./FeaturedPlayer";

export default function PlayerSearch({
  featuredPlayerName = "LeBron James",
  featuredPlayerData = [],
  overSeasonAvgLast5 = [],
}: {
  featuredPlayerName?: string;
  featuredPlayerData?: PlayerGameLog[];
  overSeasonAvgLast5?: OverSeasonAvgLast5Type[];
}) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim();
    if (name && ALL_PLAYER_NAMES.includes(name)) {
      router.push(`/player/${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      <nav className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg">🏀</span>
            PROP<span className="text-blue-500">ANALYZER</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-10 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
            <input
              type="text"
              list="player-suggestions"
              placeholder="Search NBA Players (e.g. LeBron James)"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-5 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium placeholder:text-zinc-600 shadow-inner"
            />
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <HomeHero />
        <OverSeasonAvgLast5
          players={overSeasonAvgLast5}
          onSelectPlayer={(name) => {
            router.push(`/player/${encodeURIComponent(name)}?games=5`);
          }}
        />
        <FeaturedPlayer
          playerName={featuredPlayerName}
          data={featuredPlayerData}
        />
        <p className="text-center text-sm text-zinc-500 mt-8">
          Search a player or click a name above to open their stats page. Use the back button to return home.
        </p>
      </main>

      <datalist id="player-suggestions">
        {ALL_PLAYER_NAMES.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
