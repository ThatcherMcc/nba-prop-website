import type { Metadata } from "next";
import {
  getLastDataUpdate,
  getMlbParkFactors,
  getMlbSlateProps,
  getMlbSupportedMarkets,
} from "@/lib/data";
import { getMlbStarterGames } from "@/lib/mlbStarters";
import MlbSlatePageContent from "@/app/components/MlbSlatePageContent";

// This page is fed by live slate data and should not be statically generated during builds.
export const dynamic = "force-dynamic";

const BASE_URL = "https://propedge.bet";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "MLB Slate | PropEdge",
    description:
      "Today's MLB slate with probable starters, park-factor context, and MLB prop markets when line rows are available.",
    openGraph: {
      title: "MLB Slate | PropEdge",
      description:
        "Today's MLB slate with probable starters, park-factor context, and MLB prop markets when line rows are available.",
      url: `${BASE_URL}/mlb/slate`,
    },
    twitter: {
      card: "summary",
      title: "MLB Slate | PropEdge",
      description:
        "Today's MLB slate with probable starters, park-factor context, and MLB prop markets when line rows are available.",
    },
  };
}

export default async function MlbSlatePage() {
  let starterGames: Awaited<ReturnType<typeof getMlbStarterGames>> = [];
  let parkFactors: Awaited<ReturnType<typeof getMlbParkFactors>> = [];
  let supportedMarkets: Awaited<ReturnType<typeof getMlbSupportedMarkets>> = [];
  let slateProps: Awaited<ReturnType<typeof getMlbSlateProps>> = {
    propDate: null,
    props: [],
  };
  let lastUpdated: string | null = null;

  try {
    [starterGames, parkFactors, supportedMarkets, slateProps, lastUpdated] = await Promise.all([
      getMlbStarterGames(),
      getMlbParkFactors(),
      getMlbSupportedMarkets(),
      getMlbSlateProps(),
      getLastDataUpdate(),
    ]);
  } catch (error) {
    console.error("MLB slate page data load failed:", error);
  }

  return (
    <MlbSlatePageContent
      starterGames={starterGames}
      parkFactors={parkFactors}
      supportedMarkets={supportedMarkets}
      propDate={slateProps.propDate}
      props={slateProps.props}
      lastUpdated={lastUpdated}
    />
  );
}
