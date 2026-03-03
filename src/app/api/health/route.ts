import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      return NextResponse.json(
        { status: "error", db: "not configured" },
        { status: 503 }
      );
    }
    const sql = neon(connectionString);
    await sql`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "connected",
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        db: "disconnected",
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
