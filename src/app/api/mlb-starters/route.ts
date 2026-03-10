import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

interface MlbPitcher {
  name: string;
  mlb_id: number | null;
}

interface MlbStarterGame {
  game_date: string;
  home_team: string;
  away_team: string;
  home_pitcher: MlbPitcher;
  away_pitcher: MlbPitcher;
  game_time: string;
  status: string;
  game_pk: number;
  game_type: string;
}

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    // process.cwd() = nba-prop-website root; go up two levels to workspace root
    const workspaceRoot = join(process.cwd(), "..", "..");
    const filePath = join(
      workspaceRoot,
      "nba-data-backend",
      "data",
      `mlb_confirmed_starters_${today}.json`
    );

    let games: MlbStarterGame[] = [];
    try {
      const raw = readFileSync(filePath, "utf-8");
      games = JSON.parse(raw) as MlbStarterGame[];
    } catch {
      // File doesn't exist for today — return empty array
      games = [];
    }

    return NextResponse.json(games);
  } catch (err) {
    console.error("mlb-starters route error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
