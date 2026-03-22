"use client";

import { useState } from "react";
import type { TopPick } from "@/lib/data";

const MARKET_TO_STAT: Record<string, string> = {
  PTS: "pts", REB: "trb", AST: "ast", STL: "stl", BLK: "blk",
  FG3: "fg3", FTM: "ft", TOV: "tov", PRA: "pra", PR: "pr",
  PA: "pa", RA: "ra", SB: "sb",
};

interface Props {
  picks: TopPick[];
  propDate?: string | null;
  onSelectPlayer?: (name: string, stat?: string, line?: number) => void;
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

const MARKET_TO_DEF_LABEL: Record<string, string> = {
  PTS: "PPG",
  REB: "RPG",
  AST: "APG",
  STL: "SPG",
  BLK: "BPG",
  FG3: "3PM",
  FTM: "FTM",
  TOV: "TOPG",
  PRA: "PRA",
  PR: "PR",
  PA: "PA",
  RA: "RA",
  SB: "SB",
};

const MOBILE_COLLAPSED = 5;
const DESKTOP_COLLAPSED = 10;

export default function TopPicks({ picks, propDate, onSelectPlayer }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (picks.length === 0) return null;

  const visible = expanded ? picks : picks.slice(0, DESKTOP_COLLAPSED);
  const hasMore = picks.length > MOBILE_COLLAPSED;

  return (
    <section id="picks" className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">&#x1F3AF;</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
            Top Picks — Over
          </h2>
          <p className="text-xs text-pe-text-faint">
            Highest over hit rates at {formatPropDate(propDate)} book lines (last 10 games, 60%+)
          </p>
        </div>
      </div>

      <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
              <th className="text-left py-3 px-4">Player</th>
              <th className="text-left py-3 px-3">Stat</th>
              <th className="text-right py-3 px-3">Line</th>
              <th className="text-right py-3 px-3 hidden sm:table-cell">Over</th>
              <th className="text-right py-3 px-3">Hit Rate</th>
              <th className="text-right py-3 px-4 hidden sm:table-cell">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => {
              const hitColor =
                p.hitRate >= 80
                  ? "text-emerald-400"
                  : p.hitRate >= 70
                    ? "text-emerald-500"
                    : "text-amber-400";
              const barWidth = Math.max(0, Math.min(100, p.hitRate));
              const statKey = MARKET_TO_STAT[p.marketCode];
              const hiddenOnMobileWhenCollapsed =
                !expanded && i >= MOBILE_COLLAPSED ? "hidden md:table-row" : "";
              return (
                <tr
                  key={`${p.playerName}-${p.marketCode}-${i}`}
                  className={`border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors cursor-pointer ${hiddenOnMobileWhenCollapsed}`}
                  onClick={() =>
                    onSelectPlayer?.(p.playerName, statKey, p.bookLine)
                  }
                >
                  <td className="py-4 md:py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base md:text-sm font-bold text-pe-text-primary">
                        {p.playerName}
                      </span>
                      {p.opponentCode && p.opponentDefenseValue != null && p.opponentDefenseRank != null && (
                        <span className="text-[11px] text-pe-text-faint font-mono">
                          vs {p.opponentCode} • {p.opponentDefenseValue.toFixed(1)} {MARKET_TO_DEF_LABEL[p.marketCode] ?? "allowed"} • {p.opponentDefenseRank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 md:py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatColor(p.marketCode)}`}
                    >
                      {p.marketCode}
                    </span>
                  </td>
                  <td className="text-right py-4 md:py-3 px-3 text-base md:text-sm text-pe-text-secondary font-mono">
                    {p.bookLine}
                  </td>
                  <td className="text-right py-4 md:py-3 px-3 text-base md:text-sm text-pe-text-muted hidden sm:table-cell">
                    {p.overCount}/{p.gamesChecked}
                  </td>
                  <td className={`text-right py-4 md:py-3 px-3 text-base md:text-sm font-bold ${hitColor}`}>
                    {p.hitRate}%
                  </td>
                  <td className="text-right py-4 md:py-3 px-4 hidden sm:table-cell">
                    <div className="inline-flex items-center gap-2 w-24">
                      <div className="flex-1 h-1.5 bg-pe-surface-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.hitRate >= 80 ? "bg-emerald-500" : p.hitRate >= 70 ? "bg-emerald-600" : "bg-amber-500"
                          }`}
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
            onClick={() => setExpanded((v) => !v)}
            className="w-full py-3 md:py-2 text-base md:text-sm font-bold text-pe-text-muted hover:text-pe-text-primary border-t border-pe-border/5 transition-colors"
          >
            {expanded ? "Show less" : `Show all ${picks.length} picks`}
          </button>
        )}
      </div>
    </section>
  );
}
