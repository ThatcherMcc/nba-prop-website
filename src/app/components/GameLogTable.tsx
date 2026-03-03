"use client";

import { useState, useMemo } from "react";
import type { PlayerGameLog, PLAYER_STAT_TYPE } from "@/db/schema";
import { isDnpMinutes } from "@/lib/dnp";

interface Props {
  data: PlayerGameLog[];
  propLine: number;
  highlightStat: PLAYER_STAT_TYPE;
}

type SortKey = "gameDate" | PLAYER_STAT_TYPE;

const VISIBLE_STATS: { key: PLAYER_STAT_TYPE; label: string }[] = [
  { key: "pts", label: "PTS" },
  { key: "trb", label: "REB" },
  { key: "ast", label: "AST" },
  { key: "stl", label: "STL" },
  { key: "blk", label: "BLK" },
  { key: "fg3", label: "3PM" },
  { key: "fg", label: "FG" },
  { key: "fga", label: "FGA" },
  { key: "ft", label: "FT" },
  { key: "fta", label: "FTA" },
  { key: "tov", label: "TOV" },
];

function formatDate(d: string | null) {
  if (!d) return "—";
  const date = new Date(d + "T00:00:00");
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function GameLogTable({ data, propLine, highlightStat }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("gameDate");
  const [sortDesc, setSortDesc] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    const rows = [...data];
    rows.sort((a, b) => {
      if (sortKey === "gameDate") {
        const da = a.gameDate ?? "";
        const db = b.gameDate ?? "";
        return sortDesc ? db.localeCompare(da) : da.localeCompare(db);
      }
      const va = (a[sortKey] as number | null) ?? 0;
      const vb = (b[sortKey] as number | null) ?? 0;
      return sortDesc ? vb - va : va - vb;
    });
    return rows;
  }, [data, sortKey, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(!sortDesc);
    else {
      setSortKey(key);
      setSortDesc(key === "gameDate" ? true : true);
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-zinc-500 text-sm text-center py-8">
        No games to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm whitespace-nowrap">
        <thead>
          <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/10">
            <th
              className="text-left py-2 px-2 cursor-pointer hover:text-zinc-300 select-none sticky left-0 bg-zinc-900 z-10"
              onClick={() => handleSort("gameDate")}
            >
              Date
              {sortKey === "gameDate" && (
                <span className="ml-0.5 text-blue-400">{sortDesc ? " ↓" : " ↑"}</span>
              )}
            </th>
            <th className="text-left py-2 px-2">OPP</th>
            <th className="text-left py-2 px-2">MIN</th>
            <th className="text-center py-2 px-1 w-8">O/U</th>
            {VISIBLE_STATS.map(({ key, label }) => (
              <th
                key={key}
                className={`text-right py-2 px-2 cursor-pointer hover:text-zinc-300 select-none ${
                  key === highlightStat ? "text-blue-400" : ""
                }`}
                onClick={() => handleSort(key)}
              >
                {label}
                {sortKey === key && (
                  <span className="ml-0.5 text-blue-400">{sortDesc ? " ↓" : " ↑"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(showAll ? sorted : sorted.slice(0, 5)).map((game, i) => {
            const dnp = isDnpMinutes(game.mp);
            const statVal = (game[highlightStat] as number | null) ?? 0;
            const isOver = !dnp && propLine > 0 && statVal > propLine;
            const isUnder = !dnp && propLine > 0 && statVal < propLine;

            return (
              <tr
                key={`${game.gameDate}-${i}`}
                className={`border-b border-white/5 transition-colors ${
                  dnp
                    ? "opacity-40"
                    : isOver
                      ? "hover:bg-emerald-500/5"
                      : isUnder
                        ? "hover:bg-red-500/5"
                        : "hover:bg-white/[0.02]"
                }`}
              >
                <td className="py-2 px-2 text-zinc-400 sticky left-0 bg-zinc-900 z-10">
                  {formatDate(game.gameDate)}
                </td>
                <td className="py-2 px-2">
                  {game.opponent == null ? (
                    <span className="text-zinc-600">—</span>
                  ) : game.location === "@" ? (
                    <span className="text-zinc-500">@{game.opponent}</span>
                  ) : (
                    <span className="text-zinc-400">vs {game.opponent}</span>
                  )}
                </td>
                <td className="py-2 px-2 text-zinc-400">
                  {dnp ? "—" : game.mp ?? "—"}
                </td>
                <td className="py-2 px-1 text-center">
                  {dnp ? (
                    <span className="text-zinc-600 text-[10px]">DNP</span>
                  ) : propLine > 0 ? (
                    isOver ? (
                      <span className="text-emerald-400 font-bold text-xs">O</span>
                    ) : isUnder ? (
                      <span className="text-red-400 font-bold text-xs">U</span>
                    ) : (
                      <span className="text-amber-400 font-bold text-xs">P</span>
                    )
                  ) : (
                    <span className="text-zinc-700">—</span>
                  )}
                </td>
                {VISIBLE_STATS.map(({ key }) => {
                  const val = (game[key] as number | null) ?? 0;
                  const isHighlighted = key === highlightStat;
                  const cellColor = dnp
                    ? ""
                    : isHighlighted && propLine > 0
                      ? val > propLine
                        ? "text-emerald-400 font-bold"
                        : val < propLine
                          ? "text-red-400"
                          : "text-amber-400"
                      : "text-zinc-300";
                  return (
                    <td
                      key={key}
                      className={`text-right py-2 px-2 ${cellColor} ${
                        isHighlighted ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      {dnp ? "—" : val}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!showAll && sorted.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full py-3 md:py-2 text-base md:text-sm text-zinc-500 hover:text-white transition-colors border-t border-white/5"
        >
          Show all {sorted.length} games
        </button>
      )}
    </div>
  );
}
