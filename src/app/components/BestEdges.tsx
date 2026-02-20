"use client";

import type { BestEdgePlayer } from "@/lib/data";

interface Props {
  players: BestEdgePlayer[];
  onSelectPlayer?: (name: string, seasonAvgPts?: number) => void;
}

export default function BestEdges({ players, onSelectPlayer }: Props) {
  if (players.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">&#x1F3AF;</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            Best Edges
          </h2>
          <p className="text-xs text-zinc-500">
            Highest hit rate at season average line (last 10 games, 60%+)
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/10">
              <th className="text-left py-3 px-4">Player</th>
              <th className="text-right py-3 px-3">Avg PTS</th>
              <th className="text-right py-3 px-3">Over</th>
              <th className="text-right py-3 px-3">Hit Rate</th>
              <th className="text-right py-3 px-4 hidden sm:table-cell">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const hitColor =
                p.hitRate >= 80
                  ? "text-emerald-400"
                  : p.hitRate >= 70
                    ? "text-emerald-500"
                    : "text-amber-400";
              const barWidth = Math.max(0, Math.min(100, p.hitRate));
              return (
                <tr
                  key={p.playerName}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  onClick={() =>
                    p.playerName && onSelectPlayer?.(p.playerName, p.seasonAvgPts)
                  }
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-white">
                      {p.playerName ?? "—"}
                    </span>
                  </td>
                  <td className="text-right py-3 px-3 text-zinc-300 font-mono">
                    {p.seasonAvgPts.toFixed(1)}
                  </td>
                  <td className="text-right py-3 px-3 text-zinc-400">
                    {p.overCount}/{p.gamesChecked}
                  </td>
                  <td className={`text-right py-3 px-3 font-bold ${hitColor}`}>
                    {p.hitRate}%
                  </td>
                  <td className="text-right py-3 px-4 hidden sm:table-cell">
                    <div className="inline-flex items-center gap-2 w-24">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.hitRate >= 80 ? "bg-emerald-500" : p.hitRate >= 70 ? "bg-emerald-600" : "bg-amber-500"
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
      </div>
    </section>
  );
}
