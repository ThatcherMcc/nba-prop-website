"use client";

import { SPORTSBOOKS, SPORTSBOOK_KEYS, buildBetLink, type Sportsbook } from "@/lib/affiliates";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface BetButtonProps {
  playerName: string;
  marketCode: string;
  /** compact=true renders small pills with short names (DK/FD/PP) — for use inside pick rows */
  compact?: boolean;
}

export default function BetButton({ playerName, marketCode, compact = false }: BetButtonProps) {
  function handleClick(book: Sportsbook, e: React.MouseEvent) {
    e.stopPropagation();
    trackEvent(EVENTS.BET_CLICK, { book, player: playerName, market: marketCode });
    window.open(buildBetLink(book), "_blank", "noopener,noreferrer");
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        {SPORTSBOOK_KEYS.map((book) => {
          const cfg = SPORTSBOOKS[book];
          return (
            <button
              key={book}
              type="button"
              onClick={(e) => handleClick(book, e)}
              title={`Bet on ${cfg.name}`}
              className={`text-[10px] font-black px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${cfg.bgClass}`}
            >
              {cfg.shortName}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {SPORTSBOOK_KEYS.map((book) => {
        const cfg = SPORTSBOOKS[book];
        return (
          <button
            key={book}
            type="button"
            onClick={(e) => handleClick(book, e)}
            title={`Bet on ${cfg.name}`}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${cfg.bgClass}`}
          >
            {cfg.name}
          </button>
        );
      })}
    </div>
  );
}
