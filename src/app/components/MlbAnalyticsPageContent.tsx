import Link from "next/link";
import type {
  MlbDataCoverage,
  MlbParkFactor,
  MlbSupportedMarket,
} from "@/lib/data";
import type { MlbStarterGame } from "@/lib/mlbStarters";
import { normalizeMlbTeamCode } from "@/lib/leagues";
import MlbStartersToday from "@/app/components/MlbStartersToday";

function pfClass(value: number | null): string {
  if (value == null) return "bg-zinc-500/15 text-zinc-400";
  if (value > 103) return "bg-emerald-500/15 text-emerald-400";
  if (value < 97) return "bg-red-500/15 text-red-400";
  return "bg-zinc-700/40 text-pe-text-muted";
}

function pfLabel(value: number | null): string {
  return value == null ? "—" : value.toFixed(0);
}

function marketClass(playerType: "Batter" | "Pitcher"): string {
  return playerType === "Batter"
    ? "bg-emerald-500/12 border-emerald-500/20 text-emerald-300"
    : "bg-sky-500/12 border-sky-500/20 text-sky-300";
}

function statusClass(live: boolean): string {
  return live
    ? "bg-emerald-500/12 text-emerald-300 border-emerald-500/20"
    : "bg-amber-500/12 text-amber-300 border-amber-500/20";
}

function StatBar({
  items,
}: {
  items: Array<{ label: string; value: string; detail: string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl px-4 py-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-pe-text-faint">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-black text-pe-text-primary">{item.value}</p>
          <p className="mt-1 text-xs text-pe-text-faint">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

function CoverageRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  const live = value > 0;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-pe-border/8 py-3 last:border-0">
      <div>
        <p className="text-sm font-semibold text-pe-text-primary">{label}</p>
        <p className="text-xs text-pe-text-faint">{detail}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-pe-text-secondary">{value.toLocaleString()}</span>
        <span
          className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${statusClass(live)}`}
        >
          {live ? "Live" : "Pending"}
        </span>
      </div>
    </div>
  );
}

function Leaderboard({
  title,
  rows,
}: {
  title: string;
  rows: MlbParkFactor[];
}) {
  return (
    <section className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-pe-text-primary">{title}</h2>
        <span className="text-[10px] uppercase tracking-[0.22em] text-pe-text-faint">
          Runs / HR / K
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((team) => (
          <Link
            key={`${title}-${team.teamId}`}
            href={`/mlb/team/${team.teamCode}`}
            className="flex items-center justify-between gap-4 rounded-xl border border-pe-border/8 px-3 py-3 transition-colors hover:border-pe-border/20 hover:bg-pe-surface-2/35"
          >
            <div>
              <p className="text-sm font-semibold text-pe-text-primary">
                {normalizeMlbTeamCode(team.teamCode)}
              </p>
              <p className="text-xs text-pe-text-faint">{team.teamName}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className={`rounded-md px-2 py-1 ${pfClass(team.pfRuns)}`}>
                R {pfLabel(team.pfRuns)}
              </span>
              <span className={`rounded-md px-2 py-1 ${pfClass(team.pfHr)}`}>
                HR {pfLabel(team.pfHr)}
              </span>
              <span className={`rounded-md px-2 py-1 ${pfClass(team.pfK)}`}>
                K {pfLabel(team.pfK)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function MlbAnalyticsPageContent({
  parkFactors,
  playerCount,
  supportedMarkets,
  coverage,
  starterGames,
}: {
  parkFactors: MlbParkFactor[];
  playerCount: number;
  supportedMarkets: MlbSupportedMarket[];
  coverage: MlbDataCoverage;
  starterGames: MlbStarterGame[];
}) {
  const batterMarkets = supportedMarkets.filter((market) => market.playerType === "Batter");
  const pitcherMarkets = supportedMarkets.filter((market) => market.playerType === "Pitcher");
  const hitterFriendly = [...parkFactors]
    .sort((a, b) => (b.pfRuns ?? 0) - (a.pfRuns ?? 0))
    .slice(0, 5);
  const pitcherFriendly = [...parkFactors]
    .sort((a, b) => (a.pfRuns ?? 999) - (b.pfRuns ?? 999))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-pe-bg">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
        <section className="rounded-[2rem] border border-pe-border/10 bg-pe-surface-1 px-5 py-6 md:px-7 md:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-pe-accent/12 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-pe-accent-strong">
                  MLB
                </span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-pe-text-faint">
                  Analytics
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-pe-text-primary md:text-4xl">
                MLB analytics now has its own lane.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-pe-text-muted">
                Live starter context, full park-factor coverage, and the exact MLB prop markets
                already supported by the model layer are surfaced here. Line-level picks will
                populate automatically when MLB props and predictions start landing in the shared
                tables.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/mlb/slate"
                className="rounded-full border border-pe-accent/25 bg-pe-accent/12 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pe-accent-strong"
              >
                Open MLB Slate
              </Link>
              <Link
                href="/mlb"
                className="rounded-full border border-pe-border/14 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pe-text-muted hover:text-pe-text-primary"
              >
                Team Directory
              </Link>
            </div>
          </div>
        </section>

        <StatBar
          items={[
            {
              label: "Players Tracked",
              value: playerCount.toLocaleString(),
              detail: "Baseball Reference player directory loaded.",
            },
            {
              label: "Markets Supported",
              value: supportedMarkets.length.toString(),
              detail: `${batterMarkets.length} batter markets and ${pitcherMarkets.length} pitcher markets.`,
            },
            {
              label: "Starter Board",
              value: starterGames.length.toString(),
              detail: "Today's probable starters from the MLB Stats API.",
            },
            {
              label: "Park Factors",
              value: parkFactors.length.toString(),
              detail: "All MLB parks ranked off the current season file.",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-pe-text-primary">Coverage status</h2>
                <p className="mt-1 text-xs text-pe-text-faint">
                  What the MLB surface can already render from the shared data warehouse.
                </p>
              </div>
              <span className="rounded-full bg-pe-surface-2 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-pe-text-faint">
                Auto-updating
              </span>
            </div>

            <div className="mt-4">
              <CoverageRow
                label="MLB teams"
                value={coverage.teamCount}
                detail="Shared team directory rows available for routing and matchup joins."
              />
              <CoverageRow
                label="Tracked games"
                value={coverage.gameCount}
                detail="MLB rows currently present in the shared games table."
              />
              <CoverageRow
                label="Batter game logs"
                value={coverage.batterGameLogCount}
                detail="Required for hitter form tables and batter-side model edges."
              />
              <CoverageRow
                label="Pitcher game logs"
                value={coverage.pitcherGameLogCount}
                detail="Required for strikeout, earned-run, and outs modeling."
              />
              <CoverageRow
                label="Team stats"
                value={coverage.teamStatCount}
                detail="Used for opponent context once the MLB team pipeline is filled."
              />
              <CoverageRow
                label="Live MLB props"
                value={coverage.propCount}
                detail="Line rows already present in the shared player_props table."
              />
              <CoverageRow
                label="MLB predictions"
                value={coverage.predictionCount}
                detail="Model outputs already written to mlb_predictions."
              />
            </div>
          </section>

          <section className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-5">
            <h2 className="text-base font-bold text-pe-text-primary">Supported markets</h2>
            <p className="mt-1 text-xs text-pe-text-faint">
              These market codes already exist in `prop_markets` and in the MLB model routing.
            </p>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pe-text-faint">
                Batter markets
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {batterMarkets.map((market) => (
                  <span
                    key={market.marketCode}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${marketClass(market.playerType)}`}
                  >
                    {market.marketName}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pe-text-faint">
                Pitcher markets
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pitcherMarkets.map((market) => (
                  <span
                    key={market.marketCode}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${marketClass(market.playerType)}`}
                  >
                    {market.marketName}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <MlbStartersToday games={starterGames} title="Today’s probable starters" />

        <div className="grid gap-6 xl:grid-cols-2">
          <Leaderboard title="Most hitter-friendly parks" rows={hitterFriendly} />
          <Leaderboard title="Most pitcher-friendly parks" rows={pitcherFriendly} />
        </div>
      </div>
    </div>
  );
}
