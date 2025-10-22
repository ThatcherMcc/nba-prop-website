"use server";

import { db, playerData, PlayerGameLog } from "@/db";
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
