import type { Metadata } from "next";
import {
  getLastDataUpdate,
  getMlbDataCoverage,
  getMlbParkFactors,
  getMlbSlateProps,
  getMlbSupportedMarkets,
  getMlbTopPicks,
  getMlbUnderPicks,
} from "@/lib/data";
import { getMlbStarterGames } from "@/lib/mlbStarters";
import MlbAnalyticsPageContent from "@/app/components/MlbAnalyticsPageContent";

const BASE_URL = "https://propedge.bet";

export const metadata: Metadata = {
  title: "MLB Analytics | PropEdge",
  description:
    "MLB park-factor analytics, starter context, market coverage, and live data readiness for the baseball slate.",
  openGraph: {
    title: "MLB Analytics | PropEdge",
    description:
      "MLB park-factor analytics, starter context, market coverage, and live data readiness for the baseball slate.",
    url: `${BASE_URL}/mlb/analytics`,
  },
  twitter: {
    card: "summary",
    title: "MLB Analytics | PropEdge",
    description:
      "MLB park-factor analytics, starter context, market coverage, and live data readiness for the baseball slate.",
  },
};

export default async function MlbAnalyticsPage() {
  let parkFactors: Awaited<ReturnType<typeof getMlbParkFactors>> = [];
  let supportedMarkets: Awaited<ReturnType<typeof getMlbSupportedMarkets>> = [];
  let coverage: Awaited<ReturnType<typeof getMlbDataCoverage>> = {
    teamCount: 0,
    playerCount: 0,
    parkFactorCount: 0,
    supportedMarketCount: 0,
    gameCount: 0,
    teamStatCount: 0,
    batterGameLogCount: 0,
    pitcherGameLogCount: 0,
    propCount: 0,
    predictionCount: 0,
  };
  let starterGames: Awaited<ReturnType<typeof getMlbStarterGames>> = [];
  let slateProps: Awaited<ReturnType<typeof getMlbSlateProps>> = {
    propDate: null,
    props: [],
  };
  let topPicks: Awaited<ReturnType<typeof getMlbTopPicks>> = {
    picks: [],
    propDate: null,
  };
  let underPicks: Awaited<ReturnType<typeof getMlbUnderPicks>> = {
    picks: [],
    propDate: null,
  };
  let lastUpdated: string | null = null;

  try {
    [parkFactors, supportedMarkets, coverage, starterGames, slateProps, topPicks, underPicks, lastUpdated] = await Promise.all([
      getMlbParkFactors(),
      getMlbSupportedMarkets(),
      getMlbDataCoverage(),
      getMlbStarterGames(),
      getMlbSlateProps(24),
      getMlbTopPicks(25),
      getMlbUnderPicks(25),
      getLastDataUpdate(),
    ]);
  } catch (error) {
    console.error("MLB analytics page data load failed:", error);
  }

  return (
    <MlbAnalyticsPageContent
      parkFactors={parkFactors}
      supportedMarkets={supportedMarkets}
      coverage={coverage}
      starterGames={starterGames}
      slateProps={slateProps}
      lastUpdated={lastUpdated}
      topPicks={topPicks.picks}
      underPicks={underPicks.picks}
      propDate={topPicks.propDate ?? underPicks.propDate ?? slateProps.propDate}
    />
  );
}
