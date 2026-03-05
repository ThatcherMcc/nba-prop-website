import {
  getPlayersOverSeasonAvgLast5,
  getPlayersUnderSeasonAvgLast5,
  getTrendingPlayers,
  getTopPicks,
  getUnderPicks,
  getBacktestResults,
  getLastDataUpdate,
} from "@/lib/data";
import AnalyticsPageContent from "@/app/components/AnalyticsPageContent";

export const metadata = {
  title: "Analytics | PropEdge",
  description: "Command center view of NBA prop betting analytics.",
};

export default async function AnalyticsPage() {
  // Higher limits than homepage for analytics density
  let overSeasonAvgLast5: Awaited<ReturnType<typeof getPlayersOverSeasonAvgLast5>> = [];
  let underSeasonAvgLast5: Awaited<ReturnType<typeof getPlayersUnderSeasonAvgLast5>> = [];
  let trendingPlayers: Awaited<ReturnType<typeof getTrendingPlayers>> = [];
  let topPicks: Awaited<ReturnType<typeof getTopPicks>> = { picks: [], propDate: null };
  let underPicks: Awaited<ReturnType<typeof getUnderPicks>> = { picks: [], propDate: null };
  let backtestResults: Awaited<ReturnType<typeof getBacktestResults>> = { gameDate: "", picks: [] };
  let lastUpdated: string | null = null;

  try {
    [overSeasonAvgLast5, underSeasonAvgLast5, trendingPlayers, topPicks, underPicks, backtestResults, lastUpdated] =
      await Promise.all([
        getPlayersOverSeasonAvgLast5(25),
        getPlayersUnderSeasonAvgLast5(25),
        getTrendingPlayers(25),
        getTopPicks(50),
        getUnderPicks(50),
        getBacktestResults(),
        getLastDataUpdate(),
      ]);
  } catch (e) {
    console.error("Analytics page data load failed:", e);
  }

  return (
    <AnalyticsPageContent
      overSeasonAvgLast5={overSeasonAvgLast5}
      underSeasonAvgLast5={underSeasonAvgLast5}
      trendingPlayers={trendingPlayers}
      topPicks={topPicks.picks}
      underPicks={underPicks.picks}
      propDate={topPicks.propDate ?? underPicks.propDate}
      backtestResults={backtestResults}
      lastUpdated={lastUpdated}
    />
  );
}
