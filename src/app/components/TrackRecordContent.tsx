"use client";

import { useState } from "react";
import Link from "next/link";
import type { BacktestResult, WeeklyRecap, MlBacktestSummary, MlBacktestPick } from "@/lib/data";

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

// ── Summary Stats Card ────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: string | number;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
        {label}
      </span>
      <span className={`text-3xl font-black leading-none ${valueClass ?? "text-pe-text-primary"}`}>
        {value}
      </span>
      {sub && (
        <span className="text-[11px] text-pe-text-faint mt-0.5">{sub}</span>
      )}
    </div>
  );
}

// ── ML Daily Bar Chart ───────────────────────────────────────────────────────

function MlDailyChart({ data }: { data: MlBacktestSummary }) {
  const days = data.dailyResults;
  if (days.length === 0) return null;

  const maxPicks = Math.max(...days.map((d) => d.picks));

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-4 mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint mb-3">
        Daily hit rate — Last {days.length} game days
      </p>
      <div className="flex items-end gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[...days].reverse().map((day) => {
          const barH = maxPicks > 0 ? (day.picks / maxPicks) * 48 : 24;
          const hitPct = day.picks > 0 ? day.hits / day.picks : 0;
          return (
            <div key={day.gameDate} className="flex flex-col items-center gap-1 min-w-[36px]">
              <span className={`text-[10px] font-black ${winRateColor(day.hitRate)}`}>
                {day.hitRate}%
              </span>
              <div
                className="w-7 rounded-md overflow-hidden flex flex-col-reverse"
                style={{ height: barH + 8 }}
              >
                <div
                  className="bg-emerald-500/60 w-full rounded-b-md"
                  style={{ height: `${hitPct * 100}%` }}
                />
                <div
                  className="bg-red-500/30 w-full"
                  style={{ height: `${(1 - hitPct) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-pe-text-faint whitespace-nowrap">
                {formatDate(day.gameDate).split(",")[0]?.replace(/\s+/g, "")}
              </span>
              <span className="text-[9px] text-pe-text-muted font-mono">
                {day.hits}/{day.picks}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ML Market Breakdown ──────────────────────────────────────────────────────

function MlMarketBreakdown({ data }: { data: MlBacktestSummary }) {
  if (data.marketBreakdown.length === 0) return null;

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-pe-border/10 bg-pe-surface-2/20">
        <p className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
          Hit rate by market
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-pe-border/5">
        {data.marketBreakdown.map((m) => (
          <div key={m.market} className="flex items-center justify-between px-4 py-3 bg-pe-bg">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatColor(m.market)}`}>
                {m.market}
              </span>
              <span className="text-xs text-pe-text-muted font-mono">
                {m.hits}/{m.picks}
              </span>
            </div>
            <span className={`text-sm font-black ${winRateColor(m.rate)}`}>
              {m.rate}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ML Recent Picks Table ────────────────────────────────────────────────────

function MlRecentPicks({ picks, gameDate }: { picks: MlBacktestPick[]; gameDate: string }) {
  const [expanded, setExpanded] = useState(false);
  if (picks.length === 0) return null;

  const visible = expanded ? picks : picks.slice(0, 15);
  const hasMore = picks.length > 15;

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-pe-border/10 bg-pe-surface-2/20">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
            Most recent picks
          </p>
          <p className="text-sm font-bold text-pe-text-primary mt-0.5">
            {formatDate(gameDate)}
          </p>
        </div>
        <span className="text-[10px] font-mono text-pe-text-faint">
          {picks.filter((p) => p.hit === true).length}/{picks.filter((p) => p.hit !== null).length} hit
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
            <th className="text-left py-3 px-4">Player</th>
            <th className="text-left py-3 px-3">Pick</th>
            <th className="text-left py-3 px-3">Stat</th>
            <th className="text-right py-3 px-3">Line</th>
            <th className="text-right py-3 px-3">Actual</th>
            <th className="text-right py-3 px-3">Conf</th>
            <th className="text-right py-3 px-4">Result</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((p, i) => {
            const isHit = p.hit === true;
            const isMiss = p.hit === false;

            return (
              <tr
                key={`${p.playerName}-${p.marketCode}-${i}`}
                className="border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors"
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/player/${encodeURIComponent(p.playerName)}`}
                    className="font-bold text-pe-text-primary hover:text-pe-accent transition-colors"
                  >
                    {p.playerName}
                  </Link>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      p.prediction === "OVER"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {p.prediction === "OVER" ? "OVR" : "UND"}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatColor(p.marketCode)}`}>
                    {p.marketCode}
                  </span>
                </td>
                <td className="text-right py-3 px-3 text-pe-text-secondary font-mono text-xs">
                  {p.bookLine}
                </td>
                <td className={`text-right py-3 px-3 font-mono font-bold text-xs ${
                  p.actualValue === null ? "text-pe-text-faint" : isHit ? "text-emerald-400" : "text-red-400"
                }`}>
                  {p.actualValue !== null ? p.actualValue : "—"}
                </td>
                <td className="text-right py-3 px-3 text-pe-text-faint text-xs font-mono">
                  {Math.round(p.confidence * 100)}%
                </td>
                <td className="text-right py-3 px-4">
                  {isHit && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      &#x2713; W
                    </span>
                  )}
                  {isMiss && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20">
                      &#x2717; L
                    </span>
                  )}
                  {p.hit === null && (
                    <span className="text-[11px] text-pe-text-faint">—</span>
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
          className="w-full py-2.5 text-xs font-bold text-pe-text-muted hover:text-pe-text-primary border-t border-pe-border/5 transition-colors cursor-pointer"
        >
          {expanded ? "Show less" : `Show all ${picks.length} picks`}
        </button>
      )}
    </div>
  );
}

// ── Daily Bar (existing weekly) ──────────────────────────────────────────────

function DailyBreakdownBar({ recap }: { recap: WeeklyRecap }) {
  const days = recap.dailyBreakdown;
  if (days.length === 0) return null;

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-4 mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint mb-3">
        Edge picks daily breakdown —{" "}
        <span className="text-pe-text-muted font-normal normal-case tracking-normal">
          {formatWeekRange(recap.weekStart, recap.weekEnd)}
        </span>
      </p>
      <div className="flex items-end gap-2 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => {
          const total = day.wins + day.losses + day.pushes;
          const rate = total > 0 ? Math.round((day.wins / (day.wins + day.losses || 1)) * 100) : 0;
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 min-w-[48px]">
              <span className={`text-xs font-black ${winRateColor(rate)}`}>
                {rate}%
              </span>
              <div className="w-10 bg-pe-surface-2/40 rounded-md overflow-hidden flex flex-col-reverse" style={{ height: 40 }}>
                {day.wins > 0 && (
                  <div
                    className="bg-emerald-500/50 w-full"
                    style={{ height: `${(day.wins / Math.max(total, 1)) * 100}%` }}
                  />
                )}
              </div>
              <span className="text-[10px] text-pe-text-faint whitespace-nowrap">
                {formatDate(day.date).split(",")[0]}
              </span>
              <span className="text-[10px] text-pe-text-muted font-mono">
                {day.wins}W/{day.losses}L
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Existing Results Table ───────────────────────────────────────────────────

const COLLAPSED_COUNT = 15;

function ResultsTable({ data }: { data: BacktestResult }) {
  const [expanded, setExpanded] = useState(false);

  const { picks, gameDate } = data;

  if (picks.length === 0) return null;

  const overPicks = picks.filter((p) => p.side === "over");
  const underPicks = picks.filter((p) => p.side === "under");
  const allPicks = [...overPicks, ...underPicks];
  const visible = expanded ? allPicks : allPicks.slice(0, COLLAPSED_COUNT);
  const hasMore = allPicks.length > COLLAPSED_COUNT;

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-pe-border/10 bg-pe-surface-2/20">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
            Edge picks — Most recent graded day
          </p>
          <p className="text-sm font-bold text-pe-text-primary mt-0.5">
            {formatDate(gameDate)}
          </p>
        </div>
        <span className="text-[10px] font-mono text-pe-text-faint">
          {allPicks.length} pick{allPicks.length !== 1 ? "s" : ""}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
            <th className="text-left py-3 px-4">Player</th>
            <th className="text-left py-3 px-3">Side</th>
            <th className="text-left py-3 px-3">Stat</th>
            <th className="text-right py-3 px-3">Line</th>
            <th className="text-right py-3 px-3">Actual</th>
            <th className="text-right py-3 px-3">Pred %</th>
            <th className="text-right py-3 px-4">Result</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((p, i) => {
            const isWin = p.result === "win";
            const isLoss = p.result === "loss";
            const isPush = p.result === "push";
            const isDnp = p.result === "dnp";

            return (
              <tr
                key={`${p.playerName}-${p.marketCode}-${p.side}-${i}`}
                className="border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors"
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/player/${encodeURIComponent(p.playerName)}`}
                    className="font-bold text-pe-text-primary hover:text-pe-accent transition-colors"
                  >
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
                <td className="text-right py-3 px-3 text-pe-text-secondary font-mono text-xs">
                  {p.bookLine}
                </td>
                <td
                  className={`text-right py-3 px-3 font-mono font-bold text-xs ${
                    isDnp
                      ? "text-pe-text-faint"
                      : isWin
                        ? "text-emerald-400"
                        : isLoss
                          ? "text-red-400"
                          : "text-pe-text-muted"
                  }`}
                >
                  {isDnp ? "—" : (p.actualValue ?? "—")}
                </td>
                <td className="text-right py-3 px-3 text-pe-text-faint text-xs font-mono">
                  {p.hitRate}%
                </td>
                <td className="text-right py-3 px-4">
                  {isWin && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      &#x2713; W
                    </span>
                  )}
                  {isLoss && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20">
                      &#x2717; L
                    </span>
                  )}
                  {isPush && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-zinc-500/10 text-pe-text-faint border-pe-border/10">
                      &#x2014; P
                    </span>
                  )}
                  {isDnp && (
                    <span className="text-[11px] text-pe-text-faint">DNP</span>
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

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg font-black uppercase tracking-tight text-pe-text-primary">
          Track Record
        </h1>
        <p className="text-xs text-pe-text-faint mt-0.5">
          How our picks have performed — graded against real game results
        </p>
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
              {/* Hero stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <SummaryCard
                  label="Hit Rate"
                  value={`${ml.hitRate}%`}
                  sub={`${ml.totalHits}W / ${ml.totalPicks - ml.totalHits}L`}
                  valueClass={winRateColor(ml.hitRate)}
                />
                <SummaryCard
                  label="Total Picks"
                  value={ml.totalPicks}
                  sub={`${ml.daysCount} game days`}
                />
                <SummaryCard
                  label="Edge vs Juice"
                  value={`+${ml.edge}%`}
                  sub="Over 52.4% break-even"
                  valueClass="text-emerald-400"
                />
                <SummaryCard
                  label="Best Market"
                  value={ml.marketBreakdown.length > 0
                    ? ml.marketBreakdown.reduce((best, m) =>
                        m.rate > best.rate && m.picks >= 5 ? m : best
                      ).market
                    : "—"
                  }
                  sub={ml.marketBreakdown.length > 0
                    ? `${ml.marketBreakdown.reduce((best, m) =>
                        m.rate > best.rate && m.picks >= 5 ? m : best
                      ).rate}% hit rate`
                    : ""
                  }
                  valueClass="text-blue-400"
                />
              </div>

              <MlDailyChart data={ml} />
              <MlMarketBreakdown data={ml} />
              <MlRecentPicks
                picks={ml.recentPicks}
                gameDate={ml.dailyResults[0]?.gameDate ?? ""}
              />

              <p className="mt-4 text-[10px] text-pe-text-faint text-center italic">
                Top 20 picks per day by model confidence. Graded against actual game stats.
                Break-even assumes standard -110 juice (52.4%).
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
                Results are graded the day after picks are posted. Check back once
                the first game day has been graded.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <SummaryCard
                  label="Last Day Picks"
                  value={dayDecided}
                  sub={recentDay.gameDate ? formatDate(recentDay.gameDate) : "—"}
                />
                <SummaryCard
                  label="Last Day W/L"
                  value={`${dayWins}–${dayLosses}`}
                  sub={dayDecided > 0 ? `${dayWinRate}% hit rate` : "No graded picks"}
                  valueClass={dayDecided > 0 ? winRateColor(dayWinRate) : "text-pe-text-muted"}
                />
                {recentWeek ? (
                  <>
                    <SummaryCard
                      label="This Week Picks"
                      value={weekDecided + recentWeek.pushes + recentWeek.dnps}
                      sub={formatWeekRange(recentWeek.weekStart, recentWeek.weekEnd)}
                    />
                    <SummaryCard
                      label="This Week W/L"
                      value={`${weekWins}–${weekLosses}`}
                      sub={weekDecided > 0 ? `${weekWinRate}% hit rate` : "No graded picks"}
                      valueClass={weekDecided > 0 ? winRateColor(weekWinRate) : "text-pe-text-muted"}
                    />
                  </>
                ) : (
                  <>
                    <SummaryCard label="Total Picks" value={dayPicks.length} sub="Most recent day" />
                    <SummaryCard
                      label="Hit Rate"
                      value={`${dayWinRate}%`}
                      sub={`${dayWins}W / ${dayLosses}L`}
                      valueClass={winRateColor(dayWinRate)}
                    />
                  </>
                )}
              </div>

              {recentWeek && <DailyBreakdownBar recap={recentWeek} />}
              <ResultsTable data={recentDay} />

              <p className="mt-4 text-[10px] text-pe-text-faint text-center italic">
                Results graded using the most recent game log data. Push and DNP picks are excluded from hit rate calculations.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
