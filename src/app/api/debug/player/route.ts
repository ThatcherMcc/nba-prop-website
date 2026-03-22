import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { timingSafeCompare, extractBearerToken } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

type PlayerRow = {
  player_id: number;
  player_name: string;
};

type RecentGameRow = {
  game_date: string;
  minutes_played: string | null;
  points: number | null;
  opponent_code: string | null;
  is_home: boolean | null;
  updated_at: string | null;
};

type LastUpdateRow = {
  last_updated: string | null;
};

function getDbFingerprint(connectionString: string | undefined) {
  if (!connectionString) {
    return { configured: false, host: null, database: null };
  }

  try {
    const url = new URL(connectionString);
    return {
      configured: true,
      host: url.hostname || null,
      database: url.pathname.replace(/^\//, "") || null,
    };
  } catch {
    return { configured: true, host: "unparseable", database: null };
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const bearer = extractBearerToken(request.headers.get("authorization"));
  const headerSecret = request.headers.get("x-revalidate-secret");
  const provided = bearer ?? headerSecret ?? "";

  if (!provided || !timingSafeCompare(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playerName = request.nextUrl.searchParams.get("name")?.trim();
  if (!playerName) {
    return NextResponse.json(
      { error: 'Missing required query param "name"' },
      { status: 400 }
    );
  }

  try {
    const playerResult = await db.execute<PlayerRow>(sql`
      SELECT player_id, player_name
      FROM players
      WHERE LOWER(player_name) = LOWER(${playerName})
      LIMIT 1
    `);

    const playerRows =
      "rows" in playerResult && Array.isArray(playerResult.rows)
        ? playerResult.rows
        : [];

    const lastUpdateResult = await db.execute<LastUpdateRow>(sql`
      SELECT MAX(updated_at)::text AS last_updated
      FROM player_game_stats
    `);

    const lastUpdateRows =
      "rows" in lastUpdateResult && Array.isArray(lastUpdateResult.rows)
        ? lastUpdateResult.rows
        : [];

    const dbFingerprint = getDbFingerprint(process.env.POSTGRES_URL);

    if (playerRows.length === 0) {
      return NextResponse.json({
        ok: true,
        playerFound: false,
        queriedName: playerName,
        database: dbFingerprint,
        cache: {
          tag: "player-data",
          revalidateSeconds: 900,
        },
        data: {
          overallLastPlayerGameStatsUpdate: lastUpdateRows[0]?.last_updated ?? null,
          recentGames: [],
          latestGameDate: null,
        },
        timestamp: new Date().toISOString(),
      });
    }

    const player = playerRows[0];

    const recentGamesResult = await db.execute<RecentGameRow>(sql`
      SELECT
        g.game_date::text AS game_date,
        s.minutes_played,
        s.points,
        opp.team_code AS opponent_code,
        s.is_home,
        s.updated_at::text AS updated_at
      FROM player_game_stats s
      JOIN games g ON g.game_id = s.game_id
      LEFT JOIN teams opp ON opp.team_id = CASE
        WHEN s.is_home THEN g.away_team_id
        ELSE g.home_team_id
      END
      WHERE s.player_id = ${player.player_id}
      ORDER BY g.game_date DESC
      LIMIT 15
    `);

    const recentGames =
      "rows" in recentGamesResult && Array.isArray(recentGamesResult.rows)
        ? recentGamesResult.rows
        : [];

    return NextResponse.json({
      ok: true,
      playerFound: true,
      queriedName: playerName,
      canonicalPlayerName: player.player_name,
      database: dbFingerprint,
      cache: {
        tag: "player-data",
        revalidateSeconds: 900,
      },
      data: {
        overallLastPlayerGameStatsUpdate: lastUpdateRows[0]?.last_updated ?? null,
        latestGameDate: recentGames[0]?.game_date ?? null,
        recentGames: recentGames.map((row) => ({
          gameDate: row.game_date,
          minutesPlayed: row.minutes_played,
          points: row.points,
          opponentCode: row.opponent_code,
          isHome: row.is_home,
          updatedAt: row.updated_at,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug player endpoint error:", error);
    return NextResponse.json(
      { error: "Debug query failed" },
      { status: 500 }
    );
  }
}
