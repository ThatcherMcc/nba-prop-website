import Link from "next/link";
import type {
  MlbDataCoverage,
  MlbParkFactor,
  MlbSupportedMarket,
} from "@/lib/data";
import type { MlbStarterGame } from "@/lib/mlbStarters";

function formatTimestamp(value: string | null) {
  if (!value) return "Awaiting latest sync";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function classifyPark(value: number | null) {
  if (value == null) return "No data";
  if (value > 103) return "Hitter-friendly";
  if (value < 97) return "Pitcher-friendly";
  return "Neutral";
}

export default function MlbPageContent({
  parkFactors,
  coverage,
  starterGames,
  supportedMarkets,
  lastUpdated,
}: {
  parkFactors: MlbParkFactor[];
  coverage: MlbDataCoverage;
  starterGames: MlbStarterGame[];
  supportedMarkets: MlbSupportedMarket[];
  lastUpdated: string | null;
}) {
  const hitterFriendlyCount = parkFactors.filter((park) => (park.pfRuns ?? 100) > 103).length;
  const pitcherFriendlyCount = parkFactors.filter((park) => (park.pfRuns ?? 100) < 97).length;
  const neutralParkCount = Math.max(parkFactors.length - hitterFriendlyCount - pitcherFriendlyCount, 0);
  const parkBreakdown = [
    { rate: hitterFriendlyCount, label: "Hitter parks", tone: "bg-emerald-400/85", text: "text-emerald-300" },
    { rate: neutralParkCount, label: "Neutral parks", tone: "bg-pe-accent/85", text: "text-pe-accent-strong" },
    { rate: pitcherFriendlyCount, label: "Pitcher parks", tone: "bg-rose-400/72", text: "text-rose-300" },
  ];
  const maxBucket = Math.max(...parkBreakdown.map((item) => item.rate), 1);
  const featuredStarter = starterGames[0] ?? null;
  const featuredPark = parkFactors[0] ?? null;
  const featureRows = [
    {
      href: "/mlb/slate",
      label: "Slate desk",
      eyebrow: "Live board",
      summary: "Today's MLB slate in the same card-by-card board format, organized around starters, park context, and live prop rows.",
      accent: "text-pe-text-secondary",
    },
    {
      href: "/mlb/analytics",
      label: "Trend engine",
      eyebrow: "Data coverage",
      summary: "Coverage checks, park leaderboards, supported markets, and readiness signals for the baseball side of the product.",
      accent: "text-pe-text-secondary",
    },
    {
      href: featuredPark ? `/mlb/team/${featuredPark.teamCode}` : "/mlb",
      label: "Park dossiers",
      eyebrow: "Venue layer",
      summary: "Each MLB team page stays attached to its run, home-run, hit, and strikeout environment so context stays readable.",
      accent: "text-pe-accent-strong",
    },
    {
      href: "/track-record",
      label: "Editorial review",
      eyebrow: "Weekly signal",
      summary: "The same track-record and recap surfaces remain available while the baseball model layer fills in more live outputs.",
      accent: "text-pe-accent-strong",
    },
  ];

  return (
    <div className="relative flex flex-col gap-12 pb-8 md:gap-24 md:pb-10">
      <section
        className="relative left-1/2 right-1/2 -mt-[7.25rem] w-screen -translate-x-1/2 overflow-hidden border-b border-pe-accent/10 pt-[7.25rem] md:-mt-[8.5rem] md:pt-[8.5rem]"
        style={{ backgroundColor: "rgb(var(--pe-bg-rgb))" }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 24% 18%, rgb(var(--pe-accent) / 0.18), transparent 18%), radial-gradient(circle at 76% 44%, rgb(var(--pe-accent) / 0.1), transparent 24%), linear-gradient(180deg, rgb(var(--pe-bg-rgb)) 0%, rgb(var(--pe-bg-rgb)) 42%, rgb(var(--pe-bg-rgb)) 100%)",
            }}
          />
          <div className="absolute inset-0 opacity-90">
            <svg
              className="h-full w-full"
              viewBox="0 0 1440 960"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M0 710C137 671 213 598 332 570C449 543 503 602 617 561C758 511 764 387 907 343C1031 305 1146 351 1440 234"
                stroke="rgb(var(--pe-accent) / 0.28)"
                strokeWidth="2"
              />
              <path
                d="M0 794C146 761 223 708 358 676C494 644 563 708 689 671C830 629 866 505 1005 460C1136 418 1248 442 1440 397"
                stroke="rgb(var(--pe-accent) / 0.18)"
                strokeWidth="2"
              />
              <path
                d="M0 880C181 836 256 796 416 773C558 752 635 786 772 748C913 709 963 606 1094 561C1203 524 1298 516 1440 482"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#060708]" />
        </div>

        <div className="relative mx-auto grid h-[calc(100svh-6.55rem)] max-h-[calc(100svh-6.55rem)] w-full max-w-[1600px] items-start gap-3 overflow-hidden px-5 pt-0 pb-4 md:h-[calc(100svh-6rem)] md:max-h-[calc(100svh-6rem)] md:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)] md:gap-8 md:px-10 md:pt-1 md:pb-8">
          <div className="max-w-3xl self-start pt-2 pl-2 -translate-y-4 md:self-center md:pt-0 md:pl-0 md:-translate-y-10 md:pr-6">
            <div className="pl-0.5 md:pl-0">
              <div className="hero-reveal">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-pe-accent">
                  Analytics Desk
                </span>
              </div>
              <div className="hero-reveal hero-reveal-delay-1 mt-3 md:mt-4">
                <p className="relative mb-2 pl-5 font-mono text-[0.64rem] uppercase tracking-[0.24em] text-pe-text-secondary md:mb-3 md:text-[0.68rem] md:tracking-[0.26em]">
                  <span className="animate-pulse-live absolute left-0 top-1/2 inline-block h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-pe-accent" />
                  Last Updated {formatTimestamp(lastUpdated)}
                </p>
              </div>
            </div>
            <div className="hero-reveal hero-reveal-delay-1 mt-3 md:mt-4">
              <h1 className="max-w-4xl text-[2.65rem] font-semibold uppercase leading-[0.9] tracking-[-0.055em] text-pe-text-primary sm:text-5xl md:text-6xl lg:text-[5.75rem]">
                <span className="block text-pe-text-primary">Read The</span>
                <span className="block text-pe-accent">MLB Board</span>
              </h1>
            </div>
            <div className="hero-reveal hero-reveal-delay-2 mt-2 max-w-md md:mt-3">
              <p className="text-[0.92rem] leading-5 text-pe-text-body md:text-base md:leading-6">
                Same product flow as NBA. Different league, different markets, same operating surface.
              </p>
            </div>
            <div className="hero-reveal hero-reveal-delay-3 mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center md:mt-6 md:gap-3">
              <Link
                href="/mlb/slate"
                className="inline-flex items-center justify-center rounded-full border border-pe-accent/40 bg-pe-accent/12 px-5 py-2.5 text-[0.78rem] font-medium uppercase tracking-[0.2em] text-pe-accent-strong shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-pe-accent/18 md:px-6 md:py-3 md:text-sm md:tracking-[0.22em]"
              >
                Open today&apos;s slate
              </Link>
              <Link
                href="/mlb/analytics"
                className="line-link inline-flex w-fit items-center text-[0.78rem] font-medium uppercase tracking-[0.2em] text-pe-accent md:text-sm md:tracking-[0.22em]"
              >
                Explore the analytics layer
              </Link>
            </div>
          </div>

          <div className="hero-reveal hero-reveal-delay-2 mt-0 self-start -translate-y-5 md:mt-0 md:self-center md:-translate-y-6">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-pe-accent/15 bg-pe-surface-3/90 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.32)] md:rounded-[2rem] md:p-5">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pe-accent to-transparent opacity-70" />
              <div className="absolute -right-16 top-6 h-32 w-32 rounded-full bg-pe-accent/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between border-b border-white/8 pb-2.5 md:pb-3">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.24em] text-pe-text-faint md:text-[0.68rem] md:tracking-[0.26em]">
                      Live slate monitor
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold uppercase tracking-[0.08em] text-pe-text-primary md:mt-2 md:text-xl">
                      Tonight&apos;s board
                    </h2>
                  </div>
                  <span className="rounded-full border border-pe-accent/30 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-pe-accent md:px-3 md:text-[0.68rem] md:tracking-[0.24em]">
                    MLB
                  </span>
                </div>

                {featuredStarter ? (
                  <div className="mt-3 rounded-[1.15rem] border border-pe-accent/15 bg-[rgba(255,255,255,0.03)] px-3.5 py-3.5 md:mt-4 md:rounded-[1.35rem] md:px-4 md:py-4">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-pe-text-faint md:text-[0.64rem] md:tracking-[0.3em]">
                      Featured matchup
                    </p>
                    <div className="mt-2.5 flex items-end justify-between gap-3 md:mt-3 md:gap-4">
                      <div>
                        <p className="text-[2rem] font-semibold tracking-[-0.05em] text-pe-accent-strong md:text-4xl">
                          {starterGames.length}
                        </p>
                        <p className="mt-1.5 text-[0.66rem] uppercase tracking-[0.18em] text-pe-accent md:mt-2 md:text-[0.72rem] md:tracking-[0.22em]">
                          Games on today&apos;s board
                        </p>
                      </div>
                      <div className="rounded-full border border-pe-accent/20 bg-pe-accent/10 px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-pe-accent-strong md:px-3 md:text-[0.62rem] md:tracking-[0.24em]">
                        {classifyPark(featuredPark?.pfRuns ?? null)}
                      </div>
                    </div>

                    <p className="mt-3 text-base font-semibold uppercase tracking-[0.04em] text-pe-text-primary md:mt-4 md:text-lg">
                      {featuredStarter.away_team} @ {featuredStarter.home_team}
                    </p>
                    <p className="mt-1.5 text-[0.88rem] leading-5 text-pe-text-muted md:mt-2 md:text-sm md:leading-6">
                      {featuredStarter.away_pitcher.name} vs {featuredStarter.home_pitcher.name}. Park context and starter board stay attached to the live slate route.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-[1.15rem] border border-pe-accent/15 bg-[rgba(255,255,255,0.03)] px-3.5 py-3.5 md:mt-4 md:rounded-[1.35rem] md:px-4 md:py-4">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-pe-text-faint md:text-[0.64rem] md:tracking-[0.3em]">
                      Starter board
                    </p>
                    <p className="mt-2.5 text-[2rem] font-semibold tracking-[-0.05em] text-pe-accent-strong md:mt-3 md:text-4xl">
                      Live
                    </p>
                    <p className="mt-2 text-[0.88rem] leading-5 text-pe-text-muted md:mt-3 md:text-sm md:leading-6">
                      Matchups will populate here as soon as the MLB schedule feed returns today&apos;s probable starters.
                    </p>
                  </div>
                )}

                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 md:mt-4 md:gap-3">
                  <div className="rounded-[1rem] border border-white/8 bg-[rgba(255,255,255,0.02)] px-3.5 py-3 md:rounded-[1.15rem] md:px-4 md:py-3.5">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-pe-text-faint md:text-[0.64rem] md:tracking-[0.24em]">
                      Markets ready
                    </p>
                    <p className="mt-1.5 text-lg font-semibold text-pe-text-primary md:mt-2 md:text-xl">
                      {supportedMarkets.length}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-white/8 bg-[rgba(255,255,255,0.02)] px-3.5 py-3 md:rounded-[1.15rem] md:px-4 md:py-3.5">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-pe-text-faint md:text-[0.64rem] md:tracking-[0.24em]">
                      Teams loaded
                    </p>
                    <p className="mt-1.5 text-[0.84rem] leading-5 text-pe-text-primary md:mt-2 md:text-sm md:leading-6">
                      {coverage.teamCount} clubs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
        <div className="max-w-md">
          <p className="section-label">Environment Map</p>
          <h2 className="mt-5 text-3xl font-semibold uppercase leading-tight tracking-[-0.03em] text-pe-text-primary md:text-4xl">
            Read the league by venue before you read it by player.
          </h2>
          <p className="mt-5 text-sm leading-7 text-pe-text-muted">
            Baseball boards move differently. The first layer is venue context: which parks lean toward run scoring, which suppress offense, and where strikeout environments tend to run hot.
          </p>
          <p className="mt-4 text-sm leading-7 text-pe-text-muted">
            The MLB home route now uses the same structure as NBA, but the core signal is park environment instead of bankroll math.
          </p>
        </div>

        <div className="shell-panel rounded-[2rem] p-6 md:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                Park environment split
              </p>
              <h3 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em] text-pe-text-primary">
                Run-scoring landscape
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                Coverage
              </p>
              <p className="mt-2 text-2xl font-semibold text-pe-accent-strong">{parkFactors.length}</p>
            </div>
          </div>

          <div className="space-y-5">
            {parkBreakdown.map((item) => {
              const width = `${(item.rate / maxBucket) * 100}%`;
              return (
                <div key={item.label} className="grid gap-3 md:grid-cols-[7rem_1fr_7rem] md:items-center">
                  <div>
                    <p className={`text-2xl font-semibold ${item.text}`}>{item.rate}</p>
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-pe-text-faint">
                      {item.label}
                    </p>
                  </div>
                  <div className="rounded-full bg-white/6 px-1 py-1">
                    <div className="relative h-5 overflow-hidden rounded-full bg-pe-surface-2/70">
                      <div className={`absolute inset-y-0 left-0 rounded-full ${item.tone}`} style={{ width }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-semibold ${item.text}`}>
                      {parkFactors.length > 0 ? Math.round((item.rate / parkFactors.length) * 100) : 0}%
                    </p>
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-pe-text-faint">
                      Of parks
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="max-w-md">
          <p className="section-label">Workflow</p>
          <h2 className="mt-5 text-3xl font-semibold uppercase leading-tight tracking-[-0.03em] text-pe-text-primary md:text-4xl">
            One research stack. Four baseball reads built on top of it.
          </h2>
          <p className="mt-5 text-sm leading-7 text-pe-text-muted">
            The product flow stays the same across leagues: open the slate, validate the matchup, inspect the venue, then move into the deeper coverage view.
          </p>
        </div>

        <div className="border-t border-white/8">
          {featureRows.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group grid gap-3 border-b border-white/8 py-6 md:grid-cols-[10rem_1fr_auto] md:items-start"
            >
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                {item.eyebrow}
              </p>
              <div>
                <h3 className={`text-2xl font-semibold uppercase tracking-[0.06em] ${item.accent}`}>
                  {item.label}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-pe-text-muted">
                  {item.summary}
                </p>
              </div>
              <span className="pt-1 text-sm uppercase tracking-[0.24em] text-pe-text-secondary group-hover:text-pe-text-primary">
                Open
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="shell-panel rounded-[2rem] p-6 md:p-8">
          <p className="section-label">Method</p>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                01 / ingest
              </p>
              <h3 className="mt-3 text-xl font-semibold uppercase tracking-[0.08em] text-pe-text-primary">
                Build the card
              </h3>
              <p className="mt-3 text-sm leading-7 text-pe-text-muted">
                Probable starters, park factors, prop markets, and warehouse coverage all get pulled into one baseball surface.
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                02 / frame
              </p>
              <h3 className="mt-3 text-xl font-semibold uppercase tracking-[0.08em] text-pe-text-primary">
                Frame the matchup
              </h3>
              <p className="mt-3 text-sm leading-7 text-pe-text-muted">
                Venue environment and starter context establish whether the board should be read as hitter-leaning, pitcher-leaning, or neutral.
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                03 / expand
              </p>
              <h3 className="mt-3 text-xl font-semibold uppercase tracking-[0.08em] text-pe-text-primary">
                Expand the model layer
              </h3>
              <p className="mt-3 text-sm leading-7 text-pe-text-muted">
                The same shell is now in place so MLB predictions can land without introducing a second design language.
              </p>
            </div>
          </div>
        </div>

        <div className="shell-panel-soft rounded-[2rem] p-6">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
            Current read
          </p>
          <h3 className="mt-4 text-2xl font-semibold uppercase tracking-[0.08em] text-pe-text-primary">
            Park context first
          </h3>
          <p className="mt-4 text-sm leading-7 text-pe-text-muted">
            Open the slate first, then work outward into park profiles, market coverage, and the live starter board.
          </p>
          <div className="mt-8 border-t border-white/8 pt-5">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
              Starter board
            </p>
            <p className="mt-3 text-3xl font-semibold text-pe-text-primary">
              {starterGames.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-pe-text-muted">
              Today&apos;s probable starters are already live, with the latest sync at {formatTimestamp(lastUpdated)}.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-pe-accent/20 bg-[linear-gradient(135deg,rgba(205,168,101,0.12),rgba(255,255,255,0.03))] px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">Start Here</p>
            <h2 className="mt-5 text-3xl font-semibold uppercase leading-tight tracking-[-0.03em] text-pe-text-primary md:text-4xl">
              Open the slate. Read the venue. Then move deeper into the baseball layer.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/mlb/slate"
              className="inline-flex items-center justify-center rounded-full border border-pe-accent/35 bg-pe-accent/18 px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-pe-accent hover:bg-pe-accent/24"
            >
              View today&apos;s slate
            </Link>
            <Link
              href="/mlb/analytics"
              className="inline-flex items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-pe-text-secondary hover:text-pe-text-primary"
            >
              Open analytics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
