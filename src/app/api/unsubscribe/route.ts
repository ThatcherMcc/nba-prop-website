import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/unsubscribe?email=<encoded-email>
 *
 * Linked from the footer of every PropEdge email. Sets unsubscribed_at on the
 * subscriber row and returns a simple HTML confirmation page.
 */
export async function GET(request: NextRequest) {
  const rawEmail = request.nextUrl.searchParams.get("email");
  const email = rawEmail ? decodeURIComponent(rawEmail).trim().toLowerCase() : null;

  if (!email || !EMAIL_REGEX.test(email)) {
    return new NextResponse(buildPage("Invalid unsubscribe link.", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    await db
      .update(subscribers)
      .set({ unsubscribedAt: new Date() })
      .where(
        and(
          eq(subscribers.email, email),
          isNull(subscribers.unsubscribedAt)
        )
      );
  } catch (err) {
    console.error("[unsubscribe] DB error:", err);
    return new NextResponse(buildPage("Something went wrong. Please try again later.", false), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse(buildPage("You've been unsubscribed from PropEdge emails.", true), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function buildPage(message: string, success: boolean): string {
  const accentColor = success ? "#10b981" : "#ef4444";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Unsubscribe &mdash; PropEdge</title>
</head>
<body style="margin:0;padding:0;background:#09090b;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;width:100%;margin:0 auto;padding:40px 24px;text-align:center;">
    <div style="margin-bottom:24px;">
      <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;">PropEdge</span><span style="color:#3b82f6;font-size:24px;font-weight:800;">.</span>
    </div>
    <div style="background:#18181b;border-radius:12px;padding:32px;border:1px solid #27272a;">
      <div style="font-size:32px;margin-bottom:16px;">${success ? "✓" : "✗"}</div>
      <p style="color:${accentColor};font-size:16px;font-weight:600;margin:0 0 12px;">${message}</p>
      ${success ? `<p style="color:#71717a;font-size:14px;margin:0;">You won't receive any more emails from us.</p>` : ""}
    </div>
    <p style="margin-top:24px;">
      <a href="https://propedge.bet" style="color:#3b82f6;font-size:14px;text-decoration:none;">Back to PropEdge &rarr;</a>
    </p>
  </div>
</body>
</html>`;
}
