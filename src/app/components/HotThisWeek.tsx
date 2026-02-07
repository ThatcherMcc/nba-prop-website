"use client";
import type { HotScorer } from "@/lib/data";

interface HotThisWeekProps {
  scorers: HotScorer[];
  onSelectPlayer?: (name: string) => void;
}

export default function HotThisWeek({ scorers, onSelectPlayer }: HotThisWeekProps) {
  if (scorers.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
        🔥 Hot this week — top scorers
      </h2>
      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          {scorers.map((s, i) => (
            <button
              key={s.playerName ?? `scorer-${i}`}
              type="button"
              onClick={() => s.playerName && onSelectPlayer?.(s.playerName)}
              className="flex-shrink-0 flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-w-[180px] transition-colors hover:bg-white/10 hover:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <span className="text-lg font-bold text-white truncate">
                {s.playerName ?? "—"}
              </span>
              <span className="text-sm font-semibold text-blue-400 tabular-nums">
                {s.totalPts} pts
              </span>
              <span className="text-[10px] text-zinc-500">
                {s.games}G
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
