import Link from "next/link";
import { getLastDataUpdate, getTopPicks } from "@/lib/data";

function formatTimestamp(value: string | null) {
  if (!value) return "Awaiting latest sync";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function Page() {
  let lastUpdated: string | null = null;
  let heroTopPick: Awaited<ReturnType<typeof getTopPicks>>["picks"][number] | null = null;

  try {
    const [lastUpdatedValue, topPicks] = await Promise.all([
      getLastDataUpdate(),
      getTopPicks(1),
    ]);
    lastUpdated = lastUpdatedValue;
    heroTopPick = topPicks.picks[0] ?? null;
  } catch (error) {
    console.error("Homepage data load failed:", error);
  }

  const featureRows = [
    {
      href: "/slate",
      label: "Slate desk",
      eyebrow: "Live board",
      summary: "Today's slate with analytics picks, line context, and game-by-game player research.",
      accent: "text-pe-text-secondary",
    },
    {
      href: "/analytics",
      label: "Trend engine",
      eyebrow: "Recent form",
      summary: "Hot streaks, cold streaks, rolling averages, and momentum signals before the market catches up.",
      accent: "text-pe-text-secondary",
    },
    {
      href: "/player/LeBron%20James",
      label: "Player dossiers",
      eyebrow: "Research layer",
      summary: "Searchable player pages with logs, splits, charts, matchup context, and current lines in one read.",
      accent: "text-pe-accent-strong",
    },
    {
      href: "/insights",
      label: "Editorial review",
      eyebrow: "Weekly signal",
      summary: "Weekly recaps built around trends, recent results, and the strongest storylines on the board.",
      accent: "text-pe-accent-strong",
    },
  ];

  const bankrollScenarios = [
    { rate: 58, units: 13.3, label: "Strong run" },
    { rate: 55, units: 5.0, label: "Solid edge" },
    { rate: 52.4, units: 0, label: "Break-even" },
    { rate: 50, units: -4.5, label: "Coin flip" },
    { rate: 48, units: -8.4, label: "Cold stretch" },
  ];
  const maxUnits = Math.max(...bankrollScenarios.map((item) => Math.abs(item.units)));

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
                <span className="block text-pe-text-primary">Find The</span>
                <span className="block text-pe-accent">Best Odds</span>
              </h1>
            </div>
            <div className="hero-reveal hero-reveal-delay-2 mt-2 max-w-md md:mt-3">
              <p className="text-[0.92rem] leading-5 text-pe-text-body md:text-base md:leading-6">
                Slate picks, trend context, and player research in one read.
              </p>
            </div>
            <div className="hero-reveal hero-reveal-delay-3 mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center md:mt-6 md:gap-3">
              <Link
                href="/slate"
                className="inline-flex items-center justify-center rounded-full border border-pe-accent/40 bg-pe-accent/12 px-5 py-2.5 text-[0.78rem] font-medium uppercase tracking-[0.2em] text-pe-accent-strong shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-pe-accent/18 md:px-6 md:py-3 md:text-sm md:tracking-[0.22em]"
              >
                Open today&apos;s slate
              </Link>
              <Link
                href="/analytics"
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
                    Today
                  </span>
                </div>

                {heroTopPick ? (
                  <div className="mt-3 rounded-[1.15rem] border border-pe-accent/15 bg-[rgba(255,255,255,0.03)] px-3.5 py-3.5 md:mt-4 md:rounded-[1.35rem] md:px-4 md:py-4">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-pe-text-faint md:text-[0.64rem] md:tracking-[0.3em]">
                      Top pick today
                    </p>
                    <div className="mt-2.5 flex items-end justify-between gap-3 md:mt-3 md:gap-4">
                      <div>
                        <p className="text-[2rem] font-semibold tracking-[-0.05em] text-pe-accent-strong md:text-4xl">
                          {heroTopPick.hitRate}%
                        </p>
                        <p className="mt-1.5 text-[0.66rem] uppercase tracking-[0.18em] text-pe-accent md:mt-2 md:text-[0.72rem] md:tracking-[0.22em]">
                          Over {heroTopPick.bookLine} {heroTopPick.marketCode}
                        </p>
                      </div>
                      <div className="rounded-full border border-pe-accent/20 bg-pe-accent/10 px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-pe-accent-strong md:px-3 md:text-[0.62rem] md:tracking-[0.24em]">
                        {heroTopPick.overCount}/{heroTopPick.gamesChecked}
                      </div>
                    </div>

                    <p className="mt-3 text-base font-semibold uppercase tracking-[0.04em] text-pe-text-primary md:mt-4 md:text-lg">
                      {heroTopPick.playerName}
                    </p>
                    <p className="mt-1.5 text-[0.88rem] leading-5 text-pe-text-muted md:mt-2 md:text-sm md:leading-6">
                      {heroTopPick.opponentTeamCode
                        ? `Against ${heroTopPick.opponentTeamCode}.`
                        : "On today's slate."} Last {heroTopPick.gamesChecked} games tracked.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-[1.15rem] border border-pe-accent/15 bg-[rgba(255,255,255,0.03)] px-3.5 py-3.5 md:mt-4 md:rounded-[1.35rem] md:px-4 md:py-4">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-pe-text-faint md:text-[0.64rem] md:tracking-[0.3em]">
                      Top pick today
                    </p>
                    <p className="mt-2.5 text-[2rem] font-semibold tracking-[-0.05em] text-pe-accent-strong md:mt-3 md:text-4xl">
                      Live
                    </p>
                    <p className="mt-2 text-[0.88rem] leading-5 text-pe-text-muted md:mt-3 md:text-sm md:leading-6">
                      Analytics picks will populate here as soon as today&apos;s board is available.
                    </p>
                  </div>
                )}

                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 md:mt-4 md:gap-3">
                  <div className="rounded-[1rem] border border-white/8 bg-[rgba(255,255,255,0.02)] px-3.5 py-3 md:rounded-[1.15rem] md:px-4 md:py-3.5">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-pe-text-faint md:text-[0.64rem] md:tracking-[0.24em]">
                      Board status
                    </p>
                    <p className="mt-1.5 text-lg font-semibold text-pe-text-primary md:mt-2 md:text-xl">
                      Daily
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-white/8 bg-[rgba(255,255,255,0.02)] px-3.5 py-3 md:rounded-[1.15rem] md:px-4 md:py-3.5">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-pe-text-faint md:text-[0.64rem] md:tracking-[0.24em]">
                      Last sync
                    </p>
                    <p className="mt-1.5 text-[0.84rem] leading-5 text-pe-text-primary md:mt-2 md:text-sm md:leading-6">
                      {formatTimestamp(lastUpdated)}
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
          <p className="section-label">Profit Map</p>
          <h2 className="mt-5 text-3xl font-semibold uppercase leading-tight tracking-[-0.03em] text-pe-text-primary md:text-4xl">
            Turn hit rate into something users can price in dollars.
          </h2>
          <p className="mt-5 text-sm leading-7 text-pe-text-muted">
            This section is intentionally money-oriented, but still honest: it maps hit rate to estimated dollars over 100 bets at standard `-110` pricing.
          </p>
          <p className="mt-4 text-sm leading-7 text-pe-text-muted">
            Anything above `50%` reads healthier, and once the number gets past `52.4%`, the curve flips into positive territory.
          </p>
        </div>

        <div className="shell-panel rounded-[2rem] p-6 md:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                Dollars over 100 bets
              </p>
              <h3 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em] text-pe-text-primary">
                Break-even vs upside
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                Break-even
              </p>
              <p className="mt-2 text-2xl font-semibold text-pe-accent-strong">52.4%</p>
            </div>
          </div>

          <div className="space-y-5">
            {bankrollScenarios.map((item) => {
              const width = `${(Math.abs(item.units) / maxUnits) * 100}%`;
              const positive = item.units >= 0;
              const dollarValue = item.units * 100;
              const rateTone = positive
                ? "text-emerald-300"
                : item.units === 0
                  ? "text-pe-accent-strong"
                  : "text-rose-300";
              const amountTone = positive
                ? "text-emerald-300"
                : item.units === 0
                  ? "text-pe-accent-strong"
                  : "text-rose-300";
              return (
                <div key={item.rate} className="grid gap-3 md:grid-cols-[7rem_1fr_7rem] md:items-center">
                  <div>
                    <p className={`text-2xl font-semibold ${rateTone}`}>
                      {item.rate}%
                    </p>
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-pe-text-faint">
                      {item.label}
                    </p>
                  </div>
                  <div className="rounded-full bg-white/6 px-1 py-1">
                    <div className="relative h-5 overflow-hidden rounded-full bg-pe-surface-2/70">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-white/18" />
                      <div
                        className={`absolute inset-y-0 rounded-full ${
                          positive ? "bg-emerald-400/85" : item.units === 0 ? "bg-pe-accent/85" : "bg-rose-400/72"
                        }`}
                        style={positive ? { left: "50%", width } : { right: "50%", width }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-semibold ${amountTone}`}>
                      {dollarValue > 0 ? "+" : ""}{formatMoney(dollarValue)}
                    </p>
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-pe-text-faint">
                      Per 100 bets
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
            One research stack. Four ways to read the market.
          </h2>
          <p className="mt-5 text-sm leading-7 text-pe-text-muted">
            Each surface is built for a distinct decision: scan the board, validate the trend, inspect the player, then review recent results and weekly context.
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
                Build the slate feed
              </h3>
              <p className="mt-3 text-sm leading-7 text-pe-text-muted">
                Game logs, prop lines, matchup data, and opponent defense context are refreshed into one operating dataset.
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                02 / rank
              </p>
              <h3 className="mt-3 text-xl font-semibold uppercase tracking-[0.08em] text-pe-text-primary">
                Rank the board
              </h3>
              <p className="mt-3 text-sm leading-7 text-pe-text-muted">
                Slate picks are organized around recent form, matchup context, and the clearest market value on the board.
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
                03 / review
              </p>
              <h3 className="mt-3 text-xl font-semibold uppercase tracking-[0.08em] text-pe-text-primary">
                Audit the output
              </h3>
              <p className="mt-3 text-sm leading-7 text-pe-text-muted">
                Track record views and weekly recaps keep recent performance visible after the games close.
              </p>
            </div>
          </div>
        </div>

        <div className="shell-panel-soft rounded-[2rem] p-6">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
            Current read
          </p>
          <h3 className="mt-4 text-2xl font-semibold uppercase tracking-[0.08em] text-pe-text-primary">
            Core prop markets in focus
          </h3>
          <p className="mt-4 text-sm leading-7 text-pe-text-muted">
            Open the slate first, then work outward into player research, matchup validation, and recent trend context.
          </p>
          <div className="mt-8 border-t border-white/8 pt-5">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-pe-text-faint">
              Track record
            </p>
            <p className="mt-3 text-3xl font-semibold text-pe-text-primary">
              Weekly
            </p>
            <p className="mt-2 text-sm leading-6 text-pe-text-muted">
              Archived outcomes and recap context remain available in the track record view, with the latest sync at {formatTimestamp(lastUpdated)}.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-pe-accent/20 bg-[linear-gradient(135deg,rgba(205,168,101,0.12),rgba(255,255,255,0.03))] px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">Start Here</p>
            <h2 className="mt-5 text-3xl font-semibold uppercase leading-tight tracking-[-0.03em] text-pe-text-primary md:text-4xl">
              Open the slate. Follow the signal. Validate it with player context.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/slate"
              className="inline-flex items-center justify-center rounded-full border border-pe-accent/35 bg-pe-accent/18 px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-pe-accent hover:bg-pe-accent/24"
            >
              View today&apos;s picks
            </Link>
            <Link
              href="/track-record"
              className="inline-flex items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-pe-text-secondary hover:text-pe-text-primary"
            >
              Review track record
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
