"use client";
import type { OverSeasonAvgLast5 as OverSeasonAvgLast5Type } from "@/lib/data";

interface OverSeasonAvgLast5Props {
  players: OverSeasonAvgLast5Type[];
  onSelectPlayer?: (name: string, seasonAvgPts?: number) => void;
}

export default function OverSeasonAvgLast5({
  players,
  onSelectPlayer,
}: OverSeasonAvgLast5Props) {
  if (players.length === 0) return null;

  const doubled = [...players, ...players];

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔥</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            Riding Hot
          </h2>
          <p className="text-xs text-zinc-500">
            Over season average in 4 or 5 of last 5 games — click to analyze
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
                p.playerName && onSelectPlayer?.(p.playerName, p.seasonAvgPts)
              }
              className="flex-shrink-0 flex flex-col items-start gap-2 rounded-xl bg-white/5 border-l-4 border-emerald-500 px-5 py-4 min-w-[220px] transition-all hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-left cursor-pointer"
            >
              <span className="text-base font-bold text-white truncate w-full">
                {p.playerName ?? "—"}
              </span>

              <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
                {typeof p.overCount === "number" ? p.overCount : "—"}/5 OVER
              </span>

              <div className="w-full space-y-0.5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Last 5</span>
                  <span className="font-bold text-white">{p.last5AvgPts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Season</span>
                  <span className="text-zinc-400">{p.seasonAvgPts}</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-white/5">
                  <span className="text-zinc-500">Diff</span>
                  <span className="font-bold text-emerald-400">+{p.diff}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
