"use client";

import FeaturedPlayer from "./FeaturedPlayer";
import type { TopPick, UnderPick } from "@/lib/data";
import {
  type HomepageLayoutProps,
  PickOfTheDayHero,
  YesterdayScorecard,
  MARKET_TO_STAT,
  formatRelativeTime,
} from "./homepage-shared";

// ── TickerStrip ──────────────────────────────────────────────────────────────

function TickerStrip({
  topPicks,
  underPicks,
}: {
  topPicks: TopPick[];
  underPicks: UnderPick[];
}) {
  const items = [
    ...topPicks.map((p) => ({
      name: p.playerName,
      stat: p.marketCode,
      line: p.bookLine,
      rate: p.hitRate,
      side: "OVER" as const,
    })),
    ...underPicks.map((p) => ({
      name: p.playerName,
      stat: p.marketCode,
      line: p.bookLine,
      rate: p.hitRate,
      side: "UNDER" as const,
    })),
  ];

  if (items.length === 0) return null;

  return (
    <div className="group mb-6 overflow-hidden bg-pe-surface-1 border-y border-pe-border/10 py-2">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-4 text-xs">
            <span className="font-bold text-pe-text-primary">{item.name}</span>
            <span className="text-pe-text-faint">·</span>
            <span className="text-pe-text-muted">{item.stat}</span>
            <span className="text-pe-text-secondary font-mono">{item.line}</span>
            <span className="text-pe-text-faint">·</span>
            <span
              className={`font-bold ${item.rate >= 80 ? "text-emerald-400" : "text-amber-400"}`}
            >
              {item.rate}%
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                item.side === "OVER"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-sky-500/15 text-sky-400 border-sky-500/30"
              }`}
            >
              {item.side}
            </span>
            <span className="text-pe-border/20 mx-2">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── FeedCard ─────────────────────────────────────────────────────────────────

function FeedCard({
  pick,
  side,
  goToPlayer,
}: {
  pick: TopPick | UnderPick;
  side: "over" | "under";
  goToPlayer: HomepageLayoutProps["goToPlayer"];
}) {
  const statKey = MARKET_TO_STAT[pick.marketCode] ?? pick.marketCode.toLowerCase();
  const isOver = side === "over";
  const hitRate = pick.hitRate;
  const hitColor =
    hitRate >= 80
      ? "text-emerald-400"
      : hitRate >= 70
        ? "text-amber-400"
        : "text-pe-text-secondary";
  const countKey = isOver ? "overCount" : "underCount";
  const count = (pick as Record<string, unknown>)[countKey];
  const countNum = typeof count === "number" ? count : 0;

  return (
    <button
      type="button"
      onClick={() => goToPlayer(pick.playerName, 10, statKey, pick.bookLine)}
      className="w-full text-left rounded-xl bg-pe-surface-1 border border-pe-border/10 p-4 transition-all hover:border-pe-border/20 hover:bg-pe-surface-2/30 cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-pe-text-primary text-sm truncate">
              {pick.playerName}
            </p>
            <span
              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isOver
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-sky-500/15 text-sky-400 border-sky-500/30"
              }`}
            >
              {isOver ? "OVER" : "UNDER"}
            </span>
          </div>
          <p className="text-xs text-pe-text-muted">
            {pick.marketName} {isOver ? "Over" : "Under"}{" "}
            <span className="font-semibold text-pe-text-secondary">
              {pick.bookLine}
            </span>
            <span className="mx-2 text-pe-text-faint">·</span>
            <span className="text-pe-text-faint">
              {countNum}/{pick.gamesChecked}
            </span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-lg font-black ${hitColor}`}>{hitRate}%</p>
          <p className="text-[10px] text-pe-text-faint uppercase">hit rate</p>
        </div>
      </div>
    </button>
  );
}

// ── HomepageLayoutTickerFeed ─────────────────────────────────────────────────

export default function HomepageLayoutTickerFeed({
  featuredPlayerName = "LeBron James",
  featuredPlayerData = [],
  topPicks = [],
  underPicks = [],
  propDate = null,
  backtestResults = { gameDate: "", picks: [] },
  lastUpdated = null,
  hasError = false,
  goToPlayer,
}: HomepageLayoutProps) {
  const isRecent =
    lastUpdated != null &&
    Date.now() - new Date(lastUpdated).getTime() < 6 * 3600000;

  const heroPickExists = topPicks.length > 0;
  const remainingOverPicks = topPicks.slice(1);
  const totalFeedCount = remainingOverPicks.length + underPicks.length;

  return (
    <div className="min-h-screen">
      {/* Compact header strip */}
      <header className="flex items-center justify-between mb-4 pt-2">
        <div>
          <h1 className="text-xl font-black text-pe-text-primary leading-none">
            PropEdge
          </h1>
          <p className="text-xs text-pe-text-faint mt-0.5">NBA Prop Analytics</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {isRecent && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isRecent ? "bg-emerald-500" : "bg-pe-text-faint"
              }`}
            />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-pe-text-faint">
            {formatRelativeTime(lastUpdated)}
          </span>
        </div>
      </header>

      {/* Ticker strip — scrolls all picks continuously */}
      {!hasError && (topPicks.length > 0 || underPicks.length > 0) && (
        <TickerStrip topPicks={topPicks} underPicks={underPicks} />
      )}

      {/* Error banner */}
      {hasError && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6 text-amber-200 text-sm">
          We&apos;re having trouble loading data right now. Updates run daily at
          3:00 AM ET — please try again shortly.
        </div>
      )}

      {/* Empty state */}
      {!hasError &&
        topPicks.length === 0 &&
        underPicks.length === 0 && (
          <div className="rounded-xl bg-pe-surface-1/60 border border-pe-border/5 p-6 text-center text-pe-text-muted text-sm mb-8">
            No games scheduled today. Check back tomorrow for fresh picks.
          </div>
        )}

      {/* Pick of the Day hero */}
      {!hasError && heroPickExists && (
        <PickOfTheDayHero
          pick={topPicks[0]}
          propDate={propDate}
          goToPlayer={goToPlayer}
        />
      )}

      {/* All Picks vertical feed */}
      {!hasError && totalFeedCount > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-pe-text-faint">
              All Picks
            </span>
            <span className="text-[10px] font-bold bg-pe-surface-2 text-pe-text-muted px-2 py-0.5 rounded-full">
              {totalFeedCount}
            </span>
          </div>

          <div className="space-y-3">
            {/* Over picks (skip [0] — already used as hero) */}
            {remainingOverPicks.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 px-1">
                  Over
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {remainingOverPicks.map((pick, i) => (
                    <FeedCard
                      key={`over-${pick.playerName}-${pick.marketCode}-${i}`}
                      pick={pick}
                      side="over"
                      goToPlayer={goToPlayer}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Divider between over and under groups */}
            {remainingOverPicks.length > 0 && underPicks.length > 0 && (
              <div className="border-t border-pe-border/10 my-2" />
            )}

            {/* Under picks */}
            {underPicks.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500/70 px-1">
                  Under
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {underPicks.map((pick, i) => (
                    <FeedCard
                      key={`under-${pick.playerName}-${pick.marketCode}-${i}`}
                      pick={pick}
                      side="under"
                      goToPlayer={goToPlayer}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Yesterday's Scorecard */}
      {!hasError && backtestResults.picks.length > 0 && (
        <YesterdayScorecard
          gameDate={backtestResults.gameDate}
          picks={backtestResults.picks}
        />
      )}

      {/* Divider */}
      <div className="border-t border-pe-border/5 my-10" />

      {/* GOAT section */}
      <FeaturedPlayer
        playerName={featuredPlayerName}
        data={featuredPlayerData}
      />
    </div>
  );
}
