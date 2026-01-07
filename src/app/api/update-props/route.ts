import { NextResponse } from "next/server";
import { db, playerProps } from "@/db";
import { sql } from "drizzle-orm";

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
    const rawData = await request.json();
  
    if (!Array.isArray(rawData)) {
      return NextResponse.json({ message: "Invalid format" }, { status: 400 });
    }
  
    // 1. Map to your schema format
    const allValues = rawData.map((prop) => ({
      playerName: prop.player_name,
      gameDate: prop.event_date,
      statType: prop.stat_type,
      ou: prop.ou,
      fairOdds: prop.fair_odds,
      fairLine: prop.fair_line,
      bookOdds: prop.book_odds,
      bookLine: prop.book_line,
    }));
  
    // 2. DE-DUPLICATE the incoming array
    // We use a Map to keep only the LAST occurrence of any duplicate row
    const uniqueMap = new Map();
    allValues.forEach(item => {
      const key = `${item.playerName}-${item.gameDate}-${item.statType}`;
      uniqueMap.set(key, item);
    });
    
    const valuesToInsert = Array.from(uniqueMap.values());
  
    console.log(`Original: ${allValues.length}, Unique: ${valuesToInsert.length}`);
  
    // 3. Perform Batching (as we did before)
    const BATCH_SIZE = 100;
    for (let i = 0; i < valuesToInsert.length; i += BATCH_SIZE) {
      const chunk = valuesToInsert.slice(i, i + BATCH_SIZE);
      await db.insert(playerProps)
        .values(chunk)
        .onConflictDoUpdate({
          target: [playerProps.playerName, playerProps.gameDate, playerProps.statType],
          set: {
            fairOdds: sql`excluded.fair_odds`,
            fairLine: sql`excluded.fair_line`,
            bookOdds: sql`excluded.book_odds`,
            bookLine: sql`excluded.book_line`,
            ou: sql`excluded.ou`
          },
        });
    }

    return NextResponse.json({ 
      message: "Upsert successful", 
      count: valuesToInsert.length 
    });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "Error processing data" }, { status: 500 });
  }
}