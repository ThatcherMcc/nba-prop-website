import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getWeeklyRecap,
  getWeeklyHotPlayers,
  getWeeklyColdPlayers,
} from "@/lib/data";
import WeeklyRecapContent from "@/app/components/WeeklyRecapContent";
import EmailCapture from "@/app/components/EmailCapture";
import ShareButtons from "@/app/components/ShareButtons";

const SITE_URL = "https://propedge.bet";

interface Props {
  params: Promise<{ slug: string }>;
}

function parseSlug(slug: string): string | null {
  // Expected format: week-YYYY-MM-DD
  const match = slug.match(/^week-(\d{4}-\d{2}-\d{2})$/);
  return match ? match[1] : null;
}

function formatWeekLabel(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(weekEnd + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} \u2014 ${end.toLocaleDateString("en-US", opts)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const weekStart = parseSlug(slug);
  if (!weekStart) return { title: "Not Found | PropEdge" };

  const recap = await getWeeklyRecap(weekStart);
  if (!recap) return { title: "Not Found | PropEdge" };

  const label = formatWeekLabel(recap.weekStart, recap.weekEnd);
  const title = `Week of ${label} \u2014 Picks Went ${recap.wins}-${recap.losses} (${recap.winRate}%) | The Edge`;
  const description = `PropEdge weekly recap for ${label}. ${recap.wins} wins, ${recap.losses} losses, ${recap.winRate}% win rate.`;
  const url = `${SITE_URL}/insights/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
    },
  };
}

export default async function InsightDetailPage({ params }: Props) {
  const { slug } = await params;
  const weekStart = parseSlug(slug);

  if (!weekStart) {
    notFound();
  }

  const [recap, hotPlayers, coldPlayers] = await Promise.all([
    getWeeklyRecap(weekStart),
    getWeeklyHotPlayers(weekStart, 10),
    getWeeklyColdPlayers(weekStart, 10),
  ]);

  if (!recap) {
    notFound();
  }

  const label = formatWeekLabel(recap.weekStart, recap.weekEnd);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `The Edge: Week of ${label}`,
    description: `PropEdge weekly pick recap for ${label}. ${recap.wins} wins, ${recap.losses} losses, ${recap.winRate}% win rate.`,
    url: `${SITE_URL}/insights/${slug}`,
    datePublished: recap.weekStart,
    publisher: {
      "@type": "Organization",
      name: "PropEdge",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/insights"
          className="text-xs font-bold text-pe-text-faint hover:text-pe-text-primary transition-colors"
        >
          &#x2190; The Edge
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest mb-1">
          The Edge &#8212; Weekly Recap
        </p>
        <h1 className="text-2xl font-black uppercase tracking-wide text-pe-text-primary mb-1">
          {label}
        </h1>
        <p className="text-sm text-pe-text-faint">
          {recap.picks.length} graded picks across {recap.dailyBreakdown.length} game{recap.dailyBreakdown.length !== 1 ? "s" : ""}
        </p>
      </div>

      <WeeklyRecapContent
        recap={recap}
        hotPlayers={hotPlayers}
        coldPlayers={coldPlayers}
      />

      {/* Share + Email capture */}
      <div className="mt-10 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-pe-text-faint">Share this recap</p>
          <ShareButtons
            url={`${SITE_URL}/insights/${slug}`}
            text={`PropEdge picks went ${recap.wins}-${recap.losses} (${recap.winRate}%) this week`}
          />
        </div>
        <EmailCapture />
      </div>
    </>
  );
}
