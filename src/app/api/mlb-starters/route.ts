import { NextResponse } from "next/server";
import { getMlbStarterGames } from "@/lib/mlbStarters";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const games = await getMlbStarterGames();
    return NextResponse.json(games);
  } catch (error) {
    console.error("mlb-starters route error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
