"use client";

import { useState } from "react";
import Link from "next/link";
import type { BacktestResult, WeeklyRecap } from "@/lib/data";
import ShareButtons from "./ShareButtons";

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  if (!dateStr) return "—";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(weekEnd + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

function winRateColor(rate: number): string {
  if (rate >= 65) return "text-emerald-400";
  if (rate >= 50) return "text-amber-400";
  return "text-red-400";
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TrackRecordContentProps {
  recentDay: BacktestResult;
  recentWeek: WeeklyRecap | null;
}

// ── Hero Stat ────────────────────────────────────────────────────────────────
// One dominant number with supporting context beneath

function HeroStat({
  value,
  label,
  sub,
  valueClass,
}: {
  value: string;
  label: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="text-center py-6">
      <div className={`text-5xl sm:text-6xl font-black leading-none tracking-tight ${valueClass ?? "text-pe-text-primary"}`}>
        {value}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest text-pe-text-faint mt-2">
        {label}
      </div>
      {sub && (
        <div className="text-sm text-pe-text-muted mt-1">{sub}</div>
      )}
    </div>
  );
}

// ── Supporting Metric ────────────────────────────────────────────────────────

function MetricRow({ items }: { items: { label: string; value: string; valueClass?: string }[] }) {
  return (
    <div className={`grid gap-px bg-pe-border/5 rounded-xl overflow-hidden mb-4`} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((item) => (
        <div key={item.label} className="bg-pe-surface-1/60 px-4 py-3 text-center">
          <div className={`text-lg sm:text-xl font-black ${item.valueClass ?? "text-pe-text-primary"}`}>
            {item.value}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint mt-0.5">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Daily Bar (existing edge picks) ──────────────────────────────────────────

function DailyBreakdownBar({ recap }: { recap: WeeklyRecap }) {
  const days = recap.dailyBreakdown;
  if (days.length === 0) return null;

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-4 mb-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs font-bold text-pe-text-muted">
          Daily Breakdown
        </p>
        <p className="text-[10px] text-pe-text-faint">
          {formatWeekRange(recap.weekStart, recap.weekEnd)}
        </p>
      </div>
      <div className="flex items-end gap-2 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => {
          const total = day.wins + day.losses + day.pushes;
          const rate = total > 0 ? Math.round((day.wins / (day.wins + day.losses || 1)) * 100) : 0;
          const hitPct = total > 0 ? day.wins / total : 0;
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 min-w-[40px]">
              <span className={`text-[10px] font-bold ${winRateColor(rate)}`}>
                {rate}%
              </span>
              <div className="w-8 rounded-md overflow-hidden flex flex-col-reverse bg-pe-surface-2/40" style={{ height: 40 }}>
                {day.wins > 0 && (
                  <div
                    className="bg-emerald-500/50 w-full rounded-b-md"
                    style={{ height: `${hitPct * 100}%` }}
                  />
                )}
              </div>
              <span className="text-[9px] text-pe-text-faint whitespace-nowrap">
                {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Existing Edge Results Table ─────────────────────────────────────────────

function ResultsTable({ data }: { data: BacktestResult }) {
  const [expanded, setExpanded] = useState(false);

  const { picks, gameDate } = data;
  if (picks.length === 0) return null;

  const overPicks = picks.filter((p) => p.side === "over");
  const underPicks = picks.filter((p) => p.side === "under");
  const allPicks = [...overPicks, ...underPicks];
  const visible = expanded ? allPicks : allPicks.slice(0, 10);
  const hasMore = allPicks.length > 10;

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-pe-border/10 bg-pe-surface-2/20">
        <p className="text-xs font-bold text-pe-text-muted">
          Recent Picks — {formatDate(gameDate)}
        </p>
        <span className="text-[10px] text-pe-text-faint">
          {allPicks.length} picks
        </span>
      </div>

      <div className="divide-y divide-pe-border/5">
        {visible.map((p, i) => {
          const isWin = p.result === "win";
          const isLoss = p.result === "loss";
          const isPush = p.result === "push";
          const isDnp = p.result === "dnp";

          return (
            <div
              key={`${p.playerName}-${p.marketCode}-${p.side}-${i}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-pe-surface-2/20 transition-colors"
            >
              {/* Result indicator */}
              <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                isWin
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isLoss
                    ? "bg-red-500/15 text-red-400"
                    : isPush
                      ? "bg-zinc-500/15 text-pe-text-faint"
                      : "bg-pe-surface-2/40 text-pe-text-faint"
              }`}>
                {isWin ? "\u2713" : isLoss ? "\u2717" : isPush ? "\u2014" : "—"}
              </div>

              {/* Player + pick */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/player/${encodeURIComponent(p.playerName)}`}
                    className="text-sm font-bold text-pe-text-primary hover:text-pe-accent transition-colors truncate"
                  >
                    {p.playerName}
                  </Link>
                  <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatColor(p.marketCode)}`}>
                    {p.marketCode}
                  </span>
                </div>
                <div className="text-[11px] text-pe-text-faint mt-0.5">
                  <span className={p.side === "over" ? "text-emerald-400" : "text-red-400"}>
                    {p.side === "over" ? "Over" : "Under"}
                  </span>
                  {" "}{p.bookLine}
                </div>
              </div>

              {/* Actual result */}
              <div className="shrink-0 text-right">
                <div className={`text-sm font-bold tabular-nums ${
                  isDnp ? "text-pe-text-faint" : isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-pe-text-muted"
                }`}>
                  {isDnp ? "DNP" : (p.actualValue ?? "—")}
                </div>
                <div className="text-[10px] text-pe-text-faint">actual</div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full py-2.5 text-xs font-bold text-pe-text-muted hover:text-pe-text-primary border-t border-pe-border/5 transition-colors cursor-pointer"
        >
          {expanded ? "Show less" : `Show all ${allPicks.length} picks`}
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TrackRecordContent({
  recentDay,
  recentWeek,
}: TrackRecordContentProps) {
  // Edge system stats
  const dayPicks = recentDay.picks;
  const dayWins = dayPicks.filter((p) => p.result === "win").length;
  const dayLosses = dayPicks.filter((p) => p.result === "loss").length;
  const dayDecided = dayWins + dayLosses;
  const dayWinRate = dayDecided > 0 ? Math.round((dayWins / dayDecided) * 100) : 0;

  const weekWins = recentWeek?.wins ?? 0;
  const weekLosses = recentWeek?.losses ?? 0;
  const weekDecided = weekWins + weekLosses;
  const weekWinRate = recentWeek?.winRate ?? 0;

  const hasEdge = dayPicks.length > 0 || recentWeek !== null;
  const shareText = "PropEdge track record and analytics recap";
  const shareUrl = "https://propedge.bet/track-record";

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-pe-text-primary">
              Track Record
            </h1>
            <p className="text-xs text-pe-text-faint mt-0.5">
              Recent analytics pick results and weekly recap context
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <ShareButtons url={shareUrl} text={shareText} />
          </div>
        </div>
        <div className="mt-3 mb-4 px-3 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-[10px] text-amber-400 leading-relaxed">
          Past performance does not guarantee future results. All picks and trend views are for informational and entertainment purposes only.
        </div>
      </div>

      {!hasEdge ? (
        <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-12 text-center">
          <p className="text-pe-text-primary font-bold text-base mb-1">
            No analytics pick data yet
          </p>
          <p className="text-pe-text-faint text-sm">
            Results are graded the day after picks are posted.
          </p>
        </div>
      ) : (
        <>
          {dayDecided > 0 && (
            <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl mb-4">
              <HeroStat
                value={`${dayWinRate}%`}
                label="Last Day Hit Rate"
                sub={`${dayWins}W – ${dayLosses}L${recentDay.gameDate ? ` on ${formatDate(recentDay.gameDate)}` : ""}`}
                valueClass={winRateColor(dayWinRate)}
              />
            </div>
          )}

          {recentWeek && (
            <MetricRow items={[
              {
                label: "Week Record",
                value: `${weekWins}–${weekLosses}`,
                valueClass: weekDecided > 0 ? winRateColor(weekWinRate) : undefined,
              },
              {
                label: "Week Rate",
                value: weekDecided > 0 ? `${weekWinRate}%` : "—",
                valueClass: weekDecided > 0 ? winRateColor(weekWinRate) : undefined,
              },
              {
                label: "Total Picks",
                value: `${weekDecided + (recentWeek.pushes ?? 0) + (recentWeek.dnps ?? 0)}`,
              },
            ]} />
          )}

          {recentWeek && <DailyBreakdownBar recap={recentWeek} />}
          <ResultsTable data={recentDay} />

          <p className="mt-4 text-[10px] text-pe-text-faint text-center">
            Push and DNP picks excluded from hit rate.
          </p>
        </>
      )}
    </div>
  );
}
