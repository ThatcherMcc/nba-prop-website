import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function PUT(request: Request) {
  console.log("PUT request received");

  const API_KEY = process.env.UPDATE_API_KEY;
  const authHeader = request.headers.get("authorization");

  console.log("API_KEY exists:", !!API_KEY);
  console.log("Auth header:", authHeader ? "present" : "missing");

  if (!authHeader || authHeader.split(" ")[1] !== API_KEY) {
    console.log("Authorization failed");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting to parse request body");
    const players: PlayerGameLogs[] = await request.json();
    console.log("Players data:", JSON.stringify(players, null, 2));
    console.log("Number of players:", players?.length);

    if (!Array.isArray(players)) {
      console.log("Players is not an array");
      return NextResponse.json(
        { message: "Invalid data format" },
        { status: 400 }
      );
    }

    console.log("Starting database operations");

    for (const player of players) {
      const playerName = player.name;
      const gameLogs = player.gamelogs;

      console.log(`Processing player ${playerName}:`);

      if (!Array.isArray(gameLogs)) {
        console.error(`Invalid gamelog for player ${playerName}. Skipping.`);
        continue;
      }

      for (const gamelog of gameLogs) {
        try {
          await sql`
          INSERT INTO player_data_2026 (
            player_name, game_date, location, opponent, mp, fg, fga, fg_pct,
            fg3, fg3a, fg3_pct, fg2, fg2a, fg2_pct, efg_pct, ft, fta,
            ft_pct, orb, drb, trb, ast, stl, blk, tov, pts, pra, pr,
            pa, ra, sb
          )
          VALUES (
            ${playerName}, 
            ${gamelog.DATE}, 
            ${gamelog.LOCATION}, 
            ${gamelog.OPPONENT},
            ${gamelog.MP || 0},  -- Use the calculated 'minutes' float from Python
            ${Number(gamelog.FG) || 0}, 
            ${Number(gamelog.FGA) || 0}, 
            ${gamelog.FG_PCT || 0}, 
            ${Number(gamelog.FG3) || 0}, 
            ${Number(gamelog.FG3A) || 0}, 
            ${gamelog.FG3_PCT || 0}, 
            ${Number(gamelog.FG2) || 0}, 
            ${Number(gamelog.FG2A) || 0}, 
            ${gamelog.FG2_PCT || 0}, 
            ${gamelog.EFG_PCT || 0}, 
            ${Number(gamelog.FT) || 0}, 
            ${Number(gamelog.FTA) || 0},
            ${gamelog.FT_PCT || 0}, 
            ${Number(gamelog.ORB) || 0}, 
            ${Number(gamelog.DRB) || 0}, 
            ${Number(gamelog.TRB) || 0}, 
            ${Number(gamelog.AST) || 0}, 
            ${Number(gamelog.STL) || 0}, 
            ${Number(gamelog.BLK) || 0}, 
            ${Number(gamelog.TOV) || 0}, 
            ${Number(gamelog.PTS) || 0}, 
            ${Number(gamelog.PRA) || 0}, 
            ${Number(gamelog.PR) || 0}, 
            ${Number(gamelog.PA) || 0}, 
            ${Number(gamelog.RA) || 0}, 
            ${Number(gamelog.SB) || 0}
          )
          ON CONFLICT (player_name, game_date, opponent) 
          DO UPDATE SET
            mp = EXCLUDED.mp,
            fg = EXCLUDED.fg,
            fga = EXCLUDED.fga,
            fg_pct = EXCLUDED.fg_pct,
            fg3 = EXCLUDED.fg3,
            fg3a = EXCLUDED.fg3a,
            fg3_pct = EXCLUDED.fg3_pct,
            fg2 = EXCLUDED.fg2,
            fg2a = EXCLUDED.fg2a,
            fg2_pct = EXCLUDED.fg2_pct,
            efg_pct = EXCLUDED.efg_pct,
            ft = EXCLUDED.ft,
            fta = EXCLUDED.fta,
            ft_pct = EXCLUDED.ft_pct,
            orb = EXCLUDED.orb,
            drb = EXCLUDED.drb,
            trb = EXCLUDED.trb,
            ast = EXCLUDED.ast,
            stl = EXCLUDED.stl,
            blk = EXCLUDED.blk,
            tov = EXCLUDED.tov,
            pts = EXCLUDED.pts,
            pra = EXCLUDED.pra,
            pr = EXCLUDED.pr,
            pa = EXCLUDED.pa,
            ra = EXCLUDED.ra,
            sb = EXCLUDED.sb
        `;
          console.log(
            `Successfully processed gamelog for ${playerName} on ${gamelog.DATE}`
          );
        } catch (gameLogError) {
          console.error(
            `Error processing gamelog for ${playerName} on ${gamelog.DATE}:`,
            gameLogError
          );
          console.error("Gamelog data:", gamelog);
          throw gameLogError;
        }
      }
    }

    console.log("All players processed successfully");
    return NextResponse.json({ message: "Database updated successfully!" });
  } catch (error) {
    console.error("Detailed error information:");
    console.error("Full error object:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

interface Gamelog {
  DATE: string;
  LOCATION: "Home" | "Away";
  OPPONENT: string;
  MP: string;
  FG: number;
  FGA: number;
  FG_PCT: number;
  FG3: number;
  FG3A: number;
  FG3_PCT: number;
  FG2: number;
  FG2A: number;
  FG2_PCT: number;
  EFG_PCT: number;
  FT: number;
  FTA: number;
  FT_PCT: number;
  ORB: number;
  DRB: number;
  TRB: number;
  AST: number;
  STL: number;
  BLK: number;
  TOV: number;
  PTS: number;
  PRA: number;
  PR: number;
  PA: number;
  RA: number;
  SB: number;
}

interface PlayerGameLogs {
  name: string;
  gamelogs: Gamelog[];
}
