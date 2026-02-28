"use server";

import { db, players, games, playerGameStats, type PlayerGameLog } from "@/db";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import { FALLBACK_PLAYER_NAMES } from "@/lib/playerNames";

/**
 * Canonical list of player names from Neon `players` table (source of truth).
 * Used for search suggestions and validation. Cached with tag "player-data";
 * call POST /api/revalidate after the pipeline runs to refresh.
 * Falls back to FALLBACK_PLAYER_NAMES if the DB fails or returns no rows.
 */
export async function getPlayerNames(): Promise<string[]> {
  noStore();
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
}

/** True if a player with this name exists in `players` (case-insensitive). Used for 404 on invalid /player/[name]. */
export async function getPlayerExists(playerName: string): Promise<boolean> {
  noStore();
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
}

// Only include games where the player actually played (exclude DNP).
// Excluded values (case-insensitive, trimmed): '', 'inactive', 'inact', 'did n', '0', '0:00'.
// Keep .cursor/rules/nba-prop-website.mdc and @/lib/dnp.ts in sync if adding values.
import { isDnpMinutes } from "@/lib/dnp";

const PLAYED_ONLY = sql`COALESCE(LOWER(TRIM(player_game_stats.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')`;

// --- Hottest hands: most points in each player's most recent game ---
export type HotScorerLastGame = {
  playerName: string | null;
  points: number;
  gameDate: string | null;
};

export async function getTopScorersLastGame(
  limit = 5
): Promise<HotScorerLastGame[]> {
  noStore();

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
}

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
  }
): PlayerGameLog {
  return {
    playerName: row.playerName,
    gameDate: row.gameDate,
    location: null,
    opponent: null,
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

export async function getPlayerLastGameStatus(
  playerName: string
): Promise<PlayerLastGameStatus> {
  noStore();
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
}

export async function getPlayerData(
  playerName: string,
  limit = 20
): Promise<PlayerGameLog[]> {
  noStore();

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
      })
    );
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export type HotScorer = {
  playerName: string | null;
  totalPts: number;
  games: number;
};

export async function getTopScorersLast7Days(
  limit = 8
): Promise<HotScorer[]> {
  noStore();

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
}

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

export async function getPlayersOverSeasonAvgLast5(
  limit = 8
): Promise<OverSeasonAvgLast5[]> {
  noStore();

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
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1 FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          WHERE pp.player_id = o.player_id AND g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        ) THEN 0 ELSE 1 END,
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
}

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

export async function getPlayersUnderSeasonAvgLast5(
  limit = 8
): Promise<UnderSeasonAvgLast5[]> {
  noStore();

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
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1 FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          WHERE pp.player_id = u.player_id AND g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        ) THEN 0 ELSE 1 END,
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
}

// --- Trending: last 3 games avg vs previous 3 games avg (points) ---
// DNPs excluded; only players with season avg >= 8. Sorted by diff (last 3 − prev 3) DESC.
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
  gamesChecked: number;
  overCount: number;
  hitRate: number; // 0-100
  playingToday: boolean;
};

export type PicksResult<T> = {
  picks: T[];
  propDate: string | null; // ISO date string e.g. "2026-02-27"
};

// Map market codes to frontend stat keys (used by TopPicks component)
// NOTE: Cannot export plain objects from "use server" files — define in consumer instead.

export async function getTopPicks(limit = 15): Promise<PicksResult<TopPick>> {
  noStore();

  type Row = {
    player_name: string;
    market_code: string;
    market_name: string;
    book_line: string | number;
    games_checked: number;
    over_count: number;
    hit_rate: string | number;
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
      todays_props AS (
        SELECT pp.player_id, pm.market_code, pm.market_name, pp.book_line
        FROM player_props pp
        JOIN games g ON g.game_id = pp.game_id
        JOIN prop_markets pm ON pm.market_id = pp.market_id
        WHERE g.game_date = (SELECT target_date FROM prop_date)
          AND pp.book_line IS NOT NULL
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
          )::int AS over_count
        FROM todays_props tp
        JOIN last_10 l ON l.player_id = tp.player_id
        GROUP BY tp.player_id, tp.market_code, tp.market_name, tp.book_line
        HAVING COUNT(*) >= 5
      )
      ,ranked_picks AS (
        SELECT
          p.player_name,
          h.market_code,
          h.market_name,
          h.book_line::text AS book_line,
          h.games_checked,
          h.over_count,
          ROUND((h.over_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
          ROW_NUMBER() OVER (
            PARTITION BY h.player_id
            ORDER BY (h.over_count::numeric / h.games_checked) DESC, h.book_line DESC
          ) AS player_rn
        FROM hit_rates h
        JOIN players p ON p.player_id = h.player_id
        WHERE h.over_count::numeric / h.games_checked >= 0.6
          AND h.book_line > 1.5
      )
      SELECT player_name, market_code, market_name, book_line,
        games_checked, over_count, hit_rate,
        (SELECT target_date::text FROM prop_date) AS prop_date
      FROM ranked_picks
      WHERE player_rn <= 2
      ORDER BY hit_rate DESC, book_line DESC
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
        gamesChecked: Number(r.games_checked),
        overCount: Number(r.over_count),
        hitRate: Number(r.hit_rate),
        playingToday: true,
      })),
      propDate: rows[0]?.prop_date ?? null,
    };
  } catch (error) {
    console.error("Database Error (getTopPicks):", error);
    return { picks: [], propDate: null };
  }
}

// --- Under Picks: players most likely to go UNDER today's book lines ---
export type UnderPick = {
  playerName: string;
  marketCode: string;
  marketName: string;
  bookLine: number;
  gamesChecked: number;
  underCount: number;
  hitRate: number; // 0-100
  playingToday: boolean;
};

export async function getUnderPicks(limit = 25): Promise<PicksResult<UnderPick>> {
  noStore();

  type Row = {
    player_name: string;
    market_code: string;
    market_name: string;
    book_line: string | number;
    games_checked: number;
    under_count: number;
    hit_rate: string | number;
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
      todays_props AS (
        SELECT pp.player_id, pm.market_code, pm.market_name, pp.book_line
        FROM player_props pp
        JOIN games g ON g.game_id = pp.game_id
        JOIN prop_markets pm ON pm.market_id = pp.market_id
        WHERE g.game_date = (SELECT target_date FROM prop_date)
          AND pp.book_line IS NOT NULL
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
            END < tp.book_line
          )::int AS under_count
        FROM todays_props tp
        JOIN last_10 l ON l.player_id = tp.player_id
        GROUP BY tp.player_id, tp.market_code, tp.market_name, tp.book_line
        HAVING COUNT(*) >= 5
      )
      ,ranked_picks AS (
        SELECT
          p.player_name,
          h.player_id,
          h.market_code,
          h.market_name,
          h.book_line::text AS book_line,
          h.games_checked,
          h.under_count,
          ROUND((h.under_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
          ROW_NUMBER() OVER (
            PARTITION BY h.player_id
            ORDER BY (h.under_count::numeric / h.games_checked) DESC, h.book_line DESC
          ) AS player_rn
        FROM hit_rates h
        JOIN players p ON p.player_id = h.player_id
        WHERE h.under_count::numeric / h.games_checked >= 0.6
          AND NOT (h.market_code IN ('BLK', 'STL') AND h.book_line <= 0.5)
          AND h.book_line > 1.5
      )
      SELECT player_name, market_code, market_name, book_line,
        games_checked, under_count, hit_rate,
        (SELECT target_date::text FROM prop_date) AS prop_date
      FROM ranked_picks
      WHERE player_rn <= 2
      ORDER BY hit_rate DESC, book_line DESC
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
        gamesChecked: Number(r.games_checked),
        underCount: Number(r.under_count),
        hitRate: Number(r.hit_rate),
        playingToday: true,
      })),
      propDate: rows[0]?.prop_date ?? null,
    };
  } catch (error) {
    console.error("Database Error (getUnderPicks):", error);
    return { picks: [], propDate: null };
  }
}

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

export async function getBacktestResults(): Promise<BacktestResult> {
  noStore();

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
          AND NOT (h.market_code IN ('BLK', 'STL') AND h.book_line <= 0.5)
          AND h.book_line > 1.5
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
}

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
};

export type PlayerSplits = {
  home: SplitStats;
  away: SplitStats;
};

export async function getPlayerSplits(
  playerName: string
): Promise<PlayerSplits> {
  noStore();
  const empty: SplitStats = {
    games: 0, avgPts: 0, avgReb: 0, avgAst: 0,
    avgStl: 0, avgBlk: 0, avg3pm: 0, avgPra: 0,
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
        ROUND(AVG(s.pts_reb_ast)::numeric, 1) AS avg_pra
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
}

// --- Matchup averages per opponent team (full season) ---
export type PlayerMatchup = {
  opponentCode: string;
  opponentName: string;
  games: number;
  avgPts: number;
  avgReb: number;
  avgAst: number;
  avgPra: number;
  lastPlayed: string | null;
};

export async function getPlayerMatchups(
  playerName: string
): Promise<PlayerMatchup[]> {
  noStore();

  type Row = {
    opponent_code: string;
    opponent_name: string;
    games: number;
    avg_pts: string | number;
    avg_reb: string | number;
    avg_ast: string | number;
    avg_pra: string | number;
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
      lastPlayed: r.last_played,
    }));
  } catch (error) {
    console.error("Database Error (getPlayerMatchups):", error);
    return [];
  }
}

export async function getTrendingPlayers(
  limit = 8
): Promise<TrendingPlayer[]> {
  noStore();

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
      )
      SELECT p.player_name,
        ROUND(l3.last3_avg_pts::numeric, 1) AS last3_avg_pts,
        ROUND(pr.prev3_avg_pts::numeric, 1) AS prev3_avg_pts,
        ROUND((l3.last3_avg_pts - pr.prev3_avg_pts)::numeric, 1) AS diff
      FROM last_3 l3
      JOIN prev_3 pr ON pr.player_id = l3.player_id
      JOIN players p ON p.player_id = l3.player_id
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1 FROM player_props pp
          JOIN games g ON g.game_id = pp.game_id
          WHERE pp.player_id = l3.player_id AND g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        ) THEN 0 ELSE 1 END,
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
}

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
export async function getPlayerPropLines(
  playerName: string
): Promise<PlayerPropLine[]> {
  noStore();

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
}

// --- Today's game info for a specific player ---
export type TodaysGame = {
  opponentCode: string;
  opponentName: string;
  isHome: boolean;
};

export async function getPlayerTodaysGame(
  playerName: string
): Promise<TodaysGame | null> {
  noStore();

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
}

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
};

/**
 * Get all players with prop lines for today's games.
 * Returns player name + key lines (PTS, REB, AST, PRA) + matchup info.
 */
export async function getTodaysPlayers(): Promise<TodaysPlayer[]> {
  noStore();

  type Row = {
    player_name: string;
    pts_line: string | null;
    pts_odds: number | null;
    reb_line: string | null;
    ast_line: string | null;
    pra_line: string | null;
    home_team: string;
    away_team: string;
  };

  try {
    const result = await db.execute<Row>(sql`
      SELECT
        p.player_name,
        MAX(pp.book_line) FILTER (WHERE pm.market_code = 'PTS')::text AS pts_line,
        MAX(pp.book_odds) FILTER (WHERE pm.market_code = 'PTS') AS pts_odds,
        MAX(pp.book_line) FILTER (WHERE pm.market_code = 'REB')::text AS reb_line,
        MAX(pp.book_line) FILTER (WHERE pm.market_code = 'AST')::text AS ast_line,
        MAX(pp.book_line) FILTER (WHERE pm.market_code = 'PRA')::text AS pra_line,
        ht.team_code AS home_team,
        at.team_code AS away_team
      FROM player_props pp
      JOIN players p ON p.player_id = pp.player_id
      JOIN games g ON g.game_id = pp.game_id
      JOIN prop_markets pm ON pm.market_id = pp.market_id
      JOIN teams ht ON ht.team_id = g.home_team_id
      JOIN teams at ON at.team_id = g.away_team_id
      WHERE g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
      GROUP BY p.player_name, ht.team_code, at.team_code
      ORDER BY MAX(pp.book_line) FILTER (WHERE pm.market_code = 'PTS') DESC NULLS LAST
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
    }));
  } catch (error) {
    console.error("Database Error (getTodaysPlayers):", error);
    return [];
  }
}
