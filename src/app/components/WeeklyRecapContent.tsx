"use client";

import { useState } from "react";
import Link from "next/link";
import type { WeeklyRecap, WeeklyPlayerPerformance, WeeklyRecapPick } from "@/lib/data";

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}


interface Props {
  recap: WeeklyRecap;
  hotPlayers: WeeklyPlayerPerformance[];
  coldPlayers: WeeklyPlayerPerformance[];
}

const PICKS_COLLAPSED = 10;

export default function WeeklyRecapContent({ recap, hotPlayers, coldPlayers }: Props) {
  const [picksExpanded, setPicksExpanded] = useState(false);

  const { wins, losses, pushes, dnps, winRate, picks, dailyBreakdown } = recap;

  const winRateColor =
    winRate >= 65
      ? "text-emerald-400"
      : winRate >= 50
        ? "text-amber-400"
        : "text-red-400";

  const overPicks = picks.filter((p) => p.side === "over");
  const underPicks = picks.filter((p) => p.side === "under");
  const overWins = overPicks.filter((p) => p.result === "win").length;
  const overLosses = overPicks.filter((p) => p.result === "loss").length;
  const underWins = underPicks.filter((p) => p.result === "win").length;
  const underLosses = underPicks.filter((p) => p.result === "loss").length;

  // Best picks: wins sorted by margin descending
  const bestPicks = picks
    .filter((p) => p.result === "win" && p.margin !== null)
    .sort((a, b) => (b.margin ?? 0) - (a.margin ?? 0))
    .slice(0, 5);

  // Worst misses: losses sorted by margin ascending (most negative first)
  const worstPicks = picks
    .filter((p) => p.result === "loss" && p.margin !== null)
    .sort((a, b) => (a.margin ?? 0) - (b.margin ?? 0))
    .slice(0, 5);

  const allPicks = [...overPicks, ...underPicks];
  const visiblePicks = picksExpanded ? allPicks : allPicks.slice(0, PICKS_COLLAPSED);
  const hasMorePicks = allPicks.length > PICKS_COLLAPSED;

  return (
    <div className="space-y-10">
      {/* 1. Hero banner */}
      <section>
        <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black ${winRateColor}`}>
                {winRate}%
              </span>
              <span className="text-sm text-pe-text-faint">Win Rate</span>
            </div>

            <div className="h-8 w-px bg-pe-border/10 hidden sm:block" />

            <div className="text-sm">
              <span className="text-emerald-400 font-bold">{wins}W</span>
              <span className="text-pe-text-faint mx-1">-</span>
              <span className="text-red-400 font-bold">{losses}L</span>
              {pushes > 0 && (
                <>
                  <span className="text-pe-text-faint mx-1">-</span>
                  <span className="text-pe-text-muted font-bold">{pushes}P</span>
                </>
              )}
            </div>

            <div className="h-px w-full sm:h-8 sm:w-px bg-pe-border/10" />

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-pe-text-faint">
              <span>
                Over:{" "}
                <span className="text-pe-text-secondary font-medium">
                  {overWins}-{overLosses}
                </span>
              </span>
              <span>
                Under:{" "}
                <span className="text-pe-text-secondary font-medium">
                  {underWins}-{underLosses}
                </span>
              </span>
              {dnps > 0 && (
                <span>
                  DNP: <span className="text-pe-text-secondary font-medium">{dnps}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Daily breakdown table */}
      {dailyBreakdown.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">&#x1F4C5;</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
                Daily Breakdown
              </h2>
              <p className="text-xs text-pe-text-faint">
                Win-loss by game date
              </p>
            </div>
          </div>

          <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-3">W</th>
                  <th className="text-right py-3 px-3">L</th>
                  <th className="text-right py-3 px-3">P</th>
                  <th className="text-right py-3 px-4">Win%</th>
                </tr>
              </thead>
              <tbody>
                {dailyBreakdown.map((day) => {
                  const graded = day.wins + day.losses;
                  const dayRate = graded > 0 ? Math.round((day.wins / graded) * 100) : null;
                  const dayColor =
                    dayRate === null
                      ? "text-pe-text-faint"
                      : dayRate >= 65
                        ? "text-emerald-400"
                        : dayRate >= 50
                          ? "text-amber-400"
                          : "text-red-400";
                  return (
                    <tr
                      key={day.date}
                      className="border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-pe-text-primary">
                        {formatDate(day.date)}
                      </td>
                      <td className="text-right py-3 px-3 text-emerald-400 font-bold">
                        {day.wins}
                      </td>
                      <td className="text-right py-3 px-3 text-red-400 font-bold">
                        {day.losses}
                      </td>
                      <td className="text-right py-3 px-3 text-pe-text-muted font-bold">
                        {day.pushes}
                      </td>
                      <td className={`text-right py-3 px-4 font-bold ${dayColor}`}>
                        {dayRate !== null ? `${dayRate}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3. Best picks */}
      {bestPicks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">&#x2705;</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
                Best Picks
              </h2>
              <p className="text-xs text-pe-text-faint">
                Top 5 wins by margin
              </p>
            </div>
          </div>

          <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-left py-3 px-3">Stat</th>
                  <th className="text-left py-3 px-3">Side</th>
                  <th className="text-right py-3 px-3">Line</th>
                  <th className="text-right py-3 px-3">Actual</th>
                  <th className="text-right py-3 px-3 hidden sm:table-cell">Date</th>
                  <th className="text-right py-3 px-4">Margin</th>
                </tr>
              </thead>
              <tbody>
                {bestPicks.map((p, i) => (
                  <PickRow key={`best-${i}`} pick={p} accent="emerald" />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4. Worst misses */}
      {worstPicks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">&#x274C;</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
                Worst Misses
              </h2>
              <p className="text-xs text-pe-text-faint">
                Bottom 5 losses by margin
              </p>
            </div>
          </div>

          <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-left py-3 px-3">Stat</th>
                  <th className="text-left py-3 px-3">Side</th>
                  <th className="text-right py-3 px-3">Line</th>
                  <th className="text-right py-3 px-3">Actual</th>
                  <th className="text-right py-3 px-3 hidden sm:table-cell">Date</th>
                  <th className="text-right py-3 px-4">Margin</th>
                </tr>
              </thead>
              <tbody>
                {worstPicks.map((p, i) => (
                  <PickRow key={`worst-${i}`} pick={p} accent="red" />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 5. Full picks log */}
      {allPicks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">&#x1F4CA;</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
                All Picks
              </h2>
              <p className="text-xs text-pe-text-faint">
                Every graded pick from the week
              </p>
            </div>
          </div>

          <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
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
                {visiblePicks.map((p, i) => {
                  const isWin = p.result === "win";
                  const isLoss = p.result === "loss";
                  const isDnp = p.result === "dnp";

                  return (
                    <tr
                      key={`all-${p.playerName}-${p.marketCode}-${p.side}-${i}`}
                      className="border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link href={`/player/${encodeURIComponent(p.playerName)}`} className="font-bold text-pe-text-primary hover:text-pe-accent transition-colors">
                          {p.playerName}
                        </Link>
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
                      <td className="text-right py-3 px-3 text-pe-text-secondary font-mono">
                        {p.bookLine}
                      </td>
                      <td
                        className={`text-right py-3 px-3 font-mono font-bold ${
                          isDnp
                            ? "text-pe-text-faint"
                            : isWin
                              ? "text-emerald-400"
                              : isLoss
                                ? "text-red-400"
                                : "text-pe-text-muted"
                        }`}
                      >
                        {isDnp ? "\u2014" : p.actualValue}
                      </td>
                      <td className="text-right py-3 px-3 text-pe-text-faint text-xs">
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
                          <span className="text-pe-text-faint font-bold text-xs">
                            &#x2014; P
                          </span>
                        )}
                        {isDnp && (
                          <span className="text-pe-text-faint text-xs">DNP</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {hasMorePicks && (
              <button
                type="button"
                onClick={() => setPicksExpanded((v) => !v)}
                className="w-full py-2.5 text-xs font-bold text-pe-text-muted hover:text-pe-text-primary border-t border-pe-border/5 transition-colors"
              >
                {picksExpanded
                  ? "Show less"
                  : `Show all ${allPicks.length} results`}
              </button>
            )}
          </div>
        </section>
      )}

      {/* 6. Hot players of the week */}
      {hotPlayers.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">&#x1F525;</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
                Hot Players
              </h2>
              <p className="text-xs text-pe-text-faint">
                Players who outperformed their season average this week
              </p>
            </div>
          </div>

          <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-right py-3 px-3">Games</th>
                  <th className="text-right py-3 px-3">Week Avg</th>
                  <th className="text-right py-3 px-3">Season Avg</th>
                  <th className="text-right py-3 px-4">Diff</th>
                </tr>
              </thead>
              <tbody>
                {hotPlayers.map((pl, i) => (
                  <tr
                    key={`hot-${i}`}
                    className="border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link href={`/player/${encodeURIComponent(pl.playerName)}`} className="font-bold text-pe-text-primary hover:text-pe-accent transition-colors">
                        {pl.playerName}
                      </Link>
                    </td>
                    <td className="text-right py-3 px-3 text-pe-text-muted">
                      {pl.gamesPlayed}
                    </td>
                    <td className="text-right py-3 px-3 font-mono font-bold text-pe-text-secondary">
                      {pl.weekAvgPts.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-3 font-mono text-pe-text-muted">
                      {pl.seasonAvgPts.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-4 font-bold font-mono text-emerald-400">
                      +{pl.diff.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 7. Cold players of the week */}
      {coldPlayers.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">&#x2744;&#xFE0F;</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
                Cold Players
              </h2>
              <p className="text-xs text-pe-text-faint">
                Players who fell below their season average this week
              </p>
            </div>
          </div>

          <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-right py-3 px-3">Games</th>
                  <th className="text-right py-3 px-3">Week Avg</th>
                  <th className="text-right py-3 px-3">Season Avg</th>
                  <th className="text-right py-3 px-4">Diff</th>
                </tr>
              </thead>
              <tbody>
                {coldPlayers.map((pl, i) => (
                  <tr
                    key={`cold-${i}`}
                    className="border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link href={`/player/${encodeURIComponent(pl.playerName)}`} className="font-bold text-pe-text-primary hover:text-pe-accent transition-colors">
                        {pl.playerName}
                      </Link>
                    </td>
                    <td className="text-right py-3 px-3 text-pe-text-muted">
                      {pl.gamesPlayed}
                    </td>
                    <td className="text-right py-3 px-3 font-mono font-bold text-pe-text-secondary">
                      {pl.weekAvgPts.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-3 font-mono text-pe-text-muted">
                      {pl.seasonAvgPts.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-4 font-bold font-mono text-red-400">
                      {pl.diff.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

// Sub-component for best/worst pick rows
function PickRow({
  pick,
  accent,
}: {
  pick: WeeklyRecapPick;
  accent: "emerald" | "red";
}) {
  const accentClass = accent === "emerald" ? "text-emerald-400" : "text-red-400";
  const marginSign = accent === "emerald" ? "+" : "";

  return (
    <tr className="border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors">
      <td className="py-3 px-4">
        <Link href={`/player/${encodeURIComponent(pick.playerName)}`} className="font-bold text-pe-text-primary hover:text-pe-accent transition-colors">
          {pick.playerName}
        </Link>
      </td>
      <td className="py-3 px-3">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatColor(pick.marketCode)}`}
        >
          {pick.marketCode}
        </span>
      </td>
      <td className="py-3 px-3">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            pick.side === "over"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
          }`}
        >
          {pick.side === "over" ? "OVR" : "UND"}
        </span>
      </td>
      <td className="text-right py-3 px-3 font-mono text-pe-text-secondary">
        {pick.bookLine}
      </td>
      <td className={`text-right py-3 px-3 font-mono font-bold ${accentClass}`}>
        {pick.actualValue ?? "\u2014"}
      </td>
      <td className="text-right py-3 px-3 text-pe-text-faint text-xs hidden sm:table-cell">
        {pick.gameDate
          ? new Date(pick.gameDate + "T12:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "\u2014"}
      </td>
      <td className={`text-right py-3 px-4 font-bold font-mono ${accentClass}`}>
        {pick.margin !== null
          ? `${marginSign}${pick.margin.toFixed(1)}`
          : "\u2014"}
      </td>
    </tr>
  );
}
