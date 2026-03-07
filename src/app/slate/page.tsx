import {
  getTodaysPlayers,
  getTopPicks,
  getTeamDefensiveRatings,
  getLastDataUpdate,
} from "@/lib/data";
import SlatePageContent from "@/app/components/SlatePageContent";

export const metadata = {
  title: "Today's Slate | PropEdge",
  description:
    "Today's NBA games with top prop edges for every matchup.",
};

export default async function SlatePage() {
  let todaysPlayers: Awaited<ReturnType<typeof getTodaysPlayers>> = [];
  let topPicks: Awaited<ReturnType<typeof getTopPicks>> = {
    picks: [],
    propDate: null,
  };
  let defensiveRatings: Awaited<ReturnType<typeof getTeamDefensiveRatings>> =
    [];
  let lastUpdated: string | null = null;

  try {
    [todaysPlayers, topPicks, defensiveRatings, lastUpdated] =
      await Promise.all([
        getTodaysPlayers(),
        getTopPicks(50),
        getTeamDefensiveRatings(),
        getLastDataUpdate(),
      ]);
  } catch (e) {
    console.error("Slate page data load failed:", e);
  }

  return (
    <SlatePageContent
      todaysPlayers={todaysPlayers}
      topPicks={topPicks.picks}
      defensiveRatings={defensiveRatings}
      lastUpdated={lastUpdated}
      propDate={topPicks.propDate}
    />
  );
}
