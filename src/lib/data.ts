"use server";

import { db, players, games, playerGameStats, type PlayerGameLog } from "@/db";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { FALLBACK_PLAYER_NAMES } from "@/lib/playerNames";

/**
 * Canonical list of player names from Neon `players` table (source of truth).
 * Used for search suggestions and validation. Cached with tag "player-data";
 * call POST /api/revalidate after the pipeline runs to refresh.
 * Falls back to FALLBACK_PLAYER_NAMES if the DB fails or returns no rows.
 */
export const getPlayerNames = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const rows = await db
        .select({ playerName: players.playerName })
        .from(players)
        .orderBy(players.playerName);
      const names = rows.map((r) => r.playerName);
      return names.length > 0 ? names : FALLBACK_PLAYER_NAMES;
    } catch (error) {
      console.error("Database Error (getPlayerNames):", error);
      return FALLBACK_PLAYER_NAMES;
    }
  },
  ["getPlayerNames"],
  { tags: ["player-data"] }
);

/**
 * Players who actually have game stats — used for sitemap generation.
 * Excludes MLB players (and any NBA players) with zero game logs.
 */
export const getPlayersWithGameData = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const rows = await db
        .selectDistinct({ playerName: players.playerName })
        .from(players)
        .innerJoin(playerGameStats, eq(players.playerId, playerGameStats.playerId))
        .orderBy(players.playerName);
      return rows.map((r) => r.playerName);
    } catch (error) {
      console.error("Database Error (getPlayersWithGameData):", error);
      return [];
    }
  },
  ["getPlayersWithGameData"],
  { tags: ["player-data"] }
);

export const getPlayerHasGameData = unstable_cache(
  async (playerName: string): Promise<boolean> => {
    try {
      const rows = await db
        .select({ playerId: players.playerId })
        .from(players)
        .innerJoin(playerGameStats, eq(players.playerId, playerGameStats.playerId))
        .where(eq(sql`lower(${players.playerName})`, playerName.toLowerCase()))
        .limit(1);
      return rows.length > 0;
    } catch (error) {
      console.error("Database Error (getPlayerHasGameData):", error);
      return false;
    }
  },
  ["getPlayerHasGameData"],
  { tags: ["player-data"] }
);

/** True if a player with this name exists in `players` (case-insensitive). Used for 404 on invalid /player/[name]. */
export const getPlayerExists = unstable_cache(
  async (playerName: string): Promise<boolean> => {
    try {
      const [row] = await db
        .select({ playerId: players.playerId })
        .from(players)
        .where(eq(sql`lower(${players.playerName})`, playerName.toLowerCase()))
        .limit(1);
      return row != null;
    } catch (error) {
      console.error("Database Error (getPlayerExists):", error);
      return false;
    }
  },
  ["getPlayerExists"],
  { tags: ["player-data"] }
);

// Only include games where the player actually played (exclude DNP).
// Excluded values (case-insensitive, trimmed): '', 'inactive', 'inact', 'did n', '0', '0:00', 'not w', 'suspe'.
// Keep .cursor/rules/nba-prop-website.mdc and @/lib/dnp.ts in sync if adding values.
import { isDnpMinutes } from "@/lib/dnp";

const PLAYED_ONLY = sql`COALESCE(LOWER(TRIM(player_game_stats.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00', 'not w', 'suspe')`;

// --- Hottest hands: most points in each player's most recent game ---
export type HotScorerLastGame = {
  playerName: string | null;
  points: number;
  gameDate: string | null;
};

export const getTopScorersLastGame = unstable_cache(
  async (limit = 5): Promise<HotScorerLastGame[]> => {
    type Row = { player_name: string | null; points: number; game_date: string | null };

    try {
      const result = await db.execute<Row>(sql`
        WITH last_game AS (
          SELECT s.player_id, s.points, g.game_date,
            ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
          FROM player_game_stats s
          JOIN games g ON g.game_id = s.game_id
          WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
        )
        SELECT p.player_name, lg.points::int AS points, lg.game_date::text AS game_date
        FROM last_game lg
        JOIN players p ON p.player_id = lg.player_id
        WHERE lg.rn = 1
        ORDER BY lg.points DESC NULLS LAST
        LIMIT ${limit}
      `);

      const rows: Row[] = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      return rows.map((r: Row) => ({
        playerName: r.player_name ?? null,
        points: Number(r.points) ?? 0,
        gameDate: r.game_date ?? null,
      }));
    } catch (error) {
      console.error("Database Error (getTopScorersLastGame):", error);
      return [];
    }
  },
  ["getTopScorersLastGame"],
  { tags: ["player-data"] }
);

function toNum(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? null : n;
}

function rowToPlayerGameLog(
  row: {
    playerName: string;
    gameDate: string | null;
    minutesPlayed: string | null;
    fieldGoalsMade: number | null;
    fieldGoalsAttempted: number | null;
    fieldGoalPct: string | null;
    threePointersMade: number | null;
    threePointersAttempted: number | null;
    threePointPct: string | null;
    twoPointersMade: number | null;
    twoPointersAttempted: number | null;
    twoPointPct: string | null;
    effectiveFgPct: string | null;
    freeThrowsMade: number | null;
    freeThrowsAttempted: number | null;
    freeThrowPct: string | null;
    offensiveRebounds: number | null;
    defensiveRebounds: number | null;
    totalRebounds: number | null;
    assists: number | null;
    steals: number | null;
    blocks: number | null;
    turnovers: number | null;
    points: number | null;
    ptsRebAst: number | null;
    ptsReb: number | null;
    ptsAst: number | null;
    rebAst: number | null;
    stlBlk: number | null;
    isHome?: boolean | null;
    opponentCode?: string | null;
  }
): PlayerGameLog {
  return {
    playerName: row.playerName,
    gameDate: row.gameDate,
    location: row.isHome ? "" : "@",
    opponent: row.opponentCode ?? null,
    mp: row.minutesPlayed,
    fg: row.fieldGoalsMade,
    fga: row.fieldGoalsAttempted,
    fgPct: toNum(row.fieldGoalPct),
    fg3: row.threePointersMade,
    fg3a: row.threePointersAttempted,
    fg3Pct: toNum(row.threePointPct),
    fg2: row.twoPointersMade,
    fg2a: row.twoPointersAttempted,
    fg2Pct: toNum(row.twoPointPct),
    efgPct: toNum(row.effectiveFgPct),
    ft: row.freeThrowsMade,
    fta: row.freeThrowsAttempted,
    ftPct: toNum(row.freeThrowPct),
    orb: row.offensiveRebounds,
    drb: row.defensiveRebounds,
    trb: row.totalRebounds,
    ast: row.assists,
    stl: row.steals,
    blk: row.blocks,
    tov: row.turnovers,
    pts: row.points,
    pra: row.ptsRebAst,
    pr: row.ptsReb,
    pa: row.ptsAst,
    ra: row.rebAst,
    sb: row.stlBlk,
  };
}

/** Most recent game (by date) for the player; used to show "Last game: DNP" when excluded from averages. */
export type PlayerLastGameStatus = {
  lastGameDate: string | null;
  isDnp: boolean;
};

export const getPlayerLastGameStatus = unstable_cache(
  async (playerName: string): Promise<PlayerLastGameStatus> => {
    try {
      const [player] = await db
        .select({ playerId: players.playerId })
        .from(players)
        .where(eq(sql`lower(${players.playerName})`, playerName.toLowerCase()))
        .limit(1);

      if (!player) return { lastGameDate: null, isDnp: false };

      const [row] = await db
        .select({
          gameDate: games.gameDate,
          minutesPlayed: playerGameStats.minutesPlayed,
        })
        .from(playerGameStats)
        .innerJoin(games, eq(playerGameStats.gameId, games.gameId))
        .where(eq(playerGameStats.playerId, player.playerId))
        .orderBy(desc(games.gameDate))
        .limit(1);

      if (!row) return { lastGameDate: null, isDnp: false };
      const lastGameDate = row.gameDate != null ? String(row.gameDate) : null;
      return { lastGameDate, isDnp: isDnpMinutes(row.minutesPlayed) };
    } catch (error) {
      console.error("Database Error (getPlayerLastGameStatus):", error);
      return { lastGameDate: null, isDnp: false };
    }
  },
  ["getPlayerLastGameStatus"],
  { tags: ["player-data"] }
);

export const getPlayerData = unstable_cache(
  async (playerName: string, limit = 20): Promise<PlayerGameLog[]> => {
    try {
      const [player] = await db
        .select({ playerId: players.playerId })
        .from(players)
        .where(eq(sql`lower(${players.playerName})`, playerName.toLowerCase()))
        .limit(1);

      if (!player) return [];

      const rows = await db
        .select({
          playerName: players.playerName,
          gameDate: games.gameDate,
          minutesPlayed: playerGameStats.minutesPlayed,
          fieldGoalsMade: playerGameStats.fieldGoalsMade,
          fieldGoalsAttempted: playerGameStats.fieldGoalsAttempted,
          fieldGoalPct: playerGameStats.fieldGoalPct,
          threePointersMade: playerGameStats.threePointersMade,
          threePointersAttempted: playerGameStats.threePointersAttempted,
          threePointPct: playerGameStats.threePointPct,
          twoPointersMade: playerGameStats.twoPointersMade,
          twoPointersAttempted: playerGameStats.twoPointersAttempted,
          twoPointPct: playerGameStats.twoPointPct,
          effectiveFgPct: playerGameStats.effectiveFgPct,
          freeThrowsMade: playerGameStats.freeThrowsMade,
          freeThrowsAttempted: playerGameStats.freeThrowsAttempted,
          freeThrowPct: playerGameStats.freeThrowPct,
          offensiveRebounds: playerGameStats.offensiveRebounds,
          defensiveRebounds: playerGameStats.defensiveRebounds,
          totalRebounds: playerGameStats.totalRebounds,
          assists: playerGameStats.assists,
          steals: playerGameStats.steals,
          blocks: playerGameStats.blocks,
          turnovers: playerGameStats.turnovers,
          points: playerGameStats.points,
          ptsRebAst: playerGameStats.ptsRebAst,
          ptsReb: playerGameStats.ptsReb,
          ptsAst: playerGameStats.ptsAst,
          rebAst: playerGameStats.rebAst,
          stlBlk: playerGameStats.stlBlk,
          isHome: playerGameStats.isHome,
          opponentCode: sql<string>`(
            SELECT t.team_code FROM teams t
            WHERE t.team_id = CASE
              WHEN ${playerGameStats.isHome} THEN ${games.awayTeamId}
              ELSE ${games.homeTeamId}
            END
          )`,
        })
        .from(playerGameStats)
        .innerJoin(games, eq(playerGameStats.gameId, games.gameId))
        .innerJoin(players, eq(playerGameStats.playerId, players.playerId))
        .where(eq(playerGameStats.playerId, player.playerId))
        .orderBy(desc(games.gameDate))
        .limit(limit);

      return rows.map((r) =>
        rowToPlayerGameLog({
          ...r,
          playerName: r.playerName ?? "",
          isHome: r.isHome,
          opponentCode: r.opponentCode,
        })
      );
    } catch (error) {
      console.error("Database Error:", error);
      return [];
    }
  },
  ["getPlayerData"],
  { tags: ["player-data"] }
);

export type HotScorer = {
  playerName: string | null;
  totalPts: number;
  games: number;
};

export const getTopScorersLast7Days = unstable_cache(
  async (limit = 8): Promise<HotScorer[]> => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().slice(0, 10);

    try {
      const rows = await db
        .select({
          playerName: players.playerName,
          totalPts: sql<number>`coalesce(sum(${playerGameStats.points}), 0)::int`,
          games: sql<number>`count(*)::int`,
        })
        .from(playerGameStats)
        .innerJoin(games, eq(playerGameStats.gameId, games.gameId))
        .innerJoin(players, eq(playerGameStats.playerId, players.playerId))
        .where(and(gte(games.gameDate, dateStr), PLAYED_ONLY))
        .groupBy(players.playerId, players.playerName)
        .orderBy(desc(sql`sum(${playerGameStats.points})`))
        .limit(limit);

      return rows as HotScorer[];
    } catch (error) {
      console.error("Database Error (getTopScorersLast7Days):", error);
      return [];
    }
  },
  ["getTopScorersLast7Days"],
  { tags: ["player-data"] }
);

// --- Over season average in last 5 games (points) ---
// Players with 5/5 or 4/5 of last 5 games over their season average; season avg >= 8.
export type OverSeasonAvgLast5 = {
  playerName: string | null;
  seasonAvgPts: number;
  last5AvgPts: number;
  gamesInLast5: number;
  overCount: number; // 4 or 5 — how many of last 5 games were over season avg
  diff: number; // last5AvgPts - seasonAvgPts
};

export const getPlayersOverSeasonAvgLast5 = unstable_cache(
  async (limit = 8): Promise<OverSeasonAvgLast5[]> => {
    type Row = {
      player_name: string | null;
      season_avg_pts: string | number;
      last5_avg_pts: string | number;
      games_in_last5: number;
      over_count: number;
      diff: string | number;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH ranked AS (
          SELECT s.player_id, s.points, g.game_date,
            ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
          FROM player_game_stats s
          JOIN games g ON g.game_id = s.game_id
          WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
        ),
        recently_active AS (
          SELECT sub.player_id
          FROM (
            SELECT s.player_id, s.minutes_played,
              ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
            FROM player_game_stats s
            JOIN games g ON g.game_id = s.game_id
          ) sub
          WHERE sub.rn <= 3
          GROUP BY sub.player_id
          HAVING COUNT(*) FILTER (
            WHERE COALESCE(LOWER(TRIM(sub.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          ) >= 3
        ),
        season_avg AS (
          SELECT player_id, AVG(points) AS season_avg_pts
          FROM player_game_stats
          WHERE COALESCE(LOWER(TRIM(minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          GROUP BY player_id
          HAVING AVG(points) >= 8
        ),
        last_5_with_sa AS (
          SELECT r.player_id, r.points, sa.season_avg_pts
          FROM ranked r
          JOIN season_avg sa ON sa.player_id = r.player_id
          JOIN recently_active ra ON ra.player_id = r.player_id
          WHERE r.rn <= 5
        ),
        over_agg AS (
          SELECT player_id,
            COUNT(*)::int AS games_in_last5,
            COUNT(*) FILTER (WHERE points > season_avg_pts)::int AS over_count,
            AVG(points) AS last5_avg_pts
          FROM last_5_with_sa
          GROUP BY player_id
          HAVING COUNT(*) >= 5 AND COUNT(*) FILTER (WHERE points > season_avg_pts) IN (4, 5)
        ),
        playing_today AS (
          SELECT DISTINCT pp.player_id
          FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          WHERE g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        )
        SELECT p.player_name,
          ROUND(sa.season_avg_pts::numeric, 1) AS season_avg_pts,
          ROUND(o.last5_avg_pts::numeric, 1) AS last5_avg_pts,
          o.games_in_last5,
          o.over_count,
          ROUND((o.last5_avg_pts - sa.season_avg_pts)::numeric, 1) AS diff
        FROM over_agg o
        JOIN season_avg sa ON sa.player_id = o.player_id
        JOIN players p ON p.player_id = o.player_id
        WHERE EXISTS (SELECT 1 FROM playing_today pt WHERE pt.player_id = o.player_id)
           OR NOT EXISTS (SELECT 1 FROM playing_today)
        ORDER BY
          o.over_count DESC, sa.season_avg_pts DESC
        LIMIT ${limit}
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return rows.map((r: Row) => {
        const raw = r as Record<string, unknown>;
        const overCount = Number(r.over_count ?? raw.over_count ?? 0);
        return {
          playerName: r.player_name ?? null,
          seasonAvgPts: Number(r.season_avg_pts ?? raw.season_avg_pts ?? 0),
          last5AvgPts: Number(r.last5_avg_pts ?? raw.last5_avg_pts ?? 0),
          gamesInLast5: Number(r.games_in_last5 ?? raw.games_in_last5 ?? 0),
          overCount: overCount >= 4 && overCount <= 5 ? overCount : 0,
          diff: Number(r.diff ?? raw.diff ?? 0),
        };
      }).filter((p) => p.seasonAvgPts >= 8 && (p.overCount === 4 || p.overCount === 5));
    } catch (error) {
      console.error("Database Error (getPlayersOverSeasonAvgLast5):", error);
      return [];
    }
  },
  ["getPlayersOverSeasonAvgLast5"],
  { tags: ["player-data"] }
);

// --- Under season average in last 5 games (points) — "Cold last 5" ---
// Players with 5/5 or 4/5 of last 5 (played) games under their season average; season avg >= 8; DNPs excluded.
export type UnderSeasonAvgLast5 = {
  playerName: string | null;
  seasonAvgPts: number;
  last5AvgPts: number;
  gamesInLast5: number;
  underCount: number; // 4 or 5 — how many of last 5 games were under season avg
  diff: number; // last5AvgPts - seasonAvgPts (negative when cold)
};

export const getPlayersUnderSeasonAvgLast5 = unstable_cache(
  async (limit = 8): Promise<UnderSeasonAvgLast5[]> => {
    type Row = {
      player_name: string | null;
      season_avg_pts: string | number;
      last5_avg_pts: string | number;
      games_in_last5: number;
      under_count: number;
      diff: string | number;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH ranked AS (
          SELECT s.player_id, s.points, g.game_date,
            ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
          FROM player_game_stats s
          JOIN games g ON g.game_id = s.game_id
          WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
        ),
        recently_active AS (
          SELECT sub.player_id
          FROM (
            SELECT s.player_id, s.minutes_played,
              ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
            FROM player_game_stats s
            JOIN games g ON g.game_id = s.game_id
          ) sub
          WHERE sub.rn <= 5
          GROUP BY sub.player_id
          HAVING
            -- most recent game must be played
            COUNT(*) FILTER (
              WHERE sub.rn = 1
                AND COALESCE(LOWER(TRIM(sub.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
            ) = 1
            -- at least 3 of last 5 played
            AND COUNT(*) FILTER (
              WHERE COALESCE(LOWER(TRIM(sub.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
            ) >= 3
        ),
        season_avg AS (
          SELECT player_id, AVG(points) AS season_avg_pts
          FROM player_game_stats
          WHERE COALESCE(LOWER(TRIM(minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          GROUP BY player_id
          HAVING AVG(points) >= 8
        ),
        last_5_with_sa AS (
          SELECT r.player_id, r.points, sa.season_avg_pts
          FROM ranked r
          JOIN season_avg sa ON sa.player_id = r.player_id
          JOIN recently_active ra ON ra.player_id = r.player_id
          WHERE r.rn <= 5
        ),
        under_agg AS (
          SELECT player_id,
            COUNT(*)::int AS games_in_last5,
            COUNT(*) FILTER (WHERE points < season_avg_pts)::int AS under_count,
            AVG(points) AS last5_avg_pts
          FROM last_5_with_sa
          GROUP BY player_id
          HAVING COUNT(*) >= 5 AND COUNT(*) FILTER (WHERE points < season_avg_pts) IN (4, 5)
        ),
        playing_today AS (
          SELECT DISTINCT pp.player_id
          FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          WHERE g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        )
        SELECT p.player_name,
          ROUND(sa.season_avg_pts::numeric, 1) AS season_avg_pts,
          ROUND(u.last5_avg_pts::numeric, 1) AS last5_avg_pts,
          u.games_in_last5,
          u.under_count,
          ROUND((u.last5_avg_pts - sa.season_avg_pts)::numeric, 1) AS diff
        FROM under_agg u
        JOIN season_avg sa ON sa.player_id = u.player_id
        JOIN players p ON p.player_id = u.player_id
        WHERE EXISTS (SELECT 1 FROM playing_today pt WHERE pt.player_id = u.player_id)
           OR NOT EXISTS (SELECT 1 FROM playing_today)
        ORDER BY
          u.under_count DESC, sa.season_avg_pts DESC
        LIMIT ${limit}
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return rows
        .map((r: Row) => {
          const raw = r as Record<string, unknown>;
          const underCount = Number(r.under_count ?? raw.under_count ?? 0);
          return {
            playerName: r.player_name ?? null,
            seasonAvgPts: Number(r.season_avg_pts ?? raw.season_avg_pts ?? 0),
            last5AvgPts: Number(r.last5_avg_pts ?? raw.last5_avg_pts ?? 0),
            gamesInLast5: Number(r.games_in_last5 ?? raw.games_in_last5 ?? 0),
            underCount: underCount >= 4 && underCount <= 5 ? underCount : 0,
            diff: Number(r.diff ?? raw.diff ?? 0),
          };
        })
        .filter(
          (p) => p.seasonAvgPts >= 8 && (p.underCount === 4 || p.underCount === 5)
        );
    } catch (error) {
      console.error("Database Error (getPlayersUnderSeasonAvgLast5):", error);
      return [];
    }
  },
  ["getPlayersUnderSeasonAvgLast5"],
  { tags: ["player-data"] }
);

// --- Trending: last 3 games avg vs previous 3 games avg (points) ---
// DNPs excluded; only players with season avg >= 8. Sorted by diff (last 3 - prev 3) DESC.
export type TrendingPlayer = {
  playerName: string | null;
  last3AvgPts: number;
  prev3AvgPts: number;
  diff: number; // last3AvgPts - prev3AvgPts
};

// --- Top Picks: multi-stat high-confidence bets using book lines ---
// For each player with prop lines today, checks how often they beat the book line
// across ALL stats in their last 10 games. Returns the most confident hits.
export type TopPick = {
  playerName: string;
  marketCode: string;
  marketName: string;
  bookLine: number;
  opponentTeamCode: string | null;
  gamesChecked: number;
  overCount: number;
  hitRate: number; // 0-100
  playingToday: boolean;
};

export type PicksResult<T> = {
  picks: T[];
  propDate: string | null; // ISO date string e.g. "2026-02-27"
};

type PickBoardResult = {
  propDate: string | null;
  topPicks: TopPick[];
  underPicks: UnderPick[];
};

const getNbaPickBoard = unstable_cache(
  async (): Promise<PickBoardResult> => {
    type Row = {
      side: "over" | "under";
      player_name: string;
      market_code: string;
      market_name: string;
      book_line: string | number;
      opponent_team_code: string | null;
      games_checked: number;
      over_count: number | null;
      under_count: number | null;
      hit_rate: string | number;
      avg_last10: string | number | null;
      prop_date: string | null;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH prop_date AS (
          SELECT COALESCE(
            (SELECT g.game_date FROM player_props pp
             JOIN games g ON g.game_id = pp.game_id
             WHERE g.game_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
             ORDER BY g.game_date ASC LIMIT 1),
            (SELECT MAX(g.game_date) FROM player_props pp
             JOIN games g ON g.game_id = pp.game_id)
          ) AS target_date
        ),
        candidate_props AS (
          SELECT
            pp.player_id,
            pm.market_code,
            pm.market_name,
            pp.book_line,
            g.home_team_id,
            g.away_team_id
          FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          JOIN prop_markets pm ON pm.market_id = pp.market_id
          WHERE g.game_date = (SELECT target_date FROM prop_date)
            AND pp.book_line IS NOT NULL
            AND pm.market_code NOT IN ('FTM', 'TOV')
        ),
        latest_team AS (
          SELECT DISTINCT ON (pgs.player_id)
            pgs.player_id,
            pgs.team_id
          FROM player_game_stats pgs
          WHERE pgs.player_id IN (SELECT DISTINCT player_id FROM candidate_props)
          ORDER BY pgs.player_id, pgs.gamelog_id DESC
        ),
        todays_props AS (
          SELECT
            cp.player_id,
            cp.market_code,
            cp.market_name,
            cp.book_line,
            opp.team_code AS opponent_team_code
          FROM candidate_props cp
          JOIN latest_team lt ON lt.player_id = cp.player_id
          JOIN teams opp ON opp.team_id = CASE
            WHEN lt.team_id = cp.home_team_id THEN cp.away_team_id
            ELSE cp.home_team_id
          END
        ),
        ranked_games AS (
          SELECT s.player_id,
            s.points, s.total_rebounds, s.assists, s.steals, s.blocks,
            s.three_pointers_made, s.free_throws_made, s.turnovers, s.pts_reb_ast,
            ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
          FROM player_game_stats s
          JOIN games g ON g.game_id = s.game_id
          WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
            AND s.player_id IN (SELECT DISTINCT player_id FROM todays_props)
        ),
        last_10 AS (
          SELECT * FROM ranked_games WHERE rn <= 10
        ),
        hit_rates AS (
          SELECT
            tp.player_id,
            tp.market_code,
            tp.market_name,
            tp.book_line,
            tp.opponent_team_code,
            COUNT(*)::int AS games_checked,
            COUNT(*) FILTER (WHERE
              CASE tp.market_code
                WHEN 'PTS' THEN l.points
                WHEN 'REB' THEN l.total_rebounds
                WHEN 'AST' THEN l.assists
                WHEN 'STL' THEN l.steals
                WHEN 'BLK' THEN l.blocks
                WHEN 'FG3' THEN l.three_pointers_made
                WHEN 'FTM' THEN l.free_throws_made
                WHEN 'TOV' THEN l.turnovers
                WHEN 'PRA' THEN l.pts_reb_ast
                WHEN 'PR' THEN l.points + l.total_rebounds
                WHEN 'PA' THEN l.points + l.assists
                WHEN 'RA' THEN l.total_rebounds + l.assists
                WHEN 'SB' THEN l.steals + l.blocks
              END > tp.book_line
            )::int AS over_count,
            COUNT(*) FILTER (WHERE
              CASE tp.market_code
                WHEN 'PTS' THEN l.points
                WHEN 'REB' THEN l.total_rebounds
                WHEN 'AST' THEN l.assists
                WHEN 'STL' THEN l.steals
                WHEN 'BLK' THEN l.blocks
                WHEN 'FG3' THEN l.three_pointers_made
                WHEN 'FTM' THEN l.free_throws_made
                WHEN 'TOV' THEN l.turnovers
                WHEN 'PRA' THEN l.pts_reb_ast
                WHEN 'PR' THEN l.points + l.total_rebounds
                WHEN 'PA' THEN l.points + l.assists
                WHEN 'RA' THEN l.total_rebounds + l.assists
                WHEN 'SB' THEN l.steals + l.blocks
              END < tp.book_line
            )::int AS under_count,
            AVG(
              CASE tp.market_code
                WHEN 'PTS' THEN l.points
                WHEN 'REB' THEN l.total_rebounds
                WHEN 'AST' THEN l.assists
                WHEN 'STL' THEN l.steals
                WHEN 'BLK' THEN l.blocks
                WHEN 'FG3' THEN l.three_pointers_made
                WHEN 'FTM' THEN l.free_throws_made
                WHEN 'TOV' THEN l.turnovers
                WHEN 'PRA' THEN l.pts_reb_ast
                WHEN 'PR' THEN l.points + l.total_rebounds
                WHEN 'PA' THEN l.points + l.assists
                WHEN 'RA' THEN l.total_rebounds + l.assists
                WHEN 'SB' THEN l.steals + l.blocks
              END
            ) AS avg_last10
          FROM todays_props tp
          JOIN last_10 l ON l.player_id = tp.player_id
          GROUP BY tp.player_id, tp.market_code, tp.market_name, tp.book_line, tp.opponent_team_code
          HAVING COUNT(*) >= 5
        ),
        over_ranked AS (
          SELECT
            p.player_name,
            h.player_id,
            h.market_code,
            h.market_name,
            h.book_line::text AS book_line,
            h.opponent_team_code,
            h.games_checked,
            h.over_count,
            h.under_count,
            ROUND((h.over_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
            h.avg_last10,
            ROW_NUMBER() OVER (
              PARTITION BY h.player_id
              ORDER BY (h.over_count::numeric / h.games_checked) DESC, ABS(h.avg_last10 - h.book_line) / NULLIF(h.book_line, 0) DESC
            ) AS player_rn
          FROM hit_rates h
          JOIN players p ON p.player_id = h.player_id
          WHERE h.over_count::numeric / h.games_checked >= 0.6
            AND h.book_line > 1.5
        ),
        under_ranked AS (
          SELECT
            p.player_name,
            h.player_id,
            h.market_code,
            h.market_name,
            h.book_line::text AS book_line,
            h.opponent_team_code,
            h.games_checked,
            h.over_count,
            h.under_count,
            ROUND((h.under_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
            h.avg_last10,
            ROW_NUMBER() OVER (
              PARTITION BY h.player_id
              ORDER BY (h.under_count::numeric / h.games_checked) DESC, h.book_line DESC
            ) AS player_rn
          FROM hit_rates h
          JOIN players p ON p.player_id = h.player_id
          WHERE h.under_count::numeric / h.games_checked >= 0.6
            AND h.book_line > 1.5
            AND h.market_code != 'FG3'
            AND NOT (h.market_code IN ('BLK', 'STL', 'SB') AND h.book_line <= 1.5)
            AND NOT (h.market_code = 'AST' AND h.book_line <= 2.5)
        )
        SELECT
          side,
          player_name,
          market_code,
          market_name,
          book_line,
          opponent_team_code,
          games_checked,
          over_count,
          under_count,
          hit_rate,
          avg_last10::text AS avg_last10,
          (SELECT target_date::text FROM prop_date) AS prop_date
        FROM (
          SELECT
            'over'::text AS side,
            player_name,
            market_code,
            market_name,
            book_line,
            opponent_team_code,
            games_checked,
            over_count,
            under_count,
            hit_rate,
            avg_last10,
            ROW_NUMBER() OVER (
              ORDER BY hit_rate DESC, ABS(avg_last10 - book_line::numeric) / NULLIF(book_line::numeric, 0) DESC
            ) AS overall_rn
          FROM over_ranked
          WHERE player_rn <= 2

          UNION ALL

          SELECT
            'under'::text AS side,
            player_name,
            market_code,
            market_name,
            book_line,
            opponent_team_code,
            games_checked,
            over_count,
            under_count,
            hit_rate,
            avg_last10,
            ROW_NUMBER() OVER (
              ORDER BY hit_rate DESC, book_line::numeric DESC
            ) AS overall_rn
          FROM under_ranked
          WHERE player_rn <= 2
        ) ranked
        WHERE overall_rn <= 50
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      const topPicks: TopPick[] = [];
      const underPicks: UnderPick[] = [];

      for (const row of rows) {
        if (row.side === "over") {
          topPicks.push({
            playerName: row.player_name,
            marketCode: row.market_code,
            marketName: row.market_name,
            bookLine: Number(row.book_line),
            opponentTeamCode: row.opponent_team_code,
            gamesChecked: Number(row.games_checked),
            overCount: Number(row.over_count ?? 0),
            hitRate: Number(row.hit_rate),
            playingToday: true,
          });
        } else {
          underPicks.push({
            playerName: row.player_name,
            marketCode: row.market_code,
            marketName: row.market_name,
            bookLine: Number(row.book_line),
            opponentTeamCode: row.opponent_team_code,
            gamesChecked: Number(row.games_checked),
            underCount: Number(row.under_count ?? 0),
            hitRate: Number(row.hit_rate),
            playingToday: true,
          });
        }
      }

      topPicks.sort((a, b) => b.hitRate - a.hitRate || b.bookLine - a.bookLine);
      underPicks.sort((a, b) => b.hitRate - a.hitRate || b.bookLine - a.bookLine);

      return {
        propDate: rows[0]?.prop_date ?? null,
        topPicks,
        underPicks,
      };
    } catch (error) {
      console.error("Database Error (getNbaPickBoard):", error);
      return { propDate: null, topPicks: [], underPicks: [] };
    }
  },
  ["getNbaPickBoard"],
  { tags: ["player-data"] }
);

export const getTopPicks = unstable_cache(
  async (limit = 15): Promise<PicksResult<TopPick>> => {
    try {
      const board = await getNbaPickBoard();
      return {
        picks: board.topPicks.slice(0, limit),
        propDate: board.propDate,
      };
    } catch (error) {
      console.error("Database Error (getTopPicks):", error);
      return { picks: [], propDate: null };
    }
  },
  ["getTopPicks"],
  { tags: ["player-data"] }
);

// --- Under Picks: players most likely to go UNDER today's book lines ---
export type UnderPick = {
  playerName: string;
  marketCode: string;
  marketName: string;
  bookLine: number;
  opponentTeamCode: string | null;
  gamesChecked: number;
  underCount: number;
  hitRate: number; // 0-100
  playingToday: boolean;
};

export const getUnderPicks = unstable_cache(
  async (limit = 25): Promise<PicksResult<UnderPick>> => {
    try {
      const board = await getNbaPickBoard();
      return {
        picks: board.underPicks.slice(0, limit),
        propDate: board.propDate,
      };
    } catch (error) {
      console.error("Database Error (getUnderPicks):", error);
      return { picks: [], propDate: null };
    }
  },
  ["getUnderPicks"],
  { tags: ["player-data"] }
);

export const getMlbTopPicks = unstable_cache(
  async (limit = 25): Promise<PicksResult<TopPick>> => {
    type Row = {
      player_name: string;
      market_code: string;
      market_name: string;
      book_line: string | number;
      opponent_team_code: string | null;
      games_checked: number;
      over_count: number;
      hit_rate: string | number;
      prop_date: string | null;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH prop_date AS (
          SELECT COALESCE(
            (
              SELECT g.game_date
              FROM player_props pp
              JOIN games g ON g.game_id = pp.game_id
              JOIN prop_markets pm ON pm.market_id = pp.market_id
              WHERE pm.market_code LIKE 'MLB_%'
                AND g.game_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
              ORDER BY g.game_date ASC
              LIMIT 1
            ),
            (
              SELECT MAX(g.game_date)
              FROM player_props pp
              JOIN games g ON g.game_id = pp.game_id
              JOIN prop_markets pm ON pm.market_id = pp.market_id
              WHERE pm.market_code LIKE 'MLB_%'
            )
          ) AS target_date
        ),
        todays_props AS (
          SELECT
            pp.player_id,
            pm.market_code,
            pm.market_name,
            pp.book_line,
            CASE
              WHEN latest_team.team_code = ht.team_code THEN at.team_code
              ELSE ht.team_code
            END AS opponent_team_code
          FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          JOIN prop_markets pm ON pm.market_id = pp.market_id
          JOIN teams ht ON ht.team_id = g.home_team_id
          JOIN teams at ON at.team_id = g.away_team_id
          LEFT JOIN LATERAL (
            SELECT t.team_code
            FROM (
              SELECT bgs.team_id, g2.game_date, bgs.gamelog_id
              FROM mlb_batter_game_stats bgs
              JOIN games g2 ON g2.game_id = bgs.game_id
              WHERE bgs.player_id = pp.player_id

              UNION ALL

              SELECT pgs.team_id, g3.game_date, pgs.gamelog_id
              FROM mlb_pitcher_game_stats pgs
              JOIN games g3 ON g3.game_id = pgs.game_id
              WHERE pgs.player_id = pp.player_id
            ) latest_team_rows
            JOIN teams t ON t.team_id = latest_team_rows.team_id
            ORDER BY latest_team_rows.game_date DESC, latest_team_rows.gamelog_id DESC
            LIMIT 1
          ) latest_team ON true
          WHERE g.game_date = (SELECT target_date FROM prop_date)
            AND pp.book_line IS NOT NULL
            AND pm.market_code LIKE 'MLB_%'
            AND latest_team.team_code IS NOT NULL
        ),
        batter_props AS (
          SELECT * FROM todays_props
          WHERE market_code IN ('MLB_HITS', 'MLB_TB', 'MLB_HR', 'MLB_RBI', 'MLB_RUNS', 'MLB_WALKS', 'MLB_SB')
        ),
        pitcher_props AS (
          SELECT * FROM todays_props
          WHERE market_code IN ('MLB_P_SO', 'MLB_P_ER', 'MLB_P_OUTS', 'MLB_P_HITS', 'MLB_P_WALKS')
        ),
        ranked_batter_games AS (
          SELECT
            bgs.player_id,
            bgs.hits,
            bgs.total_bases,
            bgs.home_runs,
            bgs.rbi,
            bgs.runs,
            bgs.walks,
            bgs.stolen_bases,
            ROW_NUMBER() OVER (PARTITION BY bgs.player_id ORDER BY g.game_date DESC) AS rn
          FROM mlb_batter_game_stats bgs
          JOIN games g ON g.game_id = bgs.game_id
          WHERE bgs.player_id IN (SELECT DISTINCT player_id FROM batter_props)
        ),
        last_10_batter AS (
          SELECT * FROM ranked_batter_games WHERE rn <= 10
        ),
        ranked_pitcher_games AS (
          SELECT
            pgs.player_id,
            pgs.strikeouts,
            pgs.earned_runs,
            pgs.outs_recorded,
            pgs.hits_allowed,
            pgs.walks_allowed,
            ROW_NUMBER() OVER (PARTITION BY pgs.player_id ORDER BY g.game_date DESC) AS rn
          FROM mlb_pitcher_game_stats pgs
          JOIN games g ON g.game_id = pgs.game_id
          WHERE pgs.player_id IN (SELECT DISTINCT player_id FROM pitcher_props)
        ),
        last_10_pitcher AS (
          SELECT * FROM ranked_pitcher_games WHERE rn <= 10
        ),
        batter_hit_rates AS (
          SELECT
            bp.player_id,
            bp.market_code,
            bp.market_name,
            bp.book_line,
            bp.opponent_team_code,
            COUNT(*)::int AS games_checked,
            COUNT(*) FILTER (
              WHERE CASE bp.market_code
                WHEN 'MLB_HITS' THEN l.hits
                WHEN 'MLB_TB' THEN l.total_bases
                WHEN 'MLB_HR' THEN l.home_runs
                WHEN 'MLB_RBI' THEN l.rbi
                WHEN 'MLB_RUNS' THEN l.runs
                WHEN 'MLB_WALKS' THEN l.walks
                WHEN 'MLB_SB' THEN l.stolen_bases
              END > bp.book_line
            )::int AS over_count,
            AVG(
              CASE bp.market_code
                WHEN 'MLB_HITS' THEN l.hits
                WHEN 'MLB_TB' THEN l.total_bases
                WHEN 'MLB_HR' THEN l.home_runs
                WHEN 'MLB_RBI' THEN l.rbi
                WHEN 'MLB_RUNS' THEN l.runs
                WHEN 'MLB_WALKS' THEN l.walks
                WHEN 'MLB_SB' THEN l.stolen_bases
              END
            ) AS avg_last10
          FROM batter_props bp
          JOIN last_10_batter l ON l.player_id = bp.player_id
          GROUP BY bp.player_id, bp.market_code, bp.market_name, bp.book_line, bp.opponent_team_code
          HAVING COUNT(*) >= 5
        ),
        pitcher_hit_rates AS (
          SELECT
            pp.player_id,
            pp.market_code,
            pp.market_name,
            pp.book_line,
            pp.opponent_team_code,
            COUNT(*)::int AS games_checked,
            COUNT(*) FILTER (
              WHERE CASE pp.market_code
                WHEN 'MLB_P_SO' THEN l.strikeouts
                WHEN 'MLB_P_ER' THEN l.earned_runs
                WHEN 'MLB_P_OUTS' THEN l.outs_recorded
                WHEN 'MLB_P_HITS' THEN l.hits_allowed
                WHEN 'MLB_P_WALKS' THEN l.walks_allowed
              END > pp.book_line
            )::int AS over_count,
            AVG(
              CASE pp.market_code
                WHEN 'MLB_P_SO' THEN l.strikeouts
                WHEN 'MLB_P_ER' THEN l.earned_runs
                WHEN 'MLB_P_OUTS' THEN l.outs_recorded
                WHEN 'MLB_P_HITS' THEN l.hits_allowed
                WHEN 'MLB_P_WALKS' THEN l.walks_allowed
              END
            ) AS avg_last10
          FROM pitcher_props pp
          JOIN last_10_pitcher l ON l.player_id = pp.player_id
          GROUP BY pp.player_id, pp.market_code, pp.market_name, pp.book_line, pp.opponent_team_code
          HAVING COUNT(*) >= 5
        ),
        all_hit_rates AS (
          SELECT * FROM batter_hit_rates
          UNION ALL
          SELECT * FROM pitcher_hit_rates
        ),
        ranked_picks AS (
          SELECT
            p.player_name,
            h.player_id,
            h.market_code,
            h.market_name,
            h.book_line::text AS book_line,
            h.opponent_team_code,
            h.games_checked,
            h.over_count,
            ROUND((h.over_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
            h.avg_last10,
            ROW_NUMBER() OVER (
              PARTITION BY h.player_id
              ORDER BY (h.over_count::numeric / h.games_checked) DESC, ABS(h.avg_last10 - h.book_line) DESC
            ) AS player_rn
          FROM all_hit_rates h
          JOIN players p ON p.player_id = h.player_id
          WHERE h.over_count::numeric / h.games_checked >= 0.6
            AND h.book_line >= 0.5
        )
        SELECT
          player_name,
          market_code,
          market_name,
          book_line,
          opponent_team_code,
          games_checked,
          over_count,
          hit_rate,
          (SELECT target_date::text FROM prop_date) AS prop_date
        FROM ranked_picks
        WHERE player_rn <= 2
        ORDER BY hit_rate DESC, book_line::numeric DESC
        LIMIT ${limit}
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return {
        picks: rows.map((r) => ({
          playerName: r.player_name,
          marketCode: r.market_code,
          marketName: r.market_name,
          bookLine: Number(r.book_line),
          opponentTeamCode: r.opponent_team_code,
          gamesChecked: Number(r.games_checked),
          overCount: Number(r.over_count),
          hitRate: Number(r.hit_rate),
          playingToday: true,
        })),
        propDate: rows[0]?.prop_date ?? null,
      };
    } catch (error) {
      console.error("Database Error (getMlbTopPicks):", error);
      return { picks: [], propDate: null };
    }
  },
  ["getMlbTopPicks"],
  { tags: ["mlb-data"] }
);

export const getMlbUnderPicks = unstable_cache(
  async (limit = 25): Promise<PicksResult<UnderPick>> => {
    type Row = {
      player_name: string;
      market_code: string;
      market_name: string;
      book_line: string | number;
      opponent_team_code: string | null;
      games_checked: number;
      under_count: number;
      hit_rate: string | number;
      prop_date: string | null;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH prop_date AS (
          SELECT COALESCE(
            (
              SELECT g.game_date
              FROM player_props pp
              JOIN games g ON g.game_id = pp.game_id
              JOIN prop_markets pm ON pm.market_id = pp.market_id
              WHERE pm.market_code LIKE 'MLB_%'
                AND g.game_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
              ORDER BY g.game_date ASC
              LIMIT 1
            ),
            (
              SELECT MAX(g.game_date)
              FROM player_props pp
              JOIN games g ON g.game_id = pp.game_id
              JOIN prop_markets pm ON pm.market_id = pp.market_id
              WHERE pm.market_code LIKE 'MLB_%'
            )
          ) AS target_date
        ),
        todays_props AS (
          SELECT
            pp.player_id,
            pm.market_code,
            pm.market_name,
            pp.book_line,
            CASE
              WHEN latest_team.team_code = ht.team_code THEN at.team_code
              ELSE ht.team_code
            END AS opponent_team_code
          FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          JOIN prop_markets pm ON pm.market_id = pp.market_id
          JOIN teams ht ON ht.team_id = g.home_team_id
          JOIN teams at ON at.team_id = g.away_team_id
          LEFT JOIN LATERAL (
            SELECT t.team_code
            FROM (
              SELECT bgs.team_id, g2.game_date, bgs.gamelog_id
              FROM mlb_batter_game_stats bgs
              JOIN games g2 ON g2.game_id = bgs.game_id
              WHERE bgs.player_id = pp.player_id

              UNION ALL

              SELECT pgs.team_id, g3.game_date, pgs.gamelog_id
              FROM mlb_pitcher_game_stats pgs
              JOIN games g3 ON g3.game_id = pgs.game_id
              WHERE pgs.player_id = pp.player_id
            ) latest_team_rows
            JOIN teams t ON t.team_id = latest_team_rows.team_id
            ORDER BY latest_team_rows.game_date DESC, latest_team_rows.gamelog_id DESC
            LIMIT 1
          ) latest_team ON true
          WHERE g.game_date = (SELECT target_date FROM prop_date)
            AND pp.book_line IS NOT NULL
            AND pm.market_code LIKE 'MLB_%'
            AND latest_team.team_code IS NOT NULL
        ),
        batter_props AS (
          SELECT * FROM todays_props
          WHERE market_code IN ('MLB_HITS', 'MLB_TB', 'MLB_HR', 'MLB_RBI', 'MLB_RUNS', 'MLB_WALKS', 'MLB_SB')
        ),
        pitcher_props AS (
          SELECT * FROM todays_props
          WHERE market_code IN ('MLB_P_SO', 'MLB_P_ER', 'MLB_P_OUTS', 'MLB_P_HITS', 'MLB_P_WALKS')
        ),
        ranked_batter_games AS (
          SELECT
            bgs.player_id,
            bgs.hits,
            bgs.total_bases,
            bgs.home_runs,
            bgs.rbi,
            bgs.runs,
            bgs.walks,
            bgs.stolen_bases,
            ROW_NUMBER() OVER (PARTITION BY bgs.player_id ORDER BY g.game_date DESC) AS rn
          FROM mlb_batter_game_stats bgs
          JOIN games g ON g.game_id = bgs.game_id
          WHERE bgs.player_id IN (SELECT DISTINCT player_id FROM batter_props)
        ),
        last_10_batter AS (
          SELECT * FROM ranked_batter_games WHERE rn <= 10
        ),
        ranked_pitcher_games AS (
          SELECT
            pgs.player_id,
            pgs.strikeouts,
            pgs.earned_runs,
            pgs.outs_recorded,
            pgs.hits_allowed,
            pgs.walks_allowed,
            ROW_NUMBER() OVER (PARTITION BY pgs.player_id ORDER BY g.game_date DESC) AS rn
          FROM mlb_pitcher_game_stats pgs
          JOIN games g ON g.game_id = pgs.game_id
          WHERE pgs.player_id IN (SELECT DISTINCT player_id FROM pitcher_props)
        ),
        last_10_pitcher AS (
          SELECT * FROM ranked_pitcher_games WHERE rn <= 10
        ),
        batter_hit_rates AS (
          SELECT
            bp.player_id,
            bp.market_code,
            bp.market_name,
            bp.book_line,
            bp.opponent_team_code,
            COUNT(*)::int AS games_checked,
            COUNT(*) FILTER (
              WHERE CASE bp.market_code
                WHEN 'MLB_HITS' THEN l.hits
                WHEN 'MLB_TB' THEN l.total_bases
                WHEN 'MLB_HR' THEN l.home_runs
                WHEN 'MLB_RBI' THEN l.rbi
                WHEN 'MLB_RUNS' THEN l.runs
                WHEN 'MLB_WALKS' THEN l.walks
                WHEN 'MLB_SB' THEN l.stolen_bases
              END < bp.book_line
            )::int AS under_count
          FROM batter_props bp
          JOIN last_10_batter l ON l.player_id = bp.player_id
          GROUP BY bp.player_id, bp.market_code, bp.market_name, bp.book_line, bp.opponent_team_code
          HAVING COUNT(*) >= 5
        ),
        pitcher_hit_rates AS (
          SELECT
            pp.player_id,
            pp.market_code,
            pp.market_name,
            pp.book_line,
            pp.opponent_team_code,
            COUNT(*)::int AS games_checked,
            COUNT(*) FILTER (
              WHERE CASE pp.market_code
                WHEN 'MLB_P_SO' THEN l.strikeouts
                WHEN 'MLB_P_ER' THEN l.earned_runs
                WHEN 'MLB_P_OUTS' THEN l.outs_recorded
                WHEN 'MLB_P_HITS' THEN l.hits_allowed
                WHEN 'MLB_P_WALKS' THEN l.walks_allowed
              END < pp.book_line
            )::int AS under_count
          FROM pitcher_props pp
          JOIN last_10_pitcher l ON l.player_id = pp.player_id
          GROUP BY pp.player_id, pp.market_code, pp.market_name, pp.book_line, pp.opponent_team_code
          HAVING COUNT(*) >= 5
        ),
        all_hit_rates AS (
          SELECT * FROM batter_hit_rates
          UNION ALL
          SELECT * FROM pitcher_hit_rates
        ),
        ranked_picks AS (
          SELECT
            p.player_name,
            h.player_id,
            h.market_code,
            h.market_name,
            h.book_line::text AS book_line,
            h.opponent_team_code,
            h.games_checked,
            h.under_count,
            ROUND((h.under_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
            ROW_NUMBER() OVER (
              PARTITION BY h.player_id
              ORDER BY (h.under_count::numeric / h.games_checked) DESC, h.book_line DESC
            ) AS player_rn
          FROM all_hit_rates h
          JOIN players p ON p.player_id = h.player_id
          WHERE h.under_count::numeric / h.games_checked >= 0.6
            AND h.book_line >= 0.5
        )
        SELECT
          player_name,
          market_code,
          market_name,
          book_line,
          opponent_team_code,
          games_checked,
          under_count,
          hit_rate,
          (SELECT target_date::text FROM prop_date) AS prop_date
        FROM ranked_picks
        WHERE player_rn <= 2
        ORDER BY hit_rate DESC, book_line::numeric DESC
        LIMIT ${limit}
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return {
        picks: rows.map((r) => ({
          playerName: r.player_name,
          marketCode: r.market_code,
          marketName: r.market_name,
          bookLine: Number(r.book_line),
          opponentTeamCode: r.opponent_team_code,
          gamesChecked: Number(r.games_checked),
          underCount: Number(r.under_count),
          hitRate: Number(r.hit_rate),
          playingToday: true,
        })),
        propDate: rows[0]?.prop_date ?? null,
      };
    } catch (error) {
      console.error("Database Error (getMlbUnderPicks):", error);
      return { picks: [], propDate: null };
    }
  },
  ["getMlbUnderPicks"],
  { tags: ["mlb-data"] }
);

// --- Backtest: check how yesterday's picks actually performed ---
export type BacktestPick = {
  playerName: string;
  marketCode: string;
  marketName: string;
  bookLine: number;
  gamesChecked: number;
  pickCount: number;
  hitRate: number;
  side: "over" | "under";
  actualValue: number | null;
  result: "win" | "loss" | "push" | "dnp";
};

export type BacktestResult = {
  gameDate: string;
  picks: BacktestPick[];
};

export const getBacktestResults = unstable_cache(
  async (): Promise<BacktestResult> => {
    type Row = {
      player_name: string;
      market_code: string;
      market_name: string;
      book_line: string | number;
      games_checked: number;
      pick_count: number;
      hit_rate: string | number;
      side: string;
      actual_value: number | null;
      result: string;
      game_date: string;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH target_date AS (
          SELECT MAX(g.game_date) AS dt
          FROM games g
          WHERE g.game_date < (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
            AND g.game_date > (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date - INTERVAL '7 days'
            AND EXISTS (
              SELECT 1 FROM player_props pp
              WHERE pp.game_id = g.game_id AND pp.book_line IS NOT NULL
            )
            AND EXISTS (
              SELECT 1 FROM player_game_stats s
              WHERE s.game_id = g.game_id
                AND COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
            )
        ),
        target_props AS (
          SELECT pp.player_id, pm.market_code, pm.market_name, pp.book_line, pp.game_id
          FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          JOIN prop_markets pm ON pm.market_id = pp.market_id
          CROSS JOIN target_date td
          WHERE g.game_date = td.dt
            AND pp.book_line IS NOT NULL
            AND pm.market_code NOT IN ('FTM', 'TOV')
        ),
        ranked_games AS (
          SELECT s.player_id,
            s.points, s.total_rebounds, s.assists, s.steals, s.blocks,
            s.three_pointers_made, s.free_throws_made, s.turnovers, s.pts_reb_ast,
            ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
          FROM player_game_stats s
          JOIN games g ON g.game_id = s.game_id
          CROSS JOIN target_date td
          WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
            AND g.game_date < td.dt
            AND s.player_id IN (SELECT DISTINCT player_id FROM target_props)
        ),
        last_10 AS (
          SELECT * FROM ranked_games WHERE rn <= 10
        ),
        hit_rates AS (
          SELECT
            tp.player_id, tp.market_code, tp.market_name, tp.book_line, tp.game_id,
            COUNT(*)::int AS games_checked,
            COUNT(*) FILTER (WHERE
              CASE tp.market_code
                WHEN 'PTS' THEN l.points
                WHEN 'REB' THEN l.total_rebounds
                WHEN 'AST' THEN l.assists
                WHEN 'STL' THEN l.steals
                WHEN 'BLK' THEN l.blocks
                WHEN 'FG3' THEN l.three_pointers_made
                WHEN 'FTM' THEN l.free_throws_made
                WHEN 'TOV' THEN l.turnovers
                WHEN 'PRA' THEN l.pts_reb_ast
                WHEN 'PR' THEN l.points + l.total_rebounds
                WHEN 'PA' THEN l.points + l.assists
                WHEN 'RA' THEN l.total_rebounds + l.assists
                WHEN 'SB' THEN l.steals + l.blocks
              END > tp.book_line
            )::int AS over_count,
            COUNT(*) FILTER (WHERE
              CASE tp.market_code
                WHEN 'PTS' THEN l.points
                WHEN 'REB' THEN l.total_rebounds
                WHEN 'AST' THEN l.assists
                WHEN 'STL' THEN l.steals
                WHEN 'BLK' THEN l.blocks
                WHEN 'FG3' THEN l.three_pointers_made
                WHEN 'FTM' THEN l.free_throws_made
                WHEN 'TOV' THEN l.turnovers
                WHEN 'PRA' THEN l.pts_reb_ast
                WHEN 'PR' THEN l.points + l.total_rebounds
                WHEN 'PA' THEN l.points + l.assists
                WHEN 'RA' THEN l.total_rebounds + l.assists
                WHEN 'SB' THEN l.steals + l.blocks
              END < tp.book_line
            )::int AS under_count,
            AVG(
              CASE tp.market_code
                WHEN 'PTS' THEN l.points
                WHEN 'REB' THEN l.total_rebounds
                WHEN 'AST' THEN l.assists
                WHEN 'STL' THEN l.steals
                WHEN 'BLK' THEN l.blocks
                WHEN 'FG3' THEN l.three_pointers_made
                WHEN 'FTM' THEN l.free_throws_made
                WHEN 'TOV' THEN l.turnovers
                WHEN 'PRA' THEN l.pts_reb_ast
                WHEN 'PR' THEN l.points + l.total_rebounds
                WHEN 'PA' THEN l.points + l.assists
                WHEN 'RA' THEN l.total_rebounds + l.assists
                WHEN 'SB' THEN l.steals + l.blocks
              END
            ) AS avg_last10
          FROM target_props tp
          JOIN last_10 l ON l.player_id = tp.player_id
          GROUP BY tp.player_id, tp.market_code, tp.market_name, tp.book_line, tp.game_id
          HAVING COUNT(*) >= 5
        ),
        over_ranked AS (
          SELECT p.player_name, h.player_id, h.market_code, h.market_name,
            h.book_line, h.game_id, h.games_checked, h.over_count AS pick_count,
            ROUND((h.over_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
            h.avg_last10,
            'over'::text AS side,
            ROW_NUMBER() OVER (
              PARTITION BY h.player_id
              ORDER BY (h.over_count::numeric / h.games_checked) DESC, ABS(h.avg_last10 - h.book_line) / NULLIF(h.book_line, 0) DESC
            ) AS player_rn
          FROM hit_rates h
          JOIN players p ON p.player_id = h.player_id
          WHERE h.over_count::numeric / h.games_checked >= 0.6
            AND h.book_line > 1.5
        ),
        under_ranked AS (
          SELECT p.player_name, h.player_id, h.market_code, h.market_name,
            h.book_line, h.game_id, h.games_checked, h.under_count AS pick_count,
            ROUND((h.under_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
            h.avg_last10,
            'under'::text AS side,
            ROW_NUMBER() OVER (
              PARTITION BY h.player_id
              ORDER BY (h.under_count::numeric / h.games_checked) DESC, ABS(h.avg_last10 - h.book_line) / NULLIF(h.book_line, 0) DESC
            ) AS player_rn
          FROM hit_rates h
          JOIN players p ON p.player_id = h.player_id
          WHERE h.under_count::numeric / h.games_checked >= 0.6
            AND h.book_line > 1.5
            AND h.market_code != 'FG3'
            AND NOT (h.market_code IN ('BLK', 'STL', 'SB') AND h.book_line <= 1.5)
            AND NOT (h.market_code = 'AST' AND h.book_line <= 2.5)
        ),
        all_picks AS (
          (SELECT player_name, player_id, market_code, market_name, book_line, game_id,
            games_checked, pick_count, hit_rate, avg_last10, side
          FROM over_ranked WHERE player_rn <= 2
          ORDER BY hit_rate DESC, ABS(avg_last10 - book_line) / NULLIF(book_line, 0) DESC
          LIMIT 100)
          UNION ALL
          (SELECT player_name, player_id, market_code, market_name, book_line, game_id,
            games_checked, pick_count, hit_rate, avg_last10, side
          FROM under_ranked WHERE player_rn <= 2
          ORDER BY hit_rate DESC, ABS(avg_last10 - book_line) / NULLIF(book_line, 0) DESC
          LIMIT 100)
        ),
        actual AS (
          SELECT DISTINCT s.player_id, s.game_id,
            s.points, s.total_rebounds, s.assists, s.steals, s.blocks,
            s.three_pointers_made, s.free_throws_made, s.turnovers, s.pts_reb_ast
          FROM player_game_stats s
          JOIN all_picks ap ON ap.player_id = s.player_id AND ap.game_id = s.game_id
          WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
        ),
        with_actual AS (
          SELECT ap.player_name, ap.market_code, ap.market_name,
            ap.book_line, ap.games_checked, ap.pick_count, ap.hit_rate, ap.avg_last10, ap.side,
            CASE ap.market_code
              WHEN 'PTS' THEN a.points
              WHEN 'REB' THEN a.total_rebounds
              WHEN 'AST' THEN a.assists
              WHEN 'STL' THEN a.steals
              WHEN 'BLK' THEN a.blocks
              WHEN 'FG3' THEN a.three_pointers_made
              WHEN 'FTM' THEN a.free_throws_made
              WHEN 'TOV' THEN a.turnovers
              WHEN 'PRA' THEN a.pts_reb_ast
              WHEN 'PR' THEN a.points + a.total_rebounds
              WHEN 'PA' THEN a.points + a.assists
              WHEN 'RA' THEN a.total_rebounds + a.assists
              WHEN 'SB' THEN a.steals + a.blocks
            END AS actual_value
          FROM all_picks ap
          LEFT JOIN actual a ON a.player_id = ap.player_id AND a.game_id = ap.game_id
        )
        SELECT player_name, market_code, market_name,
          book_line::text AS book_line, games_checked, pick_count, hit_rate, side,
          actual_value,
          CASE
            WHEN actual_value IS NULL THEN 'dnp'
            WHEN side = 'over' AND actual_value > book_line THEN 'win'
            WHEN side = 'under' AND actual_value < book_line THEN 'win'
            WHEN actual_value = book_line THEN 'push'
            ELSE 'loss'
          END AS result,
          (SELECT dt FROM target_date)::text AS game_date
        FROM with_actual
        ORDER BY side, hit_rate DESC, ABS(avg_last10 - book_line) / NULLIF(book_line, 0) DESC
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return {
        gameDate: rows.length > 0 ? String(rows[0].game_date) : "",
        picks: rows.map((r) => ({
          playerName: r.player_name,
          marketCode: r.market_code,
          marketName: r.market_name,
          bookLine: Number(r.book_line),
          gamesChecked: Number(r.games_checked),
          pickCount: Number(r.pick_count),
          hitRate: Number(r.hit_rate),
          side: r.side as "over" | "under",
          actualValue: r.actual_value != null ? Number(r.actual_value) : null,
          result: r.result as "win" | "loss" | "push" | "dnp",
        })),
      };
    } catch (error) {
      console.error("Database Error (getBacktestResults):", error);
      return { gameDate: "", picks: [] };
    }
  },
  ["getBacktestResults"],
  { tags: ["player-data"] }
);

// --- ML Backtest: graded ML model predictions ---

export type MlBacktestPick = {
  gameDate: string;
  playerName: string;
  marketCode: string;
  prediction: "OVER" | "UNDER";
  bookLine: number;
  pOver: number;
  confidence: number;
  actualValue: number | null;
  hit: boolean | null;
  avgLast5: number | null;
  oppDefRank: number | null;
  pickRank: number;
};

export type MlBacktestDay = {
  gameDate: string;
  picks: number;
  hits: number;
  losses: number;
  hitRate: number;
};

export type MlBacktestSummary = {
  totalPicks: number;
  totalHits: number;
  hitRate: number;
  daysCount: number;
  edge: number;
  dailyResults: MlBacktestDay[];
  marketBreakdown: { market: string; picks: number; hits: number; rate: number }[];
  recentPicks: MlBacktestPick[];
};

export const getMlBacktestResults = unstable_cache(
  async (): Promise<MlBacktestSummary> => {
    type Row = {
      game_date: string;
      player_name: string;
      market_code: string;
      prediction: string;
      book_line: string;
      p_over: string;
      confidence: string;
      actual_value: number | null;
      hit: boolean | null;
      avg_last_5: string | null;
      opp_def_rank: number | null;
      pick_rank: number;
    };

    try {
      const result = await db.execute<Row>(sql`
        SELECT
          game_date::text AS game_date,
          player_name, market_code, prediction,
          book_line::text AS book_line,
          p_over::text AS p_over,
          confidence::text AS confidence,
          actual_value, hit,
          avg_last_5::text AS avg_last_5,
          opp_def_rank, pick_rank
        FROM ml_backtest_results
        ORDER BY game_date DESC, pick_rank ASC
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      if (rows.length === 0) {
        return {
          totalPicks: 0, totalHits: 0, hitRate: 0, daysCount: 0, edge: 0,
          dailyResults: [], marketBreakdown: [], recentPicks: [],
        };
      }

      const picks: MlBacktestPick[] = rows.map((r) => ({
        gameDate: r.game_date,
        playerName: r.player_name,
        marketCode: r.market_code,
        prediction: r.prediction as "OVER" | "UNDER",
        bookLine: Number(r.book_line),
        pOver: Number(r.p_over),
        confidence: Number(r.confidence),
        actualValue: r.actual_value != null ? Number(r.actual_value) : null,
        hit: r.hit,
        avgLast5: r.avg_last_5 != null ? Number(r.avg_last_5) : null,
        oppDefRank: r.opp_def_rank,
        pickRank: r.pick_rank,
      }));

      // Daily aggregation
      const dayMap = new Map<string, { hits: number; total: number }>();
      for (const p of picks) {
        if (p.hit === null) continue;
        const d = dayMap.get(p.gameDate) ?? { hits: 0, total: 0 };
        d.total++;
        if (p.hit) d.hits++;
        dayMap.set(p.gameDate, d);
      }
      const dailyResults: MlBacktestDay[] = Array.from(dayMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, s]) => ({
          gameDate: date,
          picks: s.total,
          hits: s.hits,
          losses: s.total - s.hits,
          hitRate: s.total > 0 ? Math.round((s.hits / s.total) * 100) : 0,
        }));

      // Market aggregation
      const mktMap = new Map<string, { hits: number; total: number }>();
      for (const p of picks) {
        if (p.hit === null) continue;
        const m = mktMap.get(p.marketCode) ?? { hits: 0, total: 0 };
        m.total++;
        if (p.hit) m.hits++;
        mktMap.set(p.marketCode, m);
      }
      const marketBreakdown = Array.from(mktMap.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .map(([market, s]) => ({
          market,
          picks: s.total,
          hits: s.hits,
          rate: s.total > 0 ? Math.round((s.hits / s.total) * 100) : 0,
        }));

      const totalHits = picks.filter((p) => p.hit === true).length;
      const totalGraded = picks.filter((p) => p.hit !== null).length;
      const hitRate = totalGraded > 0 ? Math.round((totalHits / totalGraded) * 100) : 0;

      // Most recent day's picks for display
      const mostRecentDate = dailyResults[0]?.gameDate ?? "";
      const recentPicks = picks.filter((p) => p.gameDate === mostRecentDate);

      return {
        totalPicks: totalGraded,
        totalHits: totalHits,
        hitRate,
        daysCount: dailyResults.length,
        edge: Math.round((hitRate - 52.4) * 10) / 10,
        dailyResults,
        marketBreakdown,
        recentPicks,
      };
    } catch (error) {
      console.error("Database Error (getMlBacktestResults):", error);
      return {
        totalPicks: 0, totalHits: 0, hitRate: 0, daysCount: 0, edge: 0,
        dailyResults: [], marketBreakdown: [], recentPicks: [],
      };
    }
  },
  ["getMlBacktestResults"],
  { tags: ["player-data"] }
);

// --- Home/Away splits for a player (full season) ---
export type SplitStats = {
  games: number;
  avgPts: number;
  avgReb: number;
  avgAst: number;
  avgStl: number;
  avgBlk: number;
  avg3pm: number;
  avgPra: number;
  avgFtm: number;
  avgFta: number;
};

export type PlayerSplits = {
  home: SplitStats;
  away: SplitStats;
};

export const getPlayerSplits = unstable_cache(
  async (playerName: string): Promise<PlayerSplits> => {
    const empty: SplitStats = {
      games: 0, avgPts: 0, avgReb: 0, avgAst: 0,
      avgStl: 0, avgBlk: 0, avg3pm: 0, avgPra: 0,
      avgFtm: 0, avgFta: 0,
    };

    type Row = {
      is_home: boolean;
      games: number;
      avg_pts: string | number;
      avg_reb: string | number;
      avg_ast: string | number;
      avg_stl: string | number;
      avg_blk: string | number;
      avg_3pm: string | number;
      avg_pra: string | number;
      avg_ftm: string | number;
      avg_fta: string | number;
    };

    try {
      const result = await db.execute<Row>(sql`
        SELECT
          s.is_home,
          COUNT(*)::int AS games,
          ROUND(AVG(s.points)::numeric, 1) AS avg_pts,
          ROUND(AVG(s.total_rebounds)::numeric, 1) AS avg_reb,
          ROUND(AVG(s.assists)::numeric, 1) AS avg_ast,
          ROUND(AVG(s.steals)::numeric, 1) AS avg_stl,
          ROUND(AVG(s.blocks)::numeric, 1) AS avg_blk,
          ROUND(AVG(s.three_pointers_made)::numeric, 1) AS avg_3pm,
          ROUND(AVG(s.pts_reb_ast)::numeric, 1) AS avg_pra,
          ROUND(AVG(s.free_throws_made)::numeric, 1) AS avg_ftm,
          ROUND(AVG(s.free_throws_attempted)::numeric, 1) AS avg_fta
        FROM player_game_stats s
        JOIN players p ON p.player_id = s.player_id
        WHERE LOWER(p.player_name) = LOWER(${playerName})
          AND COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
        GROUP BY s.is_home
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      const toStats = (r: Row): SplitStats => ({
        games: Number(r.games),
        avgPts: Number(r.avg_pts),
        avgReb: Number(r.avg_reb),
        avgAst: Number(r.avg_ast),
        avgStl: Number(r.avg_stl),
        avgBlk: Number(r.avg_blk),
        avg3pm: Number(r.avg_3pm),
        avgPra: Number(r.avg_pra),
        avgFtm: Number(r.avg_ftm),
        avgFta: Number(r.avg_fta),
      });

      const homeRow = rows.find((r) => r.is_home === true);
      const awayRow = rows.find((r) => r.is_home === false);

      return {
        home: homeRow ? toStats(homeRow) : empty,
        away: awayRow ? toStats(awayRow) : empty,
      };
    } catch (error) {
      console.error("Database Error (getPlayerSplits):", error);
      return { home: empty, away: empty };
    }
  },
  ["getPlayerSplits"],
  { tags: ["player-data"] }
);

// --- Matchup averages per opponent team (full season) ---
export type PlayerMatchup = {
  opponentCode: string;
  opponentName: string;
  games: number;
  avgPts: number;
  avgReb: number;
  avgAst: number;
  avgPra: number;
  avgStl: number;
  avgBlk: number;
  avgTov: number;
  lastPlayed: string | null;
};

export const getPlayerMatchups = unstable_cache(
  async (playerName: string): Promise<PlayerMatchup[]> => {
    type Row = {
      opponent_code: string;
      opponent_name: string;
      games: number;
      avg_pts: string | number;
      avg_reb: string | number;
      avg_ast: string | number;
      avg_pra: string | number;
      avg_stl: string | number;
      avg_blk: string | number;
      avg_tov: string | number;
      last_played: string | null;
    };

    try {
      const result = await db.execute<Row>(sql`
        SELECT
          t.team_code AS opponent_code,
          t.team_name AS opponent_name,
          COUNT(*)::int AS games,
          ROUND(AVG(s.points)::numeric, 1) AS avg_pts,
          ROUND(AVG(s.total_rebounds)::numeric, 1) AS avg_reb,
          ROUND(AVG(s.assists)::numeric, 1) AS avg_ast,
          ROUND(AVG(s.pts_reb_ast)::numeric, 1) AS avg_pra,
          ROUND(AVG(s.steals)::numeric, 1) AS avg_stl,
          ROUND(AVG(s.blocks)::numeric, 1) AS avg_blk,
          ROUND(AVG(s.turnovers)::numeric, 1) AS avg_tov,
          MAX(g.game_date)::text AS last_played
        FROM player_game_stats s
        JOIN players p ON p.player_id = s.player_id
        JOIN games g ON g.game_id = s.game_id
        JOIN teams t ON t.team_id = CASE WHEN s.is_home THEN g.away_team_id ELSE g.home_team_id END
        WHERE LOWER(p.player_name) = LOWER(${playerName})
          AND COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
        GROUP BY t.team_code, t.team_name
        ORDER BY COUNT(*) DESC, AVG(s.points) DESC
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return rows.map((r) => ({
        opponentCode: r.opponent_code,
        opponentName: r.opponent_name,
        games: Number(r.games),
        avgPts: Number(r.avg_pts),
        avgReb: Number(r.avg_reb),
        avgAst: Number(r.avg_ast),
        avgPra: Number(r.avg_pra),
        avgStl: Number(r.avg_stl),
        avgBlk: Number(r.avg_blk),
        avgTov: Number(r.avg_tov),
        lastPlayed: r.last_played,
      }));
    } catch (error) {
      console.error("Database Error (getPlayerMatchups):", error);
      return [];
    }
  },
  ["getPlayerMatchups"],
  { tags: ["player-data"] }
);

export const getTrendingPlayers = unstable_cache(
  async (limit = 8): Promise<TrendingPlayer[]> => {
    type Row = {
      player_name: string | null;
      last3_avg_pts: string | number;
      prev3_avg_pts: string | number;
      diff: string | number;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH ranked AS (
          SELECT s.player_id, s.points, g.game_date,
            ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
          FROM player_game_stats s
          JOIN games g ON g.game_id = s.game_id
          WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
        ),
        recently_active AS (
          SELECT sub.player_id
          FROM (
            SELECT s.player_id, s.minutes_played,
              ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
            FROM player_game_stats s
            JOIN games g ON g.game_id = s.game_id
          ) sub
          WHERE sub.rn <= 6
          GROUP BY sub.player_id
          HAVING COUNT(*) FILTER (
            WHERE COALESCE(LOWER(TRIM(sub.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          ) >= 6
        ),
        season_avg AS (
          SELECT player_id
          FROM player_game_stats
          WHERE COALESCE(LOWER(TRIM(minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          GROUP BY player_id
          HAVING AVG(points) >= 8
        ),
        last_3 AS (
          SELECT r.player_id, AVG(r.points) AS last3_avg_pts
          FROM ranked r
          JOIN season_avg sa ON sa.player_id = r.player_id
          JOIN recently_active ra ON ra.player_id = r.player_id
          WHERE r.rn <= 3
          GROUP BY r.player_id
          HAVING COUNT(*) >= 3
        ),
        prev_3 AS (
          SELECT r.player_id, AVG(r.points) AS prev3_avg_pts
          FROM ranked r
          JOIN season_avg sa ON sa.player_id = r.player_id
          WHERE r.rn BETWEEN 4 AND 6
          GROUP BY r.player_id
          HAVING COUNT(*) >= 3
        ),
        playing_today AS (
          SELECT DISTINCT pp.player_id
          FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          WHERE g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        )
        SELECT p.player_name,
          ROUND(l3.last3_avg_pts::numeric, 1) AS last3_avg_pts,
          ROUND(pr.prev3_avg_pts::numeric, 1) AS prev3_avg_pts,
          ROUND((l3.last3_avg_pts - pr.prev3_avg_pts)::numeric, 1) AS diff
        FROM last_3 l3
        JOIN prev_3 pr ON pr.player_id = l3.player_id
        JOIN players p ON p.player_id = l3.player_id
        WHERE EXISTS (SELECT 1 FROM playing_today pt WHERE pt.player_id = l3.player_id)
           OR NOT EXISTS (SELECT 1 FROM playing_today)
        ORDER BY
          (l3.last3_avg_pts - pr.prev3_avg_pts) DESC
        LIMIT ${limit}
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return rows.map((r: Row) => {
        const raw = r as Record<string, unknown>;
        return {
          playerName: r.player_name ?? null,
          last3AvgPts: Number(r.last3_avg_pts ?? raw.last3_avg_pts ?? 0),
          prev3AvgPts: Number(r.prev3_avg_pts ?? raw.prev3_avg_pts ?? 0),
          diff: Number(r.diff ?? raw.diff ?? 0),
        };
      });
    } catch (error) {
      console.error("Database Error (getTrendingPlayers):", error);
      return [];
    }
  },
  ["getTrendingPlayers"],
  { tags: ["player-data"] }
);

// --- Player prop lines from sportsbook data ---
export type PlayerPropLine = {
  marketCode: string;
  marketName: string;
  fairLine: number | null;
  fairOdds: number | null;
  bookLine: number | null;
  bookOdds: number | null;
  gameDate: string | null;
};

/**
 * Get prop lines for a player across all markets.
 * Prefers today's game; falls back to most recent game with prop data.
 */
export const getPlayerPropLines = unstable_cache(
  async (playerName: string): Promise<PlayerPropLine[]> => {
    type Row = {
      market_code: string;
      market_name: string;
      fair_line: string | null;
      fair_odds: number | null;
      book_line: string | null;
      book_odds: number | null;
      game_date: string | null;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH player_prop_games AS (
          SELECT DISTINCT pp.game_id, g.game_date
          FROM player_props pp
          JOIN players p ON p.player_id = pp.player_id
          JOIN games g ON g.game_id = pp.game_id
          WHERE LOWER(p.player_name) = LOWER(${playerName})
        ),
        best_game AS (
          SELECT game_id FROM player_prop_games
          ORDER BY
            CASE WHEN game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date THEN 0 ELSE 1 END,
            game_date DESC
          LIMIT 1
        )
        SELECT
          pm.market_code,
          pm.market_name,
          pp.fair_line::text AS fair_line,
          pp.fair_odds,
          pp.book_line::text AS book_line,
          pp.book_odds,
          g.game_date::text AS game_date
        FROM player_props pp
        JOIN players p ON p.player_id = pp.player_id
        JOIN prop_markets pm ON pm.market_id = pp.market_id
        JOIN games g ON g.game_id = pp.game_id
        WHERE LOWER(p.player_name) = LOWER(${playerName})
          AND pp.game_id = (SELECT game_id FROM best_game)
          AND pm.market_code NOT IN ('FTM', 'TOV')
        ORDER BY pm.market_id
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return rows.map((r) => ({
        marketCode: r.market_code,
        marketName: r.market_name,
        fairLine: r.fair_line != null ? Number(r.fair_line) : null,
        fairOdds: r.fair_odds,
        bookLine: r.book_line != null ? Number(r.book_line) : null,
        bookOdds: r.book_odds,
        gameDate: r.game_date,
      }));
    } catch (error) {
      console.error("Database Error (getPlayerPropLines):", error);
      return [];
    }
  },
  ["getPlayerPropLines"],
  { tags: ["player-data"] }
);

// --- Today's game info for a specific player ---
export type TodaysGame = {
  opponentCode: string;
  opponentName: string;
  isHome: boolean;
};

export const getPlayerTodaysGame = unstable_cache(
  async (playerName: string): Promise<TodaysGame | null> => {
    type Row = {
      opponent_code: string;
      opponent_name: string;
      is_home: boolean;
    };

    try {
      const result = await db.execute<Row>(sql`
        SELECT
          opp.team_code AS opponent_code,
          opp.team_name AS opponent_name,
          s.is_home
        FROM player_game_stats s
        JOIN players p ON p.player_id = s.player_id
        JOIN games g ON g.game_id = s.game_id
        JOIN teams opp ON opp.team_id = CASE WHEN s.is_home THEN g.away_team_id ELSE g.home_team_id END
        WHERE LOWER(p.player_name) = LOWER(${playerName})
          AND g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        LIMIT 1
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      if (rows.length === 0) {
        // Fallback: check if a game exists via player_props (upcoming games may not have stats yet)
        type GameRow = {
          opponent_code: string;
          opponent_name: string;
          is_home: boolean;
        };
        const gameResult = await db.execute<GameRow>(sql`
          WITH player_team AS (
            SELECT s.player_id,
              CASE WHEN s.is_home THEN g.home_team_id ELSE g.away_team_id END AS team_id
            FROM player_game_stats s
            JOIN players p ON p.player_id = s.player_id
            JOIN games g ON g.game_id = s.game_id
            WHERE LOWER(p.player_name) = LOWER(${playerName})
            ORDER BY g.game_date DESC
            LIMIT 1
          )
          SELECT
            opp.team_code AS opponent_code,
            opp.team_name AS opponent_name,
            (pt.team_id = g.home_team_id) AS is_home
          FROM player_props pp
          JOIN player_team pt ON pt.player_id = pp.player_id
          JOIN games g ON g.game_id = pp.game_id
          JOIN teams opp ON opp.team_id = CASE
            WHEN pt.team_id = g.home_team_id THEN g.away_team_id
            ELSE g.home_team_id
          END
          WHERE g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
          LIMIT 1
        `);

        const gameRows: GameRow[] =
          "rows" in gameResult && Array.isArray(gameResult.rows) ? gameResult.rows : [];

        if (gameRows.length === 0) return null;
        return {
          opponentCode: gameRows[0].opponent_code,
          opponentName: gameRows[0].opponent_name,
          isHome: gameRows[0].is_home,
        };
      }

      return {
        opponentCode: rows[0].opponent_code,
        opponentName: rows[0].opponent_name,
        isHome: rows[0].is_home,
      };
    } catch (error) {
      console.error("Database Error (getPlayerTodaysGame):", error);
      return null;
    }
  },
  ["getPlayerTodaysGame"],
  { tags: ["player-data"] }
);

// --- Today's players with their key prop lines ---
export type TodaysPlayer = {
  playerName: string;
  ptsLine: number | null;
  ptsOdds: number | null;
  rebLine: number | null;
  astLine: number | null;
  praLine: number | null;
  homeTeam: string;
  awayTeam: string;
  playerTeam: string | null;
};

/**
 * Get all players with prop lines for today's games.
 * Returns player name + key lines (PTS, REB, AST, PRA) + matchup info.
 */
export const getTodaysPlayers = unstable_cache(
  async (): Promise<TodaysPlayer[]> => {
    type Row = {
      player_name: string;
      pts_line: string | null;
      pts_odds: number | null;
      reb_line: string | null;
      ast_line: string | null;
      pra_line: string | null;
      home_team: string;
      away_team: string;
      player_team: string | null;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH todays_props AS (
          SELECT
            pp.player_id,
            p.player_name,
            pm.market_code,
            pp.book_line,
            pp.book_odds,
            g.home_team_id,
            g.away_team_id
          FROM player_props pp
          JOIN players p ON p.player_id = pp.player_id
          JOIN games g ON g.game_id = pp.game_id
          JOIN prop_markets pm ON pm.market_id = pp.market_id
          WHERE g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        ),
        latest_team AS (
          SELECT DISTINCT ON (pgs.player_id)
            pgs.player_id,
            pgs.team_id
          FROM player_game_stats pgs
          WHERE pgs.player_id IN (SELECT DISTINCT player_id FROM todays_props)
          ORDER BY pgs.player_id, pgs.gamelog_id DESC
        )
        SELECT
          tp.player_name,
          MAX(tp.book_line) FILTER (WHERE tp.market_code = 'PTS')::text AS pts_line,
          MAX(tp.book_odds) FILTER (WHERE tp.market_code = 'PTS') AS pts_odds,
          MAX(tp.book_line) FILTER (WHERE tp.market_code = 'REB')::text AS reb_line,
          MAX(tp.book_line) FILTER (WHERE tp.market_code = 'AST')::text AS ast_line,
          MAX(tp.book_line) FILTER (WHERE tp.market_code = 'PRA')::text AS pra_line,
          ht.team_code AS home_team,
          at.team_code AS away_team,
          pt.team_code AS player_team
        FROM todays_props tp
        JOIN teams ht ON ht.team_id = tp.home_team_id
        JOIN teams at ON at.team_id = tp.away_team_id
        LEFT JOIN latest_team lt ON lt.player_id = tp.player_id
        LEFT JOIN teams pt ON pt.team_id = lt.team_id
        GROUP BY tp.player_name, ht.team_code, at.team_code, pt.team_code
        ORDER BY MAX(tp.book_line) FILTER (WHERE tp.market_code = 'PTS') DESC NULLS LAST
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return rows.map((r) => ({
        playerName: r.player_name,
        ptsLine: r.pts_line != null ? Number(r.pts_line) : null,
        ptsOdds: r.pts_odds,
        rebLine: r.reb_line != null ? Number(r.reb_line) : null,
        astLine: r.ast_line != null ? Number(r.ast_line) : null,
        praLine: r.pra_line != null ? Number(r.pra_line) : null,
        homeTeam: r.home_team,
        awayTeam: r.away_team,
        playerTeam: r.player_team ?? null,
      }));
    } catch (error) {
      console.error("Database Error (getTodaysPlayers):", error);
      return [];
    }
  },
  ["getTodaysPlayers"],
  { tags: ["player-data"] }
);

/**
 * Returns the ISO timestamp of the most recently updated player_game_stats row.
 * Used by HomeHero to display a data freshness indicator.
 */
export const getLastDataUpdate = unstable_cache(
  async (): Promise<string | null> => {
    type Row = { last_updated: string | null };
    try {
      const result = await db.execute<Row>(
        sql`SELECT MAX(updated_at)::text AS last_updated FROM player_game_stats`
      );
      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      return rows[0]?.last_updated ?? null;
    } catch (error) {
      console.error("Database Error (getLastDataUpdate):", error);
      return null;
    }
  },
  ["getLastDataUpdate"],
  { tags: ["player-data"] }
);

// --- ML Predictions ---

export type MlPrediction = {
  playerName: string;
  marketCode: string;
  bookLine: number;
  pOver: number;
  prediction: string; // "OVER" | "UNDER"
  confidence: number;
  avgLast5: number | null;
  avgSeason: number | null;
  oppDefRank: number | null;
  lineZscore: number | null;
};

export const getMlPredictions = unstable_cache(
  async (): Promise<MlPrediction[]> => {
    type Row = {
      player_name: string;
      market_code: string;
      book_line: string | number;
      p_over: string | number;
      prediction: string;
      confidence: string | number;
      avg_last_5: string | number | null;
      avg_season: string | number | null;
      opp_def_rank: number | null;
      line_zscore: string | number | null;
    };

    try {
      const result = await db.execute<Row>(sql`
        SELECT
          p.player_name,
          pm.market_code,
          ml.book_line::text AS book_line,
          ml.p_over::text AS p_over,
          ml.prediction,
          ml.confidence::text AS confidence,
          ml.avg_last_5::text AS avg_last_5,
          ml.avg_season::text AS avg_season,
          ml.opp_def_rank,
          ml.line_zscore::text AS line_zscore
        FROM ml_predictions ml
        JOIN players p ON p.player_id = ml.player_id
        JOIN games g ON g.game_id = ml.game_id
        JOIN prop_markets pm ON pm.market_id = ml.market_id
        WHERE g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
          AND pm.market_code NOT IN ('FTM', 'TOV', 'FG2', 'BLK')
          AND ml.book_line >= 4.5
        ORDER BY ml.confidence DESC
      `);

      const rows: Row[] =
        "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return rows.map((r) => ({
        playerName: r.player_name,
        marketCode: r.market_code,
        bookLine: Number(r.book_line),
        pOver: Number(r.p_over),
        prediction: r.prediction,
        confidence: Number(r.confidence),
        avgLast5: r.avg_last_5 != null ? Number(r.avg_last_5) : null,
        avgSeason: r.avg_season != null ? Number(r.avg_season) : null,
        oppDefRank: r.opp_def_rank,
        lineZscore: r.line_zscore != null ? Number(r.line_zscore) : null,
      }));
    } catch (error) {
      console.error("Database Error (getMlPredictions):", error);
      return [];
    }
  },
  ["getMlPredictions"],
  { tags: ["player-data"] }
);

// --- Weekly Insights ("The Edge") ---

export type InsightWeekSummary = {
  weekStart: string;
  gameDates: number;
};

export type WeeklyRecapPick = BacktestPick & {
  gameDate: string;
  margin: number | null;
};

export type DailyBreakdown = {
  date: string;
  wins: number;
  losses: number;
  pushes: number;
};

export type WeeklyRecap = {
  weekStart: string;
  weekEnd: string;
  wins: number;
  losses: number;
  pushes: number;
  dnps: number;
  winRate: number;
  picks: WeeklyRecapPick[];
  dailyBreakdown: DailyBreakdown[];
};

export type WeeklyPlayerPerformance = {
  playerName: string;
  gamesPlayed: number;
  weekAvgPts: number;
  seasonAvgPts: number;
  diff: number;
};

/** Internal helper: run backtest grading for a specific game date */
async function backtestForDate(targetDate: string): Promise<BacktestResult> {
  type Row = {
    player_name: string;
    market_code: string;
    market_name: string;
    book_line: string;
    games_checked: number;
    pick_count: number;
    hit_rate: number;
    side: string;
    actual_value: number | null;
    result: string;
    game_date: string;
  };

  try {
    const result = await db.execute<Row>(sql`
      WITH target_date AS (
        SELECT ${targetDate}::date AS dt
      ),
      target_props AS (
        SELECT pp.player_id, pm.market_code, pm.market_name, pp.book_line, pp.game_id
        FROM player_props pp
        JOIN games g ON g.game_id = pp.game_id
        JOIN prop_markets pm ON pm.market_id = pp.market_id
        CROSS JOIN target_date td
        WHERE g.game_date = td.dt
          AND pp.book_line IS NOT NULL
      ),
      ranked_games AS (
        SELECT s.player_id,
          s.points, s.total_rebounds, s.assists, s.steals, s.blocks,
          s.three_pointers_made, s.free_throws_made, s.turnovers, s.pts_reb_ast,
          ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY g.game_date DESC) AS rn
        FROM player_game_stats s
        JOIN games g ON g.game_id = s.game_id
        CROSS JOIN target_date td
        WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          AND g.game_date < td.dt
          AND s.player_id IN (SELECT DISTINCT player_id FROM target_props)
      ),
      last_10 AS (
        SELECT * FROM ranked_games WHERE rn <= 10
      ),
      hit_rates AS (
        SELECT
          tp.player_id, tp.market_code, tp.market_name, tp.book_line, tp.game_id,
          COUNT(*)::int AS games_checked,
          COUNT(*) FILTER (WHERE
            CASE tp.market_code
              WHEN 'PTS' THEN l.points
              WHEN 'REB' THEN l.total_rebounds
              WHEN 'AST' THEN l.assists
              WHEN 'STL' THEN l.steals
              WHEN 'BLK' THEN l.blocks
              WHEN 'FG3' THEN l.three_pointers_made
              WHEN 'FTM' THEN l.free_throws_made
              WHEN 'TOV' THEN l.turnovers
              WHEN 'PRA' THEN l.pts_reb_ast
              WHEN 'PR' THEN l.points + l.total_rebounds
              WHEN 'PA' THEN l.points + l.assists
              WHEN 'RA' THEN l.total_rebounds + l.assists
              WHEN 'SB' THEN l.steals + l.blocks
            END > tp.book_line
          )::int AS over_count,
          COUNT(*) FILTER (WHERE
            CASE tp.market_code
              WHEN 'PTS' THEN l.points
              WHEN 'REB' THEN l.total_rebounds
              WHEN 'AST' THEN l.assists
              WHEN 'STL' THEN l.steals
              WHEN 'BLK' THEN l.blocks
              WHEN 'FG3' THEN l.three_pointers_made
              WHEN 'FTM' THEN l.free_throws_made
              WHEN 'TOV' THEN l.turnovers
              WHEN 'PRA' THEN l.pts_reb_ast
              WHEN 'PR' THEN l.points + l.total_rebounds
              WHEN 'PA' THEN l.points + l.assists
              WHEN 'RA' THEN l.total_rebounds + l.assists
              WHEN 'SB' THEN l.steals + l.blocks
            END < tp.book_line
          )::int AS under_count
        FROM target_props tp
        JOIN last_10 l ON l.player_id = tp.player_id
        GROUP BY tp.player_id, tp.market_code, tp.market_name, tp.book_line, tp.game_id
        HAVING COUNT(*) >= 5
      ),
      over_ranked AS (
        SELECT p.player_name, h.player_id, h.market_code, h.market_name,
          h.book_line, h.game_id, h.games_checked, h.over_count AS pick_count,
          ROUND((h.over_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
          'over'::text AS side,
          ROW_NUMBER() OVER (
            PARTITION BY h.player_id
            ORDER BY (h.over_count::numeric / h.games_checked) DESC, h.book_line DESC
          ) AS player_rn
        FROM hit_rates h
        JOIN players p ON p.player_id = h.player_id
        WHERE h.over_count::numeric / h.games_checked >= 0.6
          AND h.book_line > 1.5
      ),
      under_ranked AS (
        SELECT p.player_name, h.player_id, h.market_code, h.market_name,
          h.book_line, h.game_id, h.games_checked, h.under_count AS pick_count,
          ROUND((h.under_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
          'under'::text AS side,
          ROW_NUMBER() OVER (
            PARTITION BY h.player_id
            ORDER BY (h.under_count::numeric / h.games_checked) DESC, h.book_line DESC
          ) AS player_rn
        FROM hit_rates h
        JOIN players p ON p.player_id = h.player_id
        WHERE h.under_count::numeric / h.games_checked >= 0.6
          AND h.book_line > 1.5
          AND h.market_code != 'FG3'
          AND NOT (h.market_code IN ('BLK', 'STL', 'SB') AND h.book_line <= 1.5)
          AND NOT (h.market_code = 'AST' AND h.book_line <= 2.5)
      ),
      all_picks AS (
        (SELECT player_name, player_id, market_code, market_name, book_line, game_id,
          games_checked, pick_count, hit_rate, side
        FROM over_ranked WHERE player_rn <= 2
        ORDER BY hit_rate DESC, book_line DESC
        LIMIT 25)
        UNION ALL
        (SELECT player_name, player_id, market_code, market_name, book_line, game_id,
          games_checked, pick_count, hit_rate, side
        FROM under_ranked WHERE player_rn <= 2
        ORDER BY hit_rate DESC, book_line DESC
        LIMIT 25)
      ),
      actual AS (
        SELECT DISTINCT s.player_id, s.game_id,
          s.points, s.total_rebounds, s.assists, s.steals, s.blocks,
          s.three_pointers_made, s.free_throws_made, s.turnovers, s.pts_reb_ast
        FROM player_game_stats s
        JOIN all_picks ap ON ap.player_id = s.player_id AND ap.game_id = s.game_id
        WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
      ),
      with_actual AS (
        SELECT ap.player_name, ap.market_code, ap.market_name,
          ap.book_line, ap.games_checked, ap.pick_count, ap.hit_rate, ap.side,
          CASE ap.market_code
            WHEN 'PTS' THEN a.points
            WHEN 'REB' THEN a.total_rebounds
            WHEN 'AST' THEN a.assists
            WHEN 'STL' THEN a.steals
            WHEN 'BLK' THEN a.blocks
            WHEN 'FG3' THEN a.three_pointers_made
            WHEN 'FTM' THEN a.free_throws_made
            WHEN 'TOV' THEN a.turnovers
            WHEN 'PRA' THEN a.pts_reb_ast
            WHEN 'PR' THEN a.points + a.total_rebounds
            WHEN 'PA' THEN a.points + a.assists
            WHEN 'RA' THEN a.total_rebounds + a.assists
            WHEN 'SB' THEN a.steals + a.blocks
          END AS actual_value
        FROM all_picks ap
        LEFT JOIN actual a ON a.player_id = ap.player_id AND a.game_id = ap.game_id
      )
      SELECT player_name, market_code, market_name,
        book_line::text AS book_line, games_checked, pick_count, hit_rate, side,
        actual_value,
        CASE
          WHEN actual_value IS NULL THEN 'dnp'
          WHEN side = 'over' AND actual_value > book_line THEN 'win'
          WHEN side = 'under' AND actual_value < book_line THEN 'win'
          WHEN actual_value = book_line THEN 'push'
          ELSE 'loss'
        END AS result,
        (SELECT dt FROM target_date)::text AS game_date
      FROM with_actual
      ORDER BY side, hit_rate DESC, book_line DESC
    `);

    const rows: Row[] =
      "rows" in result && Array.isArray(result.rows) ? result.rows : [];

    return {
      gameDate: targetDate,
      picks: rows.map((r) => ({
        playerName: r.player_name,
        marketCode: r.market_code,
        marketName: r.market_name,
        bookLine: Number(r.book_line),
        gamesChecked: Number(r.games_checked),
        pickCount: Number(r.pick_count),
        hitRate: Number(r.hit_rate),
        side: r.side as "over" | "under",
        actualValue: r.actual_value != null ? Number(r.actual_value) : null,
        result: r.result as "win" | "loss" | "push" | "dnp",
      })),
    };
  } catch (error) {
    console.error(`Database Error (backtestForDate ${targetDate}):`, error);
    return { gameDate: targetDate, picks: [] };
  }
}

/** List weeks that have graded prop data (newest first) */
export const getAvailableInsightWeeks = unstable_cache(
  async (): Promise<InsightWeekSummary[]> => {
    type Row = { week_start: string; game_dates: number };

    try {
      const result = await db.execute<Row>(sql`
        SELECT
          date_trunc('week', g.game_date)::date::text AS week_start,
          COUNT(DISTINCT g.game_date)::int AS game_dates
        FROM games g
        WHERE g.game_date < (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
          AND EXISTS (
            SELECT 1 FROM player_props pp
            WHERE pp.game_id = g.game_id AND pp.book_line IS NOT NULL
          )
          AND EXISTS (
            SELECT 1 FROM player_game_stats s
            WHERE s.game_id = g.game_id
              AND COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          )
        GROUP BY date_trunc('week', g.game_date)
        ORDER BY week_start DESC
      `);

      const rows = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      return rows.map((r) => ({
        weekStart: r.week_start,
        gameDates: Number(r.game_dates),
      }));
    } catch (error) {
      console.error("Database Error (getAvailableInsightWeeks):", error);
      return [];
    }
  },
  ["getAvailableInsightWeeks"],
  { tags: ["player-data"] }
);

/** Full weekly recap: run backtest for each game date in the week, aggregate results */
export const getWeeklyRecap = unstable_cache(
  async (weekStart: string): Promise<WeeklyRecap | null> => {
    type DateRow = { dt: string };

    try {
      // 1. Find all completed game dates in this week with prop data
      const datesResult = await db.execute<DateRow>(sql`
        SELECT DISTINCT g.game_date::text AS dt
        FROM games g
        WHERE g.game_date >= ${weekStart}::date
          AND g.game_date < ${weekStart}::date + INTERVAL '7 days'
          AND g.game_date < (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
          AND EXISTS (
            SELECT 1 FROM player_props pp
            WHERE pp.game_id = g.game_id AND pp.book_line IS NOT NULL
          )
          AND EXISTS (
            SELECT 1 FROM player_game_stats s
            WHERE s.game_id = g.game_id
              AND COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          )
        ORDER BY dt
      `);

      const dates =
        "rows" in datesResult && Array.isArray(datesResult.rows)
          ? datesResult.rows.map((r) => r.dt)
          : [];

      if (dates.length === 0) return null;

      // 2. Run backtest for each date in parallel
      const results = await Promise.all(dates.map((d) => backtestForDate(d)));

      // 3. Aggregate all picks with game date and margin
      const allPicks: WeeklyRecapPick[] = results.flatMap((r, i) =>
        r.picks.map((p) => ({
          ...p,
          gameDate: dates[i],
          margin:
            p.actualValue != null
              ? p.side === "over"
                ? p.actualValue - p.bookLine
                : p.bookLine - p.actualValue
              : null,
        }))
      );

      const wins = allPicks.filter((p) => p.result === "win").length;
      const losses = allPicks.filter((p) => p.result === "loss").length;
      const pushes = allPicks.filter((p) => p.result === "push").length;
      const dnps = allPicks.filter((p) => p.result === "dnp").length;
      const decided = wins + losses;

      // 4. Daily breakdown
      const dailyMap = new Map<string, DailyBreakdown>();
      for (const pick of allPicks) {
        const day = dailyMap.get(pick.gameDate) ?? {
          date: pick.gameDate,
          wins: 0,
          losses: 0,
          pushes: 0,
        };
        if (pick.result === "win") day.wins++;
        else if (pick.result === "loss") day.losses++;
        else if (pick.result === "push") day.pushes++;
        dailyMap.set(pick.gameDate, day);
      }

      // Compute week end (weekStart + 6 days)
      const wsDate = new Date(weekStart + "T00:00:00");
      wsDate.setDate(wsDate.getDate() + 6);
      const weekEnd = wsDate.toISOString().slice(0, 10);

      return {
        weekStart,
        weekEnd,
        wins,
        losses,
        pushes,
        dnps,
        winRate: decided > 0 ? Math.round((wins / decided) * 100) : 0,
        picks: allPicks,
        dailyBreakdown: Array.from(dailyMap.values()).sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
      };
    } catch (error) {
      console.error("Database Error (getWeeklyRecap):", error);
      return null;
    }
  },
  ["getWeeklyRecap"],
  { tags: ["player-data"] }
);

/** Players who outperformed their season average during the given week */
export const getWeeklyHotPlayers = unstable_cache(
  async (weekStart: string, limit = 10): Promise<WeeklyPlayerPerformance[]> => {
    type Row = {
      player_name: string;
      games_played: number;
      week_avg_pts: string | number;
      season_avg_pts: string | number;
      diff: string | number;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH week_stats AS (
          SELECT s.player_id,
            COUNT(*)::int AS games_played,
            AVG(s.points) AS week_avg_pts
          FROM player_game_stats s
          JOIN games g ON g.game_id = s.game_id
          WHERE g.game_date >= ${weekStart}::date
            AND g.game_date < ${weekStart}::date + INTERVAL '7 days'
            AND COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          GROUP BY s.player_id
          HAVING COUNT(*) >= 2
        ),
        season_avg AS (
          SELECT s.player_id, AVG(s.points) AS season_avg_pts
          FROM player_game_stats s
          WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          GROUP BY s.player_id
          HAVING AVG(s.points) >= 5
        )
        SELECT p.player_name,
          ws.games_played,
          ROUND(ws.week_avg_pts::numeric, 1) AS week_avg_pts,
          ROUND(sa.season_avg_pts::numeric, 1) AS season_avg_pts,
          ROUND((ws.week_avg_pts - sa.season_avg_pts)::numeric, 1) AS diff
        FROM week_stats ws
        JOIN season_avg sa ON sa.player_id = ws.player_id
        JOIN players p ON p.player_id = ws.player_id
        WHERE ws.week_avg_pts > sa.season_avg_pts
        ORDER BY (ws.week_avg_pts - sa.season_avg_pts) DESC
        LIMIT ${limit}
      `);

      const rows = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      return rows.map((r) => ({
        playerName: r.player_name,
        gamesPlayed: Number(r.games_played),
        weekAvgPts: Number(r.week_avg_pts),
        seasonAvgPts: Number(r.season_avg_pts),
        diff: Number(r.diff),
      }));
    } catch (error) {
      console.error("Database Error (getWeeklyHotPlayers):", error);
      return [];
    }
  },
  ["getWeeklyHotPlayers"],
  { tags: ["player-data"] }
);

/** Players who underperformed their season average during the given week */
export const getWeeklyColdPlayers = unstable_cache(
  async (weekStart: string, limit = 10): Promise<WeeklyPlayerPerformance[]> => {
    type Row = {
      player_name: string;
      games_played: number;
      week_avg_pts: string | number;
      season_avg_pts: string | number;
      diff: string | number;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH week_stats AS (
          SELECT s.player_id,
            COUNT(*)::int AS games_played,
            AVG(s.points) AS week_avg_pts
          FROM player_game_stats s
          JOIN games g ON g.game_id = s.game_id
          WHERE g.game_date >= ${weekStart}::date
            AND g.game_date < ${weekStart}::date + INTERVAL '7 days'
            AND COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          GROUP BY s.player_id
          HAVING COUNT(*) >= 2
        ),
        season_avg AS (
          SELECT s.player_id, AVG(s.points) AS season_avg_pts
          FROM player_game_stats s
          WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
          GROUP BY s.player_id
          HAVING AVG(s.points) >= 5
        )
        SELECT p.player_name,
          ws.games_played,
          ROUND(ws.week_avg_pts::numeric, 1) AS week_avg_pts,
          ROUND(sa.season_avg_pts::numeric, 1) AS season_avg_pts,
          ROUND((ws.week_avg_pts - sa.season_avg_pts)::numeric, 1) AS diff
        FROM week_stats ws
        JOIN season_avg sa ON sa.player_id = ws.player_id
        JOIN players p ON p.player_id = ws.player_id
        WHERE ws.week_avg_pts < sa.season_avg_pts
        ORDER BY (ws.week_avg_pts - sa.season_avg_pts) ASC
        LIMIT ${limit}
      `);

      const rows = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      return rows.map((r) => ({
        playerName: r.player_name,
        gamesPlayed: Number(r.games_played),
        weekAvgPts: Number(r.week_avg_pts),
        seasonAvgPts: Number(r.season_avg_pts),
        diff: Number(r.diff),
      }));
    } catch (error) {
      console.error("Database Error (getWeeklyColdPlayers):", error);
      return [];
    }
  },
  ["getWeeklyColdPlayers"],
  { tags: ["player-data"] }
);

// --- Team defensive ratings (opponent weakness overlay) ---

export type TeamDefensiveRating = {
  teamCode: string;
  teamName: string;
  gamesPlayed: number;
  oppPts: number;
  oppReb: number;
  oppAst: number;
  opp3p: number;
  oppFt: number;
  oppStl: number;
  oppBlk: number;
  oppTov: number;
  oppFgPct: number;
  /** Rank 1 = allows fewest, 30 = allows most (for stat-specific ranking) */
  ranks: Record<string, number>;
};

export const getTeamDefensiveRatings = unstable_cache(
  async (): Promise<TeamDefensiveRating[]> => {
    type Row = {
      team_code: string;
      team_name: string;
      games_played: number;
      opp_pts: number;
      opp_trb: number;
      opp_ast: number;
      opp_3p: number;
      opp_ft: number;
      opp_stl: number;
      opp_blk: number;
      opp_tov: number;
      opp_fg_pct: number;
    };
    try {
      const result = await db.execute<Row>(sql`
        SELECT
          t.team_code,
          t.team_name,
          tdr.games_played::int AS games_played,
          tdr.opp_pts::float AS opp_pts,
          tdr.opp_trb::float AS opp_trb,
          tdr.opp_ast::float AS opp_ast,
          tdr.opp_3p::float AS opp_3p,
          tdr.opp_ft::float AS opp_ft,
          tdr.opp_stl::float AS opp_stl,
          tdr.opp_blk::float AS opp_blk,
          tdr.opp_tov::float AS opp_tov,
          tdr.opp_fg_pct::float AS opp_fg_pct
        FROM team_defensive_ratings tdr
        JOIN teams t ON t.team_id = tdr.team_id
        ORDER BY tdr.opp_pts ASC
      `);

      const rows: Row[] = "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      // Compute per-stat rankings (1 = best defense / fewest allowed)
      const statKeys = ["opp_pts", "opp_trb", "opp_ast", "opp_3p", "opp_ft", "opp_stl", "opp_blk", "opp_tov", "opp_fg_pct"] as const;
      const rankings: Record<string, Record<string, number>> = {};

      for (const stat of statKeys) {
        const sorted = [...rows].sort((a, b) => (a[stat] ?? 0) - (b[stat] ?? 0));
        sorted.forEach((row, idx) => {
          if (!rankings[row.team_code]) rankings[row.team_code] = {};
          rankings[row.team_code][stat] = idx + 1;
        });
      }

      return rows.map((r) => ({
        teamCode: r.team_code,
        teamName: r.team_name,
        gamesPlayed: r.games_played ?? 0,
        oppPts: r.opp_pts ?? 0,
        oppReb: r.opp_trb ?? 0,
        oppAst: r.opp_ast ?? 0,
        opp3p: r.opp_3p ?? 0,
        oppFt: r.opp_ft ?? 0,
        oppStl: r.opp_stl ?? 0,
        oppBlk: r.opp_blk ?? 0,
        oppTov: r.opp_tov ?? 0,
        oppFgPct: r.opp_fg_pct ?? 0,
        ranks: rankings[r.team_code] ?? {},
      }));
    } catch (error) {
      console.error("Database Error (getTeamDefensiveRatings):", error);
      return [];
    }
  },
  ["getTeamDefensiveRatings"],
  { tags: ["player-data"] }
);

// ── MLB Data Queries ──────────────────────────────────────────────────────────

export type MlbTeam = {
  teamId: number;
  teamCode: string;
  teamName: string;
};

export const getMlbTeams = unstable_cache(
  async (): Promise<MlbTeam[]> => {
    type Row = { team_id: number; team_code: string; team_name: string };
    try {
      const result = await db.execute<Row>(sql`
        SELECT team_id, team_code, team_name
        FROM teams
        WHERE sport = 'MLB'
        ORDER BY team_name
      `);
      const rows: Row[] = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      return rows.map((r) => ({
        teamId: Number(r.team_id),
        teamCode: r.team_code,
        teamName: r.team_name,
      }));
    } catch (error) {
      console.error("Database Error (getMlbTeams):", error);
      return [];
    }
  },
  ["getMlbTeams"],
  { tags: ["mlb-data"] }
);

export type MlbParkFactor = {
  teamId: number;
  teamCode: string;
  teamName: string;
  season: string;
  pfRuns: number | null;
  pfHr: number | null;
  pfHits: number | null;
  pfK: number | null;
};

export const getMlbParkFactors = unstable_cache(
  async (): Promise<MlbParkFactor[]> => {
    type Row = {
      team_id: number;
      team_code: string;
      team_name: string;
      season: string;
      pf_runs: string | null;
      pf_hr: string | null;
      pf_hits: string | null;
      pf_so: string | null;
    };
    try {
      const result = await db.execute<Row>(sql`
        SELECT t.team_id, t.team_code, t.team_name,
               pf.season, pf.pf_runs, pf.pf_hr, pf.pf_hits, pf.pf_so
        FROM mlb_park_factors pf
        JOIN teams t ON t.team_id = pf.team_id
        ORDER BY pf.pf_runs DESC NULLS LAST
      `);
      const rows: Row[] = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      return rows.map((r) => ({
        teamId: Number(r.team_id),
        teamCode: r.team_code,
        teamName: r.team_name,
        season: r.season,
        pfRuns: r.pf_runs != null ? Number(r.pf_runs) : null,
        pfHr: r.pf_hr != null ? Number(r.pf_hr) : null,
        pfHits: r.pf_hits != null ? Number(r.pf_hits) : null,
        pfK: r.pf_so != null ? Number(r.pf_so) : null,
      }));
    } catch (error) {
      console.error("Database Error (getMlbParkFactors):", error);
      return [];
    }
  },
  ["getMlbParkFactors"],
  { tags: ["mlb-data"] }
);

export const getMlbPlayerCount = unstable_cache(
  async (): Promise<number> => {
    type Row = { cnt: string | number };
    try {
      const result = await db.execute<Row>(sql`
        SELECT COUNT(*) AS cnt FROM players WHERE url LIKE '%baseball-reference%'
      `);
      const rows: Row[] = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      return Number(rows[0]?.cnt ?? 0);
    } catch (error) {
      console.error("Database Error (getMlbPlayerCount):", error);
      return 0;
    }
  },
  ["getMlbPlayerCount"],
  { tags: ["mlb-data"] }
);

export type MlbTeamDetail = {
  teamId: number;
  teamCode: string;
  teamName: string;
  parkFactor: MlbParkFactor | null;
};

export const getMlbTeamWithParkFactor = unstable_cache(
  async (teamCode: string): Promise<MlbTeamDetail | null> => {
    type Row = {
      team_id: number;
      team_code: string;
      team_name: string;
      season: string | null;
      pf_runs: string | null;
      pf_hr: string | null;
      pf_hits: string | null;
      pf_so: string | null;
    };
    try {
      const result = await db.execute<Row>(sql`
        SELECT t.team_id, t.team_code, t.team_name,
               pf.season, pf.pf_runs, pf.pf_hr, pf.pf_hits, pf.pf_so
        FROM teams t
        LEFT JOIN mlb_park_factors pf ON pf.team_id = t.team_id
        WHERE t.sport = 'MLB'
          AND t.team_code = ${teamCode}
        LIMIT 1
      `);
      const rows: Row[] = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      if (rows.length === 0) return null;
      const r = rows[0];
      const hasPf = r.season != null;
      return {
        teamId: Number(r.team_id),
        teamCode: r.team_code,
        teamName: r.team_name,
        parkFactor: hasPf
          ? {
              teamId: Number(r.team_id),
              teamCode: r.team_code,
              teamName: r.team_name,
              season: r.season!,
              pfRuns: r.pf_runs != null ? Number(r.pf_runs) : null,
              pfHr: r.pf_hr != null ? Number(r.pf_hr) : null,
              pfHits: r.pf_hits != null ? Number(r.pf_hits) : null,
              pfK: r.pf_so != null ? Number(r.pf_so) : null,
            }
          : null,
      };
    } catch (error) {
      console.error("Database Error (getMlbTeamWithParkFactor):", error);
      return null;
    }
  },
  ["getMlbTeamWithParkFactor"],
  { tags: ["mlb-data"] }
);

const MLB_BATTER_MARKET_CODES = new Set([
  "MLB_HITS",
  "MLB_TB",
  "MLB_HR",
  "MLB_RBI",
  "MLB_RUNS",
  "MLB_WALKS",
  "MLB_SB",
]);

type CountRow = { cnt: string | number };

async function safeCountQuery(
  query: ReturnType<typeof sql.raw>,
  label: string,
  suppressMissingTableError = false
): Promise<number> {
  try {
    const result = await db.execute<CountRow>(query);
    const rows: CountRow[] = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
    return Number(rows[0]?.cnt ?? 0);
  } catch (error) {
    const errorCode =
      typeof error === "object" &&
      error != null &&
      "cause" in error &&
      typeof (error as { cause?: { code?: string } }).cause?.code === "string"
        ? (error as { cause?: { code?: string } }).cause?.code
        : undefined;

    if (suppressMissingTableError && errorCode === "42P01") {
      return 0;
    }

    console.error(`Database Error (${label}):`, error);
    return 0;
  }
}

export type MlbSupportedMarket = {
  marketCode: string;
  marketName: string;
  playerType: "Batter" | "Pitcher";
};

export const getMlbSupportedMarkets = unstable_cache(
  async (): Promise<MlbSupportedMarket[]> => {
    type Row = {
      market_code: string;
      market_name: string;
    };

    try {
      const result = await db.execute<Row>(sql`
        SELECT market_code, market_name
        FROM prop_markets
        WHERE market_code LIKE 'MLB_%'
        ORDER BY market_code
      `);
      const rows: Row[] = "rows" in result && Array.isArray(result.rows) ? result.rows : [];

      return rows.map((row) => ({
        marketCode: row.market_code,
        marketName: row.market_name,
        playerType: MLB_BATTER_MARKET_CODES.has(row.market_code) ? "Batter" : "Pitcher",
      }));
    } catch (error) {
      console.error("Database Error (getMlbSupportedMarkets):", error);
      return [];
    }
  },
  ["getMlbSupportedMarkets"],
  { tags: ["mlb-data"] }
);

export type MlbDataCoverage = {
  teamCount: number;
  playerCount: number;
  parkFactorCount: number;
  supportedMarketCount: number;
  gameCount: number;
  teamStatCount: number;
  batterGameLogCount: number;
  pitcherGameLogCount: number;
  propCount: number;
  predictionCount: number;
};

export const getMlbDataCoverage = unstable_cache(
  async (): Promise<MlbDataCoverage> => {
    const [
      teamCount,
      playerCount,
      parkFactorCount,
      supportedMarketCount,
      gameCount,
      teamStatCount,
      batterGameLogCount,
      pitcherGameLogCount,
      propCount,
      predictionCount,
    ] = await Promise.all([
      safeCountQuery(sql`SELECT COUNT(*) AS cnt FROM teams WHERE sport = 'MLB'`, "getMlbDataCoverage:teams"),
      safeCountQuery(
        sql`SELECT COUNT(*) AS cnt FROM players WHERE url LIKE '%baseball-reference%'`,
        "getMlbDataCoverage:players"
      ),
      safeCountQuery(sql`SELECT COUNT(*) AS cnt FROM mlb_park_factors`, "getMlbDataCoverage:park_factors"),
      safeCountQuery(
        sql`SELECT COUNT(*) AS cnt FROM prop_markets WHERE market_code LIKE 'MLB_%'`,
        "getMlbDataCoverage:supported_markets"
      ),
      safeCountQuery(
        sql`
          SELECT COUNT(*) AS cnt
          FROM games g
          JOIN teams ht ON ht.team_id = g.home_team_id
          WHERE ht.sport = 'MLB'
        `,
        "getMlbDataCoverage:games"
      ),
      safeCountQuery(sql.raw("SELECT COUNT(*) AS cnt FROM mlb_team_stats"), "getMlbDataCoverage:team_stats"),
      safeCountQuery(
        sql.raw("SELECT COUNT(*) AS cnt FROM mlb_batter_game_stats"),
        "getMlbDataCoverage:batter_logs"
      ),
      safeCountQuery(
        sql.raw("SELECT COUNT(*) AS cnt FROM mlb_pitcher_game_stats"),
        "getMlbDataCoverage:pitcher_logs"
      ),
      safeCountQuery(
        sql`
          SELECT COUNT(*) AS cnt
          FROM player_props pp
          JOIN prop_markets pm ON pm.market_id = pp.market_id
          WHERE pm.market_code LIKE 'MLB_%'
        `,
        "getMlbDataCoverage:props"
      ),
      safeCountQuery(
        sql.raw("SELECT COUNT(*) AS cnt FROM mlb_predictions"),
        "getMlbDataCoverage:predictions",
        true
      ),
    ]);

    return {
      teamCount,
      playerCount,
      parkFactorCount,
      supportedMarketCount,
      gameCount,
      teamStatCount,
      batterGameLogCount,
      pitcherGameLogCount,
      propCount,
      predictionCount,
    };
  },
  ["getMlbDataCoverage"],
  { tags: ["mlb-data"] }
);

export type MlbSlateProp = {
  playerName: string;
  marketCode: string;
  marketName: string;
  bookLine: number | null;
  bookOdds: number | null;
  homeTeam: string;
  awayTeam: string;
  playerTeam: string | null;
};

export type MlbSlatePropsResult = {
  propDate: string | null;
  props: MlbSlateProp[];
};

export const getMlbSlateProps = unstable_cache(
  async (limit = 200): Promise<MlbSlatePropsResult> => {
    type Row = {
      player_name: string;
      market_code: string;
      market_name: string;
      book_line: string | null;
      book_odds: number | null;
      home_team: string;
      away_team: string;
      player_team: string | null;
      prop_date: string | null;
    };

    try {
      const result = await db.execute<Row>(sql`
        WITH target_date AS (
          SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date AS prop_date
        )
        SELECT
          p.player_name,
          pm.market_code,
          pm.market_name,
          pp.book_line::text AS book_line,
          pp.book_odds,
          ht.team_code AS home_team,
          at.team_code AS away_team,
          latest_team.team_code AS player_team,
          (SELECT prop_date::text FROM target_date) AS prop_date
        FROM player_props pp
        JOIN players p ON p.player_id = pp.player_id
        JOIN games g ON g.game_id = pp.game_id
        JOIN prop_markets pm ON pm.market_id = pp.market_id
        JOIN teams ht ON ht.team_id = g.home_team_id
        JOIN teams at ON at.team_id = g.away_team_id
        LEFT JOIN LATERAL (
          SELECT t.team_code
          FROM (
            SELECT bgs.team_id, g2.game_date, bgs.gamelog_id
            FROM mlb_batter_game_stats bgs
            JOIN games g2 ON g2.game_id = bgs.game_id
            WHERE bgs.player_id = pp.player_id

            UNION ALL

            SELECT pgs.team_id, g3.game_date, pgs.gamelog_id
            FROM mlb_pitcher_game_stats pgs
            JOIN games g3 ON g3.game_id = pgs.game_id
            WHERE pgs.player_id = pp.player_id
          ) mlb_latest_team
          JOIN teams t ON t.team_id = mlb_latest_team.team_id
          ORDER BY mlb_latest_team.game_date DESC, mlb_latest_team.gamelog_id DESC
          LIMIT 1
        ) latest_team ON true
        WHERE pm.market_code LIKE 'MLB_%'
          AND g.game_date = (SELECT prop_date FROM target_date)
        ORDER BY ht.team_code, at.team_code, p.player_name, pm.market_code
        LIMIT ${limit}
      `);

      const rows: Row[] = "rows" in result && Array.isArray(result.rows) ? result.rows : [];
      return {
        propDate: rows.length > 0 ? rows[0]?.prop_date ?? null : null,
        props: rows.map((row) => ({
          playerName: row.player_name,
          marketCode: row.market_code,
          marketName: row.market_name,
          bookLine: row.book_line != null ? Number(row.book_line) : null,
          bookOdds: row.book_odds,
          homeTeam: row.home_team,
          awayTeam: row.away_team,
          playerTeam: row.player_team ?? null,
        })),
      };
    } catch (error) {
      console.error("Database Error (getMlbSlateProps):", error);
      return { propDate: null, props: [] };
    }
  },
  ["getMlbSlateProps"],
  { tags: ["mlb-data"] }
);
