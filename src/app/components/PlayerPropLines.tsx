"use client";

import type { PlayerPropLine, TeamDefensiveRating } from "@/lib/data";

interface Props {
  propLines: PlayerPropLine[];
  seasonStats?: {
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    fg3: number;
    pra: number;
  } | null;
  opponentRating?: TeamDefensiveRating | null;
  opponentName?: string | null;
}

// Map market codes to defensive rating keys and rank keys
const MARKET_TO_DEF: Record<string, { key: keyof TeamDefensiveRating; rankKey: string; label: string }> = {
  PTS: { key: "oppPts", rankKey: "opp_pts", label: "PPG allowed" },
  REB: { key: "oppReb", rankKey: "opp_trb", label: "RPG allowed" },
  AST: { key: "oppAst", rankKey: "opp_ast", label: "APG allowed" },
  FG3: { key: "opp3p", rankKey: "opp_3p", label: "3PM allowed" },
  FTM: { key: "oppFt", rankKey: "opp_ft", label: "FTM allowed" },
  STL: { key: "oppStl", rankKey: "opp_stl", label: "SPG allowed" },
  BLK: { key: "oppBlk", rankKey: "opp_blk", label: "BPG allowed" },
  TOV: { key: "oppTov", rankKey: "opp_tov", label: "TO forced" },
  PRA: { key: "oppPts", rankKey: "opp_pts", label: "PPG allowed" },
  PR: { key: "oppPts", rankKey: "opp_pts", label: "PPG allowed" },
  PA: { key: "oppPts", rankKey: "opp_pts", label: "PPG allowed" },
  RA: { key: "oppReb", rankKey: "opp_trb", label: "RPG allowed" },
  SB: { key: "oppStl", rankKey: "opp_stl", label: "SPG allowed" },
};

// Map market_code → season stat key
const MARKET_TO_STAT: Record<string, string> = {
  PTS: "pts",
  REB: "reb",
  AST: "ast",
  STL: "stl",
  BLK: "blk",
  FG3: "fg3",
  PRA: "pra",
};

// Display order for markets (primary stats first, combos last)
const MARKET_ORDER = [
  "PTS", "REB", "AST", "STL", "BLK", "FG3", "FTM", "TOV",
  "PR", "PA", "RA", "PRA", "SB",
];

function formatOdds(odds: number | null): string {
  if (odds == null) return "—";
  return odds >= 0 ? `+${odds}` : `${odds}`;
}

function oddsColor(odds: number | null): string {
  if (odds == null) return "text-pe-text-faint";
  if (odds >= 100) return "text-emerald-400";
  if (odds <= -150) return "text-red-400";
  return "text-pe-text-secondary";
}

export default function PlayerPropLines({ propLines, seasonStats, opponentRating }: Props) {
  if (propLines.length === 0) {
    return (
      <div className="text-pe-text-faint text-sm text-center py-8">
        No prop lines available for this player yet.
      </div>
    );
  }

  const gameDate = propLines[0]?.gameDate;

  // Sort by preferred order
  const sorted = [...propLines].sort((a, b) => {
    const ai = MARKET_ORDER.indexOf(a.marketCode);
    const bi = MARKET_ORDER.indexOf(b.marketCode);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <div>
      {gameDate && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">
            Lines for
          </span>
          <span className="text-xs font-bold text-pe-text-secondary bg-pe-surface-2 px-2 py-0.5 rounded">
            {new Date(gameDate + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((line) => {
          const statKey = MARKET_TO_STAT[line.marketCode];
          const seasonAvg =
            seasonStats && statKey
              ? (seasonStats as Record<string, number>)[statKey]
              : null;

          const hasFairLine = line.fairLine != null;
          const hasBookLine = line.bookLine != null;
          const lineDiff =
            hasFairLine && hasBookLine
              ? +(line.fairLine! - line.bookLine!).toFixed(1)
              : null;

          // Edge: if fair line > book line, the over has value (book is too low)
          // If fair line < book line, the under has value (book is too high)
          let edgeLabel = "";
          let edgeColor = "";
          if (lineDiff != null && Math.abs(lineDiff) >= 0.5) {
            if (lineDiff > 0) {
              edgeLabel = "OVER value";
              edgeColor = "text-emerald-400 bg-emerald-500/10";
            } else {
              edgeLabel = "UNDER value";
              edgeColor = "text-red-400 bg-red-500/10";
            }
          }

          const isHighEdge = lineDiff != null && Math.abs(lineDiff) >= 1.5;
          const highEdgeClass = isHighEdge
            ? lineDiff! > 0
              ? "border-l-4 border-l-emerald-500 bg-emerald-500/5"
              : "border-l-4 border-l-rose-500 bg-rose-500/5"
            : "";

          return (
            <div
              key={line.marketCode}
              className={`bg-pe-surface-2/50 border border-pe-border/5 rounded-xl p-4 hover:border-pe-border/10 transition-colors ${highEdgeClass}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-pe-text-primary uppercase">
                    {line.marketCode}
                  </span>
                  <span className="text-[10px] text-pe-text-faint">
                    {line.marketName}
                  </span>
                </div>
                {edgeLabel && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${edgeColor}`}
                  >
                    {edgeLabel}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {/* Book line */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">
                    Book
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-pe-text-primary">
                      {hasBookLine ? line.bookLine : "—"}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${oddsColor(line.bookOdds)}`}
                    >
                      {formatOdds(line.bookOdds)}
                    </span>
                  </div>
                </div>

                {/* Fair line */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">
                    Fair
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-pe-text-muted">
                      {hasFairLine ? line.fairLine : "—"}
                    </span>
                    <span
                      className={`text-xs font-mono ${oddsColor(line.fairOdds)}`}
                    >
                      {formatOdds(line.fairOdds)}
                    </span>
                  </div>
                </div>

                {/* Season average comparison */}
                {seasonAvg != null && hasBookLine && (
                  <div className="flex items-center justify-between pt-1 border-t border-pe-border/5">
                    <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">
                      Avg
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-pe-text-muted">
                        {seasonAvg}
                      </span>
                      {(() => {
                        const diff = +(seasonAvg - line.bookLine!).toFixed(1);
                        if (Math.abs(diff) < 0.5)
                          return (
                            <span className="text-[10px] text-pe-text-faint">
                              = line
                            </span>
                          );
                        return (
                          <span
                            className={`text-[10px] font-bold ${
                              diff > 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff} vs line
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Opponent defensive weakness */}
                {opponentRating && (() => {
                  const def = MARKET_TO_DEF[line.marketCode];
                  if (!def) return null;
                  const val = opponentRating[def.key] as number;
                  const rank = opponentRating.ranks[def.rankKey] ?? 0;
                  if (!val || !rank) return null;
                  const isWeak = rank >= 21; // bottom 10 defense
                  const isStrong = rank <= 10; // top 10 defense
                  return (
                    <div className="flex items-center justify-between pt-1 border-t border-pe-border/5">
                      <span className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest">
                        vs {opponentRating.teamCode}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-pe-text-muted">
                          {val.toFixed(1)} {def.label}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isWeak
                              ? "text-emerald-400 bg-emerald-500/10"
                              : isStrong
                                ? "text-red-400 bg-red-500/10"
                                : "text-pe-text-faint bg-pe-surface-2"
                          }`}
                        >
                          {rank}{rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
