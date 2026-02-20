"use client";

import { useState } from "react";
import type { PlayerMatchup } from "@/lib/data";

interface Props {
  matchups: PlayerMatchup[];
}

type SortKey = "games" | "avgPts" | "avgReb" | "avgAst" | "avgPra";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "games", label: "GP" },
  { key: "avgPts", label: "PTS" },
  { key: "avgReb", label: "REB" },
  { key: "avgAst", label: "AST" },
  { key: "avgPra", label: "PRA" },
];

export default function PlayerMatchups({ matchups }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("avgPts");
  const [sortDesc, setSortDesc] = useState(true);

  if (matchups.length === 0) {
    return (
      <div className="text-zinc-500 text-sm text-center py-8">
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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(!sortDesc);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/10">
            <th className="text-left py-2 px-2">Team</th>
            {COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                className="text-right py-2 px-2 cursor-pointer hover:text-zinc-300 transition-colors select-none"
                onClick={() => handleSort(key)}
              >
                {label}
                {sortKey === key && (
                  <span className="ml-0.5 text-blue-400">
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
                  : "text-zinc-100";
            return (
              <tr
                key={m.opponentCode}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100">
                      {m.opponentCode}
                    </span>
                    <span className="text-zinc-500 text-xs hidden sm:inline">
                      {m.opponentName}
                    </span>
                  </div>
                </td>
                <td className="text-right py-2.5 px-2 text-zinc-400">
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
                <td className="text-right py-2.5 px-2 text-zinc-300">
                  {m.avgReb.toFixed(1)}
                </td>
                <td className="text-right py-2.5 px-2 text-zinc-300">
                  {m.avgAst.toFixed(1)}
                </td>
                <td className="text-right py-2.5 px-2 text-zinc-300 font-medium">
                  {m.avgPra.toFixed(1)}
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
            <span className="text-zinc-400">Best matchup: </span>
            <span className="text-emerald-400 font-bold">
              {sorted[0].avgPts.toFixed(1)} PTS vs {sorted[0].opponentCode}
            </span>
            <span className="text-zinc-500 text-xs ml-1">
              ({sorted[0].games}G)
            </span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
            <span className="text-zinc-400">Toughest matchup: </span>
            <span className="text-red-400 font-bold">
              {sorted[sorted.length - 1].avgPts.toFixed(1)} PTS vs{" "}
              {sorted[sorted.length - 1].opponentCode}
            </span>
            <span className="text-zinc-500 text-xs ml-1">
              ({sorted[sorted.length - 1].games}G)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
