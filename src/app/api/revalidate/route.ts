import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeCompare, extractBearerToken } from "@/lib/api-auth";

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
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const bearer = extractBearerToken(request.headers.get("authorization"));
  const headerSecret = request.headers.get("x-revalidate-secret");
  const provided = bearer ?? headerSecret ?? "";

  if (!provided || !timingSafeCompare(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(CACHE_TAG);
  return NextResponse.json({ revalidated: true, tag: CACHE_TAG });
}
