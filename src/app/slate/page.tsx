import {
  getTodaysPlayers,
  getTopPicks,
  getTeamDefensiveRatings,
  getLastDataUpdate,
  getMlPredictions,
} from "@/lib/data";
import SlatePageContent from "@/app/components/SlatePageContent";

export const metadata = {
  title: "The Edge | PropEdge",
  description:
    "Today's NBA games with top prop edges and ML picks for every matchup.",
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
