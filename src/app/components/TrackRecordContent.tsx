"use client";

import { useState } from "react";
import Link from "next/link";
import type { BacktestResult, WeeklyRecap, MlBacktestSummary, MlBacktestPick } from "@/lib/data";
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
  mlBacktest: MlBacktestSummary;
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

// ── ML Daily Bar Chart ───────────────────────────────────────────────────────
// Simplified: bars with tooltippy labels, no triple encoding

function MlDailyChart({ data }: { data: MlBacktestSummary }) {
  const days = data.dailyResults;
  if (days.length === 0) return null;

  const maxPicks = Math.max(...days.map((d) => d.picks));
  const reversed = [...days].reverse();

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-4 mb-4">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-xs font-bold text-pe-text-muted">
          Daily Performance
        </p>
        <p className="text-[10px] text-pe-text-faint">
          {days.length} game days
        </p>
      </div>
      <div className="flex items-end gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {reversed.map((day) => {
          const barH = maxPicks > 0 ? (day.picks / maxPicks) * 56 + 8 : 32;
          const hitPct = day.picks > 0 ? day.hits / day.picks : 0;
          const isGood = day.hitRate >= 65;
          const isOk = day.hitRate >= 50;
          return (
            <div key={day.gameDate} className="flex flex-col items-center gap-1 min-w-[28px] sm:min-w-[36px] group">
              {/* Hit rate — only show on hover or always for readability */}
              <span className={`text-[10px] font-bold tabular-nums ${isGood ? "text-emerald-400" : isOk ? "text-amber-400" : "text-red-400"}`}>
                {day.hitRate}%
              </span>
              {/* Stacked bar */}
              <div
                className="w-5 sm:w-7 rounded-md overflow-hidden flex flex-col-reverse"
                style={{ height: barH }}
              >
                <div
                  className={`w-full rounded-b-md ${isGood ? "bg-emerald-500/60" : isOk ? "bg-amber-500/50" : "bg-red-500/40"}`}
                  style={{ height: `${hitPct * 100}%` }}
                />
                <div
                  className="bg-pe-surface-2/60 w-full"
                  style={{ height: `${(1 - hitPct) * 100}%` }}
                />
              </div>
              {/* Date label */}
              <span className="text-[9px] text-pe-text-faint whitespace-nowrap">
                {new Date(day.gameDate + "T12:00:00").toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ML Market Breakdown ──────────────────────────────────────────────────────
// Visual bars instead of just numbers

function MlMarketBreakdown({ data }: { data: MlBacktestSummary }) {
  if (data.marketBreakdown.length === 0) return null;

  const sorted = [...data.marketBreakdown].sort((a, b) => b.rate - a.rate);

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-pe-border/10 bg-pe-surface-2/20">
        <p className="text-xs font-bold text-pe-text-muted">
          By Market
        </p>
      </div>
      <div className="divide-y divide-pe-border/5">
        {sorted.map((m) => (
          <div key={m.market} className="flex items-center gap-3 px-4 py-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border w-10 text-center ${getStatColor(m.market)}`}>
              {m.market}
            </span>
            {/* Visual bar */}
            <div className="flex-1 h-2 rounded-full bg-pe-surface-2/60 overflow-hidden">
              <div
                className={`h-full rounded-full ${m.rate >= 65 ? "bg-emerald-500/60" : m.rate >= 50 ? "bg-amber-500/50" : "bg-red-500/40"}`}
                style={{ width: `${m.rate}%` }}
              />
            </div>
            <span className={`text-sm font-black tabular-nums w-12 text-right ${winRateColor(m.rate)}`}>
              {m.rate}%
            </span>
            <span className="text-[10px] text-pe-text-faint tabular-nums w-10 text-right">
              {m.picks}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ML Recent Picks ─────────────────────────────────────────────────────────
// Simplified: focus on result first, context second

function MlRecentPicks({ picks, gameDate }: { picks: MlBacktestPick[]; gameDate: string }) {
  const [expanded, setExpanded] = useState(false);
  if (picks.length === 0) return null;

  const visible = expanded ? picks : picks.slice(0, 10);
  const hasMore = picks.length > 10;
  const hitCount = picks.filter((p) => p.hit === true).length;
  const gradedCount = picks.filter((p) => p.hit !== null).length;

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-pe-border/10 bg-pe-surface-2/20">
        <p className="text-xs font-bold text-pe-text-muted">
          Recent Picks — {formatDate(gameDate)}
        </p>
        <span className={`text-xs font-bold ${winRateColor(gradedCount > 0 ? Math.round((hitCount / gradedCount) * 100) : 0)}`}>
          {hitCount}/{gradedCount}
        </span>
      </div>

      <div className="divide-y divide-pe-border/5">
        {visible.map((p, i) => {
          const isHit = p.hit === true;
          const isMiss = p.hit === false;

          return (
            <div
              key={`${p.playerName}-${p.marketCode}-${i}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-pe-surface-2/20 transition-colors"
            >
              {/* Result indicator — most important */}
              <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                isHit
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isMiss
                    ? "bg-red-500/15 text-red-400"
                    : "bg-pe-surface-2/40 text-pe-text-faint"
              }`}>
                {isHit ? "\u2713" : isMiss ? "\u2717" : "\u2014"}
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
                  <span className={p.prediction === "OVER" ? "text-emerald-400" : "text-red-400"}>
                    {p.prediction === "OVER" ? "Over" : "Under"}
                  </span>
                  {" "}{p.bookLine}
                </div>
              </div>

              {/* Actual vs line */}
              <div className="shrink-0 text-right">
                <div className={`text-sm font-bold tabular-nums ${
                  p.actualValue === null ? "text-pe-text-faint" : isHit ? "text-emerald-400" : "text-red-400"
                }`}>
                  {p.actualValue !== null ? p.actualValue : "—"}
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
          {expanded ? "Show less" : `Show all ${picks.length} picks`}
        </button>
      )}
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
  mlBacktest,
}: TrackRecordContentProps) {
  const [tab, setTab] = useState<"ml" | "edge">("ml");

  const ml = mlBacktest;
  const hasML = ml.totalPicks > 0;

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

  // Best market
  const bestMarket = ml.marketBreakdown.length > 0
    ? ml.marketBreakdown.reduce((best, m) => m.rate > best.rate && m.picks >= 5 ? m : best)
    : null;

  const shareText = hasML
    ? `PropEdge AI: ${ml.hitRate}% hit rate on ${ml.totalPicks} picks`
    : "PropEdge AI — Data-driven NBA prop picks";
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
              Model performance graded against real results
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <ShareButtons url={shareUrl} text={shareText} />
          </div>
        </div>
        <div className="mt-3 mb-4 px-3 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-[10px] text-amber-400 leading-relaxed">
          Past performance does not guarantee future results. All model outputs are probabilistic estimates, not guaranteed predictions. For entertainment purposes only.
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-pe-surface-1/40 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("ml")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            tab === "ml"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "text-pe-text-muted hover:text-pe-text-primary"
          }`}
        >
          Prop AI
        </button>
        <button
          type="button"
          onClick={() => setTab("edge")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            tab === "edge"
              ? "bg-pe-accent/20 text-pe-accent border border-pe-accent/30"
              : "text-pe-text-muted hover:text-pe-text-primary"
          }`}
        >
          Edge Picks
        </button>
      </div>

      {/* ── ML Tab ── */}
      {tab === "ml" && (
        <>
          {!hasML ? (
            <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-12 text-center">
              <p className="text-pe-text-primary font-bold text-base mb-1">
                No Prop AI results yet
              </p>
              <p className="text-pe-text-faint text-sm">
                ML predictions are graded against actual results. Check back after the first game day.
              </p>
            </div>
          ) : (
            <>
              {/* Hero: the one number that matters */}
              <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl mb-4">
                <HeroStat
                  value={`${ml.hitRate}%`}
                  label="Overall Hit Rate"
                  sub={`${ml.totalHits} wins from ${ml.totalPicks} picks across ${ml.daysCount} game days`}
                  valueClass={winRateColor(ml.hitRate)}
                />
              </div>

              {/* Supporting metrics — secondary context */}
              <MetricRow items={[
                {
                  label: "Edge",
                  value: `+${ml.edge}%`,
                  valueClass: "text-emerald-400",
                },
                {
                  label: "Best Market",
                  value: bestMarket ? bestMarket.market : "—",
                  valueClass: "text-blue-400",
                },
                {
                  label: "Best Rate",
                  value: bestMarket ? `${bestMarket.rate}%` : "—",
                  valueClass: bestMarket ? winRateColor(bestMarket.rate) : undefined,
                },
              ]} />

              <MlDailyChart data={ml} />
              <MlMarketBreakdown data={ml} />
              <MlRecentPicks
                picks={ml.recentPicks}
                gameDate={ml.dailyResults[0]?.gameDate ?? ""}
              />

              <p className="mt-4 text-[10px] text-pe-text-faint text-center">
                Top 20 picks per day by model confidence. Break-even at -110 juice = 52.4%.
              </p>
            </>
          )}
        </>
      )}

      {/* ── Edge Tab ── */}
      {tab === "edge" && (
        <>
          {!hasEdge ? (
            <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-12 text-center">
              <p className="text-pe-text-primary font-bold text-base mb-1">
                No edge pick data yet
              </p>
              <p className="text-pe-text-faint text-sm">
                Results are graded the day after picks are posted.
              </p>
            </div>
          ) : (
            <>
              {/* Edge hero */}
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

              {/* Week summary if available */}
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
        </>
      )}
    </div>
  );
}
