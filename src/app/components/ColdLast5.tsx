"use client";
import { useState } from "react";
import type { UnderSeasonAvgLast5 } from "@/lib/data";

interface ColdLast5Props {
  players: UnderSeasonAvgLast5[];
  onSelectPlayer?: (name: string, seasonAvgPts?: number) => void;
}

export default function ColdLast5({
  players,
  onSelectPlayer,
}: ColdLast5Props) {
  const [mobileIndex, setMobileIndex] = useState(0);

  if (players.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🧊</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
            Ice Cold
          </h2>
          <p className="text-xs text-pe-text-faint">
            Under season average in last 5 games — click to analyze
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
            className="flex flex-col items-start gap-2 rounded-xl bg-pe-surface-1/60 border border-pe-border/5 border-l-4 border-l-sky-500 px-5 py-4 transition-all hover:bg-sky-500/10 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-left cursor-pointer"
          >
            <span className="text-base font-bold text-pe-text-primary truncate w-full">
              {p.playerName ?? "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-sky-500/15 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-full">
              {typeof p.underCount === "number" ? p.underCount : "—"}/5 UNDER
            </span>
            <div className="w-full space-y-0.5">
              <div className="flex justify-between text-sm">
                <span className="text-pe-text-faint">Last 5</span>
                <span className="font-bold text-pe-text-primary">{p.last5AvgPts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-pe-text-faint">Season</span>
                <span className="text-pe-text-muted">{p.seasonAvgPts}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-pe-border/5">
                <span className="text-pe-text-faint">Diff</span>
                <span className="font-bold text-sky-400">{p.diff}</span>
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
            className="w-full flex flex-col items-start gap-2 rounded-xl bg-pe-surface-1/60 border border-pe-border/5 border-l-4 border-l-sky-500 px-5 py-5 text-left"
          >
            <span className="text-lg font-bold text-pe-text-primary truncate w-full">
              {players[mobileIndex]?.playerName ?? "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-sky-500/15 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-full">
              {typeof players[mobileIndex]?.underCount === "number"
                ? players[mobileIndex].underCount
                : "—"}
              /5 UNDER
            </span>
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-pe-text-faint">Last 5 Avg</span>
                <span className="font-bold text-pe-text-primary text-base">
                  {players[mobileIndex]?.last5AvgPts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-pe-text-faint">Season Avg</span>
                <span className="text-pe-text-muted">
                  {players[mobileIndex]?.seasonAvgPts}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-pe-border/5">
                <span className="text-pe-text-faint">Diff</span>
                <span className="font-bold text-sky-400">
                  {players[mobileIndex]?.diff}
                </span>
              </div>
            </div>
          </button>

          {/* Left arrow */}
          {mobileIndex > 0 && (
            <button
              type="button"
              onClick={() => setMobileIndex((i) => Math.max(0, i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-pe-surface-2/80 border border-pe-border/10 flex items-center justify-center text-pe-text-primary text-sm active:bg-zinc-700"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-pe-surface-2/80 border border-pe-border/10 flex items-center justify-center text-pe-text-primary text-sm active:bg-zinc-700"
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
                  i === mobileIndex ? "bg-sky-400" : "bg-pe-text-faint"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
