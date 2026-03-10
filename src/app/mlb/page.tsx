import type { Metadata } from "next";
import { getMlbParkFactors, getMlbPlayerCount } from "@/lib/data";
import MlbPageContent from "@/app/components/MlbPageContent";

export const metadata: Metadata = {
  title: "MLB Analytics | PropEdge",
  description:
    "MLB park factors, team data, and prop analytics. Full predictions launch with the regular season.",
};

export default async function MlbPage() {
  let parkFactors: Awaited<ReturnType<typeof getMlbParkFactors>> = [];
  let playerCount = 0;

  try {
    [parkFactors, playerCount] = await Promise.all([
      getMlbParkFactors(),
      getMlbPlayerCount(),
    ]);
  } catch (e) {
    console.error("MLB page data load failed:", e);
  }

  return <MlbPageContent parkFactors={parkFactors} playerCount={playerCount} />;
}
