"use client";

import { useState } from "react";
import type { UnderPick } from "@/lib/data";

const MARKET_TO_STAT: Record<string, string> = {
  PTS: "pts", REB: "trb", AST: "ast", STL: "stl", BLK: "blk",
  FG3: "fg3", FTM: "ft", TOV: "tov", PRA: "pra", PR: "pr",
  PA: "pa", RA: "ra", SB: "sb",
};

interface Props {
  picks: UnderPick[];
  onSelectPlayer?: (name: string, stat?: string, line?: number) => void;
}

const STAT_COLORS: Record<string, string> = {
  PTS: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  REB: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  AST: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  STL: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  BLK: "bg-red-500/15 text-red-400 border-red-500/30",
  FG3: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  PRA: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

function getStatColor(code: string) {
  return STAT_COLORS[code] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
}

const COLLAPSED_COUNT = 10;

export default function UnderPicks({ picks, onSelectPlayer }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (picks.length === 0) return null;

  const visible = expanded ? picks : picks.slice(0, COLLAPSED_COUNT);
  const hasMore = picks.length > COLLAPSED_COUNT;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">&#x1F4C9;</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            Top Picks — Under
          </h2>
          <p className="text-xs text-zinc-500">
            Highest under hit rates at today&apos;s book lines (last 10 games, 60%+)
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/10">
              <th className="text-left py-3 px-4">Player</th>
              <th className="text-left py-3 px-3">Stat</th>
              <th className="text-right py-3 px-3">Line</th>
              <th className="text-right py-3 px-3">Under</th>
              <th className="text-right py-3 px-3">Hit Rate</th>
              <th className="text-right py-3 px-4 hidden sm:table-cell">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => {
              const hitColor =
                p.hitRate >= 80
                  ? "text-rose-400"
                  : p.hitRate >= 70
                    ? "text-rose-500"
                    : "text-amber-400";
              const barWidth = Math.max(0, Math.min(100, p.hitRate));
              const statKey = MARKET_TO_STAT[p.marketCode];
              return (
                <tr
                  key={`${p.playerName}-${p.marketCode}-${i}`}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  onClick={() =>
                    onSelectPlayer?.(p.playerName, statKey, p.bookLine)
                  }
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-white">
                      {p.playerName}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatColor(p.marketCode)}`}
                    >
                      {p.marketCode}
                    </span>
                  </td>
                  <td className="text-right py-3 px-3 text-zinc-300 font-mono">
                    {p.bookLine}
                  </td>
                  <td className="text-right py-3 px-3 text-zinc-400">
                    {p.underCount}/{p.gamesChecked}
                  </td>
                  <td className={`text-right py-3 px-3 font-bold ${hitColor}`}>
                    {p.hitRate}%
                  </td>
                  <td className="text-right py-3 px-4 hidden sm:table-cell">
                    <div className="inline-flex items-center gap-2 w-24">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.hitRate >= 80 ? "bg-rose-500" : p.hitRate >= 70 ? "bg-rose-600" : "bg-amber-500"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-white border-t border-white/5 transition-colors"
          >
            {expanded ? "Show less" : `Show all ${picks.length} picks`}
          </button>
        )}
      </div>
    </section>
  );
}
