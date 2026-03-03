"use client";
import { useState } from "react";
import type { TrendingPlayer } from "@/lib/data";

interface TrendingPlayersProps {
  players: TrendingPlayer[];
  onSelectPlayer?: (name: string, last3AvgPts?: number) => void;
}

export default function TrendingPlayers({
  players,
  onSelectPlayer,
}: TrendingPlayersProps) {
  const [mobileIndex, setMobileIndex] = useState(0);

  if (players.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🚀</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            Trending Up
          </h2>
          <p className="text-xs text-zinc-500">
            Last 3 games avg above previous 3 — click to analyze
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
              p.playerName && onSelectPlayer?.(p.playerName, p.last3AvgPts)
            }
            className="flex flex-col items-start gap-2 rounded-xl bg-zinc-900/60 border border-white/5 border-l-4 border-l-amber-500 px-5 py-4 transition-all hover:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left cursor-pointer"
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
                <span className="text-zinc-500">Diff</span>
                <span className="font-bold text-amber-400">+{p.diff}</span>
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
              if (p?.playerName) onSelectPlayer?.(p.playerName, p.last3AvgPts);
            }}
            className="w-full flex flex-col items-start gap-2 rounded-xl bg-zinc-900/60 border border-white/5 border-l-4 border-l-amber-500 px-5 py-5 text-left"
          >
            <span className="text-lg font-bold text-white truncate w-full">
              {players[mobileIndex]?.playerName ?? "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
              +{players[mobileIndex]?.diff} PPG
            </span>
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Last 3</span>
                <span className="font-bold text-white text-base">
                  {players[mobileIndex]?.last3AvgPts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Prev 3</span>
                <span className="text-zinc-400">
                  {players[mobileIndex]?.prev3AvgPts}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-white/5">
                <span className="text-zinc-500">Diff</span>
                <span className="font-bold text-amber-400">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-white text-sm active:bg-zinc-700"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-white text-sm active:bg-zinc-700"
              aria-label="Next player"
            >
              ›
            </button>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {players.map((p, i) => (
            <button
              key={p.playerName}
              type="button"
              onClick={() => setMobileIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === mobileIndex ? "bg-amber-400" : "bg-zinc-700"
              }`}
              aria-label={`Go to ${p.playerName}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
