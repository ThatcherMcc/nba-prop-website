import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { sql, isNull } from "drizzle-orm";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { timingSafeCompare, extractBearerToken } from "@/lib/api-auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GradedPickRow = {
  player_name: string;
  market_code: string;
  book_line: string;
  prediction: string;
  confidence: string;
  actual_value: number | null;
  hit: boolean | null;
};

type GradedPick = {
  playerName: string;
  market: string;
  line: number;
  direction: string;
  confidence: number;
  actualValue: number | null;
  hit: boolean | null;
};

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function buildWeeklyHtml(
  recap: {
    wins: number;
    losses: number;
    winRate: number;
    topPicks: GradedPick[];
  },
  weekLabel: string
): string {
  const recordColor = recap.winRate >= 60 ? "#10b981" : recap.winRate >= 50 ? "#f59e0b" : "#ef4444";

  const topPickRows = recap.topPicks
    .map(
      (p) => `
      <div style="background:#18181b;border-radius:8px;padding:14px 16px;margin:10px 0;border:1px solid #27272a;display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div>
          <div style="font-size:15px;font-weight:700;color:#ffffff;">${p.playerName}</div>
          <div style="font-size:13px;color:#71717a;margin-top:2px;">
            ${p.direction} ${p.line} ${p.market}
            ${p.actualValue != null ? `&mdash; actual: <strong style="color:#a1a1aa;">${p.actualValue}</strong>` : ""}
          </div>
        </div>
        <span style="background:${p.hit ? "#10b981" : "#ef4444"};color:#fff;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:700;white-space:nowrap;">
          ${p.hit ? "WIN" : "LOSS"}
        </span>
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

    <h1 style="font-size:26px;font-weight:700;color:#ffffff;margin:0 0 4px;">The Edge Report</h1>
    <p style="color:#71717a;font-size:14px;margin:0 0 28px;">Week of ${weekLabel} &mdash; ML model graded results</p>

    <!-- Win rate headline -->
    <div style="background:#18181b;border-radius:12px;padding:24px;text-align:center;border:1px solid #27272a;margin-bottom:24px;">
      <div style="font-size:48px;font-weight:800;color:${recordColor};line-height:1;">${recap.winRate}%</div>
      <div style="color:#a1a1aa;font-size:15px;margin-top:6px;">Win Rate</div>
      <div style="color:#52525b;font-size:13px;margin-top:8px;">
        ${recap.wins}W &ndash; ${recap.losses}L this week
      </div>
    </div>

    ${recap.topPicks.length > 0 ? `
    <h2 style="font-size:16px;font-weight:600;color:#a1a1aa;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.08em;">Top Picks</h2>
    ${topPickRows}
    ` : `<p style="color:#71717a;">No graded picks available for this week yet.</p>`}

    <div style="margin-top:28px;">
      <a href="https://propedge.bet/track-record"
         style="display:inline-block;background:#3b82f6;color:#ffffff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
        View Full Track Record &rarr;
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
// Helper: get the most recent Monday on or before today (ET)
// ---------------------------------------------------------------------------

function getMostRecentWeekStart(): string {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = now.getDay(); // 0=Sun, 1=Mon … 6=Sat
  const daysBack = day === 0 ? 6 : day - 1; // back to Monday
  now.setDate(now.getDate() - daysBack);
  return now.toISOString().slice(0, 10);
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

  // 2. Determine week window (accept optional weekStart in body, otherwise use current week)
  let weekStart: string;
  try {
    const body = await request.json().catch(() => ({}));
    weekStart =
      typeof body === "object" && body != null && "weekStart" in body && typeof body.weekStart === "string"
        ? (body.weekStart as string)
        : getMostRecentWeekStart();
  } catch {
    weekStart = getMostRecentWeekStart();
  }

  // weekEnd is exclusive (7 days after weekStart)
  const weekEndDate = new Date(weekStart + "T00:00:00");
  weekEndDate.setDate(weekEndDate.getDate() + 7);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);

  // 3. Query graded ML picks for the week
  let wins = 0;
  let losses = 0;
  let topPicks: GradedPick[] = [];

  try {
    const result = await db.execute<GradedPickRow>(sql`
      SELECT
        p.player_name,
        pm.market_code,
        ml.book_line::text       AS book_line,
        ml.prediction,
        ml.confidence::text      AS confidence,
        pgs.points::int          AS actual_value,
        CASE
          WHEN ml.prediction = 'OVER'  AND actual_stat.val >  ml.book_line::numeric THEN true
          WHEN ml.prediction = 'UNDER' AND actual_stat.val <  ml.book_line::numeric THEN true
          WHEN actual_stat.val IS NULL THEN NULL
          ELSE false
        END AS hit
      FROM ml_predictions ml
      JOIN players      p   ON p.player_id   = ml.player_id
      JOIN games        g   ON g.game_id     = ml.game_id
      JOIN prop_markets pm  ON pm.market_id  = ml.market_id
      -- resolve actual stat value by market
      LEFT JOIN LATERAL (
        SELECT
          CASE pm.market_code
            WHEN 'PTS'  THEN pgs.points::numeric
            WHEN 'REB'  THEN pgs.total_rebounds::numeric
            WHEN 'AST'  THEN pgs.assists::numeric
            WHEN 'STL'  THEN pgs.steals::numeric
            WHEN 'BLK'  THEN pgs.blocks::numeric
            WHEN 'FG3'  THEN pgs.three_pointers_made::numeric
            WHEN 'PRA'  THEN pgs.pts_reb_ast::numeric
            WHEN 'PR'   THEN pgs.pts_reb::numeric
            WHEN 'PA'   THEN pgs.pts_ast::numeric
            WHEN 'RA'   THEN pgs.reb_ast::numeric
            WHEN 'SB'   THEN pgs.stl_blk::numeric
            ELSE NULL
          END AS val
        FROM player_game_stats pgs
        WHERE pgs.player_id = ml.player_id
          AND pgs.game_id   = ml.game_id
          AND COALESCE(LOWER(TRIM(pgs.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
        LIMIT 1
      ) actual_stat ON true
      LEFT JOIN player_game_stats pgs
        ON pgs.player_id = ml.player_id AND pgs.game_id = ml.game_id
      WHERE g.game_date >= ${weekStart}::date
        AND g.game_date <  ${weekEnd}::date
        AND g.game_date <  (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date
        AND pm.market_code NOT IN ('FTM', 'TOV', 'FG2', 'BLK')
        AND ml.confidence::numeric >= 0.30
        AND actual_stat.val IS NOT NULL
      ORDER BY ml.confidence DESC
    `);

    const rows: GradedPickRow[] =
      "rows" in result && Array.isArray(result.rows) ? result.rows : [];

    const allGraded: GradedPick[] = rows.map((r) => ({
      playerName: r.player_name,
      market: r.market_code,
      line: Number(r.book_line),
      direction: r.prediction,
      confidence: Number(r.confidence),
      actualValue: r.actual_value,
      hit: r.hit,
    }));

    wins = allGraded.filter((p) => p.hit === true).length;
    losses = allGraded.filter((p) => p.hit === false).length;
    topPicks = allGraded.filter((p) => p.hit === true).slice(0, 3);
    if (topPicks.length < 3) {
      topPicks = allGraded.slice(0, 3);
    }
  } catch (err) {
    console.error("[send-weekly-recap] DB error (graded picks):", err);
    return NextResponse.json({ error: "DB error fetching graded picks" }, { status: 500 });
  }

  const decided = wins + losses;
  const winRate = decided > 0 ? Math.round((wins / decided) * 100) : 0;

  // 4. Fetch active subscribers
  let emails: string[] = [];
  try {
    const subs = await db
      .select({ email: subscribers.email })
      .from(subscribers)
      .where(isNull(subscribers.unsubscribedAt));
    emails = subs.map((s) => s.email);
  } catch (err) {
    console.error("[send-weekly-recap] DB error (subscribers):", err);
    return NextResponse.json({ error: "DB error fetching subscribers" }, { status: 500 });
  }

  if (emails.length === 0) {
    return NextResponse.json({ sent: 0, wins, losses, winRate });
  }

  // 5. Build email content
  const weekLabel = new Date(weekStart + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  const subject = `The Edge Report — Week of ${weekLabel}`;

  // 6. Send in batches of 100
  const BATCH_SIZE = 100;
  let totalSent = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    const messages = batch.map((email) => ({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: buildWeeklyHtml({ wins, losses, winRate, topPicks }, weekLabel).replace(
        /\{\{email\}\}/g,
        encodeURIComponent(email)
      ),
    }));

    try {
      await resend.batch.send(messages);
      totalSent += batch.length;
    } catch (err) {
      console.error(`[send-weekly-recap] Resend batch error (offset ${i}):`, err);
    }
  }

  return NextResponse.json({ sent: totalSent, wins, losses, winRate, weekStart });
}
