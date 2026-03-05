"use client";

import type { PlayerSplits as PlayerSplitsType, TodaysGame } from "@/lib/data";

interface Props {
  splits: PlayerSplitsType;
  todaysGame?: TodaysGame | null;
}

const STAT_LABELS: { key: keyof PlayerSplitsType["home"]; label: string }[] = [
  { key: "avgPts", label: "PTS" },
  { key: "avgReb", label: "REB" },
  { key: "avgAst", label: "AST" },
  { key: "avgStl", label: "STL" },
  { key: "avgBlk", label: "BLK" },
  { key: "avg3pm", label: "3PM" },
  { key: "avgFtm", label: "FTM" },
  { key: "avgFta", label: "FTA" },
  { key: "avgPra", label: "PRA" },
];

function diffColor(home: number, away: number) {
  if (home > away) return "text-emerald-400";
  if (home < away) return "text-red-400";
  return "text-pe-text-muted";
}

export default function PlayerSplits({ splits, todaysGame }: Props) {
  const { home, away } = splits;
  if (home.games === 0 && away.games === 0) {
    return (
      <div className="text-pe-text-faint text-sm text-center py-8">
        No split data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center text-xs font-bold text-pe-text-faint uppercase tracking-widest">
        <div className="flex items-center gap-2 justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Home ({home.games}G)
          {todaysGame?.isHome && (
            <span className="bg-pe-accent text-[8px] font-black text-pe-text-primary px-1.5 py-0.5 rounded leading-none normal-case tracking-normal">
              TODAY
            </span>
          )}
        </div>
        <div>Stat</div>
        <div className="flex items-center gap-2 justify-center">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          Away ({away.games}G)
          {todaysGame && !todaysGame.isHome && (
            <span className="bg-pe-accent text-[8px] font-black text-pe-text-primary px-1.5 py-0.5 rounded leading-none normal-case tracking-normal">
              TODAY
            </span>
          )}
        </div>
      </div>

      {STAT_LABELS.map(({ key, label }) => {
        const h = home[key] as number;
        const a = away[key] as number;
        const diff = h - a;
        return (
          <div
            key={key}
            className="grid grid-cols-3 gap-4 items-center text-center py-2 border-b border-pe-border/5 last:border-0"
          >
            <div className="space-y-0.5">
              <span className={`text-lg font-bold ${diffColor(h, a)}`}>
                {h.toFixed(1)}
              </span>
              {diff !== 0 && (
                <div className={`text-[10px] font-medium ${diff > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                </div>
              )}
            </div>
            <div className="text-sm font-semibold text-pe-text-secondary">{label}</div>
            <div className="space-y-0.5">
              <span className={`text-lg font-bold ${diffColor(a, h)}`}>
                {a.toFixed(1)}
              </span>
              {diff !== 0 && (
                <div className={`text-[10px] font-medium ${diff < 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {diff < 0 ? "+" : ""}{(-diff).toFixed(1)}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Highlight the biggest edge */}
      {(() => {
        let bestStat = "";
        let bestDiff = 0;
        let bestLocation = "";
        for (const { key, label } of STAT_LABELS) {
          const diff = Math.abs((home[key] as number) - (away[key] as number));
          if (diff > bestDiff) {
            bestDiff = diff;
            bestStat = label;
            bestLocation = (home[key] as number) > (away[key] as number) ? "Home" : "Away";
          }
        }
        if (bestDiff < 1) return null;
        return (
          <div className="mt-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
            Biggest edge: <span className="font-bold">+{bestDiff.toFixed(1)} {bestStat}</span> at{" "}
            <span className="font-bold">{bestLocation}</span>
          </div>
        );
      })()}
    </div>
  );
}
