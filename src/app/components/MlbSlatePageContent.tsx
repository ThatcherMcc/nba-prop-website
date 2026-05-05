import Link from "next/link";
import type {
  MlbParkFactor,
  MlbSlatePropsResult,
  MlbSupportedMarket,
} from "@/lib/data";
import type { MlbStarterGame } from "@/lib/mlbStarters";
import { normalizeMlbTeamCode } from "@/lib/leagues";

function pfClass(value: number | null): string {
  if (value == null) return "bg-zinc-500/15 text-zinc-400";
  if (value > 103) return "bg-emerald-500/15 text-emerald-400";
  if (value < 97) return "bg-red-500/15 text-red-400";
  return "bg-zinc-700/40 text-pe-text-muted";
}

function pfLabel(value: number | null): string {
  return value == null ? "—" : value.toFixed(0);
}

function formatGameTime(time: string): string {
  if (!time) return "TBD";
  const [hStr, mStr] = time.split(":");
  const hour = parseInt(hStr, 10);
  const minute = mStr ?? "00";
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${hour12}:${minute} ET`;
}

function formatPropDate(propDate: string | null): string {
  if (!propDate) return "Awaiting lines";
  return new Date(`${propDate}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function parkTone(park: MlbParkFactor | undefined): string {
  if (!park?.pfRuns) return "Neutral";
  if (park.pfRuns > 103) return "Hitter-friendly";
  if (park.pfRuns < 97) return "Pitcher-friendly";
  return "Neutral";
}

function parkTakeaways(park: MlbParkFactor | undefined): string[] {
  if (!park) {
    return ["Park factors not loaded for this venue yet."];
  }

  const takeaways: string[] = [];

  if ((park.pfRuns ?? 100) > 103) takeaways.push("Run scoring trends above league average.");
  if ((park.pfRuns ?? 100) < 97) takeaways.push("Run scoring trends below league average.");
  if ((park.pfHr ?? 100) > 103) takeaways.push("Home-run environment grades well above average.");
  if ((park.pfHr ?? 100) < 97) takeaways.push("Home runs are suppressed here more often than average.");
  if ((park.pfK ?? 100) > 103) takeaways.push("Strikeout environment tends to run hot.");
  if ((park.pfK ?? 100) < 97) takeaways.push("Strikeout environment tends to run light.");

  return takeaways.length > 0 ? takeaways.slice(0, 2) : ["Most indicators sit close to league average."];
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

function MatchupCard({
  game,
  park,
}: {
  game: MlbStarterGame;
  park: MlbParkFactor | undefined;
}) {
  const parkHref = park ? `/mlb/team/${park.teamCode}` : "/mlb";
  const parkLabel = park ? normalizeMlbTeamCode(park.teamCode) : game.home_team;

  return (
    <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pe-text-faint">
            {formatGameTime(game.game_time)}
          </p>
          <h2 className="mt-2 text-lg font-black text-pe-text-primary">
            {game.away_team} @ {game.home_team}
          </h2>
          <p className="mt-1 text-xs text-pe-text-faint">{game.status}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${pfClass(park?.pfRuns ?? null)}`}>
          {parkTone(park)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-pe-border/8 bg-pe-surface-2/35 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pe-text-faint">
            Away starter
          </p>
          <p className="mt-2 text-sm font-semibold text-pe-text-primary">
            {game.away_pitcher.name}
          </p>
        </div>
        <div className="rounded-xl border border-pe-border/8 bg-pe-surface-2/35 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pe-text-faint">
            Home starter
          </p>
          <p className="mt-2 text-sm font-semibold text-pe-text-primary">
            {game.home_pitcher.name}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${pfClass(park?.pfRuns ?? null)}`}>
          Runs {pfLabel(park?.pfRuns ?? null)}
        </span>
        <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${pfClass(park?.pfHr ?? null)}`}>
          HR {pfLabel(park?.pfHr ?? null)}
        </span>
        <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${pfClass(park?.pfHits ?? null)}`}>
          Hits {pfLabel(park?.pfHits ?? null)}
        </span>
        <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${pfClass(park?.pfK ?? null)}`}>
          K {pfLabel(park?.pfK ?? null)}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {parkTakeaways(park).map((takeaway) => (
          <p key={takeaway} className="text-sm text-pe-text-muted">
            {takeaway}
          </p>
        ))}
      </div>

      <div className="mt-5">
        <Link
          href={parkHref}
          className="text-xs font-medium uppercase tracking-[0.22em] text-pe-text-secondary hover:text-pe-text-primary"
        >
          Open {parkLabel} park profile
        </Link>
      </div>
    </div>
  );
}

export default function MlbSlatePageContent({
  starterGames,
  parkFactors,
  supportedMarkets,
  slateProps,
}: {
  starterGames: MlbStarterGame[];
  parkFactors: MlbParkFactor[];
  supportedMarkets: MlbSupportedMarket[];
  slateProps: MlbSlatePropsResult;
}) {
  const parkMap = new Map(
    parkFactors.map((park) => [normalizeMlbTeamCode(park.teamCode), park] as const)
  );
  const todaysParks = starterGames
    .map((game) => parkMap.get(game.home_team))
    .filter((park): park is MlbParkFactor => Boolean(park));
  const hitterFriendlyCount = todaysParks.filter((park) => (park.pfRuns ?? 100) > 103).length;
  const pitcherFriendlyCount = todaysParks.filter((park) => (park.pfRuns ?? 100) < 97).length;

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
                  Slate
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-pe-text-primary md:text-4xl">
                Today’s MLB slate is organized around matchup context.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-pe-text-muted">
                The slate page is live off probable starters and park conditions today, with the
                prop table already wired to read MLB rows from the shared `player_props` table as
                soon as that feed is populated.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/mlb/analytics"
                className="rounded-full border border-pe-accent/25 bg-pe-accent/12 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pe-accent-strong"
              >
                Open MLB Analytics
              </Link>
              <span className="rounded-full border border-pe-border/14 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pe-text-muted">
                Prop date {formatPropDate(slateProps.propDate)}
              </span>
            </div>
          </div>
        </section>

        <StatBar
          items={[
            {
              label: "Games Today",
              value: starterGames.length.toString(),
              detail: "Probable starter board from the MLB schedule feed.",
            },
            {
              label: "Hitter Parks",
              value: hitterFriendlyCount.toString(),
              detail: "Today's home parks grading above 103 in run environment.",
            },
            {
              label: "Pitcher Parks",
              value: pitcherFriendlyCount.toString(),
              detail: "Today's home parks grading below 97 in run environment.",
            },
            {
              label: "Live MLB Lines",
              value: slateProps.props.length.toString(),
              detail: "Current MLB prop rows available for the selected slate date.",
            },
          ]}
        />

        <section>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-pe-text-primary">Matchup board</h2>
              <p className="mt-1 text-xs text-pe-text-faint">
                Park context is keyed off the home venue for each game.
              </p>
            </div>
          </div>

          {starterGames.length > 0 ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {starterGames.map((game) => (
                <MatchupCard
                  key={game.game_pk}
                  game={game}
                  park={parkMap.get(game.home_team)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-pe-border/10 bg-pe-surface-1 px-5 py-10 text-center">
              <p className="text-sm text-pe-text-faint">No MLB games are scheduled for today.</p>
            </div>
          )}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-pe-text-primary">Live prop board</h2>
                <p className="mt-1 text-xs text-pe-text-faint">
                  MLB prop rows will appear here automatically once the shared prop feed includes
                  MLB market codes.
                </p>
              </div>
              <span className="rounded-full bg-pe-surface-2 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-pe-text-faint">
                {slateProps.props.length} rows
              </span>
            </div>

            {slateProps.props.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-pe-border/10 text-[10px] uppercase tracking-[0.22em] text-pe-text-faint">
                      <th className="py-2 pr-4">Player</th>
                      <th className="py-2 pr-4">Team</th>
                      <th className="py-2 pr-4">Market</th>
                      <th className="py-2 pr-4">Line</th>
                      <th className="py-2">Game</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slateProps.props.map((prop) => (
                      <tr
                        key={`${prop.playerName}-${prop.marketCode}-${prop.homeTeam}-${prop.awayTeam}`}
                        className="border-b border-pe-border/6 last:border-0"
                      >
                        <td className="py-3 pr-4 font-semibold text-pe-text-primary">
                          {prop.playerName}
                        </td>
                        <td className="py-3 pr-4 text-pe-text-muted">
                          {prop.playerTeam ? normalizeMlbTeamCode(prop.playerTeam) : "—"}
                        </td>
                        <td className="py-3 pr-4 text-pe-text-secondary">{prop.marketName}</td>
                        <td className="py-3 pr-4 font-mono text-pe-text-primary">
                          {prop.bookLine ?? "—"}
                        </td>
                        <td className="py-3 text-pe-text-muted">
                          {normalizeMlbTeamCode(prop.awayTeam)} @ {normalizeMlbTeamCode(prop.homeTeam)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-pe-border/12 px-4 py-6">
                <p className="text-sm text-pe-text-primary">
                  No MLB prop lines are stored for the selected slate date yet.
                </p>
                <p className="mt-2 text-xs leading-5 text-pe-text-faint">
                  The matchup cards and park context are live now. Once MLB rows land in
                  `player_props`, this table will populate without another frontend change.
                </p>
              </div>
            )}
          </section>

          <section className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-5">
            <h2 className="text-base font-bold text-pe-text-primary">Markets ready for lines</h2>
            <p className="mt-1 text-xs text-pe-text-faint">
              The backend already recognizes these MLB markets, so the slate UI is prepared for
              them as soon as the feed starts writing rows.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {supportedMarkets.map((market) => (
                <span
                  key={market.marketCode}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                    market.playerType === "Batter"
                      ? "bg-emerald-500/12 border-emerald-500/20 text-emerald-300"
                      : "bg-sky-500/12 border-sky-500/20 text-sky-300"
                  }`}
                >
                  {market.marketName}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
