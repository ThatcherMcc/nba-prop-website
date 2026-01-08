"use server";

import { db, playerData, players, PlayerGameLog } from "@/db";
import { eq, desc, sql } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

export async function getPlayerData(
  playerName: string
): Promise<PlayerGameLog[]> {
  noStore();

  const query = db
    .select()
    .from(playerData)
    .where(eq(sql`lower(${playerData.playerName})`, playerName.toLowerCase()))
    .orderBy(desc(playerData.gameDate))
    .limit(10)
    .toSQL();

  // 2. Log the generated SQL and its parameters to your server console
  console.log("EXECUTING SQL:", query.sql);
  console.log("PARAMETERS:", query.params);

  try {
    const data = await db
      .select()
      .from(playerData)
      .where(eq(sql`lower(${playerData.playerName})`, playerName.toLowerCase()))
      .orderBy(desc(playerData.gameDate))
      .limit(20);
    console.log("DATA RECEIVED:", data);
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch player data.");
  }
}

export async function getPlayerProfileImageUrl(
  playerName: string
): Promise<string | null> {
  noStore();

  try {
    const rows = await db
      .select({ profileImageUrl: players.profileImageUrl })
      .from(players)
      .where(eq(sql`lower(${players.playerName})`, playerName.toLowerCase()))
      .limit(1);

    return rows[0]?.profileImageUrl ?? null;
  } catch (error) {
    // If the table/migration isn't applied yet (or any other DB error),
    // keep the UI working by falling back to the default image.
    console.error("Database Error (getPlayerProfileImageUrl):", error);
    return null;
  }
}
