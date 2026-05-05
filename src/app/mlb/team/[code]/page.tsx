import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMlbTeamWithParkFactor } from "@/lib/data";
import MlbTeamPageContent from "@/app/components/MlbTeamPageContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const team = await getMlbTeamWithParkFactor(code.toUpperCase());
  if (!team) {
    return { title: "Team Not Found | PropEdge" };
  }
  const canonicalUrl = `https://propedge.bet/mlb/team/${code}`;
  return {
    title: `${team.teamName} — MLB Park Factors & Stats | PropEdge`,
    description: `${team.teamName} park factors, ballpark context, and links into the live MLB slate and analytics surfaces.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${team.teamName} — MLB Park Factors | PropEdge`,
      description: `${team.teamName} park factors and live MLB matchup context.`,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${team.teamName} — MLB Park Factors | PropEdge`,
      description: `${team.teamName} park factors and live MLB matchup context.`,
    },
  };
}

export default async function MlbTeamPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const team = await getMlbTeamWithParkFactor(code.toUpperCase());

  if (!team) notFound();

  return <MlbTeamPageContent team={team} />;
}
