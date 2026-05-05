import Link from "next/link";
import type { MlbTeamDetail } from "@/lib/data";
import { normalizeMlbTeamCode } from "@/lib/leagues";

function pfBarWidth(value: number | null): number {
  if (value == null) return 50;
  return Math.min(100, Math.max(0, ((value - 70) / 60) * 100));
}

function pfBarColor(value: number | null): string {
  if (value == null) return "bg-zinc-600";
  if (value > 103) return "bg-emerald-500";
  if (value < 97) return "bg-red-500";
  return "bg-zinc-400";
}

function pfTextColor(value: number | null): string {
  if (value == null) return "text-pe-text-faint";
  if (value > 103) return "text-emerald-400";
  if (value < 97) return "text-red-400";
  return "text-pe-text-muted";
}

function pfLabel(value: number | null): string {
  return value == null ? "—" : value.toFixed(0);
}

function pfDescription(value: number | null): string {
  if (value == null) return "No data";
  if (value > 110) return "Strongly hitter-friendly";
  if (value > 103) return "Hitter-friendly";
  if (value < 90) return "Strongly pitcher-friendly";
  if (value < 97) return "Pitcher-friendly";
  return "Neutral";
}

function signalCopy(label: string, value: number | null): string {
  if (value == null) {
    return `${label} context is not loaded yet.`;
  }
  if (label === "Runs" && value > 103) {
    return "Run-scoring environments usually play warmer than league average here.";
  }
  if (label === "Runs" && value < 97) {
    return "This venue tends to suppress run scoring relative to league average.";
  }
  if (label === "Home Runs" && value > 103) {
    return "Long-ball markets deserve extra attention in this park.";
  }
  if (label === "Home Runs" && value < 97) {
    return "Home-run conditions lean quieter than league average.";
  }
  if (label === "Strikeouts" && value > 103) {
    return "Strikeout environments can run stronger than average here.";
  }
  if (label === "Strikeouts" && value < 97) {
    return "Strikeout environments can run lighter than average here.";
  }
  return `${label} trends sit close to league average in this park.`;
}

function PfRow({
  label,
  sublabel,
  value,
}: {
  label: string;
  sublabel: string;
  value: number | null;
}) {
  const width = pfBarWidth(value);
  const barColor = pfBarColor(value);
  const textColor = pfTextColor(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-pe-text-primary">{label}</span>
          <span className="ml-2 text-xs text-pe-text-faint">{sublabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${textColor}`}>{pfDescription(value)}</span>
          <span className={`text-base font-black tabular-nums ${textColor}`}>
            {pfLabel(value)}
          </span>
        </div>
      </div>

      <div className="relative h-2 rounded-full bg-pe-surface-2 overflow-hidden">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-pe-border/20" />
        <div
          className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="flex justify-between text-[9px] text-pe-text-faint">
        <span>70 Pitcher</span>
        <span>100 Neutral</span>
        <span>Hitter 130</span>
      </div>
    </div>
  );
}

function PfBadge({ label, value }: { label: string; value: number | null }) {
  const textColor = pfTextColor(value);
  const bg =
    value == null
      ? "bg-zinc-800/40"
      : value > 103
        ? "bg-emerald-500/10 border border-emerald-500/20"
        : value < 97
          ? "bg-red-500/10 border border-red-500/20"
          : "bg-pe-surface-2 border border-pe-border/10";

  return (
    <div className={`rounded-xl px-4 py-3 flex flex-col gap-0.5 ${bg}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
        {label}
      </span>
      <span className={`text-2xl font-black tabular-nums ${textColor}`}>{pfLabel(value)}</span>
      <span className={`text-[10px] font-medium ${textColor}`}>{pfDescription(value)}</span>
    </div>
  );
}

export default function MlbTeamPageContent({ team }: { team: MlbTeamDetail }) {
  const code = normalizeMlbTeamCode(team.teamCode);
  const pf = team.parkFactor;

  return (
    <div className="min-h-screen bg-pe-bg">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="mb-6">
          <Link
            href="/mlb"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-pe-text-faint hover:text-pe-text-muted transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            MLB Overview
          </Link>
        </div>

        <section className="rounded-[2rem] border border-pe-border/10 bg-pe-surface-1 px-5 py-6 md:px-7 md:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-pe-surface-2 border border-pe-border/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-black text-pe-text-muted tracking-tight">{code}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-pe-accent bg-pe-accent/10 px-2 py-0.5 rounded-full">
                    MLB
                  </span>
                  {pf && (
                    <span className="text-xs text-pe-text-faint">{pf.season} Season</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-pe-text-primary">
                  {team.teamName}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/mlb/slate"
                className="rounded-full border border-pe-accent/25 bg-pe-accent/12 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pe-accent-strong"
              >
                View MLB Slate
              </Link>
              <Link
                href="/mlb/analytics"
                className="rounded-full border border-pe-border/14 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pe-text-muted hover:text-pe-text-primary"
              >
                MLB Analytics
              </Link>
            </div>
          </div>
        </section>

        {pf ? (
          <section className="mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <PfBadge label="Runs" value={pf.pfRuns} />
              <PfBadge label="Home Runs" value={pf.pfHr} />
              <PfBadge label="Hits" value={pf.pfHits} />
              <PfBadge label="Strikeouts" value={pf.pfK} />
            </div>

            <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-5 md:p-6 flex flex-col gap-6">
              <PfRow
                label="Runs"
                sublabel="How many runs score vs. average"
                value={pf.pfRuns}
              />
              <PfRow
                label="Home Runs"
                sublabel="HR frequency vs. league average"
                value={pf.pfHr}
              />
              <PfRow
                label="Hits"
                sublabel="Hit rate vs. league average"
                value={pf.pfHits}
              />
              <PfRow
                label="Strikeouts"
                sublabel="K rate vs. league average"
                value={pf.pfK}
              />
            </div>

            <p className="mt-3 text-[11px] text-pe-text-faint">
              Park factors index to 100. Values above 100 favor hitters; below 100 favor pitchers.
            </p>
          </section>
        ) : (
          <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl px-5 py-10 text-center mt-8">
            <p className="text-pe-text-faint text-sm">No park factor data available for this team.</p>
          </div>
        )}

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-5">
            <h2 className="text-base font-bold text-pe-text-primary">How to use this park</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-pe-border/8 bg-pe-surface-2/35 px-4 py-3">
                <p className="text-sm font-semibold text-pe-text-primary">Runs</p>
                <p className="mt-1 text-sm text-pe-text-muted">
                  {signalCopy("Runs", pf?.pfRuns ?? null)}
                </p>
              </div>
              <div className="rounded-xl border border-pe-border/8 bg-pe-surface-2/35 px-4 py-3">
                <p className="text-sm font-semibold text-pe-text-primary">Home Runs</p>
                <p className="mt-1 text-sm text-pe-text-muted">
                  {signalCopy("Home Runs", pf?.pfHr ?? null)}
                </p>
              </div>
              <div className="rounded-xl border border-pe-border/8 bg-pe-surface-2/35 px-4 py-3">
                <p className="text-sm font-semibold text-pe-text-primary">Strikeouts</p>
                <p className="mt-1 text-sm text-pe-text-muted">
                  {signalCopy("Strikeouts", pf?.pfK ?? null)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl p-5">
            <h2 className="text-base font-bold text-pe-text-primary">Connected surfaces</h2>
            <div className="mt-4 space-y-3">
              <Link
                href="/mlb/slate"
                className="block rounded-xl border border-pe-border/8 bg-pe-surface-2/35 px-4 py-4 transition-colors hover:border-pe-border/20"
              >
                <p className="text-sm font-semibold text-pe-text-primary">MLB slate</p>
                <p className="mt-1 text-sm text-pe-text-muted">
                  Check today&apos;s probable starters and matchup-specific park context.
                </p>
              </Link>
              <Link
                href="/mlb/analytics"
                className="block rounded-xl border border-pe-border/8 bg-pe-surface-2/35 px-4 py-4 transition-colors hover:border-pe-border/20"
              >
                <p className="text-sm font-semibold text-pe-text-primary">MLB analytics</p>
                <p className="mt-1 text-sm text-pe-text-muted">
                  Compare this venue against the rest of the league and inspect market coverage.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
