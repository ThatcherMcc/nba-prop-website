import type { Metadata } from "next";
import {
  getTodaysPlayers,
  getTopPicks,
  getUnderPicks,
  getTeamDefensiveRatings,
  getLastDataUpdate,
} from "@/lib/data";
import SlatePageContent from "@/app/components/SlatePageContent";

// This route reads the live slate and should not block deploys on static generation timeouts.
export const dynamic = "force-dynamic";

const BASE_URL = "https://propedge.bet";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Slate | PropEdge",
    description:
      "Today's NBA slate with analytics picks, player prop lines, and matchup context for every game.",
    openGraph: {
      title: "Slate | PropEdge",
      description:
        "Today's NBA slate with analytics picks, player prop lines, and matchup context for every game.",
      url: `${BASE_URL}/slate`,
    },
    twitter: {
      card: "summary",
      title: "Slate | PropEdge",
      description:
        "Today's NBA slate with analytics picks, player prop lines, and matchup context for every game.",
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
  let underPicks: Awaited<ReturnType<typeof getUnderPicks>> = {
    picks: [],
    propDate: null,
  };
  let defensiveRatings: Awaited<ReturnType<typeof getTeamDefensiveRatings>> =
    [];
  let lastUpdated: string | null = null;

  try {
    [todaysPlayers, topPicks, underPicks, defensiveRatings, lastUpdated] =
      await Promise.all([
        getTodaysPlayers(),
        getTopPicks(50),
        getUnderPicks(50),
        getTeamDefensiveRatings(),
        getLastDataUpdate(),
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
      topPicks={topPicks.picks}
      underPicks={underPicks.picks}
    />
  );
}
