import type { Metadata } from "next";
import {
  getTodaysPlayers,
  getTopPicks,
  getTeamDefensiveRatings,
  getLastDataUpdate,
  getMlPredictions,
} from "@/lib/data";
import SlatePageContent from "@/app/components/SlatePageContent";

const BASE_URL = "https://propedge.bet";

// ── Dynamic metadata for share links ─────────────────────────────────────────

type SlatePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(
  { searchParams }: SlatePageProps
): Promise<Metadata> {
  const params = await searchParams;

  const player    = typeof params.player    === "string" ? params.player    : null;
  const market    = typeof params.market    === "string" ? params.market    : null;
  const line      = typeof params.line      === "string" ? params.line      : null;
  const direction = typeof params.direction === "string" ? params.direction : null;
  const confidence = typeof params.confidence === "string" ? params.confidence : null;

  // If all share params present, generate a pick-specific OG image
  if (player && market && line && direction) {
    const ogParams = new URLSearchParams({ player, market, line, direction });
    if (confidence) ogParams.set("confidence", confidence);

    const dirLabel = direction.toUpperCase() === "UNDER" ? "UNDER" : "OVER";
    const confLabel = confidence
      ? ` (${Math.round(parseFloat(confidence) * 100)}% conf)`
      : "";
    const title = `${player} ${dirLabel} ${line} ${market}${confLabel} — PropEdge AI Pick`;
    const description = `PropEdge AI model pick: ${player} ${dirLabel} ${line} ${market}${confLabel}. Data-driven NBA prop analysis.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/slate?${ogParams.toString()}`,
        images: [
          {
            url: `${BASE_URL}/api/og/pick?${ogParams.toString()}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${BASE_URL}/api/og/pick?${ogParams.toString()}`],
      },
    };
  }

  // Default slate page metadata
  return {
    title: "The Edge | PropEdge",
    description:
      "Today's NBA games with top prop edges and ML picks for every matchup.",
    openGraph: {
      title: "The Edge | PropEdge",
      description:
        "Today's NBA games with top prop edges and ML picks for every matchup.",
      url: `${BASE_URL}/slate`,
    },
    twitter: {
      card: "summary",
      title: "The Edge | PropEdge",
      description:
        "Today's NBA games with top prop edges and ML picks for every matchup.",
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SlatePage() {
  let todaysPlayers: Awaited<ReturnType<typeof getTodaysPlayers>> = [];
  let topPicks: Awaited<ReturnType<typeof getTopPicks>> = {
    picks: [],
    propDate: null,
  };
  let defensiveRatings: Awaited<ReturnType<typeof getTeamDefensiveRatings>> =
    [];
  let lastUpdated: string | null = null;
  let mlPredictions: Awaited<ReturnType<typeof getMlPredictions>> = [];

  try {
    [todaysPlayers, topPicks, defensiveRatings, lastUpdated, mlPredictions] =
      await Promise.all([
        getTodaysPlayers(),
        getTopPicks(50),
        getTeamDefensiveRatings(),
        getLastDataUpdate(),
        getMlPredictions(),
      ]);
  } catch (e) {
    console.error("Slate page data load failed:", e);
  }

  return (
    <SlatePageContent
      todaysPlayers={todaysPlayers}
      defensiveRatings={defensiveRatings}
      lastUpdated={lastUpdated}
      propDate={topPicks.propDate}
      mlPredictions={mlPredictions}
    />
  );
}
