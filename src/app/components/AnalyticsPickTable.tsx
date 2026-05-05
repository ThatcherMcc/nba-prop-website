"use client";

import { useState } from "react";
import type { TeamDefensiveRating, TopPick, UnderPick } from "@/lib/data";
import { getDefenseMarketInfo } from "@/lib/defense";

const MARKET_TO_STAT: Record<string, string> = {
  PTS: "pts",
  REB: "trb",
  AST: "ast",
  STL: "stl",
  BLK: "blk",
  FG3: "fg3",
  FTM: "ft",
  TOV: "tov",
  PRA: "pra",
  PR: "pr",
  PA: "pa",
  RA: "ra",
  SB: "sb",
  MLB_HITS: "hits",
  MLB_TB: "tb",
  MLB_HR: "hr",
  MLB_RBI: "rbi",
  MLB_RUNS: "runs",
  MLB_WALKS: "walks",
  MLB_SB: "sb",
  MLB_P_SO: "so",
  MLB_P_ER: "er",
  MLB_P_OUTS: "outs",
  MLB_P_HITS: "hits_allowed",
  MLB_P_WALKS: "walks_allowed",
};

const STAT_COLORS: Record<string, string> = {
  PTS: "bg-[#e4c661]/12 text-[#f2d978] border-[#e4c661]/26",
  REB: "bg-[#dcb54c]/12 text-[#edd27b] border-[#dcb54c]/26",
  AST: "bg-[#caa13a]/12 text-[#ebcf72] border-[#caa13a]/26",
  STL: "bg-[#b4892e]/12 text-[#e4c55f] border-[#b4892e]/26",
  BLK: "bg-[#967524]/12 text-[#d8b956] border-[#967524]/26",
  FG3: "bg-[#d2aa43]/12 text-[#f1d77e] border-[#d2aa43]/26",
  PRA: "bg-[#eccd73]/12 text-[#fff0b4] border-[#eccd73]/26",
  MLB_HITS: "bg-emerald-500/12 text-emerald-300 border-emerald-500/26",
  MLB_TB: "bg-emerald-500/12 text-emerald-300 border-emerald-500/26",
  MLB_HR: "bg-emerald-500/12 text-emerald-300 border-emerald-500/26",
  MLB_RBI: "bg-emerald-500/12 text-emerald-300 border-emerald-500/26",
  MLB_RUNS: "bg-emerald-500/12 text-emerald-300 border-emerald-500/26",
  MLB_WALKS: "bg-emerald-500/12 text-emerald-300 border-emerald-500/26",
  MLB_SB: "bg-emerald-500/12 text-emerald-300 border-emerald-500/26",
  MLB_P_SO: "bg-sky-500/12 text-sky-300 border-sky-500/26",
  MLB_P_ER: "bg-sky-500/12 text-sky-300 border-sky-500/26",
  MLB_P_OUTS: "bg-sky-500/12 text-sky-300 border-sky-500/26",
  MLB_P_HITS: "bg-sky-500/12 text-sky-300 border-sky-500/26",
  MLB_P_WALKS: "bg-sky-500/12 text-sky-300 border-sky-500/26",
};

const MARKET_LABELS: Record<string, string> = {
  MLB_HITS: "HITS",
  MLB_TB: "TB",
  MLB_HR: "HR",
  MLB_RBI: "RBI",
  MLB_RUNS: "RUNS",
  MLB_WALKS: "BB",
  MLB_SB: "SB",
  MLB_P_SO: "P-SO",
  MLB_P_ER: "P-ER",
  MLB_P_OUTS: "P-OUTS",
  MLB_P_HITS: "P-H",
  MLB_P_WALKS: "P-BB",
};

const MOBILE_COLLAPSED = 5;
const DESKTOP_COLLAPSED = 10;

type PickRow = TopPick | UnderPick;
type PickSide = "over" | "under";

interface Props {
  side: PickSide;
  picks: PickRow[];
  defensiveRatings?: TeamDefensiveRating[];
  propDate?: string | null;
  onSelectPlayer?: (name: string, stat?: string, line?: number) => void;
  sectionId?: string;
}

function ordinal(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

function formatPropDate(propDate?: string | null): string {
  if (!propDate) return "today's";
  const today = new Date();
  const d = new Date(propDate + "T12:00:00");
  const diffMs = d.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays === 0) return "today's";
  if (diffDays === 1) return "tomorrow's";
  if (diffDays === -1) return "yesterday's";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getStatColor(code: string) {
  return STAT_COLORS[code] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
}

function getMarketLabel(code: string) {
  return MARKET_LABELS[code] ?? code;
}

function getCountValue(pick: PickRow, side: PickSide): number {
  if (side === "over") return "overCount" in pick ? pick.overCount : 0;
  return "underCount" in pick ? pick.underCount : 0;
}

export default function AnalyticsPickTable({
  side,
  picks,
  defensiveRatings = [],
  propDate,
  onSelectPlayer,
  sectionId,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  if (picks.length === 0) return null;

  const isOver = side === "over";
  const visible = expanded ? picks : picks.slice(0, DESKTOP_COLLAPSED);
  const hasMore = picks.length > MOBILE_COLLAPSED;
  const icon = isOver ? "\u{1F3AF}" : "\u{1F4C9}";
  const title = isOver ? "Top Picks — Over" : "Top Picks — Under";
  const sideLabel = isOver ? "Over" : "Under";
  const subtitle = isOver ? "Highest over hit rates" : "Highest under hit rates";

  return (
    <section id={sectionId} className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
            {title}
          </h2>
          <p className="text-xs text-pe-text-faint">
            {subtitle} at {formatPropDate(propDate)} book lines (last 10 games, 60%+)
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-pe-border/5 bg-pe-surface-1/60">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-pe-border/10 text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
              <th className="w-[34%] px-4 py-3 text-left">Player</th>
              <th className="w-[12%] px-3 py-3 text-left">Stat</th>
              <th className="w-[18%] px-3 py-3 text-right">Line</th>
              <th className="hidden w-[14%] px-3 py-3 text-right sm:table-cell">{sideLabel}</th>
              <th className="w-[14%] px-3 py-3 text-right">Hit Rate</th>
              <th className="hidden w-[18%] px-4 py-3 text-right sm:table-cell">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((pick, index) => {
              const hitColor =
                pick.hitRate >= 80
                  ? isOver
                    ? "text-emerald-400"
                    : "text-red-400"
                  : pick.hitRate >= 70
                    ? isOver
                      ? "text-emerald-300"
                      : "text-red-300"
                    : "text-[#e4c661]";
              const barColor =
                pick.hitRate >= 80
                  ? isOver
                    ? "bg-emerald-500"
                    : "bg-red-500"
                  : pick.hitRate >= 70
                    ? isOver
                      ? "bg-emerald-400"
                      : "bg-red-400"
                    : "bg-[#e4c661]";
              const barWidth = Math.max(0, Math.min(100, pick.hitRate));
              const statKey = MARKET_TO_STAT[pick.marketCode];
              const opponentRating =
                defensiveRatings.find((rating) => rating.teamCode === pick.opponentTeamCode) ?? null;
              const defenseInfo = getDefenseMarketInfo(opponentRating, pick.marketCode);
              const hiddenOnMobileWhenCollapsed =
                !expanded && index >= MOBILE_COLLAPSED ? "hidden md:table-row" : "";

              return (
                <tr
                  key={`${pick.playerName}-${pick.marketCode}-${index}`}
                  className={`cursor-pointer border-b border-pe-border/5 transition-colors hover:bg-pe-surface-2/20 ${hiddenOnMobileWhenCollapsed}`}
                  onClick={() => onSelectPlayer?.(pick.playerName, statKey, pick.bookLine)}
                >
                  <td className="px-4 py-4 md:py-3">
                    <span className="block truncate text-base font-bold text-pe-text-primary md:text-sm">
                      {pick.playerName}
                    </span>
                  </td>
                  <td className="px-3 py-4 md:py-3">
                    <span
                      className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold ${getStatColor(pick.marketCode)}`}
                    >
                      {getMarketLabel(pick.marketCode)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right font-mono text-base text-pe-text-secondary md:py-3 md:text-sm">
                    <div className="flex flex-col items-end gap-0.5">
                      <span>{pick.bookLine}</span>
                      {defenseInfo?.rank != null && pick.opponentTeamCode && (
                        <span
                          className={`text-[10px] font-semibold leading-none ${
                            defenseInfo.rank >= 21
                              ? "text-emerald-400"
                              : defenseInfo.rank <= 10
                                ? "text-red-400"
                                : "text-pe-text-faint"
                          }`}
                        >
                          vs {pick.opponentTeamCode} {ordinal(defenseInfo.rank)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-3 py-4 text-right text-base text-pe-text-muted md:py-3 md:text-sm sm:table-cell">
                    {getCountValue(pick, side)}/{pick.gamesChecked}
                  </td>
                  <td className={`px-3 py-4 text-right text-base font-bold md:py-3 md:text-sm ${hitColor}`}>
                    {pick.hitRate}%
                  </td>
                  <td className="hidden px-4 py-4 text-right md:py-3 sm:table-cell">
                    <div className="inline-flex w-24 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-pe-surface-2">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="w-full border-t border-pe-border/5 py-3 text-base font-bold text-pe-text-muted transition-colors hover:text-pe-text-primary md:py-2 md:text-sm"
          >
            {expanded ? "Show less" : `Show all ${picks.length} picks`}
          </button>
        )}
      </div>
    </section>
  );
}
