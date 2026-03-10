"use client";

import Link from "next/link";
import type { MlbTeamDetail } from "@/lib/data";

// ── Helpers ───────────────────────────────────────────────────────────────────

function displayCode(teamCode: string): string {
  return teamCode.startsWith("M-") ? teamCode.slice(2) : teamCode;
}

/**
 * Clamp a park factor bar width: 100 = centre (50%). Range 70–130 maps to 0–100%.
 * Values below 100 lean left (pitcher-friendly), above 100 lean right (hitter-friendly).
 */
function pfBarWidth(value: number | null): number {
  if (value == null) return 50;
  // Map [70, 130] → [0, 100]
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
  if (value == null) return "—";
  return value.toFixed(0);
}

function pfDescription(value: number | null): string {
  if (value == null) return "No data";
  if (value > 110) return "Strongly hitter-friendly";
  if (value > 103) return "Hitter-friendly";
  if (value < 90) return "Strongly pitcher-friendly";
  if (value < 97) return "Pitcher-friendly";
  return "Neutral";
}

// ── Park Factor Row ───────────────────────────────────────────────────────────

interface PfRowProps {
  label: string;
  sublabel: string;
  value: number | null;
}

function PfRow({ label, sublabel, value }: PfRowProps) {
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

      {/* Bar track */}
      <div className="relative h-2 rounded-full bg-pe-surface-2 overflow-hidden">
        {/* Centre marker at 50% */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-pe-border/20" />
        {/* Fill bar */}
        <div
          className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[9px] text-pe-text-faint">
        <span>70 Pitcher</span>
        <span>100 Neutral</span>
        <span>Hitter 130</span>
      </div>
    </div>
  );
}

// ── Summary Badge Grid ────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  value: number | null;
}

function PfBadge({ label, value }: BadgeProps) {
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

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-pe-text-faint">
      <span className="font-semibold text-pe-text-muted">Park Factors:</span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500/70" />
        &gt;103 Hitter-friendly
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-zinc-500/70" />
        97–103 Neutral
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500/70" />
        &lt;97 Pitcher-friendly
      </span>
      <span className="ml-auto text-[10px]">Base 100 = league average</span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MlbTeamPageContentProps {
  team: MlbTeamDetail;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MlbTeamPageContent({ team }: MlbTeamPageContentProps) {
  const code = displayCode(team.teamCode);
  const pf = team.parkFactor;

  return (
    <div className="min-h-screen bg-pe-bg">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10">

        {/* Back link */}
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

        {/* Team header */}
        <div className="flex items-center gap-4 mb-8">
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

        {/* Park factors section */}
        {pf ? (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-pe-text-primary">Park Factors</h2>
              <Legend />
            </div>

            {/* Summary badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <PfBadge label="Runs" value={pf.pfRuns} />
              <PfBadge label="Home Runs" value={pf.pfHr} />
              <PfBadge label="Hits" value={pf.pfHits} />
              <PfBadge label="Strikeouts" value={pf.pfK} />
            </div>

            {/* Detailed bars */}
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
              Park factors index to 100 (league average). Values above 100 favour hitters; below 100 favour pitchers.
              Data sourced from Baseball Reference.
            </p>
          </section>
        ) : (
          <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl px-5 py-10 text-center mb-10">
            <p className="text-pe-text-faint text-sm">No park factor data available for this team.</p>
          </div>
        )}

        {/* Season stats placeholder */}
        <section>
          <h2 className="text-base font-bold text-pe-text-primary mb-4">Season Stats</h2>
          <div className="bg-pe-surface-1 border border-pe-border/10 rounded-2xl px-5 py-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-pe-text-primary mb-1">
                Game-by-game stats coming soon
              </p>
              <p className="text-xs text-pe-text-faint">
                Player gamelogs and team stats will populate automatically once the 2026 regular
                season begins. Check back on Opening Day.
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Launching ~April 2026
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
