import type { Metadata } from "next";
import { getAvailableInsightWeeks } from "@/lib/data";
import InsightCard from "@/app/components/InsightCard";
import EmailCapture from "@/app/components/EmailCapture";

const SITE_URL = "https://propedge.bet";

export const metadata: Metadata = {
  title: "The Edge \u2014 Weekly Prop Insights | PropEdge",
  description:
    "Weekly NBA prop betting recaps: win rates, best picks, worst misses, hot and cold players. Track how PropEdge picks performed week by week.",
  alternates: {
    canonical: `${SITE_URL}/insights`,
  },
  openGraph: {
    title: "The Edge \u2014 Weekly Prop Insights",
    description:
      "Weekly NBA prop betting recaps: win rates, best picks, worst misses, hot and cold players.",
    url: `${SITE_URL}/insights`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "The Edge \u2014 Weekly Prop Insights",
  url: `${SITE_URL}/insights`,
  description:
    "Weekly NBA prop betting recaps from PropEdge. Covers win rates, individual pick results, hot and cold players each week.",
  publisher: {
    "@type": "Organization",
    name: "PropEdge",
    url: SITE_URL,
  },
};

export default async function InsightsPage() {
  const weeks = await getAvailableInsightWeeks();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-wide text-pe-text-primary mb-1">
          The Edge
        </h1>
        <p className="text-sm text-pe-text-faint">
          Weekly NBA prop betting recaps &#8212; win rates, best picks, and player trends.
        </p>
      </div>

      {weeks.length === 0 ? (
        <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl p-8 text-center">
          <p className="text-pe-text-muted text-sm">No insights available yet.</p>
          <p className="text-pe-text-faint text-xs mt-1">
            Weekly recaps will appear here once prop data is available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeks.map((week) => (
            <InsightCard
              key={week.weekStart}
              weekStart={week.weekStart}
              gameDates={week.gameDates}
            />
          ))}
        </div>
      )}

      {/* Email capture */}
      <div className="mt-12">
        <EmailCapture />
      </div>
    </>
  );
}
