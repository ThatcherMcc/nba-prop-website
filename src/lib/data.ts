"use server";

import { db, players, games, playerGameStats, type PlayerGameLog } from "@/db";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

// Only include games where the player actually played (exclude DNP).
// Excluded values (case-insensitive, trimmed): '', 'inactive', 'inact', 'did n', '0', '0:00'.
// Keep .cursor/rules/nba-prop-website.mdc "Played-only / DNP exclusion" in sync if adding values.
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
      .where(
        and(
          eq(playerGameStats.playerId, player.playerId),
          PLAYED_ONLY
        )
      )
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
export type OverSeasonAvgLast5 = {
  playerName: string | null;
  seasonAvgPts: number;
  last5AvgPts: number;
  gamesInLast5: number;
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
      last_5_agg AS (
        SELECT player_id,
          AVG(points) AS last5_avg_pts,
          COUNT(*)::int AS games_in_last5
        FROM ranked
        WHERE rn <= 5
        GROUP BY player_id
        HAVING COUNT(*) >= 5
      ),
      season_avg AS (
        SELECT player_id,
          AVG(points) AS season_avg_pts
        FROM player_game_stats
        WHERE COALESCE(LOWER(TRIM(minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
        GROUP BY player_id
      )
      SELECT p.player_name,
        ROUND(sa.season_avg_pts::numeric, 1) AS season_avg_pts,
        ROUND(l5.last5_avg_pts::numeric, 1) AS last5_avg_pts,
        l5.games_in_last5,
        ROUND((l5.last5_avg_pts - sa.season_avg_pts)::numeric, 1) AS diff
      FROM last_5_agg l5
      JOIN season_avg sa ON sa.player_id = l5.player_id
      JOIN players p ON p.player_id = l5.player_id
      WHERE l5.last5_avg_pts > sa.season_avg_pts
      ORDER BY (l5.last5_avg_pts - sa.season_avg_pts) DESC
      LIMIT ${limit}
    `);

    const rows: Row[] =
      "rows" in result && Array.isArray(result.rows) ? result.rows : [];

    return rows.map((r: Row) => ({
      playerName: r.player_name ?? null,
      seasonAvgPts: Number(r.season_avg_pts) ?? 0,
      last5AvgPts: Number(r.last5_avg_pts) ?? 0,
      gamesInLast5: Number(r.games_in_last5) ?? 0,
      diff: Number(r.diff) ?? 0,
    }));
  } catch (error) {
    console.error("Database Error (getPlayersOverSeasonAvgLast5):", error);
    return [];
  }
}
