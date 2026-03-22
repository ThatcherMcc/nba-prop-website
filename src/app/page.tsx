import Link from "next/link";
import { getMlBacktestResults, getLastDataUpdate } from "@/lib/data";

export default async function Page() {
  let hitRate = 0;
  let totalPicks = 0;
  let totalHits = 0;
  let edge = 0;
  let daysCount = 0;
  let bestMarket: { market: string; rate: number } | null = null;
  let lastUpdated: string | null = null;

  try {
    const [ml, updated] = await Promise.all([
      getMlBacktestResults(),
      getLastDataUpdate(),
    ]);
    hitRate = ml.hitRate;
    totalPicks = ml.totalPicks;
    totalHits = ml.totalHits;
    edge = ml.edge;
    daysCount = ml.daysCount;
    if (ml.marketBreakdown.length > 0) {
      bestMarket = ml.marketBreakdown.reduce((best, m) =>
        m.rate > best.rate && m.picks >= 5 ? m : best
      );
    }
    lastUpdated = updated;
  } catch (e) {
    console.error("Homepage data load failed:", e);
  }

  return (
    <div className="w-full pb-16">
      {/* ── Hero ── */}
      <div className="text-center py-14 sm:py-24 px-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
          {hitRate > 0 ? `${hitRate}% verified hit rate` : "NBA player analytics"}
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-pe-text-primary leading-[1.1]">
          Stop guessing.<br />
          <span className="text-pe-accent">Start winning.</span>
        </h1>
        <p className="text-base sm:text-lg text-pe-text-muted mt-4 max-w-xl mx-auto leading-relaxed">
          PropEdge uses machine learning to analyze every NBA player, every matchup,
          and every prop line — so you don&apos;t have to.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 bg-pe-accent text-pe-bg font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Explore analytics
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link
            href="/player/LeBron James"
            className="inline-flex items-center gap-2 text-pe-text-muted font-bold text-sm px-6 py-3 rounded-xl border border-pe-border/10 hover:border-pe-border/30 hover:text-pe-text-primary transition-all"
          >
            Research players
          </Link>
        </div>
      </div>

      {/* ── Social proof stats ── */}
      {totalPicks > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-pe-border/5 rounded-2xl overflow-hidden mb-12">
          <div className="bg-pe-surface-1/60 p-5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{hitRate}%</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint mt-1">Hit Rate</div>
          </div>
          <div className="bg-pe-surface-1/60 p-5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-pe-text-primary">{totalPicks}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint mt-1">Picks Graded</div>
          </div>
          <div className="bg-pe-surface-1/60 p-5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">+{edge}%</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint mt-1">Edge vs Juice</div>
          </div>
          <div className="bg-pe-surface-1/60 p-5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-blue-400">{daysCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint mt-1">Game Days</div>
          </div>
        </div>
      )}

      {/* ── Feature sections ── */}
      <div className="flex flex-col gap-4">
        {/* Analytics */}
        <Link
          href="/analytics"
          className="group block bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <span className="text-xl sm:text-2xl">&#128202;</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-pe-text-primary group-hover:text-amber-400 transition-colors">
                    Analytics
                  </h2>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    STREAKS &amp; TRENDS
                  </span>
                </div>
                <p className="text-sm text-pe-text-muted leading-relaxed mb-3">
                  See who&apos;s hot and who&apos;s cold before the books adjust. Rolling averages,
                  over/under streaks, and trending players — all updated daily from real game logs.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-pe-text-faint">
                  <span>&#10003; Hot &amp; cold streak detection</span>
                  <span>&#10003; Over/under hit rates</span>
                  <span>&#10003; Featured player spotlights</span>
                </div>
              </div>
              <svg className="shrink-0 w-5 h-5 text-pe-text-faint group-hover:text-amber-400 transition-colors hidden sm:block mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Player Search */}
        <Link
          href="/player/LeBron James"
          className="group block bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden hover:border-pe-accent/30 transition-all"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-pe-accent/10 border border-pe-accent/20 flex items-center justify-center">
                <span className="text-xl sm:text-2xl">&#128269;</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-pe-text-primary group-hover:text-pe-accent transition-colors">
                    Player Research
                  </h2>
                  <span className="text-[10px] font-bold text-pe-accent bg-pe-accent/10 border border-pe-accent/20 px-2 py-0.5 rounded-full">
                    500+ PLAYERS
                  </span>
                </div>
                <p className="text-sm text-pe-text-muted leading-relaxed mb-3">
                  Deep-dive into any player. Game logs, stat charts, prop lines, home/away splits,
                  and matchup history — everything you need to make informed decisions.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-pe-text-faint">
                  <span>&#10003; Full game log history</span>
                  <span>&#10003; Interactive stat charts</span>
                  <span>&#10003; Home/away &amp; matchup splits</span>
                  <span>&#10003; Current prop lines</span>
                </div>
              </div>
              <svg className="shrink-0 w-5 h-5 text-pe-text-faint group-hover:text-pe-accent transition-colors hidden sm:block mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Insights */}
        <Link
          href="/insights"
          className="group block bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <span className="text-xl sm:text-2xl">&#128214;</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-pe-text-primary group-hover:text-purple-400 transition-colors">
                    Insights
                  </h2>
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    WEEKLY RECAPS
                  </span>
                </div>
                <p className="text-sm text-pe-text-muted leading-relaxed mb-3">
                  Weekly breakdowns of what hit, what missed, and why. Learn from the model&apos;s
                  wins and losses to sharpen your own approach.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-pe-text-faint">
                  <span>&#10003; Best hits of the week</span>
                  <span>&#10003; Biggest misses analyzed</span>
                  <span>&#10003; Market-by-market trends</span>
                </div>
              </div>
              <svg className="shrink-0 w-5 h-5 text-pe-text-faint group-hover:text-purple-400 transition-colors hidden sm:block mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* ── How it works ── */}
      <div className="mt-14 mb-10">
        <h2 className="text-center text-sm font-black uppercase tracking-widest text-pe-text-faint mb-8">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-pe-surface-1 border border-pe-border/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-sm font-black text-pe-text-muted">1</span>
            </div>
            <h3 className="text-sm font-bold text-pe-text-primary mb-1">Data ingestion</h3>
            <p className="text-xs text-pe-text-faint leading-relaxed">
              We scrape game logs, prop lines, and opponent defense stats for 500+ players daily.
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-pe-surface-1 border border-pe-border/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-sm font-black text-pe-text-muted">2</span>
            </div>
            <h3 className="text-sm font-bold text-pe-text-primary mb-1">ML analysis</h3>
            <p className="text-xs text-pe-text-faint leading-relaxed">
              Our LightGBM model evaluates rolling averages, matchup context, rest days, and line movement to predict over/under probability.
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-pe-surface-1 border border-pe-border/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-sm font-black text-pe-text-muted">3</span>
            </div>
            <h3 className="text-sm font-bold text-pe-text-primary mb-1">Research and review</h3>
            <p className="text-xs text-pe-text-faint leading-relaxed">
              Use player trends, matchup history, and recent form to evaluate the slate without relying on surfaced model picks.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="bg-pe-surface-1/60 border border-pe-border/10 rounded-2xl p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-black text-pe-text-primary mb-2">
          Ready to find your edge?
        </h2>
        <p className="text-sm text-pe-text-muted mb-5 max-w-md mx-auto">
          {bestMarket
            ? `Our strongest market lately has been ${bestMarket.market} at ${bestMarket.rate}%. Explore the underlying trends and player data.`
            : "Explore player trends, matchup data, and recent performance."
          }
        </p>
        <Link
          href="/analytics"
          className="inline-flex items-center gap-2 bg-pe-accent text-pe-bg font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Explore analytics
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      {/* ── Footer details ── */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-pe-text-faint">
          Data updated daily. {totalPicks > 0 && `${totalHits}/${totalPicks} picks hit across ${daysCount} game days. `}
          Break-even at -110 juice = 52.4%.
          {lastUpdated && ` Last update: ${new Date(lastUpdated).toLocaleString()}.`}
        </p>
      </div>
    </div>
  );
}
