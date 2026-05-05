"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  MlbParkFactor,
  MlbSlateProp,
  MlbSlatePropsResult,
  MlbSupportedMarket,
} from "@/lib/data";
import type { MlbStarterGame } from "@/lib/mlbStarters";
import { normalizeMlbTeamCode } from "@/lib/leagues";

interface MlbSlatePageContentProps {
  starterGames: MlbStarterGame[];
  parkFactors: MlbParkFactor[];
  supportedMarkets: MlbSupportedMarket[];
  slateProps: MlbSlatePropsResult;
  lastUpdated: string | null;
}

interface PlayerPropsGroup {
  playerName: string;
  playerTeam: string | null;
  props: MlbSlateProp[];
}

interface GameGroup {
  matchupKey: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  status: string;
  homeStarter: string;
  awayStarter: string;
  park: MlbParkFactor | null;
  props: MlbSlateProp[];
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
  return new Date(`${propDate}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTimeShort(isoString: string | null | undefined): string {
  if (!isoString) return "Updating...";
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 60) return `${Math.max(minutes, 0)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatGameTime(time: string): string {
  if (!time) return "TBD";
  const [hourString, minuteString = "00"] = time.split(":");
  const hour = Number(hourString);
  if (Number.isNaN(hour)) return "TBD";
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${hour12}:${minuteString} ET`;
}

function pfClass(value: number | null): string {
  if (value == null) return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
  if (value > 103) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  if (value < 97) return "bg-sky-500/15 text-sky-400 border-sky-500/20";
  return "bg-pe-surface-2 text-pe-text-muted border-pe-border/10";
}

function buildGameGroups(
  starterGames: MlbStarterGame[],
  slateProps: MlbSlateProp[],
  parkFactors: MlbParkFactor[]
): GameGroup[] {
  const parkMap = new Map(
    parkFactors.map((park) => [normalizeMlbTeamCode(park.teamCode), park] as const)
  );
  const map = new Map<string, GameGroup>();

  for (const game of starterGames) {
    const homeTeam = normalizeMlbTeamCode(game.home_team);
    const awayTeam = normalizeMlbTeamCode(game.away_team);
    const key = `${awayTeam}@${homeTeam}`;
    map.set(key, {
      matchupKey: key,
      homeTeam,
      awayTeam,
      gameTime: game.game_time,
      status: game.status,
      homeStarter: game.home_pitcher.name,
      awayStarter: game.away_pitcher.name,
      park: parkMap.get(homeTeam) ?? null,
      props: [],
    });
  }

  for (const prop of slateProps) {
    const homeTeam = normalizeMlbTeamCode(prop.homeTeam);
    const awayTeam = normalizeMlbTeamCode(prop.awayTeam);
    const key = `${awayTeam}@${homeTeam}`;
    if (!map.has(key)) {
      map.set(key, {
        matchupKey: key,
        homeTeam,
        awayTeam,
        gameTime: "",
        status: "Scheduled",
        homeStarter: "TBD",
        awayStarter: "TBD",
        park: parkMap.get(homeTeam) ?? null,
        props: [],
      });
    }
    map.get(key)!.props.push(prop);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.gameTime && b.gameTime) return a.gameTime.localeCompare(b.gameTime);
    if (a.gameTime) return -1;
    if (b.gameTime) return 1;
    return a.matchupKey.localeCompare(b.matchupKey);
  });
}

function splitPropsByTeam(props: MlbSlateProp[], homeTeam: string) {
  const home = new Map<string, PlayerPropsGroup>();
  const away = new Map<string, PlayerPropsGroup>();

  for (const prop of props) {
    const playerTeam = prop.playerTeam ? normalizeMlbTeamCode(prop.playerTeam) : null;
    const target = playerTeam === homeTeam ? home : away;
    const key = `${prop.playerName}-${playerTeam ?? "unknown"}`;
    if (!target.has(key)) {
      target.set(key, {
        playerName: prop.playerName,
        playerTeam,
        props: [],
      });
    }
    target.get(key)!.props.push(prop);
  }

  const sorter = (a: PlayerPropsGroup, b: PlayerPropsGroup) =>
    b.props.length - a.props.length || a.playerName.localeCompare(b.playerName);

  return {
    home: Array.from(home.values()).sort(sorter),
    away: Array.from(away.values()).sort(sorter),
  };
}

function marketTone(playerType: "Batter" | "Pitcher" | undefined) {
  if (playerType === "Pitcher") {
    return "bg-sky-500/12 text-sky-300 border-sky-500/20";
  }
  return "bg-emerald-500/12 text-emerald-300 border-emerald-500/20";
}

function PlayerRow({
  player,
  marketTypes,
}: {
  player: PlayerPropsGroup;
  marketTypes: Map<string, "Batter" | "Pitcher">;
}) {
  return (
    <div className="flex flex-col py-2 px-3 border-b border-pe-border/5 last:border-0 hover:bg-pe-surface-2/20 transition-colors gap-1.5">
      <div className="flex items-center gap-x-2.5 min-w-0">
        <span className="text-[13px] font-semibold text-pe-text-primary truncate w-[120px] sm:w-[140px] shrink-0">
          {player.playerName}
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-pe-text-faint">
          {player.props.length} markets
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {player.props.map((prop) => (
          <span
            key={`${player.playerName}-${prop.marketCode}-${prop.bookLine}`}
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap ${marketTone(
              marketTypes.get(prop.marketCode)
            )}`}
          >
            {prop.marketCode.replace("MLB_", "")} {prop.bookLine ?? "—"}
          </span>
        ))}
      </div>
    </div>
  );
}

function TeamColumn({
  teamCode,
  starterName,
  players,
  marketTypes,
  park,
}: {
  teamCode: string;
  starterName: string;
  players: PlayerPropsGroup[];
  marketTypes: Map<string, "Batter" | "Pitcher">;
  park: MlbParkFactor | null;
}) {
  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-pe-surface-2/30">
        <span className="text-xs font-black uppercase tracking-tight text-pe-text-primary">
          {teamCode}
        </span>
        <span className="text-[11px] text-pe-text-faint">
          {players.length} players
        </span>
      </div>

      <div className="flex items-center justify-between gap-2.5 px-3 py-1 bg-pe-surface-2/15 border-b border-pe-border/5">
        <div>
          <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-wider">
            Starter
          </span>
          <p className="text-[11px] text-pe-text-primary mt-0.5">{starterName}</p>
        </div>
        {park && (
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${pfClass(park.pfRuns)}`}>
              R {park.pfRuns?.toFixed(0) ?? "—"}
            </span>
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${pfClass(park.pfHr)}`}>
              HR {park.pfHr?.toFixed(0) ?? "—"}
            </span>
          </div>
        )}
      </div>

      {players.length > 0 ? (
        players.map((player) => (
          <PlayerRow
            key={`${teamCode}-${player.playerName}`}
            player={player}
            marketTypes={marketTypes}
          />
        ))
      ) : (
        <div className="px-3 py-5 text-sm text-pe-text-faint">
          No prop rows stored for this club yet.
        </div>
      )}
    </div>
  );
}

function GameCard({
  group,
  marketTypes,
  defaultOpen,
  forceOpen,
}: {
  group: GameGroup;
  marketTypes: Map<string, "Batter" | "Pitcher">;
  defaultOpen: boolean;
  forceOpen: boolean | null;
}) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = forceOpen !== null ? forceOpen : localOpen;
  const { home, away } = splitPropsByTeam(group.props, group.homeTeam);

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setLocalOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-pe-surface-2/30 hover:bg-pe-surface-2/50 transition-colors text-left cursor-pointer"
      >
        <div>
          <h2 className="text-sm font-black uppercase tracking-tight text-pe-text-primary">
            {group.awayTeam} <span className="text-pe-text-faint font-normal text-xs">@</span> {group.homeTeam}
          </h2>
          <p className="mt-0.5 text-[10px] text-pe-text-faint uppercase tracking-[0.18em]">
            {formatGameTime(group.gameTime)} · {group.status}
          </p>
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

      {open && (
        <>
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-t border-pe-border/10 bg-white/[0.02]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-pe-text-faint">
              {group.awayStarter} vs {group.homeStarter}
            </span>
            {group.park && (
              <>
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${pfClass(group.park.pfRuns)}`}>
                  Runs {group.park.pfRuns?.toFixed(0) ?? "—"}
                </span>
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${pfClass(group.park.pfK)}`}>
                  K {group.park.pfK?.toFixed(0) ?? "—"}
                </span>
                <Link
                  href={`/mlb/team/${group.park.teamCode}`}
                  className="text-[10px] uppercase tracking-[0.2em] text-pe-text-secondary hover:text-pe-text-primary"
                >
                  Park profile
                </Link>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-pe-border/10">
            <div className="lg:border-r lg:border-pe-border/10">
              <TeamColumn
                teamCode={group.awayTeam}
                starterName={group.awayStarter}
                players={away}
                marketTypes={marketTypes}
                park={group.park}
              />
            </div>
            <div className="border-t border-pe-border/5 lg:border-t-0">
              <TeamColumn
                teamCode={group.homeTeam}
                starterName={group.homeStarter}
                players={home}
                marketTypes={marketTypes}
                park={group.park}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function MlbSlatePageContent({
  starterGames,
  parkFactors,
  supportedMarkets,
  slateProps,
  lastUpdated,
}: MlbSlatePageContentProps) {
  const gameGroups = buildGameGroups(starterGames, slateProps.props, parkFactors);
  const hasGames = gameGroups.length > 0;
  const [allOpen, setAllOpen] = useState<boolean | null>(null);
  const marketTypes = new Map(
    supportedMarkets.map((market) => [market.marketCode, market.playerType] as const)
  );

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-lg font-black uppercase tracking-tight text-pe-text-primary">
            Slate
          </h1>
          <p className="text-xs text-pe-text-faint mt-0.5">
            {formatSlateDate(slateProps.propDate)}
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

      <div className="flex items-center gap-3 py-1.5 px-3 mb-4 bg-pe-surface-1 border border-pe-border/10 rounded-lg text-[11px] font-mono text-pe-text-faint">
        <span className="text-pe-text-muted font-bold">{gameGroups.length}</span> games
        <span className="text-pe-border/20 select-none hidden sm:inline">&middot;</span>
        <span className="hidden sm:inline">
          <span className="text-pe-text-muted font-bold">{slateProps.props.length}</span> prop rows
        </span>
        <span className="text-pe-border/20 select-none">&middot;</span>
        <span>
          <span className="text-[#f5d89b] font-bold">{supportedMarkets.length}</span> markets
        </span>
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
            Check back on game days for today&apos;s full card with starters, park context, and live MLB lines.
          </p>
          <Link
            href="/mlb/analytics"
            className="inline-block mt-4 text-sm font-bold text-pe-accent hover:text-pe-accent/80 transition-colors"
          >
            View Analytics instead
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {gameGroups.map((group, index) => (
            <GameCard
              key={group.matchupKey}
              group={group}
              marketTypes={marketTypes}
              defaultOpen={index < 3}
              forceOpen={allOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
