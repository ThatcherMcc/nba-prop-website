import { NextResponse } from "next/server";
import { timingSafeCompare, extractBearerToken } from "@/lib/auth";

/**
 * Props API targets the current Neon schema: player_props uses
 * player_id, game_id, market_id (FKs), not player_name/game_date/stat_type.
 * Update this route to resolve names/dates to IDs and insert with the new shape
 * when the backend is ready to call it.
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

  // New schema: player_props(player_id, game_id, market_id, over_under, fair_line, fair_odds, book_line, book_odds)
  return NextResponse.json(
    {
      message:
        "Endpoint not yet updated for new schema (player_id, game_id, market_id). See directives/infrastructure/neon_schema.md.",
    },
    { status: 501 }
  );
}
