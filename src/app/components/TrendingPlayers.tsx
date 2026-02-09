"use client";
import type { TrendingPlayer } from "@/lib/data";

interface TrendingPlayersProps {
  players: TrendingPlayer[];
  onSelectPlayer?: (name: string) => void;
}

export default function TrendingPlayers({
  players,
  onSelectPlayer,
}: TrendingPlayersProps) {
  if (players.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
        📈 Trending — last 3 vs previous 3 games (points)
      </h2>
      <p className="text-xs text-zinc-500 mb-3 max-w-xl">
        Players whose last 3-game average is above their previous 3-game average.
        Click to analyze.
      </p>
      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          {players.map((p, i) => (
            <button
              key={p.playerName ?? `player-${i}`}
              type="button"
              onClick={() => p.playerName && onSelectPlayer?.(p.playerName)}
              className="flex-shrink-0 flex flex-col items-start gap-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-w-[180px] transition-colors hover:bg-white/10 hover:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left"
            >
              <span className="text-lg font-bold text-white truncate w-full">
                {p.playerName ?? "—"}
              </span>
              <span className="text-sm text-zinc-400">
                Last 3:{" "}
                <span className="font-semibold text-white">{p.last3AvgPts}</span>{" "}
                pts/gm
              </span>
              <span className="text-sm text-zinc-400">
                Prev 3: <span className="text-zinc-500">{p.prev3AvgPts}</span> ·{" "}
                <span className="text-amber-400 font-medium">+{p.diff}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
