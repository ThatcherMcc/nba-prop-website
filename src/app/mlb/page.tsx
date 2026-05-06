import type { Metadata } from "next";
import {
  getLastDataUpdate,
  getMlbDataCoverage,
  getMlbParkFactors,
  getMlbSupportedMarkets,
} from "@/lib/data";
import { getMlbStarterGames } from "@/lib/mlbStarters";
import MlbPageContent from "@/app/components/MlbPageContent";

const BASE_URL = "https://propedge.bet";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "MLB | PropEdge",
    description:
      "MLB park factors, starter board, team profiles, analytics, and slate context built into the main PropEdge workflow.",
    openGraph: {
      title: "MLB | PropEdge",
      description:
        "MLB park factors, starter board, team profiles, analytics, and slate context built into the main PropEdge workflow.",
      url: `${BASE_URL}/mlb`,
    },
    twitter: {
      card: "summary",
      title: "MLB | PropEdge",
      description:
        "MLB park factors, starter board, team profiles, analytics, and slate context built into the main PropEdge workflow.",
    },
  };
}

export default async function MlbPage() {
  let parkFactors: Awaited<ReturnType<typeof getMlbParkFactors>> = [];
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
  let supportedMarkets: Awaited<ReturnType<typeof getMlbSupportedMarkets>> = [];
  let lastUpdated: string | null = null;

  try {
    [parkFactors, coverage, starterGames, supportedMarkets, lastUpdated] = await Promise.all([
      getMlbParkFactors(),
      getMlbDataCoverage(),
      getMlbStarterGames(),
      getMlbSupportedMarkets(),
      getLastDataUpdate(),
    ]);
  } catch (error) {
    console.error("MLB page data load failed:", error);
  }

  return (
    <MlbPageContent
      parkFactors={parkFactors}
      coverage={coverage}
      starterGames={starterGames}
      supportedMarkets={supportedMarkets}
      lastUpdated={lastUpdated}
    />
  );
}
