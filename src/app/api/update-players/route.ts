import { NextResponse } from "next/server";

/**
 * Player/gamelog data now lives in Neon tables: players, games, player_game_stats.
 * The old player_data_2026 table no longer exists. Backend should use
 * nba-data-backend update_db scripts and directives. Stub returns 501 until
 * this route is updated to write to the new schema if needed.
 */
export async function PUT(request: Request) {
  const API_KEY = process.env.UPDATE_API_KEY;
  const authHeader = request.headers.get("authorization");

  if (!authHeader || authHeader.split(" ")[1] !== API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      message:
        "Endpoint not yet updated for new schema (players, games, player_game_stats). Use backend update_db scripts.",
    },
    { status: 501 }
  );
}
