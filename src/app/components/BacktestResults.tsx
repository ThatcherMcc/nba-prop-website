"use client";

import { useState } from "react";
import type { BacktestResult } from "@/lib/data";

const STAT_COLORS: Record<string, string> = {
  PTS: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  REB: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  AST: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  STL: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  BLK: "bg-red-500/15 text-red-400 border-red-500/30",
  FG3: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  PRA: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

function getStatColor(code: string) {
  return STAT_COLORS[code] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
}

const COLLAPSED_COUNT = 10;

export default function BacktestResults({ data }: { data: BacktestResult }) {
  const [expanded, setExpanded] = useState(false);

  if (!data.picks.length) return null;

  const overPicks = data.picks.filter((p) => p.side === "over");
  const underPicks = data.picks.filter((p) => p.side === "under");

  const overWins = overPicks.filter((p) => p.result === "win").length;
  const overLosses = overPicks.filter((p) => p.result === "loss").length;
  const underWins = underPicks.filter((p) => p.result === "win").length;
  const underLosses = underPicks.filter((p) => p.result === "loss").length;
  const totalWins = overWins + underWins;
  const totalLosses = overLosses + underLosses;
  const totalGraded = totalWins + totalLosses;
  const winRate =
    totalGraded > 0 ? Math.round((totalWins / totalGraded) * 100) : 0;

  const formatted = data.gameDate
    ? new Date(data.gameDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Yesterday";

  const allPicks = [...overPicks, ...underPicks];
  const visible = expanded ? allPicks : allPicks.slice(0, COLLAPSED_COUNT);
  const hasMore = allPicks.length > COLLAPSED_COUNT;

  const winRateColor =
    winRate >= 65
      ? "text-emerald-400"
      : winRate >= 50
        ? "text-amber-400"
        : "text-red-400";

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">&#x1F4CA;</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            Yesterday&apos;s Results
          </h2>
          <p className="text-xs text-zinc-500">
            How our picks performed on {formatted}
          </p>
        </div>
      </div>

      {/* Summary banner */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mb-3">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${winRateColor}`}>
              {winRate}%
            </span>
            <span className="text-sm text-zinc-500">Win Rate</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-sm">
            <span className="text-emerald-400 font-bold">{totalWins}W</span>
            <span className="text-zinc-600 mx-1">-</span>
            <span className="text-red-400 font-bold">{totalLosses}L</span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex gap-4 text-xs text-zinc-500">
            <span>
              Over:{" "}
              <span className="text-zinc-300 font-medium">
                {overWins}-{overLosses}
              </span>
            </span>
            <span>
              Under:{" "}
              <span className="text-zinc-300 font-medium">
                {underWins}-{underLosses}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/10">
              <th className="text-left py-3 px-4">Player</th>
              <th className="text-left py-3 px-3">Side</th>
              <th className="text-left py-3 px-3">Stat</th>
              <th className="text-right py-3 px-3">Line</th>
              <th className="text-right py-3 px-3">Actual</th>
              <th className="text-right py-3 px-3">Pred</th>
              <th className="text-right py-3 px-4">Result</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => {
              const isWin = p.result === "win";
              const isLoss = p.result === "loss";
              const isDnp = p.result === "dnp";

              return (
                <tr
                  key={`${p.playerName}-${p.marketCode}-${p.side}-${i}`}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-white">
                      {p.playerName}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        p.side === "over"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {p.side === "over" ? "OVR" : "UND"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatColor(p.marketCode)}`}
                    >
                      {p.marketCode}
                    </span>
                  </td>
                  <td className="text-right py-3 px-3 text-zinc-300 font-mono">
                    {p.bookLine}
                  </td>
                  <td
                    className={`text-right py-3 px-3 font-mono font-bold ${
                      isDnp
                        ? "text-zinc-600"
                        : isWin
                          ? "text-emerald-400"
                          : isLoss
                            ? "text-red-400"
                            : "text-zinc-400"
                    }`}
                  >
                    {isDnp ? "—" : p.actualValue}
                  </td>
                  <td className="text-right py-3 px-3 text-zinc-500 text-xs">
                    {p.hitRate}%
                  </td>
                  <td className="text-right py-3 px-4">
                    {isWin && (
                      <span className="text-emerald-400 font-bold text-xs">
                        &#x2713; W
                      </span>
                    )}
                    {isLoss && (
                      <span className="text-red-400 font-bold text-xs">
                        &#x2717; L
                      </span>
                    )}
                    {p.result === "push" && (
                      <span className="text-zinc-500 font-bold text-xs">
                        &#x2014; P
                      </span>
                    )}
                    {isDnp && (
                      <span className="text-zinc-600 text-xs">DNP</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-white border-t border-white/5 transition-colors"
          >
            {expanded
              ? "Show less"
              : `Show all ${allPicks.length} results`}
          </button>
        )}
      </div>
    </section>
  );
}
