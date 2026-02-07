"use client";
import type { OverSeasonAvgLast5 as OverSeasonAvgLast5Type } from "@/lib/data";

interface OverSeasonAvgLast5Props {
  players: OverSeasonAvgLast5Type[];
  onSelectPlayer?: (name: string) => void;
}

export default function OverSeasonAvgLast5({
  players,
  onSelectPlayer,
}: OverSeasonAvgLast5Props) {
  if (players.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
        📈 Over season average — last 5 games (points)
      </h2>
      <p className="text-xs text-zinc-500 mb-3 max-w-xl">
        These players are averaging more points in their last 5 games than
        their full-season average. Click to analyze.
      </p>
      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          {players.map((p, i) => (
            <button
              key={p.playerName ?? `player-${i}`}
              type="button"
              onClick={() => p.playerName && onSelectPlayer?.(p.playerName)}
              className="flex-shrink-0 flex flex-col items-start gap-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-w-[180px] transition-colors hover:bg-white/10 hover:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-left"
            >
              <span className="text-lg font-bold text-white truncate w-full">
                {p.playerName ?? "—"}
              </span>
              <span className="text-sm text-zinc-400">
                Last 5:{" "}
                <span className="font-semibold text-white">{p.last5AvgPts}</span>{" "}
                pts/gm
              </span>
              <span className="text-sm text-zinc-400">
                Season: <span className="text-zinc-500">{p.seasonAvgPts}</span> ·{" "}
                <span className="text-emerald-400 font-medium">+{p.diff}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
