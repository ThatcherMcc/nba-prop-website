import { NextResponse } from "next/server";
import { db } from "@/db";
import { authUsers, authSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get("__Secure-authjs.session-token")?.value ??
      cookieStore.get("authjs.session-token")?.value;

    const allCookies = cookieStore.getAll().map((c) => c.name);

    if (!sessionToken) {
      return NextResponse.json({
        status: "no_session_cookie",
        cookies: allCookies,
      });
    }

    // Try to look up the session in the DB
    const sessions = await db
      .select()
      .from(authSessions)
      .where(eq(authSessions.sessionToken, sessionToken));

    if (sessions.length === 0) {
      return NextResponse.json({
        status: "session_not_in_db",
        tokenPrefix: sessionToken.substring(0, 8) + "...",
        cookies: allCookies,
      });
    }

    const session = sessions[0];
    const users = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.id, session.userId));

    return NextResponse.json({
      status: "ok",
      session: {
        tokenPrefix: sessionToken.substring(0, 8) + "...",
        userId: session.userId,
        expires: session.expires,
      },
      user: users[0]
        ? { id: users[0].id, name: users[0].name, email: users[0].email }
        : null,
      cookies: allCookies,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
