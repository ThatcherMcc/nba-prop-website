"use client";

import { useState } from "react";
import {
  type HomepageLayoutProps,
  type EdgeItem,
  type HotCard,
  PickOfTheDayHero,
  EdgeCard,
  YesterdayScorecard,
  PlayerScrollRow,
  toHotCards,
  toColdCards,
  toTrendingCards,
} from "./homepage-shared";
import FeaturedPlayer from "./FeaturedPlayer";

// ── AccordionSection ─────────────────────────────────────────────────────────

function AccordionSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-pe-border/10 rounded-xl overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-pe-surface-1 hover:bg-pe-surface-2/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-pe-text-primary">{title}</h3>
          {badge && (
            <span className="text-[10px] font-bold bg-pe-surface-2 text-pe-text-muted px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-pe-text-faint transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── Root: HomepageLayoutActionBoard ──────────────────────────────────────────

export default function HomepageLayoutActionBoard({
  featuredPlayerName = "LeBron James",
  featuredPlayerData = [],
  overSeasonAvgLast5 = [],
  underSeasonAvgLast5 = [],
  trendingPlayers = [],
  topPicks = [],
  underPicks = [],
  propDate = null,
  backtestResults = { gameDate: "", picks: [] },
  hasError = false,
  goToPlayer,
}: HomepageLayoutProps) {
  const hotCards: HotCard[] = toHotCards(overSeasonAvgLast5);
  const coldCards: HotCard[] = toColdCards(underSeasonAvgLast5);
  const trendingCards: HotCard[] = toTrendingCards(trendingPlayers);

  const heroPickExists = topPicks.length > 0;

  const quickEdges: EdgeItem[] = [
    ...topPicks.slice(1, 5).map((p): EdgeItem => ({ kind: "over", pick: p })),
    ...underPicks.slice(0, 3).map((p): EdgeItem => ({ kind: "under", pick: p })),
  ];

  const wins = backtestResults.picks.filter((p) => p.result === "win").length;
  const losses = backtestResults.picks.filter((p) => p.result === "loss").length;
  const graded = wins + losses;
  const winPct = graded > 0 ? Math.round((wins / graded) * 100) : null;
  const yesterdayBadge =
    winPct != null ? `${wins}W-${losses}L (${winPct}%)` : `${backtestResults.picks.length} picks`;

  return (
    <div className="min-h-screen">
      {/* Error banner */}
      {hasError && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6 text-amber-200 text-sm">
          We&apos;re having trouble loading data right now. Updates run daily at 3:00 AM ET — please
          try again shortly.
        </div>
      )}

      {/* Section 1: Pick of the Day Hero */}
      {!hasError && heroPickExists && (
        <PickOfTheDayHero pick={topPicks[0]} propDate={propDate} goToPlayer={goToPlayer} />
      )}

      {/* Section 2: Quick Edges horizontal row */}
      {!hasError && quickEdges.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-pe-text-faint">
              Quick Edges
            </span>
            <span className="text-[10px] font-bold bg-pe-surface-2 text-pe-text-muted px-2 py-0.5 rounded-full">
              {quickEdges.length} picks
            </span>
          </div>
          <div className="relative">
            <div
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              {quickEdges.map((item, i) => (
                <EdgeCard
                  key={`quick-edge-${item.kind}-${item.pick.playerName}-${item.pick.marketCode}-${i}`}
                  item={item}
                  goToPlayer={goToPlayer}
                />
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-pe-bg to-transparent" />
          </div>
        </section>
      )}

      {/* Section 3: Accordion sections */}
      {!hasError && (
        <div className="mb-8">
          {backtestResults.picks.length > 0 && (
            <AccordionSection title="Yesterday's Results" badge={yesterdayBadge}>
              <YesterdayScorecard
                gameDate={backtestResults.gameDate}
                picks={backtestResults.picks}
              />
            </AccordionSection>
          )}

          {hotCards.length > 0 && (
            <AccordionSection title="Hot Streaks" badge={`${hotCards.length} players`}>
              <PlayerScrollRow
                title="Hot Hands"
                subtitle="Over season avg in 4-5 of last 5 games"
                emoji="&#x1F525;"
                cards={hotCards}
                variant="hot"
                onCardClick={(card) => {
                  if (card.playerName) goToPlayer(card.playerName, 10, "pts", card.seasonAvgPts);
                }}
              />
            </AccordionSection>
          )}

          {coldCards.length > 0 && (
            <AccordionSection title="Cold Streaks" badge={`${coldCards.length} players`}>
              <PlayerScrollRow
                title="Cold Streaks"
                subtitle="Under season avg in 4-5 of last 5 games"
                emoji="&#x2744;&#xFE0F;"
                cards={coldCards}
                variant="cold"
                onCardClick={(card) => {
                  if (card.playerName) goToPlayer(card.playerName, 10, "pts", card.seasonAvgPts);
                }}
              />
            </AccordionSection>
          )}

          {trendingCards.length > 0 && (
            <AccordionSection title="Trending" badge={`${trendingCards.length} players`}>
              <PlayerScrollRow
                title="Trending Up"
                subtitle="Last 3 games scoring above previous 3"
                emoji="&#x1F680;"
                cards={trendingCards}
                variant="trending"
                onCardClick={(card) => {
                  if (card.playerName) goToPlayer(card.playerName, 10, "pts", card.last3AvgPts);
                }}
              />
            </AccordionSection>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-pe-border/5 my-10" />

      {/* GOAT section */}
      <FeaturedPlayer playerName={featuredPlayerName} data={featuredPlayerData} />
    </div>
  );
}
