"use client";
import type { HotScorerLastGame } from "@/lib/data";

// Format YYYY-MM-DD as "Mon D" without timezone shift (DB date is calendar date).
function formatGameDate(iso: string | null): string {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[month - 1]} ${day}`;
}

interface HottestHandsProps {
  scorers: HotScorerLastGame[];
  onSelectPlayer?: (name: string) => void;
}

export default function HottestHands({ scorers, onSelectPlayer }: HottestHandsProps) {
  if (scorers.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
        🔥 Hottest hands — most points in last game
      </h2>
      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          {scorers.map((s, i) => (
            <button
              key={s.playerName ?? `scorer-${i}`}
              type="button"
              onClick={() => s.playerName && onSelectPlayer?.(s.playerName)}
              className="flex-shrink-0 flex flex-col items-start gap-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-w-[180px] transition-colors hover:bg-white/10 hover:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left"
            >
              <span className="text-lg font-bold text-white truncate w-full">
                {s.playerName ?? "—"}
              </span>
              <span className="text-2xl font-black text-amber-400 tabular-nums">
                {s.points} <span className="text-sm font-semibold text-zinc-500">pts</span>
              </span>
              <span className="text-[10px] text-zinc-500">
                Last game · {formatGameDate(s.gameDate)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
