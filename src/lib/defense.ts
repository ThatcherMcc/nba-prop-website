import type { TeamDefensiveRating } from "@/lib/data";

type SingleDefenseMetric = {
  rankKey: string;
  valKey: keyof TeamDefensiveRating;
  label: string;
};

const SINGLE_DEFENSE_METRICS: Record<string, SingleDefenseMetric> = {
  PTS: { rankKey: "opp_pts", valKey: "oppPts", label: "PPG allowed" },
  REB: { rankKey: "opp_trb", valKey: "oppReb", label: "RPG allowed" },
  AST: { rankKey: "opp_ast", valKey: "oppAst", label: "APG allowed" },
  FG3: { rankKey: "opp_3p", valKey: "opp3p", label: "3PM allowed" },
  FTM: { rankKey: "opp_ft", valKey: "oppFt", label: "FTM allowed" },
  STL: { rankKey: "opp_stl", valKey: "oppStl", label: "SPG allowed" },
  BLK: { rankKey: "opp_blk", valKey: "oppBlk", label: "BPG allowed" },
  TOV: { rankKey: "opp_tov", valKey: "oppTov", label: "TOV forced" },
};

type SingleMarketCode = "PTS" | "REB" | "AST" | "FG3" | "FTM" | "STL" | "BLK" | "TOV";

const COMBO_MARKET_COMPONENTS: Record<string, SingleMarketCode[]> = {
  PRA: ["PTS", "REB", "AST"],
  PR: ["PTS", "REB"],
  PA: ["PTS", "AST"],
  RA: ["REB", "AST"],
  SB: ["STL", "BLK"],
};

export type DefenseMarketInfo = {
  allowed: number | null;
  rank: number | null;
  label: string;
};

function average(values: number[]): number | null {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function sum(values: number[]): number | null {
  return values.length > 0 ? values.reduce((total, value) => total + value, 0) : null;
}

export function getDefenseMarketInfo(
  rating: TeamDefensiveRating | null | undefined,
  marketCode: string
): DefenseMarketInfo | null {
  if (!rating) return null;

  const singleMetric = SINGLE_DEFENSE_METRICS[marketCode];
  if (singleMetric) {
    const allowed = rating[singleMetric.valKey];
    const rank = rating.ranks[singleMetric.rankKey] ?? null;
    return {
      allowed: typeof allowed === "number" ? allowed : null,
      rank,
      label: singleMetric.label,
    };
  }

  const components = COMBO_MARKET_COMPONENTS[marketCode];
  if (!components) return null;

  const allowedValues = components
    .map((code) => {
      const metric = SINGLE_DEFENSE_METRICS[code];
      return rating[metric.valKey];
    })
    .filter((value): value is number => typeof value === "number");
  const ranks = components
    .map((code) => {
      const metric = SINGLE_DEFENSE_METRICS[code];
      return rating.ranks[metric.rankKey];
    })
    .filter((value): value is number => typeof value === "number");

  return {
    // Combo markets should reflect the combined opponent allowance, not the mean component stat.
    allowed: sum(allowedValues),
    rank: ranks.length > 0 ? Math.round(average(ranks) ?? 0) : null,
    label: `${marketCode} allowed`,
  };
}
