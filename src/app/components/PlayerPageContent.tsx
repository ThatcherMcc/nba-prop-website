"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { PlayerGameLog, PLAYER_STAT_TYPE } from "@/db/schema";
import { PLAYER_STAT_NAMES } from "@/db/schema";
import { getPlayerData } from "@/lib/data";
import { isDnpMinutes } from "@/lib/dnp";
import type { PlayerLastGameStatus } from "@/lib/data";

const PlayerChartDisplay = dynamic(() => import("./PlayerChartDisplay"), {
  ssr: false,
});
const PlayerCard = dynamic(() => import("./PlayerCard"), { ssr: false });

const GAME_COUNT_OPTIONS = [5, 10, 15, 20] as const;
const DEFAULT_MULTI_STATS: [PLAYER_STAT_TYPE, PLAYER_STAT_TYPE, PLAYER_STAT_TYPE] = ["pts", "trb", "ast"];

interface PlayerPageContentProps {
  playerName: string;
  initialData: PlayerGameLog[];
  initialGameCount: number;
  lastGameStatus?: PlayerLastGameStatus | null;
  initialStat?: PLAYER_STAT_TYPE;
  initialPropLine?: number;
}

export default function PlayerPageContent({
  playerName,
  initialData,
  initialGameCount,
  lastGameStatus = null,
  initialStat,
  initialPropLine,
}: PlayerPageContentProps) {
  const router = useRouter();
  const [gameCount, setGameCount] = useState(initialGameCount);
  const [playerData, setPlayerData] = useState<PlayerGameLog[]>(initialData);
  const [viewMode, setViewMode] = useState<"single" | "multi">("single");
  const [selectedStat, setSelectedStat] = useState<PLAYER_STAT_TYPE>(initialStat ?? "pts");
  const [multiStats, setMultiStats] = useState<[PLAYER_STAT_TYPE, PLAYER_STAT_TYPE, PLAYER_STAT_TYPE]>(DEFAULT_MULTI_STATS);
  const [propLineInput, setPropLineInput] = useState(
    initialPropLine != null ? String(initialPropLine) : "0"
  );
  const [numericPropLine, setNumericPropLine] = useState<number | null>(
    initialPropLine ?? 0
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gameCount === initialGameCount) return;
    setLoading(true);
    getPlayerData(playerName, gameCount).then((data) => {
      setPlayerData(data);
      setLoading(false);
    });
  }, [playerName, gameCount, initialGameCount]);

  const handlePropLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPropLineInput(value);
    if (value === "") setNumericPropLine(null);
    else {
      const n = parseFloat(value);
      setNumericPropLine(!isNaN(n) ? n : null);
    }
  };

  const primaryStat = viewMode === "multi" ? multiStats[0] : selectedStat;
  const playedGames = useMemo(
    () => playerData.filter((g) => !isDnpMinutes(g.mp)),
    [playerData]
  );
  const { propLine, hitRate, verdict } = useMemo(() => {
    const line = numericPropLine ?? 0;
    const gamesOver = playedGames.filter(
      (g) => ((g[primaryStat] as number | null) ?? 0) > line
    ).length;
    const pct = playedGames.length > 0 ? (gamesOver / playedGames.length) * 100 : 0;
    let verdictText: string;
    if (playedGames.length === 0) verdictText = "Add a line to see a trend.";
    else if (line === 0 && pct === 0) verdictText = "Enter the line you're considering (e.g. 25.5 points).";
    else if (pct >= 60) verdictText = "Strong Over — hits above this line most of the time.";
    else if (pct <= 40) verdictText = "Lean Under — usually below this line recently.";
    else verdictText = "No clear edge — hit rate near 50%.";
    return {
      propLine: line,
      hitRate: pct.toFixed(1),
      verdict: verdictText,
    };
  }, [playedGames, primaryStat, numericPropLine]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      <nav className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-zinc-400 hover:text-white text-sm font-medium flex items-center gap-1"
            >
              ← Back to home
            </Link>
            <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
              <span className="bg-blue-600 p-1.5 rounded-lg">🏀</span>
              PROP<span className="text-blue-500">ANALYZER</span>
            </h1>
          </div>
          <div className="flex-1 max-w-xl relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
            <input
              type="text"
              placeholder="Search another player..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-5 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = (e.target as HTMLInputElement).value?.trim();
                  if (value) router.push(`/player/${encodeURIComponent(value)}`);
                }
              }}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {loading && (
          <div className="flex gap-3 text-blue-400 font-medium animate-pulse mb-4">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            Loading games...
          </div>
        )}

        {!loading && playerData.length === 0 && (
          <div className="mt-10 p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500 text-center">
            No recent game data found for <span className="font-bold">{playerName}</span>.
            <br />
            <Link href="/" className="text-blue-400 hover:underline mt-2 inline-block">
              ← Back to home
            </Link>
          </div>
        )}

        {!loading && playerData.length > 0 && (
          <>
            {lastGameStatus?.isDnp && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-amber-400 text-sm font-medium">
                <span aria-hidden>⚠️</span>
                <span>Last game: DNP (excluded from averages)</span>
              </div>
            )}
            <div className="grid grid-cols-12 gap-8 mt-4">
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-square bg-gradient-to-b from-blue-600/20 to-transparent relative">
                    <Image
                      src="/LebronPic.png"
                      fill
                      className="object-contain p-4"
                      alt={playerName}
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Last how many games?
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {GAME_COUNT_OPTIONS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setGameCount(n)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              gameCount === n
                                ? "bg-blue-600 text-white"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-white/10"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Chart view</label>
                      <div className="flex rounded-lg overflow-hidden border border-white/10 bg-zinc-800">
                        <button
                          type="button"
                          onClick={() => setViewMode("single")}
                          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                            viewMode === "single" ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          Single stat
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("multi")}
                          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                            viewMode === "multi" ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          Multi-stat
                        </button>
                      </div>
                    </div>
                    {viewMode === "single" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Stat</label>
                          <select
                            value={selectedStat}
                            onChange={(e) => setSelectedStat(e.target.value as PLAYER_STAT_TYPE)}
                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                          >
                            {PLAYER_STAT_NAMES.map((stat) => (
                              <option key={stat} value={stat}>{stat.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Prop line</label>
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            value={propLineInput}
                            onChange={handlePropLineChange}
                            placeholder="e.g. 25.5"
                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 placeholder:text-zinc-500"
                          />
                        </div>
                      </div>
                    )}
                    {viewMode === "multi" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Stats (3 charts)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {([0, 1, 2] as const).map((i) => (
                              <select
                                key={i}
                                value={multiStats[i]}
                                onChange={(e) => {
                                  const v = e.target.value as PLAYER_STAT_TYPE;
                                  setMultiStats((prev) => {
                                    const next = [...prev] as [PLAYER_STAT_TYPE, PLAYER_STAT_TYPE, PLAYER_STAT_TYPE];
                                    next[i] = v;
                                    return next;
                                  });
                                }}
                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                              >
                                {PLAYER_STAT_NAMES.map((stat) => (
                                  <option key={stat} value={stat}>{stat.toUpperCase()}</option>
                                ))}
                              </select>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Prop line (all charts)</label>
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            value={propLineInput}
                            onChange={handlePropLineChange}
                            placeholder="e.g. 25.5"
                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 placeholder:text-zinc-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <PlayerCard
                  playerName={playerName}
                  stat={primaryStat.toUpperCase()}
                  propLine={propLine}
                  hitRate={hitRate}
                  gameCount={gameCount}
                  verdict={verdict}
                />
              </div>
              <div className="col-span-12 lg:col-span-8">
                {viewMode === "single" && (
                  <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl h-full min-h-[500px]">
                    <PlayerChartDisplay
                      data={playerData}
                      statKey={selectedStat}
                      propLine={propLine}
                    />
                  </div>
                )}
                {viewMode === "multi" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {multiStats.map((statKey) => (
                      <div
                        key={statKey}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl min-h-[320px] flex flex-col"
                      >
                        <PlayerChartDisplay
                          data={playerData}
                          statKey={statKey}
                          propLine={propLine}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
