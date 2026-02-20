"use client";
import type { TrendingPlayer } from "@/lib/data";

interface TrendingPlayersProps {
  players: TrendingPlayer[];
  onSelectPlayer?: (name: string, last3AvgPts?: number) => void;
}

export default function TrendingPlayers({
  players,
  onSelectPlayer,
}: TrendingPlayersProps) {
  if (players.length === 0) return null;

  const doubled = [...players, ...players];

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🚀</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            Trending Up
          </h2>
          <p className="text-xs text-zinc-500">
            Last 3 games avg above previous 3 — momentum plays
          </p>
        </div>
      </div>

      <div className="overflow-hidden group rounded-2xl bg-zinc-900/60 border border-white/5 p-4">
        <div className="flex gap-4 animate-marquee w-max">
          {doubled.map((p, i) => (
            <button
              key={`${p.playerName}-${i}`}
              type="button"
              onClick={() =>
                p.playerName && onSelectPlayer?.(p.playerName, p.last3AvgPts)
              }
              className="flex-shrink-0 flex flex-col items-start gap-2 rounded-xl bg-white/5 border-l-4 border-amber-500 px-5 py-4 min-w-[220px] transition-all hover:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left cursor-pointer"
            >
              <span className="text-base font-bold text-white truncate w-full">
                {p.playerName ?? "—"}
              </span>

              <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
                +{p.diff} PPG
              </span>

              <div className="w-full space-y-0.5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Last 3</span>
                  <span className="font-bold text-white">{p.last3AvgPts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Prev 3</span>
                  <span className="text-zinc-400">{p.prev3AvgPts}</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-white/5">
                  <span className="text-zinc-500">Jump</span>
                  <span className="font-bold text-amber-400">+{p.diff}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
