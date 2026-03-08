import Link from "next/link";
import { getMlBacktestResults, getLastDataUpdate } from "@/lib/data";

export default async function Page() {
  let hitRate = 0;
  let totalPicks = 0;
  let lastUpdated: string | null = null;

  try {
    const [ml, updated] = await Promise.all([
      getMlBacktestResults(),
      getLastDataUpdate(),
    ]);
    hitRate = ml.hitRate;
    totalPicks = ml.totalPicks;
    lastUpdated = updated;
  } catch (e) {
    console.error("Homepage data load failed:", e);
  }

  return (
    <div className="w-full pb-16">
      {/* Hero */}
      <div className="text-center py-12 sm:py-20">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-pe-text-primary leading-tight">
          Find Your <span className="text-pe-accent">Edge</span>
        </h1>
        <p className="text-sm sm:text-base text-pe-text-faint mt-3 max-w-md mx-auto">
          AI-powered NBA prop predictions backed by data.
          {hitRate > 0 && (
            <span className="text-emerald-400 font-bold"> {hitRate}% hit rate</span>
          )}
          {totalPicks > 0 && (
            <span className="text-pe-text-muted"> across {totalPicks} picks.</span>
          )}
        </p>
      </div>

      {/* Full-width vertical sections */}
      <div className="flex flex-col gap-4">
        {/* The Edge */}
        <Link
          href="/slate"
          className="group block bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all"
        >
          <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-8">
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">&#129302;</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-pe-text-primary group-hover:text-blue-400 transition-colors">
                  The Edge
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    ML MODEL
                  </span>
                  {hitRate > 0 && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {hitRate}% HIT RATE
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-pe-text-faint leading-relaxed">
                Today&apos;s top AI prop picks with confidence scores, matchup data, and game-by-game breakdowns.
              </p>
            </div>
            <svg className="shrink-0 w-5 h-5 text-pe-text-faint group-hover:text-blue-400 transition-colors hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>

        {/* Analytics */}
        <Link
          href="/analytics"
          className="group block bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden hover:border-pe-accent/30 transition-all"
        >
          <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-8">
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">&#128202;</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-pe-text-primary group-hover:text-pe-accent transition-colors">
                  Analytics
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    STREAKS
                  </span>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                    TRENDS
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-pe-text-faint leading-relaxed">
                Hot streaks, cold spells, trending players, and prop hit rates based on recent performance.
              </p>
            </div>
            <svg className="shrink-0 w-5 h-5 text-pe-text-faint group-hover:text-pe-accent transition-colors hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>

        {/* Insights */}
        <Link
          href="/insights"
          className="group block bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all"
        >
          <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-8">
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">&#128214;</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-pe-text-primary group-hover:text-purple-400 transition-colors">
                  Insights
                </h2>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  WEEKLY RECAPS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-pe-text-faint leading-relaxed">
                Weekly recaps, best hits, biggest misses, and deep dives into what&apos;s working.
              </p>
            </div>
            <svg className="shrink-0 w-5 h-5 text-pe-text-faint group-hover:text-purple-400 transition-colors hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className="group block bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden hover:border-zinc-400/30 transition-all"
        >
          <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-8">
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">&#9881;&#65039;</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-pe-text-primary group-hover:text-zinc-300 transition-colors mb-1.5">
                Profile
              </h2>
              <p className="text-xs sm:text-sm text-pe-text-faint leading-relaxed">
                Customize your theme, layout, and preferences.
              </p>
            </div>
            <svg className="shrink-0 w-5 h-5 text-pe-text-faint group-hover:text-zinc-300 transition-colors hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Search prompt */}
      <p className="text-xs text-pe-text-faint text-center mt-10 mb-6">
        Looking for a specific player? Use <kbd className="inline-flex items-center gap-0.5 rounded border border-pe-border/10 bg-pe-surface-2 px-1.5 py-0.5 text-[10px] text-pe-text-faint mx-1">&#8984;K</kbd> to search.
      </p>

      {/* SEO content */}
      <section className="max-w-2xl mx-auto text-center">
        <p className="text-xs text-pe-text-muted leading-relaxed">
          PropEdge tracks 500+ NBA players across 26 stat categories, updated daily.
          Our ML model analyzes rolling averages, opponent defense ratings, and line movement
          to identify the highest-edge prop picks every game day.
        </p>
        {lastUpdated && (
          <p className="text-[10px] text-pe-text-faint mt-3">
            Data last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </section>
    </div>
  );
}
