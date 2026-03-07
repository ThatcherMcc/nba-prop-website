"use client";

import Link from "next/link";

interface Props {
  weekStart: string;
  gameDates: number;
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} \u2014 ${end.toLocaleDateString("en-US", opts)}`;
}

function formatYear(weekStart: string): string {
  const d = new Date(weekStart + "T12:00:00");
  return d.getFullYear().toString();
}

export default function InsightCard({ weekStart, gameDates }: Props) {
  const slug = `week-${weekStart}`;
  const range = formatWeekRange(weekStart);
  const year = formatYear(weekStart);

  return (
    <Link
      href={`/insights/${slug}`}
      className="group block bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl p-5 hover:border-pe-border/20 hover:bg-pe-surface-1/80 hover:scale-[1.01] transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-bold text-pe-text-faint uppercase tracking-widest mb-1">
            {year}
          </p>
          <h3 className="text-base font-black text-pe-text-primary leading-tight">
            {range}
          </h3>
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border bg-sky-500/15 text-sky-400 border-sky-500/30">
          {gameDates} {gameDates === 1 ? "day" : "days"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-pe-text-faint">Weekly pick recap</p>
        <span className="text-xs font-bold text-pe-text-muted group-hover:text-pe-text-primary transition-colors">
          View Recap &#x2192;
        </span>
      </div>
    </Link>
  );
}
