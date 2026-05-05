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

function TeamCard({ team }: { team: MlbParkFactor }) {
  const code = normalizeMlbTeamCode(team.teamCode);

  return (
    <Link
      href={`/mlb/team/${team.teamCode}`}
      className="bg-pe-surface-1 border border-pe-border/10 rounded-xl p-4 flex flex-col gap-3 hover:border-pe-border/25 hover:bg-pe-surface-2/50 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-pe-surface-2 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-pe-text-muted tracking-tight">
            {code}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-pe-text-primary truncate">{team.teamName}</p>
          <p className="text-xs text-pe-text-faint">{team.season}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-pe-border/10 pt-3">
        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${pfClass(team.pfRuns)}`}>
          R {pfLabel(team.pfRuns)}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${pfClass(team.pfHr)}`}>
          HR {pfLabel(team.pfHr)}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${pfClass(team.pfHits)}`}>
          H {pfLabel(team.pfHits)}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${pfClass(team.pfK)}`}>
          K {pfLabel(team.pfK)}
        </span>
      </div>
    </Link>
  );
}

function SectionCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl px-5 py-5 transition-colors hover:border-pe-border/20 hover:bg-pe-surface-2/35"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-pe-text-faint">
        MLB
      </p>
      <h2 className="mt-3 text-lg font-black text-pe-text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-pe-text-muted">{description}</p>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-pe-text-secondary">
        {cta}
      </p>
    </Link>
  );
}

export default function MlbPageContent({
  parkFactors,
  coverage,
  starterGames,
  supportedMarkets,
}: {
  parkFactors: MlbParkFactor[];
  coverage: MlbDataCoverage;
  starterGames: MlbStarterGame[];
  supportedMarkets: MlbSupportedMarket[];
}) {
  return (
    <div className="min-h-screen bg-pe-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
        <section className="rounded-[2rem] border border-pe-border/10 bg-pe-surface-1 px-5 py-6 md:px-7 md:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-pe-accent/12 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-pe-accent-strong">
                  MLB
                </span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-pe-text-faint">
                  Section Hub
                </span>
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight text-pe-text-primary">
                Baseball now lives in the main product flow.
              </h1>
              <p className="mt-3 max-w-2xl text-sm md:text-base leading-6 text-pe-text-muted">
                The MLB section now has its own analytics page, its own slate view, and live
                starter plus park-factor context. Team profiles stay connected to that same data
                layer so the whole baseball side of the site uses one shared model.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/mlb/analytics"
                className="rounded-full border border-pe-accent/25 bg-pe-accent/12 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pe-accent-strong"
              >
                MLB Analytics
              </Link>
              <Link
                href="/mlb/slate"
                className="rounded-full border border-pe-border/14 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pe-text-muted hover:text-pe-text-primary"
              >
                MLB Slate
              </Link>
            </div>
          </div>
        </section>

        <StatBar
          items={[
            {
              label: "Teams",
              value: coverage.teamCount.toString(),
              detail: "Shared MLB team directory loaded.",
            },
            {
              label: "Players",
              value: coverage.playerCount.toLocaleString(),
              detail: "Baseball Reference player profiles in the DB.",
            },
            {
              label: "Markets",
              value: supportedMarkets.length.toString(),
              detail: "Recognized MLB prop markets ready for line rows.",
            },
            {
              label: "Starter Board",
              value: starterGames.length.toString(),
              detail: "Today's probable starters from the live MLB feed.",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Analytics"
            description="League-wide park-factor leaderboards, supported market coverage, and a transparent status view of what MLB data is already live in the warehouse."
            href="/mlb/analytics"
            cta="Open analytics"
          />
          <SectionCard
            title="Slate"
            description="Today's matchups organized around probable starters and home-park conditions, with the prop table already prepared to surface MLB lines when they start writing into the shared feed."
            href="/mlb/slate"
            cta="Open slate"
          />
        </div>

        <MlbStartersToday games={starterGames} />

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-pe-text-primary">Park factors by team</h2>
              <p className="mt-1 text-xs text-pe-text-faint">
                Base 100 equals league average. Above 100 leans hitter-friendly; below 100 leans
                pitcher-friendly.
              </p>
            </div>
            <span className="text-xs text-pe-text-faint">{parkFactors.length} teams</span>
          </div>

          {parkFactors.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {parkFactors.map((team) => (
                <TeamCard key={team.teamId} team={team} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-pe-border/10 bg-pe-surface-1 px-5 py-12 text-center">
              <p className="text-pe-text-faint text-sm">No park factor data available.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
