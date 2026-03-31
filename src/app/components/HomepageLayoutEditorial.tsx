"use client";

import { useState } from "react";
import FeaturedPlayer from "./FeaturedPlayer";
import TopPicks from "./TopPicks";
import UnderPicks from "./UnderPicks";
import type { BacktestPick } from "@/lib/data";
import {
  type HomepageLayoutProps,
  PickOfTheDayHero,
  StatBadge,
} from "./homepage-shared";

// ── Full-width Yesterday Scorecard ──────────────────────────────────────────

const COLLAPSED_COUNT = 5;

function FullScorecard({
  gameDate,
  picks,
}: {
  gameDate: string;
  picks: BacktestPick[];
}) {
  const [expanded, setExpanded] = useState(false);
  if (!picks.length) return null;

  const wins = picks.filter((p) => p.result === "win").length;
  const losses = picks.filter((p) => p.result === "loss").length;
  const graded = wins + losses;
  const winRate = graded > 0 ? Math.round((wins / graded) * 100) : 0;

  const winRateColor =
    winRate >= 65
      ? "text-emerald-400"
      : winRate >= 50
        ? "text-amber-400"
        : "text-red-400";
  const ringBg =
    winRate >= 65
      ? "border-emerald-500"
      : winRate >= 50
        ? "border-amber-500"
        : "border-red-500";

  const formattedDate = gameDate
    ? new Date(gameDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Yesterday";

  const visible = expanded ? picks : picks.slice(0, COLLAPSED_COUNT);
  const hasMore = picks.length > COLLAPSED_COUNT;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-pe-text-faint">
          Yesterday&apos;s Scorecard
        </span>
        <span className="text-[10px] text-pe-text-faint">{formattedDate}</span>
      </div>

      <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl overflow-hidden">
        {/* Summary strip */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-pe-border/10 flex-wrap">
          <div
            className={`w-14 h-14 rounded-full border-4 ${ringBg} flex items-center justify-center shrink-0`}
          >
            <span className={`text-lg font-black ${winRateColor}`}>
              {winRate}%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-pe-text-primary">
              <span className="text-emerald-400">{wins}W</span>
              <span className="text-pe-text-faint mx-1.5">-</span>
              <span className="text-red-400">{losses}L</span>
            </p>
            <p className="text-xs text-pe-text-faint">
              {graded} graded picks &middot; {picks.length - graded} ungraded
            </p>
          </div>
        </div>

        {/* Results table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
                <th className="text-left py-2.5 px-4">Player</th>
                <th className="text-left py-2.5 px-2">Side</th>
                <th className="text-left py-2.5 px-2">Stat</th>
                <th className="text-right py-2.5 px-3">Line</th>
                <th className="text-right py-2.5 px-3">Actual</th>
                <th className="text-right py-2.5 px-3 hidden sm:table-cell">
                  Pred
                </th>
                <th className="text-right py-2.5 px-4">Result</th>
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
                    className="border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-pe-text-primary whitespace-nowrap">
                      {p.playerName}
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          p.side === "over"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {p.side === "over" ? "OVR" : "UND"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <StatBadge code={p.marketCode} />
                    </td>
                    <td className="py-2.5 px-3 text-right text-pe-text-secondary font-mono">
                      {p.bookLine}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold ${
                        isDnp
                          ? "text-pe-text-faint"
                          : isWin
                            ? "text-emerald-400"
                            : isLoss
                              ? "text-red-400"
                              : "text-pe-text-muted"
                      }`}
                    >
                      {isDnp ? "\u2014" : (p.actualValue ?? "\u2014")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-pe-text-faint font-mono hidden sm:table-cell">
                      {p.hitRate}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold font-mono">
                      {isWin && (
                        <span className="text-emerald-400">&#x2713; W</span>
                      )}
                      {isLoss && (
                        <span className="text-red-400">&#x2717; L</span>
                      )}
                      {p.result === "push" && (
                        <span className="text-pe-text-faint">&#x2014; P</span>
                      )}
                      {isDnp && (
                        <span className="text-pe-text-faint">DNP</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full py-3 md:py-2 text-base md:text-sm font-bold text-pe-text-muted hover:text-pe-text-primary border-t border-pe-border/5 transition-colors"
          >
            {expanded ? "Show less" : `Show all ${picks.length} results`}
          </button>
        )}
      </div>
    </section>
  );
}

// ── HomepageLayoutEditorial ─────────────────────────────────────────────────

export default function HomepageLayoutEditorial({
  featuredPlayerName = "LeBron James",
  featuredPlayerData = [],
  topPicks = [],
  underPicks = [],
  defensiveRatings = [],
  propDate = null,
  backtestResults = { gameDate: "", picks: [] },
  hasError = false,
  goToPlayer,
}: HomepageLayoutProps) {
  const heroPickExists = topPicks.length > 0;

  return (
    <div className="w-full">
      {/* Find Your Edge intro */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-pe-text-primary leading-tight">
          Find Your Edge
        </h1>
        <p className="text-sm text-pe-text-muted mt-1.5 italic whitespace-nowrap">
          Past performance doesn&apos;t guarantee future results, but it&apos;s been making us money.
        </p>
      </div>

      {/* Error banner */}
      {hasError && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6 text-amber-200 text-sm">
          We&apos;re having trouble loading data right now. Updates run daily at
          3:00 AM ET &mdash; please try again shortly.
        </div>
      )}

      {/* Empty state */}
      {!hasError && topPicks.length === 0 && underPicks.length === 0 && (
        <div className="rounded-xl bg-pe-surface-1/60 border border-pe-border/5 p-6 text-center text-pe-text-muted text-sm mb-8">
          No games scheduled today. Check back tomorrow for fresh picks.
        </div>
      )}

      {/* 1. Pick of the Day — front and center */}
      {!hasError && heroPickExists && (
        <PickOfTheDayHero
          pick={topPicks[0]}
          propDate={propDate}
          goToPlayer={goToPlayer}
        />
      )}

      {/* 2. Top Picks — Overs left, Unders right */}
      {!hasError && (topPicks.length > 0 || underPicks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <TopPicks
            picks={topPicks}
            defensiveRatings={defensiveRatings}
            propDate={propDate}
            onSelectPlayer={(name, stat, line) =>
              goToPlayer(name, 10, stat, line ?? undefined)
            }
          />
          <UnderPicks
            picks={underPicks}
            defensiveRatings={defensiveRatings}
            propDate={propDate}
            onSelectPlayer={(name, stat, line) =>
              goToPlayer(name, 10, stat, line ?? undefined)
            }
          />
        </div>
      )}

      {/* 3. Full-width Yesterday's Scorecard */}
      {!hasError && backtestResults.picks.length > 0 && (
        <FullScorecard
          gameDate={backtestResults.gameDate}
          picks={backtestResults.picks}
        />
      )}

      {/* Divider */}
      <div className="border-t border-pe-border/5 my-10" />

      {/* GOAT section */}
      <FeaturedPlayer
        playerName={featuredPlayerName}
        data={featuredPlayerData}
      />
    </div>
  );
}
