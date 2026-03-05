import HomepageContent from "@/app/components/HomepageContent";
import {
  getPlayerData,
  getPlayersOverSeasonAvgLast5,
  getPlayersUnderSeasonAvgLast5,
  getTrendingPlayers,
  getTopPicks,
  getUnderPicks,
  getBacktestResults,
  getLastDataUpdate,
} from "@/lib/data";

const FEATURED_PLAYER = "LeBron James";

export default async function Page() {
  let featuredData: Awaited<ReturnType<typeof getPlayerData>> = [];
  let overSeasonAvgLast5: Awaited<
    ReturnType<typeof getPlayersOverSeasonAvgLast5>
  > = [];
  let underSeasonAvgLast5: Awaited<
    ReturnType<typeof getPlayersUnderSeasonAvgLast5>
  > = [];
  let trendingPlayers: Awaited<ReturnType<typeof getTrendingPlayers>> = [];
  let topPicks: Awaited<ReturnType<typeof getTopPicks>> = {
    picks: [],
    propDate: null,
  };
  let underPicks: Awaited<ReturnType<typeof getUnderPicks>> = {
    picks: [],
    propDate: null,
  };
  let backtestResults: Awaited<ReturnType<typeof getBacktestResults>> = {
    gameDate: "",
    picks: [],
  };
  let lastUpdated: string | null = null;
  let hasError = false;

  try {
    [
      featuredData,
      overSeasonAvgLast5,
      underSeasonAvgLast5,
      trendingPlayers,
      topPicks,
      underPicks,
      backtestResults,
      lastUpdated,
    ] = await Promise.all([
      getPlayerData(FEATURED_PLAYER, 10),
      getPlayersOverSeasonAvgLast5(8),
      getPlayersUnderSeasonAvgLast5(8),
      getTrendingPlayers(8),
      getTopPicks(25),
      getUnderPicks(25),
      getBacktestResults(),
      getLastDataUpdate(),
    ]);
  } catch (e) {
    console.error("Homepage data load failed:", e);
    hasError = true;
  }

  return (
    <>
      <HomepageContent
        featuredPlayerName={FEATURED_PLAYER}
        featuredPlayerData={featuredData}
        overSeasonAvgLast5={overSeasonAvgLast5}
        underSeasonAvgLast5={underSeasonAvgLast5}
        trendingPlayers={trendingPlayers}
        topPicks={topPicks.picks}
        underPicks={underPicks.picks}
        propDate={topPicks.propDate ?? underPicks.propDate}
        backtestResults={backtestResults}
        lastUpdated={lastUpdated}
        hasError={hasError}
      />

      {/* Server-rendered SEO content — visible to crawlers */}
      <section className="mt-16 mb-8 max-w-3xl">
        <h2 className="text-xl font-bold text-pe-text-secondary mb-4">
          NBA Player Prop Trends &amp; Analytics — Powered by Data
        </h2>
        <div className="space-y-3 text-sm text-pe-text-muted leading-relaxed">
          <p>
            PropEdge tracks over 515 NBA players across 26 stat categories, updated
            daily with the latest game data from Basketball Reference. Whether you are
            researching points, rebounds, assists, threes, or steals, every prop trend
            is backed by real box-score data.
          </p>
          <p>
            Our hot streak and cold spell detection compares each player&#39;s recent
            performance against their season averages. When a player beats their season
            average in their last five games, they show up on the hot list. When they
            fall short, they land on the cold list. Trending players are those on
            sustained multi-game runs that signal a shift in performance.
          </p>
          <p>
            Every player page includes a full game log, home and away splits, matchup
            history, and prop line overlays. Use the edge finder to compare a
            player&#39;s recent output against specific prop lines and see hit rates at
            a glance. PropEdge is free, fast, and built for anyone who wants to find
            their edge on NBA player props with data.
          </p>
        </div>
      </section>
    </>
  );
}
