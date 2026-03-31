"use client";

import Link from "next/link";
import type { MlbParkFactor } from "@/lib/data";
import MlbStartersToday from "@/app/components/MlbStartersToday";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Color-code a park factor value: >103 hitter-friendly (green), <97 pitcher-friendly (red), else neutral */
function pfClass(value: number | null): string {
  if (value == null) return "bg-zinc-500/15 text-zinc-400";
  if (value > 103) return "bg-emerald-500/15 text-emerald-400";
  if (value < 97) return "bg-red-500/15 text-red-400";
  return "bg-zinc-700/40 text-pe-text-muted";
}

function pfLabel(value: number | null): string {
  if (value == null) return "—";
  return value.toFixed(0);
}

// Strip the "M-" prefix used to avoid team code collisions with NBA teams
function displayCode(teamCode: string): string {
  return teamCode.startsWith("M-") ? teamCode.slice(2) : teamCode;
}

// ── Stat Bar ─────────────────────────────────────────────────────────────────

interface StatBarItem {
  label: string;
  value: string;
}

function StatBar({ items }: { items: StatBarItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-pe-surface-1 border border-pe-border/10 rounded-xl px-4 py-3 flex flex-col gap-0.5"
        >
          <span className="text-xs font-medium text-pe-text-faint uppercase tracking-wide">
            {item.label}
          </span>
          <span className="text-lg font-bold text-pe-text-primary">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Park Factor Badge ─────────────────────────────────────────────────────────

function PfBadge({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] font-bold uppercase tracking-wider text-pe-text-faint">
        {label}
      </span>
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${pfClass(value)}`}>
        {pfLabel(value)}
      </span>
    </div>
  );
}

// ── Team Card ─────────────────────────────────────────────────────────────────

function TeamCard({ team }: { team: MlbParkFactor }) {
  const code = displayCode(team.teamCode);

  return (
    <Link
      href={`/mlb/team/${team.teamCode}`}
      className="bg-pe-surface-1 border border-pe-border/10 rounded-xl p-4 flex flex-col gap-3 hover:border-pe-border/25 hover:bg-pe-surface-2/50 transition-colors"
    >
      {/* Header */}
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

      {/* Park factor badges */}
      <div className="flex items-center justify-between border-t border-pe-border/10 pt-3">
        <PfBadge label="Runs" value={team.pfRuns} />
        <PfBadge label="HR" value={team.pfHr} />
        <PfBadge label="Hits" value={team.pfHits} />
        <PfBadge label="K" value={team.pfK} />
      </div>
    </Link>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-pe-text-faint mb-6">
      <span className="font-semibold text-pe-text-muted">Park Factors:</span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500/60" />
        &gt;103 Hitter-friendly
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-zinc-500/60" />
        97–103 Neutral
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500/60" />
        &lt;97 Pitcher-friendly
      </span>
      <span className="ml-auto text-[10px]">
        Base 100 = league average
      </span>
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

interface MlbPageContentProps {
  parkFactors: MlbParkFactor[];
  playerCount: number;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MlbPageContent({
  parkFactors,
  playerCount,
}: MlbPageContentProps) {
  const teamCount = parkFactors.length;

  const statBarItems: StatBarItem[] = [
    { label: "Teams", value: teamCount > 0 ? String(teamCount) : "30" },
    {
      label: "Players Scouted",
      value: playerCount > 0 ? playerCount.toLocaleString() : "—",
    },
    { label: "Park Factors", value: teamCount > 0 ? "Loaded" : "—" },
    { label: "Status", value: "Working on it" },
  ];

  return (
    <div className="min-h-screen bg-pe-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-pe-accent bg-pe-accent/10 px-2 py-0.5 rounded-full">
              MLB
            </span>
            <span className="text-xs text-pe-text-faint">2026 Season</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-pe-text-primary mb-2">
            MLB Analytics
          </h1>
          <p className="text-pe-text-muted text-sm md:text-base max-w-xl">
            Spring training is underway. Full predictions launch with the regular season.
          </p>
        </div>

        {/* Stats bar */}
        <StatBar items={statBarItems} />

        {/* Coming Soon Banner */}
        <div className="rounded-xl border border-pe-border/10 bg-pe-surface-1 px-5 py-4 mb-8 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-pe-text-primary mb-0.5">
              Predictions coming soon
            </p>
            <p className="text-xs text-pe-text-faint">
              Our ML model will generate pitcher strikeout, total bases, and hits props starting
              Opening Day. Park factor data is already loaded and ready.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Launching ~April 2026
            </span>
          </div>
        </div>

        {/* Today's Starters */}
        <MlbStartersToday />

        {/* Teams grid */}
        {parkFactors.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-pe-text-primary">
                Park Factors by Team
              </h2>
              <span className="text-xs text-pe-text-faint">
                {parkFactors.length} teams
              </span>
            </div>

            <Legend />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {parkFactors.map((team) => (
                <TeamCard key={team.teamId} team={team} />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-xl border border-pe-border/10 bg-pe-surface-1 px-5 py-12 text-center">
            <p className="text-pe-text-faint text-sm">No park factor data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
