"use client";
import type { UnderSeasonAvgLast5 } from "@/lib/data";

interface ColdLast5Props {
  players: UnderSeasonAvgLast5[];
  onSelectPlayer?: (name: string, seasonAvgPts?: number) => void;
}

export default function ColdLast5({
  players,
  onSelectPlayer,
}: ColdLast5Props) {
  if (players.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
        🧊 Cold last 5 — below season average (points)
      </h2>
      <p className="text-xs text-zinc-500 mb-3 max-w-xl">
        Players whose last 5 (played) games were under their season average in
        5/5 or 4/5 of those games. DNPs excluded. Season average ≥ 8 ppg.
        Sorted by consistency (5/5 first) then by season average. Click to
        analyze.
      </p>
      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          {players.map((p, i) => (
            <button
              key={p.playerName ?? `player-${i}`}
              type="button"
              onClick={() =>
                p.playerName && onSelectPlayer?.(p.playerName, p.seasonAvgPts)
              }
              className="flex-shrink-0 flex flex-col items-start gap-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-w-[180px] transition-colors hover:bg-white/10 hover:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-left"
            >
              <span className="text-lg font-bold text-white truncate w-full">
                {p.playerName ?? "—"}
              </span>
              <span className="text-sm text-zinc-400">
                <span className="font-semibold text-sky-400">
                  {typeof p.underCount === "number" ? p.underCount : "—"}/5
                </span>{" "}
                games under season avg
              </span>
              <span className="text-sm text-zinc-400">
                Last 5:{" "}
                <span className="font-semibold text-white">{p.last5AvgPts}</span>{" "}
                pts/gm · Season:{" "}
                <span className="text-zinc-500">{p.seasonAvgPts}</span>
              </span>
              <span className="text-sm text-zinc-400">
                <span className="text-sky-400 font-medium">{p.diff}</span> vs
                season
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
