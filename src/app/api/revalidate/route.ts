import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const CACHE_TAG = "player-data";

/**
 * Invalidate cached player data (homepage + player pages).
 * Call this after a scrape (e.g. from GitHub Actions) so the next request gets fresh data.
 *
 * Auth: set REVALIDATE_SECRET in env, then send it in the request:
 *   Authorization: Bearer <REVALIDATE_SECRET>
 *   or
 *   x-revalidate-secret: <REVALIDATE_SECRET>
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Revalidate not configured (missing REVALIDATE_SECRET)" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const headerSecret = request.headers.get("x-revalidate-secret");
  const provided = bearer ?? headerSecret;

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(CACHE_TAG);
  return NextResponse.json({ revalidated: true, tag: CACHE_TAG });
}
