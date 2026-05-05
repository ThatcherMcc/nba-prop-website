import Link from "next/link";
import type {
  MlbDataCoverage,
  MlbParkFactor,
  MlbSlatePropsResult,
  MlbSupportedMarket,
} from "@/lib/data";
import type { MlbStarterGame } from "@/lib/mlbStarters";
import { normalizeMlbTeamCode } from "@/lib/leagues";
import MlbStartersToday from "@/app/components/MlbStartersToday";

function pfClass(value: number | null): string {
  if (value == null) return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
  if (value > 103) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  if (value < 97) return "bg-sky-500/15 text-sky-400 border-sky-500/20";
  return "bg-pe-surface-2 text-pe-text-muted border-pe-border/10";
}

function statusClass(live: boolean): string {
  return live
    ? "bg-emerald-500/12 text-emerald-300 border-emerald-500/20"
    : "bg-amber-500/12 text-amber-300 border-amber-500/20";
}

function formatRelativeTimeShort(value: string | null) {
  if (!value) return "Updating...";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 60) return `${Math.max(minutes, 0)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function LivePropsSection({ slateProps }: { slateProps: MlbSlatePropsResult }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
            Live MLB Lines
          </h2>
          <p className="text-xs text-pe-text-faint">
            Current MLB market rows coming from the shared prop feed
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-pe-border/5 bg-pe-surface-1/60">
        {slateProps.props.length > 0 ? (
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-pe-border/10 text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
                <th className="w-[28%] px-4 py-3 text-left">Player</th>
                <th className="w-[16%] px-3 py-3 text-left">Team</th>
                <th className="w-[22%] px-3 py-3 text-left">Market</th>
                <th className="w-[14%] px-3 py-3 text-right">Line</th>
                <th className="w-[20%] px-4 py-3 text-right">Game</th>
              </tr>
            </thead>
            <tbody>
              {slateProps.props.map((prop, index) => (
                <tr
                  key={`${prop.playerName}-${prop.marketCode}-${index}`}
                  className="border-b border-pe-border/5 last:border-0 hover:bg-pe-surface-2/20 transition-colors"
                >
                  <td className="px-4 py-4 md:py-3">
                    <span className="block truncate text-base font-bold text-pe-text-primary md:text-sm">
                      {prop.playerName}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-pe-text-secondary md:py-3 md:text-sm">
                    {prop.playerTeam ? normalizeMlbTeamCode(prop.playerTeam) : "—"}
                  </td>
                  <td className="px-3 py-4 md:py-3">
                    <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold ${pfClass(prop.bookLine)}`}>
                      {prop.marketCode.replace("MLB_", "")}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right font-mono text-base text-pe-text-secondary md:py-3 md:text-sm">
                    {prop.bookLine ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right text-pe-text-muted md:py-3 md:text-sm">
                    {normalizeMlbTeamCode(prop.awayTeam)} @ {normalizeMlbTeamCode(prop.homeTeam)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-10 text-center text-pe-text-faint text-sm">
            No MLB prop rows are stored for today yet.
          </div>
        )}
      </div>
    </section>
  );
}

function CoverageSection({ coverage, lastUpdated }: { coverage: MlbDataCoverage; lastUpdated: string | null }) {
  const rows = [
    { label: "MLB teams", value: coverage.teamCount, detail: "Team directory rows ready for routing and joins." },
    { label: "Tracked players", value: coverage.playerCount, detail: "Baseball Reference player profiles loaded into the DB." },
    { label: "Tracked games", value: coverage.gameCount, detail: "MLB games currently present in the shared games table." },
    { label: "Batter logs", value: coverage.batterGameLogCount, detail: "Required for hitter form and batter-side model inputs." },
    { label: "Pitcher logs", value: coverage.pitcherGameLogCount, detail: "Required for strikeout, outs, and earned-run modeling." },
    { label: "Team stats", value: coverage.teamStatCount, detail: "Opponent context tables for the MLB model layer." },
    { label: "Live props", value: coverage.propCount, detail: "Rows currently present in the shared player_props table." },
    { label: "Predictions", value: coverage.predictionCount, detail: "Model outputs already written to mlb_predictions." },
  ];

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📡</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
            Coverage Status
          </h2>
          <p className="text-xs text-pe-text-faint">
            Updated {formatRelativeTimeShort(lastUpdated)} across the baseball warehouse layer
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-pe-border/5 bg-pe-surface-1/60">
        <div className="px-4 py-3 border-b border-pe-border/10 text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
          MLB data readiness
        </div>
        <div className="divide-y divide-pe-border/5">
          {rows.map((row) => {
            const live = row.value > 0;
            return (
              <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-pe-text-primary">{row.label}</p>
                  <p className="text-xs text-pe-text-faint">{row.detail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-pe-text-secondary">
                    {row.value.toLocaleString()}
                  </span>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${statusClass(live)}`}>
                    {live ? "Live" : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ParkCardsSection({
  title,
  subtitle,
  emoji,
  borderTone,
  badgeTone,
  rows,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  borderTone: string;
  badgeTone: string;
  rows: MlbParkFactor[];
}) {
  if (rows.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
            {title}
          </h2>
          <p className="text-xs text-pe-text-faint">{subtitle}</p>
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {rows.map((park) => (
          <Link
            key={`${title}-${park.teamId}`}
            href={`/mlb/team/${park.teamCode}`}
            className={`flex flex-col items-start gap-2 rounded-xl bg-pe-surface-1/60 border border-pe-border/5 border-l-4 ${borderTone} px-5 py-4 transition-all hover:bg-white/[0.02] text-left`}
          >
            <span className="text-base font-bold text-pe-text-primary truncate w-full">
              {normalizeMlbTeamCode(park.teamCode)}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${badgeTone}`}>
              Runs {park.pfRuns?.toFixed(0) ?? "—"}
            </span>
            <div className="w-full space-y-0.5">
              <div className="flex justify-between text-sm">
                <span className="text-pe-text-faint">HR</span>
                <span className="font-bold text-pe-text-primary">{park.pfHr?.toFixed(0) ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-pe-text-faint">Hits</span>
                <span className="text-pe-text-muted">{park.pfHits?.toFixed(0) ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-pe-border/5">
                <span className="text-pe-text-faint">K</span>
                <span className="font-bold text-pe-text-secondary">{park.pfK?.toFixed(0) ?? "—"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="md:hidden space-y-3">
        {rows.map((park) => (
          <Link
            key={`${title}-mobile-${park.teamId}`}
            href={`/mlb/team/${park.teamCode}`}
            className={`block rounded-xl bg-pe-surface-1/60 border border-pe-border/5 border-l-4 ${borderTone} px-5 py-4`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-lg font-bold text-pe-text-primary">
                {normalizeMlbTeamCode(park.teamCode)}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${badgeTone}`}>
                Runs {park.pfRuns?.toFixed(0) ?? "—"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-pe-text-faint">HR</p>
                <p className="font-bold text-pe-text-primary">{park.pfHr?.toFixed(0) ?? "—"}</p>
              </div>
              <div>
                <p className="text-pe-text-faint">Hits</p>
                <p className="font-bold text-pe-text-primary">{park.pfHits?.toFixed(0) ?? "—"}</p>
              </div>
              <div>
                <p className="text-pe-text-faint">K</p>
                <p className="font-bold text-pe-text-primary">{park.pfK?.toFixed(0) ?? "—"}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SupportedMarketsSection({ supportedMarkets }: { supportedMarkets: MlbSupportedMarket[] }) {
  if (supportedMarkets.length === 0) return null;

  const batterMarkets = supportedMarkets.filter((market) => market.playerType === "Batter");
  const pitcherMarkets = supportedMarkets.filter((market) => market.playerType === "Pitcher");

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🧩</span>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-pe-text-primary">
            Markets Ready
          </h2>
          <p className="text-xs text-pe-text-faint">
            These MLB markets are already recognized in the shared routing layer
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-pe-border/5 bg-pe-surface-1/60 px-5 py-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pe-text-faint">
            Batter markets
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {batterMarkets.map((market) => (
              <span
                key={market.marketCode}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/12 px-3 py-1.5 text-[11px] font-semibold text-emerald-300"
              >
                {market.marketName}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-pe-border/5 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pe-text-faint">
            Pitcher markets
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {pitcherMarkets.map((market) => (
              <span
                key={market.marketCode}
                className="rounded-full border border-sky-500/20 bg-sky-500/12 px-3 py-1.5 text-[11px] font-semibold text-sky-300"
              >
                {market.marketName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MlbAnalyticsPageContent({
  parkFactors,
  supportedMarkets,
  coverage,
  starterGames,
  slateProps,
  lastUpdated,
}: {
  parkFactors: MlbParkFactor[];
  supportedMarkets: MlbSupportedMarket[];
  coverage: MlbDataCoverage;
  starterGames: MlbStarterGame[];
  slateProps: MlbSlatePropsResult;
  lastUpdated: string | null;
}) {
  const hitterFriendly = [...parkFactors]
    .sort((a, b) => (b.pfRuns ?? 0) - (a.pfRuns ?? 0))
    .slice(0, 5);
  const pitcherFriendly = [...parkFactors]
    .sort((a, b) => (a.pfRuns ?? 999) - (b.pfRuns ?? 999))
    .slice(0, 5);

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

      <LivePropsSection slateProps={slateProps} />
      <CoverageSection coverage={coverage} lastUpdated={lastUpdated} />
      <ParkCardsSection
        title="Hitter-Friendly Parks"
        subtitle="The run environments currently grading highest above league average"
        emoji="🔥"
        borderTone="border-l-emerald-500"
        badgeTone="bg-emerald-500/15 text-emerald-400"
        rows={hitterFriendly}
      />
      <ParkCardsSection
        title="Pitcher-Friendly Parks"
        subtitle="The run environments currently suppressing scoring the most"
        emoji="🧊"
        borderTone="border-l-sky-500"
        badgeTone="bg-sky-500/15 text-sky-400"
        rows={pitcherFriendly}
      />
      <SupportedMarketsSection supportedMarkets={supportedMarkets} />

      <div className="border-t border-pe-border/5 my-10" />

      <MlbStartersToday games={starterGames} title="Today’s probable starters" />
    </>
  );
}
