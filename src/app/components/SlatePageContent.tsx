"use client";

import { useState } from "react";
import Link from "next/link";
import type { TodaysPlayer, TopPick, TeamDefensiveRating, MlPrediction } from "@/lib/data";
import { formatRelativeTimeShort } from "./homepage-shared";

// ── Types ────────────────────────────────────────────────────────────────────

interface SlatePageContentProps {
  todaysPlayers: TodaysPlayer[];
  defensiveRatings: TeamDefensiveRating[];
  lastUpdated: string | null;
  propDate: string | null;
  mlPredictions: MlPrediction[];
}

interface GameGroup {
  matchupKey: string;
  homeTeam: string;
  awayTeam: string;
  players: TodaysPlayer[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STAT_BADGE_COLORS: Record<string, string> = {
  PTS: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  REB: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  AST: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  STL: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  BLK: "bg-red-500/15 text-red-400 border-red-500/30",
  FG3: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  PRA: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PR: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  PA: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  RA: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  SB: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function getStatBadgeColor(code: string) {
  return STAT_BADGE_COLORS[code] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
}

function formatSlateDate(propDate: string | null): string {
  if (!propDate) {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  return new Date(propDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupPlayersByGame(players: TodaysPlayer[]): GameGroup[] {
  const map = new Map<string, GameGroup>();
  for (const player of players) {
    const key = `${player.awayTeam}@${player.homeTeam}`;
    if (!map.has(key)) {
      map.set(key, {
        matchupKey: key,
        homeTeam: player.homeTeam,
        awayTeam: player.awayTeam,
        players: [],
      });
    }
    map.get(key)!.players.push(player);
  }
  return Array.from(map.values());
}

function splitByTeam(
  players: TodaysPlayer[],
  homeTeam: string,
  awayTeam: string
): { home: TodaysPlayer[]; away: TodaysPlayer[] } {
  const home: TodaysPlayer[] = [];
  const away: TodaysPlayer[] = [];
  for (const p of players) {
    if (p.playerTeam === homeTeam) home.push(p);
    else if (p.playerTeam === awayTeam) away.push(p);
    else away.push(p);
  }
  const byPts = (a: TodaysPlayer, b: TodaysPlayer) =>
    (b.ptsLine ?? 0) - (a.ptsLine ?? 0);
  home.sort(byPts);
  away.sort(byPts);
  return { home, away };
}

// ── Defense helpers ──────────────────────────────────────────────────────────

type DefStat = "pts" | "reb" | "ast" | "3p" | "ft" | "stl" | "blk" | "tov";

const DEF_STAT_KEYS: Record<DefStat, { rankKey: string; valKey: keyof TeamDefensiveRating; label: string }> = {
  pts: { rankKey: "opp_pts", valKey: "oppPts", label: "PPG" },
  reb: { rankKey: "opp_trb", valKey: "oppReb", label: "RPG" },
  ast: { rankKey: "opp_ast", valKey: "oppAst", label: "APG" },
  "3p": { rankKey: "opp_3p", valKey: "opp3p", label: "3PM" },
  ft: { rankKey: "opp_ft", valKey: "oppFt", label: "FTM" },
  stl: { rankKey: "opp_stl", valKey: "oppStl", label: "SPG" },
  blk: { rankKey: "opp_blk", valKey: "oppBlk", label: "BPG" },
  tov: { rankKey: "opp_tov", valKey: "oppTov", label: "TOV" },
};

const MARKET_TO_DEF_STAT: Record<string, DefStat> = {
  PTS: "pts", REB: "reb", AST: "ast", FG3: "3p", FTM: "ft",
  STL: "stl", BLK: "blk", TOV: "tov",
  PRA: "pts", PR: "pts", PA: "pts", RA: "reb", SB: "stl",
};

function getDefRating(ratings: TeamDefensiveRating[], teamCode: string) {
  return ratings.find((d) => d.teamCode === teamCode) ?? null;
}

function getDefRank(rating: TeamDefensiveRating | null, stat: DefStat): number | null {
  if (!rating) return null;
  return rating.ranks[DEF_STAT_KEYS[stat].rankKey] ?? null;
}

function ordinal(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

type DefenseVerdict = "weak" | "mid" | "strong";

function defVerdict(rank: number | null, total: number): DefenseVerdict {
  if (rank === null) return "mid";
  if (rank >= total * 0.7) return "weak";
  if (rank <= total * 0.3) return "strong";
  return "mid";
}

function verdictColor(v: DefenseVerdict): string {
  if (v === "weak") return "text-emerald-400";
  if (v === "strong") return "text-red-400";
  return "text-pe-text-muted";
}

function pickSignal(
  pick: TopPick,
  opponentRating: TeamDefensiveRating | null,
  total: number
): { icon: string; label: string; color: string } | null {
  const defStat = MARKET_TO_DEF_STAT[pick.marketCode];
  if (!defStat || !opponentRating) return null;
  const rank = getDefRank(opponentRating, defStat);
  if (rank === null) return null;
  const v = defVerdict(rank, total);
  if (v === "weak") return { icon: "+", label: ordinal(rank), color: "text-emerald-400" };
  if (v === "strong") return { icon: "-", label: ordinal(rank), color: "text-red-400" };
  return null;
}

function statDefenseInfo(
  defStat: DefStat,
  opponentRating: TeamDefensiveRating | null,
  total: number
): { allowed: number; rank: number; verdict: DefenseVerdict } | null {
  if (!opponentRating) return null;
  const rank = getDefRank(opponentRating, defStat);
  if (rank === null) return null;
  const key = DEF_STAT_KEYS[defStat].valKey;
  const allowed = opponentRating[key];
  if (typeof allowed !== "number") return null;
  return { allowed, rank, verdict: defVerdict(rank, total) };
}

// ── Player Row ──────────────────────────────────────────────────────────────
// Grid layout: Name | PTS | REB | AST | Edges
// Consistent column widths so everything aligns across players

function PlayerRow({
  player,
  picks,
  mlPicks,
  opponentRating,
  total,
}: {
  player: TodaysPlayer;
  picks: TopPick[];
  mlPicks: MlPrediction[];
  opponentRating: TeamDefensiveRating | null;
  total: number;
}) {
  const qualifiedMlPicks = mlPicks
    .filter((ml) => ml.confidence >= 0.10)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  const hasEdge = picks.length > 0 || qualifiedMlPicks.length > 0;

  const allBadges = [
    ...picks.map((pick) => {
      const signal = pickSignal(pick, opponentRating, total);
      return (
        <span
          key={`${pick.marketCode}-${pick.bookLine}`}
          className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap ${
            pick.hitRate >= 80
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/25"
          }`}
        >
          {pick.marketCode} {pick.bookLine} {pick.hitRate}%
          {signal && (
            <span className={`${signal.color} font-mono`}>
              {signal.icon}{signal.label}
            </span>
          )}
        </span>
      );
    }),
    ...qualifiedMlPicks.map((ml) => {
      const isOver = ml.prediction === "OVER";
      const pct = isOver
        ? Math.round(ml.pOver * 100)
        : Math.round((1 - ml.pOver) * 100);
      return (
        <span
          key={`ml-${ml.marketCode}`}
          className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap ${
            isOver
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/10 text-red-400 border-red-500/25"
          }`}
        >
          <span className="text-[9px] opacity-60 font-mono">ML</span>
          {ml.marketCode} {ml.prediction} {pct}%
        </span>
      );
    }),
  ];

  return (
    <div
      className={`flex flex-col py-2 px-3 border-b border-pe-border/5 last:border-0 hover:bg-pe-surface-2/20 transition-colors gap-1.5 ${
        hasEdge ? "bg-emerald-500/[0.03]" : ""
      }`}
    >
      {/* Top row: Name + stat lines */}
      <div className="flex items-center gap-x-2.5 min-w-0">
        <Link
          href={`/player/${encodeURIComponent(player.playerName)}`}
          className="text-[13px] font-semibold text-pe-text-primary hover:text-pe-accent transition-colors truncate w-[120px] sm:w-[140px] shrink-0"
        >
          {player.playerName}
        </Link>
        <div className="flex items-center gap-x-2 ml-auto shrink-0">
          <span className="text-[13px] font-mono text-pe-text-primary tabular-nums w-[42px] text-right shrink-0">
            <span className="text-[10px] text-pe-text-faint mr-0.5">P</span>{player.ptsLine ?? "—"}
          </span>
          <span className="text-[13px] font-mono text-pe-text-primary tabular-nums w-[38px] text-right shrink-0">
            <span className="text-[10px] text-pe-text-faint mr-0.5">R</span>{player.rebLine ?? "—"}
          </span>
          <span className="text-[13px] font-mono text-pe-text-primary tabular-nums w-[38px] text-right shrink-0">
            <span className="text-[10px] text-pe-text-faint mr-0.5">A</span>{player.astLine ?? "—"}
          </span>
        </div>
      </div>

      {/* Bottom row: Edge badges (only when present) */}
      {hasEdge && (
        <div className="flex flex-wrap gap-1">
          {allBadges}
        </div>
      )}
    </div>
  );
}

// ── Team Column ─────────────────────────────────────────────────────────────

const DEF_DISPLAY: { label: string; stat: DefStat }[] = [
  { label: "PPG", stat: "pts" },
  { label: "RPG", stat: "reb" },
  { label: "APG", stat: "ast" },
  { label: "3PM", stat: "3p" },
];

function TeamColumn({
  teamCode,
  players,
  topPicks,
  mlPredictions,
  opponentRating,
  opponentCode,
  total,
}: {
  teamCode: string;
  players: TodaysPlayer[];
  topPicks: TopPick[];
  mlPredictions: MlPrediction[];
  opponentRating: TeamDefensiveRating | null;
  opponentCode: string;
  total: number;
}) {
  if (players.length === 0) return null;

  const edgeCount = new Set(
    topPicks
      .filter((p) => players.some((pl) => pl.playerName === p.playerName))
      .map((p) => p.playerName)
  ).size;

  return (
    <div className="flex flex-col min-w-0">
      {/* Row 1: Team name + edge count */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-pe-surface-2/30">
        <span className="text-xs font-black uppercase tracking-tight text-pe-text-primary">
          {teamCode}
        </span>
        <span className="text-[11px] text-pe-text-faint">
          {players.length} players
        </span>
        {edgeCount > 0 && (
          <span className="text-[11px] font-bold text-emerald-400 ml-auto">
            {edgeCount} edge{edgeCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Row 2: Opponent defense allowed stats */}
      {opponentRating && (
        <div className="flex items-center gap-2.5 px-3 py-1 bg-pe-surface-2/15 border-b border-pe-border/5">
          <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-wider">
            vs {opponentCode}
          </span>
          {DEF_DISPLAY.map(({ label, stat }) => {
            const info = statDefenseInfo(stat, opponentRating, total);
            if (!info) return null;
            return (
              <span key={stat} className="inline-flex items-center gap-0.5 text-[11px] font-mono">
                <span className="text-pe-text-faint">{label}</span>
                <span className={`font-bold ${verdictColor(info.verdict)}`}>
                  {info.allowed.toFixed(1)}
                </span>
                <span className={`text-[10px] ${verdictColor(info.verdict)} opacity-60`}>
                  {ordinal(info.rank)}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Column headers */}
      <div className="flex items-center gap-x-2.5 px-3 py-0.5 border-b border-pe-border/5">
        <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-wider w-[120px] sm:w-[140px] shrink-0">Player</span>
        <div className="flex items-center gap-x-2 ml-auto shrink-0">
          <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-wider w-[42px] text-right shrink-0">PTS</span>
          <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-wider w-[38px] text-right shrink-0">REB</span>
          <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-wider w-[38px] text-right shrink-0">AST</span>
        </div>
      </div>

      {/* Player rows */}
      {players.map((player) => {
        const picksForPlayer = topPicks.filter(
          (p) => p.playerName === player.playerName
        );
        const mlPicksForPlayer = mlPredictions.filter(
          (ml) => ml.playerName === player.playerName
        );
        return (
          <PlayerRow
            key={player.playerName}
            player={player}
            picks={picksForPlayer}
            mlPicks={mlPicksForPlayer}
            opponentRating={opponentRating}
            total={total}
          />
        );
      })}
    </div>
  );
}

// ── Collapsible Game Card ────────────────────────────────────────────────────

function GameCard({
  group,
  topPicks,
  mlPredictions,
  defensiveRatings,
  defaultOpen,
  forceOpen,
}: {
  group: GameGroup;
  topPicks: TopPick[];
  mlPredictions: MlPrediction[];
  defensiveRatings: TeamDefensiveRating[];
  defaultOpen: boolean;
  forceOpen: boolean | null;
}) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = forceOpen !== null ? forceOpen : localOpen;

  const total = defensiveRatings.length;
  const playerNames = new Set(group.players.map((p) => p.playerName));
  const picksForGame = topPicks.filter((p) => playerNames.has(p.playerName));
  const edgeCount = new Set(picksForGame.map((p) => p.playerName)).size;

  const { home, away } = splitByTeam(group.players, group.homeTeam, group.awayTeam);
  const homeRating = getDefRating(defensiveRatings, group.homeTeam);
  const awayRating = getDefRating(defensiveRatings, group.awayTeam);

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden">
      {/* Matchup header */}
      <button
        type="button"
        onClick={() => setLocalOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-pe-surface-2/30 hover:bg-pe-surface-2/50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-tight text-pe-text-primary">
            {group.awayTeam}{" "}
            <span className="text-pe-text-faint font-normal text-xs">@</span>{" "}
            {group.homeTeam}
          </h2>
          {edgeCount > 0 && (
            <span className="text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
              {edgeCount} edge{edgeCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-pe-text-faint transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Side-by-side on desktop, stacked on mobile */}
      {open && (
        <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-pe-border/10">
          <div className="lg:border-r lg:border-pe-border/10">
            <TeamColumn
              teamCode={group.awayTeam}
              players={away}
              topPicks={picksForGame}
              mlPredictions={mlPredictions}
              opponentRating={homeRating}
              opponentCode={group.homeTeam}
              total={total}
            />
          </div>
          <div className="border-t border-pe-border/5 lg:border-t-0">
            <TeamColumn
              teamCode={group.homeTeam}
              players={home}
              topPicks={picksForGame}
              mlPredictions={mlPredictions}
              opponentRating={awayRating}
              opponentCode={group.awayTeam}
              total={total}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Prop AI Section ─────────────────────────────────────────────────────────

const CONFIDENCE_TIERS = [
  { label: "High Confidence", min: 0.20, color: "emerald" },
  { label: "Moderate", min: 0.10, color: "amber" },
] as const;

function PropAiSection({ mlPredictions }: { mlPredictions: MlPrediction[] }) {
  const [expanded, setExpanded] = useState(true);

  // Top 20 picks by confidence, max 2 per player for variety
  const sorted = mlPredictions
    .filter((ml) => ml.confidence >= 0.10)
    .sort((a, b) => b.confidence - a.confidence);
  const top20: typeof sorted = [];
  const playerCount = new Map<string, number>();
  for (const pick of sorted) {
    const count = playerCount.get(pick.playerName) ?? 0;
    if (count >= 2) continue;
    top20.push(pick);
    playerCount.set(pick.playerName, count + 1);
    if (top20.length >= 20) break;
  }

  if (top20.length === 0) return null;

  // Group into tiers
  const tiers = CONFIDENCE_TIERS.map((tier) => ({
    ...tier,
    picks: top20.filter(
      (ml) =>
        ml.confidence >= tier.min &&
        (tier.min === 0.20 || ml.confidence < 0.20)
    ),
  })).filter((t) => t.picks.length > 0);

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500/10 via-pe-surface-2/30 to-pe-surface-2/30 hover:from-blue-500/15 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-black uppercase tracking-tight text-pe-text-primary">
            Prop AI
          </span>
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
            {top20.length} picks
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-pe-text-faint transition-transform ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div>
          {tiers.map((tier) => (
            <div key={tier.label}>
              <div className="px-4 py-1.5 bg-pe-surface-2/20 border-t border-pe-border/5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  tier.color === "emerald" ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {tier.label} — {tier.picks.length} picks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-pe-border/5">
                {tier.picks.map((ml) => {
                  const isOver = ml.prediction === "OVER";
                  const prob = isOver
                    ? Math.round(ml.pOver * 100)
                    : Math.round((1 - ml.pOver) * 100);

                  return (
                    <div
                      key={`${ml.playerName}-${ml.marketCode}`}
                      className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-pe-surface-1/80 hover:bg-pe-surface-2/40 transition-colors"
                    >
                      {/* Pick badge */}
                      <div className={`shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 ${
                        isOver
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-red-500/25 bg-red-500/8"
                      }`}>
                        <div className="text-center leading-tight">
                          <div className={`text-[10px] sm:text-[11px] font-black ${isOver ? "text-emerald-400" : "text-red-400"}`}>
                            {ml.prediction === "OVER" ? "OVR" : "UND"}
                          </div>
                          <div className="text-[14px] sm:text-[15px] font-black text-pe-text-primary">
                            {ml.bookLine}
                          </div>
                        </div>
                      </div>

                      {/* Player + details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/player/${encodeURIComponent(ml.playerName)}`}
                          className="text-[13px] sm:text-sm font-bold text-pe-text-primary hover:text-pe-accent transition-colors block truncate"
                        >
                          {ml.playerName}
                        </Link>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            getStatBadgeColor(ml.marketCode)
                          }`}>
                            {ml.marketCode}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-pe-text-faint">
                            L5: <span className="font-bold text-pe-text-muted">{ml.avgLast5 != null ? ml.avgLast5.toFixed(1) : "—"}</span>
                          </span>
                          {ml.oppDefRank != null && (
                            <span className={`text-[10px] sm:text-[11px] ${
                              ml.oppDefRank >= 21 ? "text-emerald-400" : ml.oppDefRank <= 9 ? "text-red-400" : "text-pe-text-faint"
                            }`}>
                              Def: <span className="font-bold">{ordinal(ml.oppDefRank)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Confidence */}
                      <div className="shrink-0 text-right">
                        <div className={`text-base sm:text-lg font-black ${isOver ? "text-emerald-400" : "text-red-400"}`}>
                          {prob}%
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-pe-text-faint">conf</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Track record link */}
          <Link
            href="/track-record"
            className="flex items-center justify-center gap-2 py-3 border-t border-pe-border/10 text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 transition-colors"
          >
            View full track record — 75.7% hit rate over 19 days
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SlatePageContent({
  todaysPlayers,
  defensiveRatings,
  lastUpdated,
  propDate,
  mlPredictions,
}: SlatePageContentProps) {
  const gameGroups = groupPlayersByGame(todaysPlayers);
  const hasGames = gameGroups.length > 0;
  const [allOpen, setAllOpen] = useState<boolean | null>(null);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-lg font-black uppercase tracking-tight text-pe-text-primary">
            The Edge
          </h1>
          <p className="text-xs text-pe-text-faint mt-0.5">
            {formatSlateDate(propDate)}
          </p>
        </div>
        {hasGames && (
          <button
            type="button"
            onClick={() => setAllOpen((prev) => (prev === null ? false : !prev))}
            className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint hover:text-pe-text-muted transition-colors px-2 py-1 rounded-lg bg-pe-surface-1 border border-pe-border/10"
          >
            {allOpen === false ? "Expand All" : "Collapse All"}
          </button>
        )}
      </div>

      {/* Summary strip */}
      <div className="flex items-center gap-3 py-1.5 px-3 mb-4 bg-pe-surface-1 border border-pe-border/10 rounded-lg text-[11px] font-mono text-pe-text-faint">
        <span className="text-pe-text-muted font-bold">{gameGroups.length}</span> games
        <span className="text-pe-border/20 select-none hidden sm:inline">&middot;</span>
        <span className="hidden sm:inline"><span className="text-pe-text-muted font-bold">{todaysPlayers.length}</span> players</span>
        {mlPredictions.length > 0 && (
          <>
            <span className="text-pe-border/20 select-none">&middot;</span>
            <span><span className="text-blue-400 font-bold">{Math.min(mlPredictions.filter((ml) => ml.confidence >= 0.10).length, 20)}</span> AI picks</span>
          </>
        )}
        <span className="ml-auto text-pe-text-faint">
          {formatRelativeTimeShort(lastUpdated)}
        </span>
      </div>

      {/* Prop AI picks */}
      {hasGames && <PropAiSection mlPredictions={mlPredictions} />}

      {!hasGames ? (
        <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-12 text-center">
          <p className="text-pe-text-primary font-bold text-base mb-1">
            No games scheduled today
          </p>
          <p className="text-pe-text-faint text-sm">
            Check back on game days for today&apos;s full card with prop lines and edges.
          </p>
          <Link
            href="/analytics"
            className="inline-block mt-4 text-sm font-bold text-pe-accent hover:text-pe-accent/80 transition-colors"
          >
            View Analytics instead
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {gameGroups.map((group, i) => (
            <GameCard
              key={group.matchupKey}
              group={group}
              topPicks={[]}
              mlPredictions={mlPredictions}
              defensiveRatings={defensiveRatings}
              defaultOpen={i < 3}
              forceOpen={allOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
