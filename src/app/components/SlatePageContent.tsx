"use client";

import { useState } from "react";
import Link from "next/link";
import type { TodaysPlayer, TopPick, UnderPick, TeamDefensiveRating } from "@/lib/data";
import { getDefenseMarketInfo } from "@/lib/defense";
import { formatRelativeTimeShort } from "./homepage-shared";

// ── Types ────────────────────────────────────────────────────────────────────

interface SlatePageContentProps {
  todaysPlayers: TodaysPlayer[];
  defensiveRatings: TeamDefensiveRating[];
  lastUpdated: string | null;
  propDate: string | null;
  topPicks: TopPick[];
  underPicks: UnderPick[];
}

interface GameGroup {
  matchupKey: string;
  homeTeam: string;
  awayTeam: string;
  players: TodaysPlayer[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  const info = getDefenseMarketInfo(opponentRating, pick.marketCode);
  const rank = info?.rank ?? null;
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

function PlayerRow({
  player,
  picks,
  underPicks,
  opponentRating,
  total,
}: {
  player: TodaysPlayer;
  picks: TopPick[];
  underPicks: UnderPick[];
  opponentRating: TeamDefensiveRating | null;
  total: number;
}) {
  const hasEdge = picks.length > 0 || underPicks.length > 0;

  const overBadges = picks.map((pick) => {
    const signal = pickSignal(pick, opponentRating, total);
    return (
        <span
        key={`over-${pick.marketCode}-${pick.bookLine}`}
        className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap ${
          pick.hitRate >= 80
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
        }`}
      >
        {pick.marketCode} O{pick.bookLine} {pick.hitRate}%
        {signal && (
          <span className={`${signal.color} font-mono`}>
            {signal.icon}{signal.label}
          </span>
        )}
      </span>
    );
  });

  const underBadges = underPicks.map((pick) => (
    <span
      key={`under-${pick.marketCode}-${pick.bookLine}`}
      className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap ${
        pick.hitRate >= 80
          ? "bg-red-500/15 text-red-400 border-red-500/30"
          : "bg-red-500/10 text-red-300 border-red-500/25"
      }`}
    >
      {pick.marketCode} U{pick.bookLine} {pick.hitRate}%
    </span>
  ));

  return (
    <div
      className={`flex flex-col py-2 px-3 border-b border-pe-border/5 last:border-0 hover:bg-pe-surface-2/20 transition-colors gap-1.5 ${
        hasEdge ? "bg-white/[0.015]" : ""
      }`}
    >
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

      {hasEdge && (
        <div className="flex flex-wrap gap-1">
          {overBadges}
          {underBadges}
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
  underPicks,
  opponentRating,
  opponentCode,
  total,
}: {
  teamCode: string;
  players: TodaysPlayer[];
  topPicks: TopPick[];
  underPicks: UnderPick[];
  opponentRating: TeamDefensiveRating | null;
  opponentCode: string;
  total: number;
}) {
  if (players.length === 0) return null;

  return (
    <div className="flex flex-col min-w-0">
      {/* Team header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-pe-surface-2/30">
        <span className="text-xs font-black uppercase tracking-tight text-pe-text-primary">
          {teamCode}
        </span>
        <span className="text-[11px] text-pe-text-faint">
          {players.length} players
        </span>
      </div>

      {/* Opponent defense allowed stats */}
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
          (p) => p.playerName === player.playerName && p.playingToday
        );
        const underPicksForPlayer = underPicks.filter(
          (p) => p.playerName === player.playerName && p.playingToday
        );
        return (
          <PlayerRow
            key={player.playerName}
            player={player}
            picks={picksForPlayer}
            underPicks={underPicksForPlayer}
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
  underPicks,
  defensiveRatings,
  defaultOpen,
  forceOpen,
}: {
  group: GameGroup;
  topPicks: TopPick[];
  underPicks: UnderPick[];
  defensiveRatings: TeamDefensiveRating[];
  defaultOpen: boolean;
  forceOpen: boolean | null;
}) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = forceOpen !== null ? forceOpen : localOpen;

  const total = defensiveRatings.length;
  const { home, away } = splitByTeam(group.players, group.homeTeam, group.awayTeam);
  const homeRating = getDefRating(defensiveRatings, group.homeTeam);
  const awayRating = getDefRating(defensiveRatings, group.awayTeam);

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setLocalOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-pe-surface-2/30 hover:bg-pe-surface-2/50 transition-colors text-left cursor-pointer"
      >
        <h2 className="text-sm font-black uppercase tracking-tight text-pe-text-primary">
          {group.awayTeam}{" "}
            <span className="text-pe-text-faint font-normal text-xs">@</span>{" "}
          {group.homeTeam}
        </h2>
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

      {open && (
        <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-pe-border/10">
          <div className="lg:border-r lg:border-pe-border/10">
            <TeamColumn
              teamCode={group.awayTeam}
              players={away}
              topPicks={topPicks}
              underPicks={underPicks}
              opponentRating={homeRating}
              opponentCode={group.homeTeam}
              total={total}
            />
          </div>
          <div className="border-t border-pe-border/5 lg:border-t-0">
            <TeamColumn
              teamCode={group.homeTeam}
              players={home}
              topPicks={topPicks}
              underPicks={underPicks}
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

// ── Main Component ───────────────────────────────────────────────────────────

export default function SlatePageContent({
  todaysPlayers,
  defensiveRatings,
  lastUpdated,
  propDate,
  topPicks,
  underPicks,
}: SlatePageContentProps) {
  const gameGroups = groupPlayersByGame(todaysPlayers);
  const hasGames = gameGroups.length > 0;
  const [allOpen, setAllOpen] = useState<boolean | null>(null);

  const analyticsPickCount =
    topPicks.filter((p) => p.playingToday).length +
    underPicks.filter((p) => p.playingToday).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-lg font-black uppercase tracking-tight text-pe-text-primary">
            Slate
          </h1>
          <p className="text-xs text-pe-text-faint mt-0.5">
            {formatSlateDate(propDate)}
          </p>
          <p className="text-[10px] text-pe-text-faint mt-1">
            All picks are for informational and entertainment purposes only. Not gambling advice.
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
        {analyticsPickCount > 0 && (
          <>
            <span className="text-pe-border/20 select-none">&middot;</span>
            <span><span className="text-[#f5d89b] font-bold">{analyticsPickCount}</span> edges</span>
            
          </>
        )}
        <span className="ml-auto text-pe-text-faint">
          {formatRelativeTimeShort(lastUpdated)}
        </span>
      </div>

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
              topPicks={topPicks}
              underPicks={underPicks}
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
