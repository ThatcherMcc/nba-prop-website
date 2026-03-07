import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email =
    body != null &&
    typeof body === "object" &&
    "email" in body &&
    typeof (body as Record<string, unknown>).email === "string"
      ? ((body as Record<string, string>).email as string).trim().toLowerCase()
      : null;

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  try {
    await db.insert(subscribers).values({ email }).onConflictDoNothing();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    // Catch any unexpected unique constraint errors that onConflictDoNothing may not swallow
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    console.error("[subscribe] DB error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
