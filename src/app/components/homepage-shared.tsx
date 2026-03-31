"use client";

import type { HomepageContentProps } from "./HomepageContent";
import type {
  TopPick,
  UnderPick,
  BacktestPick,
  OverSeasonAvgLast5 as OverSeasonAvgLast5Type,
  UnderSeasonAvgLast5,
  TrendingPlayer,
} from "@/lib/data";

// ── Shared props interface for all layouts ──────────────────────────────────

export interface HomepageLayoutProps extends HomepageContentProps {
  goToPlayer: (name: string, games?: number, stat?: string, line?: number) => void;
}

// ── Constants ───────────────────────────────────────────────────────────────

export const MARKET_TO_STAT: Record<string, string> = {
  PTS: "pts", REB: "trb", AST: "ast", STL: "stl", BLK: "blk",
  FG3: "fg3", FTM: "ft", TOV: "tov", PRA: "pra", PR: "pr",
  PA: "pa", RA: "ra", SB: "sb",
};

export const STAT_COLORS: Record<string, string> = {
  PTS: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  REB: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  AST: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  STL: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  BLK: "bg-red-500/15 text-red-400 border-red-500/30",
  FG3: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  PRA: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export function getStatColor(code: string): string {
  return STAT_COLORS[code] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return "Updating...";
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${Math.floor(hours / 24)}d ago`;
}

export function formatRelativeTimeShort(isoString: string | null | undefined): string {
  if (!isoString) return "Updating...";
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatPropDate(propDate?: string | null): string {
  if (!propDate) return "Today";
  const d = new Date(propDate + "T12:00:00");
  const diffDays = Math.round((d.getTime() - Date.now()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function hitRateTextClass(rate: number, side: "over" | "under"): string {
  if (side === "under") {
    if (rate >= 80) return "text-rose-400";
    if (rate >= 70) return "text-rose-500";
    return "text-amber-400";
  }
  if (rate >= 80) return "text-emerald-400";
  if (rate >= 70) return "text-emerald-500";
  return "text-amber-400";
}

export function hitRateBarClass(rate: number, side: "over" | "under"): string {
  if (side === "under") {
    if (rate >= 80) return "bg-rose-500";
    if (rate >= 70) return "bg-rose-600";
    return "bg-amber-500";
  }
  if (rate >= 80) return "bg-emerald-500";
  if (rate >= 70) return "bg-emerald-600";
  return "bg-amber-500";
}

// ── Types ───────────────────────────────────────────────────────────────────

export type EdgeItem =
  | { kind: "over"; pick: TopPick }
  | { kind: "under"; pick: UnderPick };

export type PlayerRowVariant = "hot" | "cold" | "trending";

export interface HotCard {
  playerName: string | null;
  overCount?: number;
  underCount?: number;
  gamesInLast5?: number;
  last5AvgPts?: number;
  seasonAvgPts?: number;
  diff: number;
  last3AvgPts?: number;
  prev3AvgPts?: number;
}

export type SortDir = "asc" | "desc";

// ── Data conversion helpers ─────────────────────────────────────────────────

export function toHotCards(data: OverSeasonAvgLast5Type[]): HotCard[] {
  return data.map((p) => ({
    playerName: p.playerName,
    overCount: p.overCount,
    gamesInLast5: p.gamesInLast5,
    last5AvgPts: p.last5AvgPts,
    seasonAvgPts: p.seasonAvgPts,
    diff: p.diff,
  }));
}

export function toColdCards(data: UnderSeasonAvgLast5[]): HotCard[] {
  return data.map((p) => ({
    playerName: p.playerName,
    underCount: p.underCount,
    gamesInLast5: p.gamesInLast5,
    last5AvgPts: p.last5AvgPts,
    seasonAvgPts: p.seasonAvgPts,
    diff: p.diff,
  }));
}

export function toTrendingCards(data: TrendingPlayer[]): HotCard[] {
  return data.map((p) => ({
    playerName: p.playerName,
    last3AvgPts: p.last3AvgPts,
    prev3AvgPts: p.prev3AvgPts,
    diff: p.diff,
  }));
}

// ── Shared UI Components ────────────────────────────────────────────────────

export function StatBadge({ code }: { code: string }) {
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatColor(code)}`}
    >
      {code}
    </span>
  );
}

export function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <span className="text-pe-text-faint ml-1 font-mono">&#x2195;</span>;
  }
  return (
    <span className="text-pe-accent ml-1 font-mono">
      {dir === "asc" ? "\u2191" : "\u2193"}
    </span>
  );
}

// ── Pick of the Day Hero Card ───────────────────────────────────────────────

export function PickOfTheDayHero({
  pick,
  propDate,
  goToPlayer,
}: {
  pick: TopPick;
  propDate?: string | null;
  goToPlayer: HomepageLayoutProps["goToPlayer"];
}) {
  const hitRate = pick.hitRate;
  const barPct = Math.max(0, Math.min(100, hitRate));
  const statKey = MARKET_TO_STAT[pick.marketCode] ?? pick.marketCode.toLowerCase();

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-pe-text-faint">
          Pick of the Day
        </span>
        <span className="text-[10px] font-bold bg-[#e4c661]/14 text-[#f3dd97] px-2 py-0.5 rounded-full uppercase tracking-wide">
          {formatPropDate(propDate)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => goToPlayer(pick.playerName, 10, statKey, pick.bookLine)}
        className="w-full text-left rounded-2xl bg-pe-surface-1 border border-pe-border/10 overflow-hidden transition-all hover:border-[#e4c661]/30 hover:bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-[#e4c661]/30 cursor-pointer group"
        aria-label={`Analyze ${pick.playerName} — ${pick.marketName} Over ${pick.bookLine}`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#cfa73e] via-[#e4c661] to-[#f3dd97]" />
        <div className="px-5 py-5 sm:px-6">
          {/* Single row: name + stat/line | hit rate + bar */}
          <div className="flex items-center gap-4">
            {/* Left: player + stat info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-2xl font-black text-pe-text-primary leading-tight truncate">
                  {pick.playerName}
                </p>
                <span className="shrink-0 text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  OVER
                </span>
              </div>
              <p className="text-base text-pe-text-secondary mt-1">
                {pick.marketName}{" "}
                <span className="font-black text-emerald-400 text-lg">{pick.bookLine}</span>
                <span className="text-pe-text-faint mx-2">&middot;</span>
                <span className="text-pe-text-faint">{pick.overCount}/{pick.gamesChecked} games</span>
              </p>
            </div>

            {/* Right: hit rate */}
            <div className="shrink-0 flex items-center gap-3">
              <div className="text-right">
                <p className={`text-3xl font-black leading-none ${hitRate >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                  {hitRate}%
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-pe-text-faint mt-1">
                  Hit Rate
                </p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pe-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Thin progress bar */}
          <div className="w-full h-2 bg-pe-surface-2 rounded-full overflow-hidden mt-4">
            <div
              className={`h-full rounded-full transition-all ${hitRate >= 80 ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      </button>
    </section>
  );
}

// ── Edge Card ───────────────────────────────────────────────────────────────

export function EdgeCard({
  item,
  goToPlayer,
}: {
  item: EdgeItem;
  goToPlayer: HomepageLayoutProps["goToPlayer"];
}) {
  const isOver = item.kind === "over";
  const pick = item.pick;
  const statKey = MARKET_TO_STAT[pick.marketCode] ?? pick.marketCode.toLowerCase();
  const hitRate = pick.hitRate;
  const hitColor = hitRate >= 80 ? "text-emerald-400" : hitRate >= 70 ? "text-amber-400" : "text-pe-text-secondary";

  return (
    <button
      type="button"
      onClick={() => goToPlayer(pick.playerName, 10, statKey, pick.bookLine)}
      className="snap-start shrink-0 w-44 min-w-[160px] flex flex-col gap-2 rounded-xl bg-pe-surface-1 border border-pe-border/10 p-3.5 text-left cursor-pointer transition-all hover:border-pe-border/20 hover:bg-pe-surface-2/50 focus:outline-none focus:ring-2 focus:ring-pe-accent/30"
      aria-label={`${pick.playerName} — ${pick.marketName} ${isOver ? "Over" : "Under"} ${pick.bookLine}`}
    >
      <p className="font-bold text-pe-text-primary text-sm leading-tight truncate w-full">{pick.playerName}</p>
      <p className="text-xs text-pe-text-muted truncate">
        {pick.marketCode} <span className="text-pe-text-secondary font-semibold">{pick.bookLine}</span>
      </p>
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-base font-black ${hitColor}`}>{hitRate}%</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
          isOver
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : "bg-red-500/15 text-red-400 border-red-500/30"
        }`}>
          {isOver ? "OVER" : "UNDER"}
        </span>
      </div>
    </button>
  );
}

// ── Today's Best Edges (horizontal scroll) ──────────────────────────────────

export function TodaysBestEdges({
  topPicks,
  underPicks,
  propDate,
  goToPlayer,
}: {
  topPicks: TopPick[];
  underPicks: UnderPick[];
  propDate?: string | null;
  goToPlayer: HomepageLayoutProps["goToPlayer"];
}) {
  const edges: EdgeItem[] = [
    ...topPicks.slice(1).map((p): EdgeItem => ({ kind: "over", pick: p })),
    ...underPicks.map((p): EdgeItem => ({ kind: "under", pick: p })),
  ];

  if (edges.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-pe-text-faint">
            Today&apos;s Best Edges
          </span>
          <span className="text-[10px] font-bold bg-pe-surface-2 text-pe-text-muted px-2 py-0.5 rounded-full">
            {edges.length} picks
          </span>
        </div>
        <span className="text-xs text-pe-text-faint">{formatPropDate(propDate)}</span>
      </div>

      <div className="relative">
        <div
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {edges.map((item, i) => (
            <EdgeCard key={`${item.kind}-${item.pick.playerName}-${item.pick.marketCode}-${i}`} item={item} goToPlayer={goToPlayer} />
          ))}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-pe-bg to-transparent" />
      </div>
    </section>
  );
}

// ── Yesterday's Scorecard ───────────────────────────────────────────────────

function getBestPick(picks: BacktestPick[]): BacktestPick | null {
  const wins = picks.filter((p) => p.result === "win");
  if (!wins.length) return null;
  return wins.reduce((best, p) => (p.hitRate > best.hitRate ? p : best), wins[0]);
}

function getWorstPick(picks: BacktestPick[]): BacktestPick | null {
  const losses = picks.filter((p) => p.result === "loss");
  if (!losses.length) return null;
  return losses.reduce((worst, p) => (p.hitRate > worst.hitRate ? p : worst), losses[0]);
}

export function YesterdayScorecard({
  gameDate,
  picks,
}: {
  gameDate: string;
  picks: BacktestPick[];
}) {
  if (!picks.length) return null;

  const wins = picks.filter((p) => p.result === "win").length;
  const losses = picks.filter((p) => p.result === "loss").length;
  const graded = wins + losses;
  const winRate = graded > 0 ? Math.round((wins / graded) * 100) : 0;

  const ringColor = winRate >= 65 ? "text-emerald-400" : winRate >= 50 ? "text-amber-400" : "text-red-400";
  const ringBg = winRate >= 65 ? "border-emerald-500" : winRate >= 50 ? "border-amber-500" : "border-red-500";

  const bestPick = getBestPick(picks);
  const worstPick = getWorstPick(picks);

  const formattedDate = gameDate
    ? new Date(gameDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "Yesterday";

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-pe-text-faint">
          Yesterday&apos;s Scorecard
        </span>
        <span className="text-[10px] text-pe-text-faint">{formattedDate}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-pe-surface-1 border border-pe-border/10 p-4 flex flex-col items-center justify-center gap-2">
          <div className={`w-16 h-16 rounded-full border-4 ${ringBg} flex items-center justify-center`}>
            <span className={`text-xl font-black ${ringColor}`}>{winRate}%</span>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-pe-text-faint uppercase tracking-wider">Win Rate</p>
            <p className="text-sm font-bold text-pe-text-secondary mt-0.5">
              <span className="text-emerald-400">{wins}W</span>
              <span className="text-pe-text-faint mx-1">-</span>
              <span className="text-red-400">{losses}L</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-pe-surface-1 border border-pe-border/10 p-4 flex flex-col gap-3">
          {bestPick && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-0.5">Best Pick</p>
              <p className="text-sm font-bold text-pe-text-primary leading-tight">{bestPick.playerName}</p>
              <p className="text-xs text-pe-text-muted">
                {bestPick.marketCode} {bestPick.side === "over" ? "Over" : "Under"} {bestPick.bookLine}
                <span className="ml-1.5 text-emerald-400 font-bold">{bestPick.hitRate}%</span>
              </p>
            </div>
          )}
          {worstPick && (
            <div className="border-t border-pe-border/5 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-0.5">Missed</p>
              <p className="text-sm font-bold text-pe-text-primary leading-tight">{worstPick.playerName}</p>
              <p className="text-xs text-pe-text-muted">
                {worstPick.marketCode} {worstPick.side === "over" ? "Over" : "Under"} {worstPick.bookLine}
                {worstPick.actualValue != null && (
                  <span className="ml-1.5 text-red-400 font-bold">actual: {worstPick.actualValue}</span>
                )}
              </p>
            </div>
          )}
          {!bestPick && !worstPick && (
            <p className="text-xs text-pe-text-faint">No graded picks.</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Streak Badge ─────────────────────────────────────────────────────────────

function StreakBadge({ card, variant }: { card: HotCard; variant: PlayerRowVariant }) {
  if (variant === "hot") {
    const overCount = card.overCount ?? 0;
    const seasonAvg = card.seasonAvgPts ?? 0;
    const isSignificant = seasonAvg > 0 && card.diff >= seasonAvg * 0.2;
    if (overCount === 5 && isSignificant) {
      return (
        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
          Fire — 5 game streak
        </span>
      );
    }
    if (overCount >= 4) {
      return (
        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
          Hot — {overCount} straight
        </span>
      );
    }
    return null;
  }

  if (variant === "cold") {
    const underCount = card.underCount ?? 0;
    if (underCount >= 4) {
      return (
        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
          Slumping — {underCount} straight
        </span>
      );
    }
    return null;
  }

  if (variant === "trending") {
    if (card.diff >= 5) {
      return (
        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
          Surging +{card.diff.toFixed(1)} PPG
        </span>
      );
    }
    return null;
  }

  return null;
}

// ── Player Scroll Cards ─────────────────────────────────────────────────────

export function PlayerScrollCard({
  card,
  variant,
  onClick,
}: {
  card: HotCard;
  variant: PlayerRowVariant;
  onClick: () => void;
}) {
  const isHot = variant === "hot";
  const isCold = variant === "cold";
  const isTrending = variant === "trending";

  const borderColor = isHot ? "border-l-emerald-500" : isCold ? "border-l-sky-500" : "border-l-amber-500";
  const badgeCls = isHot
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : isCold
      ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
      : "bg-amber-500/15 text-amber-400 border-amber-500/30";

  const diffColor = isHot || isTrending ? "text-emerald-400" : "text-sky-400";
  const diffPrefix = card.diff >= 0 ? "+" : "";

  const badgeText = isHot
    ? `${card.overCount ?? "?"}/5 OVER`
    : isCold
      ? `${card.underCount ?? "?"}/5 UNDER`
      : `+${card.diff.toFixed(1)} PPG`;

  const topLabel = isTrending ? "Last 3" : "Last 5";
  const topValue = isTrending ? card.last3AvgPts?.toFixed(1) ?? "\u2014" : card.last5AvgPts?.toFixed(1) ?? "\u2014";
  const bottomLabel = isTrending ? "Prev 3" : "Season";
  const bottomValue = isTrending ? card.prev3AvgPts?.toFixed(1) ?? "\u2014" : card.seasonAvgPts?.toFixed(1) ?? "\u2014";

  const streakBadge = <StreakBadge card={card} variant={variant} />;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`snap-start shrink-0 w-44 min-w-[160px] flex flex-col gap-2 rounded-xl bg-pe-surface-1 border border-pe-border/10 border-l-4 ${borderColor} p-3.5 text-left cursor-pointer transition-all hover:bg-pe-surface-2/50 focus:outline-none focus:ring-2 focus:ring-pe-border/20`}
      aria-label={`Analyze ${card.playerName ?? "player"}`}
    >
      <p className="font-bold text-pe-text-primary text-sm leading-tight truncate w-full">{card.playerName ?? "\u2014"}</p>
      {streakBadge}
      <span className={`inline-flex w-fit items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeCls}`}>
        {badgeText}
      </span>
      <div className="mt-auto space-y-0.5 w-full">
        <div className="flex justify-between text-xs">
          <span className="text-pe-text-faint">{topLabel}</span>
          <span className="font-bold text-pe-text-primary">{topValue}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-pe-text-faint">{bottomLabel}</span>
          <span className="text-pe-text-muted">{bottomValue}</span>
        </div>
        <div className="flex justify-between text-xs pt-1 border-t border-pe-border/5">
          <span className="text-pe-text-faint">Diff</span>
          <span className={`font-bold ${diffColor}`}>{diffPrefix}{card.diff.toFixed(1)}</span>
        </div>
      </div>
    </button>
  );
}

export function PlayerScrollRow({
  title,
  subtitle,
  emoji,
  cards,
  variant,
  onCardClick,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  cards: HotCard[];
  variant: PlayerRowVariant;
  onCardClick: (card: HotCard) => void;
}) {
  if (cards.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" aria-hidden="true">{emoji}</span>
        <div>
          <h2 className="text-sm font-black uppercase tracking-wide text-pe-text-primary">{title}</h2>
          <p className="text-[11px] text-pe-text-faint">{subtitle}</p>
        </div>
      </div>

      <div className="relative">
        <div
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {cards.map((card, i) => (
            <PlayerScrollCard key={`${variant}-${card.playerName ?? i}-${i}`} card={card} variant={variant} onClick={() => onCardClick(card)} />
          ))}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-pe-bg to-transparent" />
      </div>
    </section>
  );
}

// ── Status Bar ──────────────────────────────────────────────────────────────

export function StatusBar({
  lastUpdated,
  totalPicks,
  backtestWins,
  backtestLosses,
}: {
  lastUpdated?: string | null;
  totalPicks: number;
  backtestWins: number;
  backtestLosses: number;
}) {
  const totalGraded = backtestWins + backtestLosses;
  const winPct = totalGraded > 0 ? Math.round((backtestWins / totalGraded) * 100) : null;
  const winPctColor = winPct == null ? "text-pe-text-faint" : winPct >= 65 ? "text-emerald-400" : winPct >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 px-3 mb-4 bg-pe-surface-1 border border-pe-border/10 rounded-lg">
      <span className="font-black tracking-widest text-pe-text-primary uppercase text-[11px] font-mono">PropEdge</span>
      <span className="text-pe-border/20 select-none hidden sm:inline">|</span>
      <span className="text-xs text-pe-text-faint font-mono">
        Updated <span className="text-pe-text-muted">{formatRelativeTimeShort(lastUpdated)}</span>
      </span>
      <span className="text-pe-border/20 select-none hidden sm:inline">|</span>
      <span className="text-xs text-pe-text-faint font-mono">
        <span className="text-pe-text-muted">{totalPicks}</span> picks today
      </span>
      {winPct !== null && (
        <>
          <span className="text-pe-border/20 select-none hidden sm:inline">|</span>
          <span className="text-xs text-pe-text-faint font-mono">
            Yesterday: <span className="text-emerald-400 font-bold">{backtestWins}W</span>-<span className="text-red-400 font-bold">{backtestLosses}L</span>
            {" ("}<span className={`font-bold ${winPctColor}`}>{winPct}%</span>{")"}
          </span>
        </>
      )}
    </div>
  );
}

// ── Picks Table ─────────────────────────────────────────────────────────────

export function PicksTable({
  picks,
  side,
  goToPlayer,
}: {
  picks: (TopPick | UnderPick)[];
  side: "over" | "under";
  goToPlayer: HomepageLayoutProps["goToPlayer"];
}) {
  if (picks.length === 0) {
    return (
      <div className="text-center py-10 text-pe-text-faint text-xs">
        No {side} picks available.
      </div>
    );
  }

  const countKey = side === "over" ? "overCount" : "underCount";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[520px]">
        <thead>
          <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
            <th className="text-left py-2.5 px-3 w-8">#</th>
            <th className="text-left py-2.5 px-3">Player</th>
            <th className="text-left py-2.5 px-2">Stat</th>
            <th className="text-right py-2.5 px-3">Line</th>
            <th className="text-right py-2.5 px-3">Hit Rate</th>
            <th className="text-right py-2.5 px-3">{side === "over" ? "Over" : "Under"}</th>
            <th className="text-right py-2.5 px-3 hidden sm:table-cell">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {picks.map((p, i) => {
            const statKey = MARKET_TO_STAT[p.marketCode];
            const count = (p as Record<string, unknown>)[countKey];
            const countNum = typeof count === "number" ? count : 0;
            return (
              <tr
                key={`${p.playerName}-${p.marketCode}-${i}`}
                className="border-b border-pe-border/5 hover:bg-pe-surface-2/30 transition-colors cursor-pointer"
                onClick={() => goToPlayer(p.playerName, 10, statKey, p.bookLine)}
              >
                <td className="py-2 px-3 text-pe-text-faint font-mono">{i + 1}</td>
                <td className="py-2 px-3 font-semibold text-pe-text-primary whitespace-nowrap">{p.playerName}</td>
                <td className="py-2 px-2"><StatBadge code={p.marketCode} /></td>
                <td className="py-2 px-3 text-right text-pe-text-secondary font-mono">{p.bookLine}</td>
                <td className={`py-2 px-3 text-right font-bold font-mono ${hitRateTextClass(p.hitRate, side)}`}>{p.hitRate}%</td>
                <td className="py-2 px-3 text-right text-pe-text-muted font-mono">{countNum}/{p.gamesChecked}</td>
                <td className="py-2 px-3 text-right hidden sm:table-cell">
                  <div className="inline-flex items-center justify-end w-16">
                    <div className="w-full h-1 bg-pe-surface-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${hitRateBarClass(p.hitRate, side)}`} style={{ width: `${Math.max(0, Math.min(100, p.hitRate))}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Results Tab ─────────────────────────────────────────────────────────────

export function ResultsTab({
  picks,
  gameDate,
}: {
  picks: BacktestPick[];
  gameDate: string;
}) {
  if (picks.length === 0) {
    return (
      <div className="text-center py-10 text-pe-text-faint text-xs">
        No backtest results available.
      </div>
    );
  }

  const wins = picks.filter((p) => p.result === "win").length;
  const losses = picks.filter((p) => p.result === "loss").length;
  const graded = wins + losses;
  const winRate = graded > 0 ? Math.round((wins / graded) * 100) : 0;
  const winRateColor = winRate >= 65 ? "text-emerald-400" : winRate >= 50 ? "text-amber-400" : "text-red-400";

  const formatted = gameDate
    ? new Date(gameDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "Yesterday";

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 px-3 pt-2 flex-wrap">
        <span className={`text-2xl font-black font-mono ${winRateColor}`}>{winRate}%</span>
        <span className="text-pe-text-faint text-xs">Win Rate</span>
        <span className="text-pe-border/30 select-none">|</span>
        <span className="text-xs font-mono">
          <span className="text-emerald-400 font-bold">{wins}W</span>
          <span className="text-pe-text-faint mx-1">-</span>
          <span className="text-red-400 font-bold">{losses}L</span>
        </span>
        <span className="text-pe-border/30 select-none">|</span>
        <span className="text-xs text-pe-text-faint">{formatted}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest border-b border-pe-border/10">
              <th className="text-left py-2.5 px-3">Player</th>
              <th className="text-left py-2.5 px-2">Side</th>
              <th className="text-left py-2.5 px-2">Stat</th>
              <th className="text-right py-2.5 px-3">Line</th>
              <th className="text-right py-2.5 px-3">Actual</th>
              <th className="text-right py-2.5 px-3">Pred</th>
              <th className="text-right py-2.5 px-3">Result</th>
            </tr>
          </thead>
          <tbody>
            {picks.map((p, i) => {
              const isWin = p.result === "win";
              const isLoss = p.result === "loss";
              const isDnp = p.result === "dnp";
              const isPush = p.result === "push";
              return (
                <tr
                  key={`${p.playerName}-${p.marketCode}-${p.side}-${i}`}
                  className="border-b border-pe-border/5 hover:bg-pe-surface-2/20 transition-colors"
                >
                  <td className="py-2 px-3 font-semibold text-pe-text-primary whitespace-nowrap">{p.playerName}</td>
                  <td className="py-2 px-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      p.side === "over"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }`}>
                      {p.side === "over" ? "OVR" : "UND"}
                    </span>
                  </td>
                  <td className="py-2 px-2"><StatBadge code={p.marketCode} /></td>
                  <td className="py-2 px-3 text-right text-pe-text-secondary font-mono">{p.bookLine}</td>
                  <td className={`py-2 px-3 text-right font-mono font-bold ${
                    isDnp ? "text-pe-text-faint" : isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-pe-text-muted"
                  }`}>
                    {isDnp ? "\u2014" : (p.actualValue ?? "\u2014")}
                  </td>
                  <td className="py-2 px-3 text-right text-pe-text-faint font-mono">{p.hitRate}%</td>
                  <td className="py-2 px-3 text-right font-bold font-mono">
                    {isWin && <span className="text-emerald-400">&#x2713; W</span>}
                    {isLoss && <span className="text-red-400">&#x2717; L</span>}
                    {isPush && <span className="text-pe-text-faint">&#x2014; P</span>}
                    {isDnp && <span className="text-pe-text-faint">DNP</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
