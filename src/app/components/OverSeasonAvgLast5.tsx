"use client";
import { useState } from "react";
import type { OverSeasonAvgLast5 as OverSeasonAvgLast5Type } from "@/lib/data";

interface OverSeasonAvgLast5Props {
  players: OverSeasonAvgLast5Type[];
  onSelectPlayer?: (name: string, seasonAvgPts?: number) => void;
}

export default function OverSeasonAvgLast5({
  players,
  onSelectPlayer,
}: OverSeasonAvgLast5Props) {
  const [mobileIndex, setMobileIndex] = useState(0);

  if (players.length === 0) return null;

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

      {/* Desktop: Grid layout showing all cards */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {players.map((p) => (
          <button
            key={p.playerName}
            type="button"
            onClick={() =>
              p.playerName && onSelectPlayer?.(p.playerName, p.seasonAvgPts)
            }
            className="flex flex-col items-start gap-2 rounded-xl bg-zinc-900/60 border border-white/5 border-l-4 border-l-emerald-500 px-5 py-4 transition-all hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-left cursor-pointer"
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

      {/* Mobile: Single card with arrows + dots */}
      <div className="md:hidden">
        <div className="relative">
          {/* Card */}
          <button
            type="button"
            onClick={() => {
              const p = players[mobileIndex];
              if (p?.playerName) onSelectPlayer?.(p.playerName, p.seasonAvgPts);
            }}
            className="w-full flex flex-col items-start gap-2 rounded-xl bg-zinc-900/60 border border-white/5 border-l-4 border-l-emerald-500 px-5 py-5 text-left"
          >
            <span className="text-lg font-bold text-white truncate w-full">
              {players[mobileIndex]?.playerName ?? "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
              {typeof players[mobileIndex]?.overCount === "number"
                ? players[mobileIndex].overCount
                : "—"}
              /5 OVER
            </span>
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Last 5 Avg</span>
                <span className="font-bold text-white text-base">
                  {players[mobileIndex]?.last5AvgPts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Season Avg</span>
                <span className="text-zinc-400">
                  {players[mobileIndex]?.seasonAvgPts}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-white/5">
                <span className="text-zinc-500">Diff</span>
                <span className="font-bold text-emerald-400">
                  +{players[mobileIndex]?.diff}
                </span>
              </div>
            </div>
          </button>

          {/* Left arrow */}
          {mobileIndex > 0 && (
            <button
              type="button"
              onClick={() => setMobileIndex((i) => Math.max(0, i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-white text-sm active:bg-zinc-700"
              aria-label="Previous player"
            >
              ‹
            </button>
          )}

          {/* Right arrow */}
          {mobileIndex < players.length - 1 && (
            <button
              type="button"
              onClick={() =>
                setMobileIndex((i) => Math.min(players.length - 1, i + 1))
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-white text-sm active:bg-zinc-700"
              aria-label="Next player"
            >
              ›
            </button>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center mt-3">
          {players.map((p, i) => (
            <button
              key={p.playerName}
              type="button"
              onClick={() => setMobileIndex(i)}
              className="flex items-center justify-center p-3"
              aria-label={`Go to ${p.playerName}`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === mobileIndex ? "bg-emerald-400" : "bg-zinc-700"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
