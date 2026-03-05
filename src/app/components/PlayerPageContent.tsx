"use client";

import { useEffect, useState, useMemo, useRef } from "react";

import dynamic from "next/dynamic";
import type { PlayerGameLog, PLAYER_STAT_TYPE } from "@/db/schema";
import { PLAYER_STAT_NAMES } from "@/db/schema";
import { getPlayerData } from "@/lib/data";
import { isDnpMinutes } from "@/lib/dnp";
import type { PlayerLastGameStatus, PlayerSplits as PlayerSplitsType, PlayerMatchup, PlayerPropLine, TodaysGame } from "@/lib/data";
import PlayerSplits from "./PlayerSplits";
import PlayerMatchups from "./PlayerMatchups";
import PlayerEdgeFinder from "./PlayerEdgeFinder";
import GameLogTable from "./GameLogTable";
import PlayerPropLines from "./PlayerPropLines";

const PlayerChartDisplay = dynamic(() => import("./PlayerChartDisplay"), {
  ssr: false,
});
const PlayerCard = dynamic(() => import("./PlayerCard"), { ssr: false });

const GAME_COUNT_OPTIONS = [5, 10, 15, 20] as const;
const DEFAULT_MULTI_STATS: [PLAYER_STAT_TYPE, PLAYER_STAT_TYPE, PLAYER_STAT_TYPE] = ["pts", "trb", "ast"];

// Map frontend stat keys to prop market codes
const STAT_TO_MARKET: Partial<Record<PLAYER_STAT_TYPE, string>> = {
  pts: "PTS",
  trb: "REB",
  ast: "AST",
  stl: "STL",
  blk: "BLK",
  fg3: "FG3",
  ft: "FTM",
  tov: "TOV",
  pra: "PRA",
  pr: "PR",
  pa: "PA",
  ra: "RA",
  sb: "SB",
};

type AnalyticsTab = "props" | "edge" | "splits" | "matchups" | "gamelog";

interface PlayerPageContentProps {
  playerName: string;
  initialData: PlayerGameLog[];
  initialGameCount: number;
  lastGameStatus?: PlayerLastGameStatus | null;
  initialStat?: PLAYER_STAT_TYPE;
  initialPropLine?: number;
  splits?: PlayerSplitsType | null;
  matchups?: PlayerMatchup[] | null;
  propLines?: PlayerPropLine[] | null;
  todaysGame?: TodaysGame | null;
}

export default function PlayerPageContent({
  playerName,
  initialData,
  initialGameCount,
  lastGameStatus = null,
  initialStat,
  initialPropLine,
  splits = null,
  matchups = null,
  propLines = null,
  todaysGame = null,
}: PlayerPageContentProps) {
  const [gameCount, setGameCount] = useState(initialGameCount);
  const [playerData, setPlayerData] = useState<PlayerGameLog[]>(initialData);
  const [viewMode, setViewMode] = useState<"single" | "multi">("single");
  const [selectedStat, setSelectedStat] = useState<PLAYER_STAT_TYPE>(initialStat ?? "pts");
  const [multiStats, setMultiStats] = useState<[PLAYER_STAT_TYPE, PLAYER_STAT_TYPE, PLAYER_STAT_TYPE]>(DEFAULT_MULTI_STATS);

  // Build lookup: market code → book line from prop data
  const propLineByMarket = useMemo(() => {
    const map = new Map<string, number>();
    if (propLines) {
      for (const pl of propLines) {
        if (pl.bookLine != null) map.set(pl.marketCode, pl.bookLine);
      }
    }
    return map;
  }, [propLines]);

  // Get the book line for a stat key (if available from today's props)
  const getBookLineForStat = (stat: PLAYER_STAT_TYPE): number | null => {
    const market = STAT_TO_MARKET[stat];
    if (!market) return null;
    return propLineByMarket.get(market) ?? null;
  };

  // Initial prop line: use URL param, or auto-fill from book line
  const resolvedInitialLine = initialPropLine ?? getBookLineForStat(initialStat ?? "pts") ?? 0;

  const [propLineInput, setPropLineInput] = useState(String(resolvedInitialLine));
  const [numericPropLine, setNumericPropLine] = useState<number | null>(resolvedInitialLine);
  const [loading, setLoading] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>(
    propLines && propLines.length > 0 ? "props" : "edge"
  );

  const tabsRef = useRef<HTMLDivElement>(null);
  const [showTabFade, setShowTabFade] = useState(true);

  const handleTabScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setShowTabFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    handleTabScroll();
  }, []);

  // Auto-fill prop line from book data when stat changes
  useEffect(() => {
    // Don't override if user passed an explicit line via URL
    if (initialPropLine != null) return;
    const bookLine = getBookLineForStat(selectedStat);
    if (bookLine != null) {
      setPropLineInput(String(bookLine));
      setNumericPropLine(bookLine);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStat]);

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

  // Season averages from splits (full season, not limited by gameCount)
  const seasonStats = useMemo(() => {
    if (!splits) return null;
    const { home, away } = splits;
    const total = home.games + away.games;
    if (total === 0) return null;
    const w = (h: number, a: number) =>
      +((h * home.games + a * away.games) / total).toFixed(1);
    return {
      games: total,
      pts: w(home.avgPts, away.avgPts),
      reb: w(home.avgReb, away.avgReb),
      ast: w(home.avgAst, away.avgAst),
      stl: w(home.avgStl, away.avgStl),
      blk: w(home.avgBlk, away.avgBlk),
      fg3: w(home.avg3pm, away.avg3pm),
      pra: w(home.avgPra, away.avgPra),
    };
  }, [splits]);

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
    <div>
      {loading && (
          <div className="flex gap-3 text-pe-accent font-medium animate-pulse mb-4">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            Loading games...
          </div>
        )}

        {!loading && playerData.length === 0 && (
          <div className="mt-10 p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500 text-center">
            No recent game data found for <span className="font-bold">{playerName}</span>.
          </div>
        )}

        {!loading && playerData.length > 0 && (
          <>
            {/* Player header with season stats */}
            <div className="mt-4 mb-2">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <h2 className="text-3xl font-black tracking-tight text-pe-text-primary">
                  {playerName}
                </h2>
                {seasonStats && (
                  <div className="flex items-center gap-2 text-xs font-medium text-pe-text-faint">
                    <span>{seasonStats.games} games this season</span>
                  </div>
                )}
              </div>

              {seasonStats && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {([
                    { label: "PTS", value: seasonStats.pts },
                    { label: "REB", value: seasonStats.reb },
                    { label: "AST", value: seasonStats.ast },
                    { label: "STL", value: seasonStats.stl },
                    { label: "BLK", value: seasonStats.blk },
                    { label: "3PM", value: seasonStats.fg3 },
                    { label: "PRA", value: seasonStats.pra },
                  ] as const).map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 bg-pe-surface-1 border border-pe-border/10 rounded-lg px-3 py-1.5"
                    >
                      <span className="text-pe-text-faint text-[10px] font-bold uppercase tracking-widest">
                        {label}
                      </span>
                      <span className="text-pe-text-primary font-bold text-sm">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {lastGameStatus?.isDnp && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-amber-400 text-sm font-medium mb-2">
                <span aria-hidden>⚠️</span>
                <span>Last game: DNP (excluded from averages)</span>
              </div>
            )}

            <div className="grid grid-cols-12 gap-4 md:gap-8 mt-4">
              <div className="col-span-12 lg:col-span-4 space-y-4 md:space-y-6">
                <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">
                        Last how many games?
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {GAME_COUNT_OPTIONS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setGameCount(n)}
                            className={`px-4 py-3 md:px-3 md:py-2 rounded-lg text-base md:text-sm font-medium transition-colors min-w-[48px] ${
                              gameCount === n
                                ? "bg-pe-accent-strong text-pe-text-primary"
                                : "bg-pe-surface-2 text-pe-text-muted hover:bg-pe-surface-2/70 border border-pe-border/10"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">Chart view</label>
                      <div className="flex rounded-lg overflow-hidden border border-pe-border/10 bg-pe-surface-2">
                        <button
                          type="button"
                          onClick={() => setViewMode("single")}
                          className={`flex-1 px-3 py-3 md:py-2 text-base md:text-sm font-medium transition-colors ${
                            viewMode === "single" ? "bg-pe-accent-strong text-pe-text-primary" : "text-pe-text-muted hover:bg-pe-surface-2/70"
                          }`}
                        >
                          Single stat
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("multi")}
                          className={`flex-1 px-3 py-3 md:py-2 text-base md:text-sm font-medium transition-colors ${
                            viewMode === "multi" ? "bg-pe-accent-strong text-pe-text-primary" : "text-pe-text-muted hover:bg-pe-surface-2/70"
                          }`}
                        >
                          Multi-stat
                        </button>
                      </div>
                    </div>
                    {viewMode === "single" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">Stat</label>
                          <select
                            value={selectedStat}
                            onChange={(e) => setSelectedStat(e.target.value as PLAYER_STAT_TYPE)}
                            className="w-full bg-pe-surface-2 border border-pe-border/10 rounded-lg px-3 py-3 md:py-2 text-base md:text-sm outline-none focus:border-pe-accent"
                          >
                            {PLAYER_STAT_NAMES.map((stat) => (
                              <option key={stat} value={stat}>{stat.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">Prop line</label>
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            value={propLineInput}
                            onChange={handlePropLineChange}
                            placeholder="e.g. 25.5"
                            className="w-full bg-pe-surface-2 border border-pe-border/10 rounded-lg px-3 py-3 md:py-2 text-base md:text-sm outline-none focus:border-pe-accent placeholder:text-pe-text-faint"
                          />
                          {getBookLineForStat(selectedStat) != null && (
                            <p className="text-[10px] text-pe-accent/70">
                              Book line for {STAT_TO_MARKET[selectedStat]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {viewMode === "multi" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">Stats (3 charts)</label>
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
                                className="w-full bg-pe-surface-2 border border-pe-border/10 rounded-lg px-2 py-3 md:py-1.5 text-base md:text-xs outline-none focus:border-pe-accent"
                              >
                                {PLAYER_STAT_NAMES.map((stat) => (
                                  <option key={stat} value={stat}>{stat.toUpperCase()}</option>
                                ))}
                              </select>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">Prop line (all charts)</label>
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            value={propLineInput}
                            onChange={handlePropLineChange}
                            placeholder="e.g. 25.5"
                            className="w-full bg-pe-surface-2 border border-pe-border/10 rounded-lg px-3 py-3 md:py-2 text-base md:text-sm outline-none focus:border-pe-accent placeholder:text-pe-text-faint"
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
                  <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-4 md:p-6 shadow-2xl h-full min-h-[300px] md:min-h-[500px]">
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
                        className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-4 shadow-2xl min-h-[320px] flex flex-col"
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

            {/* Edge Analytics Section */}
            <div className="col-span-12 mt-4">
              <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="relative">
                <div
                  ref={tabsRef}
                  onScroll={handleTabScroll}
                  className="flex items-center gap-1 border-b border-pe-border/10 px-2 overflow-x-auto no-scrollbar"
                >
                  {(
                    [
                      { key: "props" as const, label: "Prop Lines" },
                      { key: "edge" as const, label: "Edge Finder" },
                      { key: "splits" as const, label: "Home / Away" },
                      { key: "matchups" as const, label: "Matchups" },
                      { key: "gamelog" as const, label: "Game Log" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAnalyticsTab(key)}
                      className={`px-4 py-4 md:py-3 text-base md:text-sm font-medium transition-colors relative whitespace-nowrap ${
                        analyticsTab === key
                          ? "text-pe-text-primary"
                          : "text-pe-text-faint hover:text-pe-text-secondary"
                      }`}
                    >
                      {label}
                      {analyticsTab === key && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-pe-accent rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
                {showTabFade && (
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-pe-surface-1 to-transparent pointer-events-none z-10" />
                )}
                </div>

                <div className="p-3 md:p-6">
                  {analyticsTab === "props" && (
                    <PlayerPropLines
                      propLines={propLines ?? []}
                      seasonStats={seasonStats}
                    />
                  )}
                  {analyticsTab === "edge" && (
                    <PlayerEdgeFinder data={initialData} stat={primaryStat} />
                  )}
                  {analyticsTab === "splits" && splits && (
                    <PlayerSplits splits={splits} todaysGame={todaysGame} />
                  )}
                  {analyticsTab === "matchups" && matchups && (
                    <PlayerMatchups matchups={matchups} todaysGame={todaysGame} />
                  )}
                  {analyticsTab === "gamelog" && (
                    <GameLogTable
                      data={playerData}
                      propLine={propLine}
                      highlightStat={primaryStat}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
