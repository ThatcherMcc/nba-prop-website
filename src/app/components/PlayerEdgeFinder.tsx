"use client";

import { useMemo } from "react";
import type { PlayerGameLog, PLAYER_STAT_TYPE } from "@/db/schema";
import { isDnpMinutes } from "@/lib/dnp";

interface Props {
  data: PlayerGameLog[];
  stat: PLAYER_STAT_TYPE;
}

const STAT_DISPLAY: Record<string, string> = {
  pts: "Points", trb: "Rebounds", ast: "Assists", stl: "Steals",
  blk: "Blocks", fg3: "3-Pointers", ft: "Free Throws", fg: "Field Goals",
  pra: "PTS+REB+AST", pr: "PTS+REB", pa: "PTS+AST", ra: "REB+AST", sb: "STL+BLK",
  tov: "Turnovers", fga: "FG Attempted", fg3a: "3PA", fta: "FTA",
  orb: "Off Reb", drb: "Def Reb",
  fg2: "2-Pointers", fg2a: "2PA",
  fgPct: "FG%", fg3Pct: "3P%", fg2Pct: "2P%", ftPct: "FT%", efgPct: "eFG%",
};

function generateLines(avg: number): number[] {
  if (avg <= 0) return [0.5, 1.5, 2.5, 3.5, 4.5];
  // Generate lines centered around the average in 0.5 increments
  const base = Math.round(avg * 2) / 2; // Round to nearest 0.5
  const lines: number[] = [];
  for (let offset = -4; offset <= 4; offset++) {
    const line = base + offset * (avg > 15 ? 2 : avg > 5 ? 1 : 0.5);
    if (line >= 0.5) lines.push(Math.round(line * 2) / 2);
  }
  return [...new Set(lines)].sort((a, b) => a - b);
}

export default function PlayerEdgeFinder({ data, stat }: Props) {
  const analysis = useMemo(() => {
    const played = data.filter((g) => !isDnpMinutes(g.mp));
    if (played.length === 0) return null;

    const values = played
      .map((g) => (g[stat] as number | null) ?? 0)
      .sort((a, b) => a - b);
    const total = played.length;
    const avg = values.reduce((s, v) => s + v, 0) / total;
    const min = values[0];
    const max = values[values.length - 1];
    const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / total;
    const stddev = Math.sqrt(variance);
    const cv = avg > 0 ? (stddev / avg) * 100 : 0;

    // Recent values (newest first in original data)
    const recent5 = played.slice(0, 5).map((g) => (g[stat] as number | null) ?? 0);

    // Hit rates at different lines
    const lines = generateLines(avg);
    const lineAnalysis = lines.map((line) => {
      const overAll = played.filter((g) => ((g[stat] as number | null) ?? 0) > line).length;
      const overRecent5 = recent5.filter((v) => v > line).length;
      const hitRate = (overAll / total) * 100;
      return { line, hitRate, overAll, total, overRecent5, recent5Count: recent5.length };
    });

    // Find the "sweet spot" line where hit rate is closest to 60%
    const sweetSpot = lineAnalysis.reduce((best, curr) => {
      const bestDist = Math.abs(best.hitRate - 60);
      const currDist = Math.abs(curr.hitRate - 60);
      return currDist < bestDist ? curr : best;
    }, lineAnalysis[0]);

    // Current streak (from most recent games)
    let streakType: "over" | "under" | null = null;
    let streakCount = 0;
    let streakLine = sweetSpot?.line ?? avg;
    if (played.length > 0 && sweetSpot) {
      const firstVal = (played[0][stat] as number | null) ?? 0;
      streakType = firstVal > sweetSpot.line ? "over" : "under";
      for (const g of played) {
        const val = (g[stat] as number | null) ?? 0;
        const isOver = val > sweetSpot.line;
        if ((streakType === "over" && isOver) || (streakType === "under" && !isOver)) {
          streakCount++;
        } else break;
      }
      streakLine = sweetSpot.line;
    }

    return {
      avg, min, max, stddev, cv, total,
      lineAnalysis, sweetSpot, streakType, streakCount, streakLine,
    };
  }, [data, stat]);

  if (!analysis) {
    return (
      <div className="text-pe-text-faint text-sm text-center py-8">
        No game data to analyze.
      </div>
    );
  }

  const consistencyLabel =
    analysis.cv < 25 ? "Reliable" : analysis.cv < 45 ? "Moderate" : "Volatile";
  const consistencyColor =
    analysis.cv < 25
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : analysis.cv < 45
        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
        : "text-red-400 bg-red-500/10 border-red-500/20";

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-pe-surface-2/50 rounded-xl px-4 py-3 text-center">
          <div className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">
            Season Avg
          </div>
          <div className="text-2xl font-black text-pe-text-primary mt-1">
            {analysis.avg.toFixed(1)}
          </div>
        </div>
        <div className={`rounded-xl px-4 py-3 text-center border ${consistencyColor}`}>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            Consistency
          </div>
          <div className="text-lg font-bold mt-1">{consistencyLabel}</div>
        </div>
      </div>

      {/* Streak callout */}
      {analysis.streakCount >= 2 && (
        <div
          className={`px-4 py-3 rounded-xl border text-sm font-medium ${
            analysis.streakType === "over"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {analysis.streakCount} straight{" "}
          {analysis.streakType === "over" ? "overs" : "unders"} at{" "}
          {analysis.streakLine}{" "}
          {STAT_DISPLAY[stat] ?? stat.toUpperCase()}
        </div>
      )}

      {/* Line-by-line hit rate table */}
      <div>
        <h4 className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest mb-3">
          Hit Rate by Line — {STAT_DISPLAY[stat] ?? stat.toUpperCase()}
        </h4>
        <div className="space-y-1">
          {analysis.lineAnalysis.map(({ line, hitRate, overAll, total, overRecent5, recent5Count }) => {
            const isSweet =
              analysis.sweetSpot && line === analysis.sweetSpot.line;
            const barWidth = Math.max(2, Math.min(100, hitRate));
            const barColor =
              hitRate >= 60
                ? "bg-emerald-500"
                : hitRate >= 50
                  ? "bg-amber-500"
                  : "bg-red-500";
            return (
              <div
                key={line}
                className={`relative flex items-center gap-3 py-1.5 px-3 rounded-lg transition-colors ${
                  isSweet ? "bg-pe-accent/10 border border-pe-accent/20" : "border border-transparent hover:bg-pe-surface-2/10"
                }`}
              >
                {isSweet && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 bg-pe-accent text-[8px] font-black text-pe-text-primary px-1 py-0.5 rounded leading-none">
                    EDGE
                  </span>
                )}
                <div className="w-12 text-right text-sm font-mono text-pe-text-secondary shrink-0">
                  {line % 1 === 0 ? `${line}.0` : line}
                </div>
                <div className="flex-1 h-5 bg-pe-surface-2 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-300`}
                    style={{ width: `${barWidth}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-pe-text-primary mix-blend-difference">
                    {hitRate.toFixed(0)}% ({overAll}/{total})
                  </div>
                </div>
                <div className="w-16 text-right text-xs text-pe-text-faint shrink-0">
                  L5: {overRecent5}/{recent5Count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
