import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { sql, isNull } from "drizzle-orm";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { timingSafeCompare, extractBearerToken } from "@/lib/api-auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MlPickRow = {
  player_name: string;
  market_code: string;
  book_line: string;
  prediction: string;
  confidence: string;
  avg_last_5: string | null;
};

type Pick = {
  playerName: string;
  market: string;
  line: number;
  direction: string;
  confidence: number;
  avgLast5: number | null;
};

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function buildDigestHtml(picks: Pick[], dateStr: string): string {
  const pickRows = picks
    .map(
      (p) => `
      <div style="background:#18181b;border-radius:8px;padding:16px;margin:12px 0;border:1px solid #27272a;">
        <div style="font-size:18px;font-weight:700;color:#ffffff;">${p.playerName}</div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <span style="background:${p.direction === "OVER" ? "#10b981" : "#ef4444"};color:#ffffff;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:0.05em;">
            ${p.direction} ${p.line}
          </span>
          <span style="color:#a1a1aa;font-size:14px;">${p.market}</span>
          <span style="color:#a1a1aa;font-size:14px;">${Math.round(p.confidence * 100)}% conf</span>
          ${p.avgLast5 != null ? `<span style="color:#71717a;font-size:13px;">L5 avg: ${p.avgLast5.toFixed(1)}</span>` : ""}
        </div>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;">
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e4e4e7;padding:32px 24px;">

    <div style="margin-bottom:24px;">
      <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;">PropEdge</span>
      <span style="color:#3b82f6;font-size:22px;font-weight:800;">.</span>
    </div>

    <h1 style="font-size:26px;font-weight:700;color:#ffffff;margin:0 0 4px;">Today's Top Picks</h1>
    <p style="color:#71717a;font-size:14px;margin:0 0 24px;">${dateStr} &mdash; High-confidence ML model selections (conf &ge; 30%)</p>

    ${pickRows.length > 0 ? pickRows : `<p style="color:#71717a;">No high-confidence picks available for today.</p>`}

    <div style="margin-top:28px;">
      <a href="https://propedge.bet/slate"
         style="display:inline-block;background:#3b82f6;color:#ffffff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
        View Full Slate &rarr;
      </a>
    </div>

    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #27272a;">
      <p style="color:#3f3f46;font-size:11px;line-height:1.6;margin:0;">
        For entertainment purposes only. Not gambling advice. Must be 21+ to wager where legal.<br>
        You're receiving this because you subscribed at <a href="https://propedge.bet" style="color:#3f3f46;">propedge.bet</a>.<br>
        <a href="https://propedge.bet/api/unsubscribe?email={{email}}" style="color:#52525b;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Auth
  const apiKey = process.env.UPDATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const bearer = extractBearerToken(request.headers.get("authorization"));
  if (!bearer || !timingSafeCompare(bearer, apiKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json(
      { error: "Email not configured (RESEND_API_KEY missing)" },
      { status: 503 }
    );
  }

  // 2. Fetch today's top ML picks directly (bypass unstable_cache)
  let picks: Pick[] = [];
  try {
    const result = await db.execute<MlPickRow>(sql`
      SELECT
        p.player_name,
        pm.market_code,
        ml.book_line::text   AS book_line,
        ml.prediction,
        ml.confidence::text  AS confidence,
        ml.avg_last_5::text  AS avg_last_5
      FROM ml_predictions ml
      JOIN players   p  ON p.player_id  = ml.player_id
      JOIN games     g  ON g.game_id    = ml.game_id
      JOIN prop_markets pm ON pm.market_id = ml.market_id
      WHERE g.game_date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        AND pm.market_code NOT IN ('FTM', 'TOV', 'FG2', 'BLK')
        AND ml.book_line >= 4.5
        AND ml.confidence::numeric >= 0.30
      ORDER BY ml.confidence DESC
      LIMIT 5
    `);

    const rows: MlPickRow[] =
      "rows" in result && Array.isArray(result.rows) ? result.rows : [];

    picks = rows.map((r) => ({
      playerName: r.player_name,
      market: r.market_code,
      line: Number(r.book_line),
      direction: r.prediction,
      confidence: Number(r.confidence),
      avgLast5: r.avg_last_5 != null ? Number(r.avg_last_5) : null,
    }));
  } catch (err) {
    console.error("[send-daily-digest] DB error (picks):", err);
    return NextResponse.json({ error: "DB error fetching picks" }, { status: 500 });
  }

  // 3. Fetch active subscribers
  let emails: string[] = [];
  try {
    const subs = await db
      .select({ email: subscribers.email })
      .from(subscribers)
      .where(isNull(subscribers.unsubscribedAt));
    emails = subs.map((s) => s.email);
  } catch (err) {
    console.error("[send-daily-digest] DB error (subscribers):", err);
    return NextResponse.json({ error: "DB error fetching subscribers" }, { status: 500 });
  }

  if (emails.length === 0) {
    return NextResponse.json({ sent: 0, picks: picks.length });
  }

  // 4. Build email content
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  const subject = `PropEdge Picks — ${new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  })}`;

  // 5. Send in batches of 100 (Resend batch limit)
  const BATCH_SIZE = 100;
  let totalSent = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    const messages = batch.map((email) => ({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: buildDigestHtml(picks, dateStr).replace(/\{\{email\}\}/g, encodeURIComponent(email)),
    }));

    try {
      await resend.batch.send(messages);
      totalSent += batch.length;
    } catch (err) {
      console.error(`[send-daily-digest] Resend batch error (offset ${i}):`, err);
      // Continue with remaining batches rather than aborting entirely
    }
  }

  return NextResponse.json({ sent: totalSent, picks: picks.length });
}
