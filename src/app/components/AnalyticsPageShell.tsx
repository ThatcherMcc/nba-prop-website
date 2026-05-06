"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { TeamDefensiveRating, TopPick, UnderPick } from "@/lib/data";
import TopPicks from "./TopPicks";
import UnderPicks from "./UnderPicks";

interface AnalyticsPageShellProps {
  topPicks: TopPick[];
  underPicks: UnderPick[];
  defensiveRatings: TeamDefensiveRating[];
  propDate: string | null;
  hasError?: boolean;
  children?: ReactNode;
}

export default function AnalyticsPageShell({
  topPicks,
  underPicks,
  defensiveRatings,
  propDate,
  hasError = false,
  children,
}: AnalyticsPageShellProps) {
  const router = useRouter();

  const goToPlayer = (
    name: string,
    games = 5,
    stat?: string,
    line?: number
  ) => {
    const params = new URLSearchParams();
    params.set("games", String(games));
    if (stat) params.set("stat", stat);
    if (line != null && !Number.isNaN(line)) params.set("line", String(line));
    router.push(`/player/${encodeURIComponent(name)}?${params.toString()}`);
  };

  const allDataEmpty = topPicks.length === 0 && underPicks.length === 0;

  return (
    <>
      <a
        href="https://prizepicks.onelink.me/FjtC/e9fwt4jw"
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-8 rounded-xl border border-pe-accent/20 bg-gradient-to-r from-pe-accent/10 to-pe-surface-1 p-4 hover:border-pe-accent/40 transition-colors group"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-pe-accent">Promo</span>
            <p className="text-sm font-semibold text-pe-text-primary mt-0.5">
              Sign up for PrizePicks with our code
            </p>
            <p className="text-xs text-pe-text-muted mt-0.5">
              Use code <span className="font-mono font-bold text-pe-accent">PR-5RMN2FT</span> when you sign up to take advantage and support PropEdge.
            </p>
          </div>
          <span className="shrink-0 px-4 py-2 rounded-lg bg-pe-accent/20 text-pe-accent text-xs font-bold uppercase tracking-wide group-hover:bg-pe-accent/30 transition-colors">
            Sign up
          </span>
        </div>
      </a>

      {hasError && (
        <div className="bg-[#d1ad6a]/10 border border-[#d1ad6a]/20 rounded-xl p-4 mb-8 text-[#f5d89b] text-sm">
          We&apos;re having trouble loading data right now. Data updates daily at 3:00 AM ET — please try again shortly.
        </div>
      )}

      {!hasError && allDataEmpty && (
        <div className="bg-pe-surface-2/50 border border-pe-border/5 rounded-xl p-6 mb-8 text-center text-pe-text-muted text-sm">
          No games scheduled today. Check back tomorrow for fresh picks.
        </div>
      )}

      <TopPicks
        picks={topPicks}
        defensiveRatings={defensiveRatings}
        propDate={propDate}
        onSelectPlayer={(name, stat, line) =>
          goToPlayer(name, 10, stat, line ?? undefined)
        }
      />

      <UnderPicks
        picks={underPicks}
        defensiveRatings={defensiveRatings}
        propDate={propDate}
        onSelectPlayer={(name, stat, line) =>
          goToPlayer(name, 10, stat, line ?? undefined)
        }
      />

      {children}
    </>
  );
}
