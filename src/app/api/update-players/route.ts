import { NextResponse } from "next/server";
import { timingSafeCompare, extractBearerToken } from "@/lib/auth";

/**
 * Player/gamelog data now lives in Neon tables: players, games, player_game_stats.
 * The old player_data_2026 table no longer exists. Backend should use
 * nba-data-backend update_db scripts and directives. Stub returns 501 until
 * this route is updated to write to the new schema if needed.
 */
export async function PUT(request: Request) {
  const apiKey = process.env.UPDATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Server misconfigured" },
      { status: 500 }
    );
  }

  const provided = extractBearerToken(request.headers.get("authorization")) ?? "";

  if (!provided || !timingSafeCompare(provided, apiKey)) {
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
