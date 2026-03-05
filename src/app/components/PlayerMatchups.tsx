"use client";

import { useState } from "react";
import type { PlayerMatchup, TodaysGame } from "@/lib/data";

interface Props {
  matchups: PlayerMatchup[];
  todaysGame?: TodaysGame | null;
}

type SortKey = "games" | "avgPts" | "avgReb" | "avgAst" | "avgPra" | "avgStl" | "avgBlk" | "avgTov";

const COLUMNS: { key: SortKey; label: string; hiddenMobile?: boolean }[] = [
  { key: "games", label: "GP" },
  { key: "avgPts", label: "PTS" },
  { key: "avgReb", label: "REB" },
  { key: "avgAst", label: "AST" },
  { key: "avgPra", label: "PRA" },
  { key: "avgStl", label: "STL", hiddenMobile: true },
  { key: "avgBlk", label: "BLK", hiddenMobile: true },
  { key: "avgTov", label: "TOV", hiddenMobile: true },
];

function formatLastPlayed(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function PlayerMatchups({ matchups, todaysGame }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("avgPts");
  const [sortDesc, setSortDesc] = useState(true);

  if (matchups.length === 0) {
    return (
      <div className="text-pe-text-faint text-sm text-center py-8">
        No matchup data available.
      </div>
    );
  }

  const sorted = [...matchups].sort((a, b) => {
    const diff = (a[sortKey] as number) - (b[sortKey] as number);
    return sortDesc ? -diff : diff;
  });

  // Compute season average for highlighting
  const totalGames = matchups.reduce((s, m) => s + m.games, 0);
  const weightedAvgPts =
    matchups.reduce((s, m) => s + m.avgPts * m.games, 0) / (totalGames || 1);

  // Find today's opponent in the matchup list
  const todaysMatchup = todaysGame
    ? matchups.find((m) => m.opponentCode === todaysGame.opponentCode)
    : null;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(!sortDesc);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Today's Matchup highlight */}
      {todaysMatchup && todaysGame && (
        <div className="bg-pe-accent/10 border border-pe-accent/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black text-pe-accent uppercase tracking-widest">
              Today&apos;s Matchup
            </span>
            <span className="text-[10px] text-pe-text-faint">
              {todaysGame.isHome ? "Home" : "Away"} vs {todaysMatchup.opponentCode}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-3 text-center">
            {COLUMNS.filter((c) => !c.hiddenMobile).map(({ key, label }) => {
              const val = todaysMatchup[key] as number;
              const isAboveAvg = key === "avgPts" && val - weightedAvgPts >= 2;
              const isBelowAvg = key === "avgPts" && weightedAvgPts - val >= 2;
              return (
                <div key={key}>
                  <div className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">
                    {label}
                  </div>
                  <div
                    className={`text-lg font-bold mt-0.5 ${
                      isAboveAvg
                        ? "text-emerald-400"
                        : isBelowAvg
                          ? "text-red-400"
                          : "text-pe-text-primary"
                    }`}
                  >
                    {key === "games" ? val : val.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
            <th className="text-left py-2 px-2">Team</th>
            <th className="text-right py-2 px-2 text-pe-text-faint">Last</th>
            {COLUMNS.map(({ key, label, hiddenMobile }) => (
              <th
                key={key}
                className={`text-right py-2 px-2 cursor-pointer hover:text-pe-text-secondary transition-colors select-none${hiddenMobile ? " hidden sm:table-cell" : ""}`}
                onClick={() => handleSort(key)}
              >
                {label}
                {sortKey === key && (
                  <span className="ml-0.5 text-pe-accent">
                    {sortDesc ? " ↓" : " ↑"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => {
            const ptsAboveAvg = m.avgPts - weightedAvgPts;
            const ptsColor =
              ptsAboveAvg >= 2
                ? "text-emerald-400"
                : ptsAboveAvg <= -2
                  ? "text-red-400"
                  : "text-pe-text-body";
            return (
              <tr
                key={m.opponentCode}
                className="border-b border-pe-border/5 hover:bg-pe-surface-2/10 transition-colors"
              >
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pe-text-body">
                      {m.opponentCode}
                    </span>
                    <span className="text-pe-text-faint text-xs hidden sm:inline">
                      {m.opponentName}
                    </span>
                  </div>
                </td>
                <td className="text-right py-2.5 px-2 text-pe-text-faint text-xs">
                  {formatLastPlayed(m.lastPlayed)}
                </td>
                <td className="text-right py-2.5 px-2 text-pe-text-muted">
                  {m.games}
                </td>
                <td className={`text-right py-2.5 px-2 font-semibold ${ptsColor}`}>
                  {m.avgPts.toFixed(1)}
                  {Math.abs(ptsAboveAvg) >= 2 && (
                    <span className="text-[10px] ml-1 opacity-70">
                      ({ptsAboveAvg > 0 ? "+" : ""}
                      {ptsAboveAvg.toFixed(1)})
                    </span>
                  )}
                </td>
                <td className="text-right py-2.5 px-2 text-pe-text-secondary">
                  {m.avgReb.toFixed(1)}
                </td>
                <td className="text-right py-2.5 px-2 text-pe-text-secondary">
                  {m.avgAst.toFixed(1)}
                </td>
                <td className="text-right py-2.5 px-2 text-pe-text-secondary font-medium">
                  {m.avgPra.toFixed(1)}
                </td>
                <td className="text-right py-2.5 px-2 text-pe-text-muted hidden sm:table-cell">
                  {m.avgStl.toFixed(1)}
                </td>
                <td className="text-right py-2.5 px-2 text-pe-text-muted hidden sm:table-cell">
                  {m.avgBlk.toFixed(1)}
                </td>
                <td className="text-right py-2.5 px-2 text-pe-text-muted hidden sm:table-cell">
                  {m.avgTov.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Top/bottom matchup callouts */}
      {sorted.length >= 3 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
            <span className="text-pe-text-muted">Best matchup: </span>
            <span className="text-emerald-400 font-bold">
              {sorted[0].avgPts.toFixed(1)} PTS vs {sorted[0].opponentCode}
            </span>
            <span className="text-pe-text-faint text-xs ml-1">
              ({sorted[0].games}G)
            </span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
            <span className="text-pe-text-muted">Toughest matchup: </span>
            <span className="text-red-400 font-bold">
              {sorted[sorted.length - 1].avgPts.toFixed(1)} PTS vs{" "}
              {sorted[sorted.length - 1].opponentCode}
            </span>
            <span className="text-pe-text-faint text-xs ml-1">
              ({sorted[sorted.length - 1].games}G)
            </span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
