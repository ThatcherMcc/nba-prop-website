"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type {
  TopPick,
  UnderPick,
  BacktestPick,
  OverSeasonAvgLast5,
  UnderSeasonAvgLast5,
  TrendingPlayer,
  BacktestResult,
} from "@/lib/data";
import {
  StatusBar,
  PicksTable,
  ResultsTab,
  SortIcon,
  formatRelativeTimeShort,
} from "./homepage-shared";
import type { SortDir } from "./homepage-shared";
import ParlayBuilder from "./ParlayBuilder";

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = "over" | "under" | "results" | "hot" | "cold" | "trending" | "parlay";

interface AnalyticsPageContentProps {
  overSeasonAvgLast5: OverSeasonAvgLast5[];
  underSeasonAvgLast5: UnderSeasonAvgLast5[];
  trendingPlayers: TrendingPlayer[];
  topPicks: TopPick[];
  underPicks: UnderPick[];
  propDate?: string | null;
  backtestResults: BacktestResult;
  lastUpdated: string | null;
}

// ── Tab config ───────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "over", label: "Over Picks" },
  { id: "under", label: "Under Picks" },
  { id: "results", label: "Results" },
  { id: "hot", label: "Hot" },
  { id: "cold", label: "Cold" },
  { id: "trending", label: "Trending" },
  { id: "parlay", label: "Parlay Builder" },
];

// ── Tab badge color helper ───────────────────────────────────────────────────

function badgeClass(tab: Tab, isActive: boolean): string {
  if (isActive) {
    if (tab === "hot") return "bg-emerald-500 text-white";
    if (tab === "cold") return "bg-sky-500 text-white";
    if (tab === "trending") return "bg-amber-500 text-white";
    if (tab === "parlay") return "bg-violet-500 text-white";
    return "bg-pe-accent text-white";
  }
  if (tab === "hot") return "bg-emerald-500/15 text-emerald-400";
  if (tab === "cold") return "bg-sky-500/15 text-sky-400";
  if (tab === "trending") return "bg-amber-500/15 text-amber-400";
  if (tab === "parlay") return "bg-violet-500/15 text-violet-400";
  return "bg-pe-surface-2 text-pe-text-faint";
}

// ── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({
  active,
  onChange,
  counts,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  counts: Record<Tab, number>;
}) {
  return (
    <div className="flex overflow-x-auto no-scrollbar border-b border-pe-border/10 mb-0">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              "relative flex-shrink-0 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors",
              isActive
                ? "text-pe-text-primary border-b-2 border-pe-accent -mb-px"
                : "text-pe-text-muted hover:text-pe-text-primary border-b-2 border-transparent -mb-px",
            ].join(" ")}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span
                className={`ml-1.5 text-[10px] px-1 rounded font-mono ${badgeClass(tab.id, isActive)}`}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Hot Streaks Table ────────────────────────────────────────────────────────

type HotSortKey = "playerName" | "seasonAvgPts" | "last5AvgPts" | "overCount" | "diff";

function HotStreaksTable({
  data,
  goToPlayer,
}: {
  data: OverSeasonAvgLast5[];
  goToPlayer: (name: string, games?: number, stat?: string, line?: number) => void;
}) {
  const [sortKey, setSortKey] = useState<HotSortKey>("diff");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: HotSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "playerName" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "playerName") {
        cmp = (a.playerName ?? "").localeCompare(b.playerName ?? "");
      } else if (sortKey === "seasonAvgPts") {
        cmp = a.seasonAvgPts - b.seasonAvgPts;
      } else if (sortKey === "last5AvgPts") {
        cmp = a.last5AvgPts - b.last5AvgPts;
      } else if (sortKey === "overCount") {
        cmp = a.overCount - b.overCount;
      } else {
        cmp = a.diff - b.diff;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-pe-text-faint text-xs">
        No hot streak data available.
      </div>
    );
  }

  function SortableHeader({
    sk,
    children,
    align = "right",
  }: {
    sk: HotSortKey;
    children: React.ReactNode;
    align?: "left" | "right";
  }) {
    const alignClass = align === "left" ? "text-left" : "text-right";
    return (
      <th
        className={`${alignClass} py-2.5 px-3 text-[10px] font-bold text-pe-text-faint uppercase tracking-widest cursor-pointer select-none hover:text-pe-text-muted transition-colors`}
        onClick={() => handleSort(sk)}
      >
        {children}
        <SortIcon active={sortKey === sk} dir={sortDir} />
      </th>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[520px]">
        <thead>
          <tr className="border-b border-pe-border/10">
            <SortableHeader sk="playerName" align="left">Player</SortableHeader>
            <SortableHeader sk="seasonAvgPts">Season Avg</SortableHeader>
            <SortableHeader sk="last5AvgPts">Last 5 Avg</SortableHeader>
            <SortableHeader sk="overCount">Over Count</SortableHeader>
            <SortableHeader sk="diff">Diff</SortableHeader>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const diffPos = p.diff >= 0;
            const diffColor = diffPos ? "text-emerald-400" : "text-red-400";
            return (
              <tr
                key={`hot-${p.playerName ?? i}-${i}`}
                className="border-b border-pe-border/5 hover:bg-pe-surface-2/30 transition-colors cursor-pointer"
                onClick={() => goToPlayer(p.playerName ?? "", 10, "pts", p.seasonAvgPts)}
              >
                <td className="py-2 px-3 font-semibold text-pe-text-primary whitespace-nowrap">
                  {p.playerName ?? "\u2014"}
                </td>
                <td className="py-2 px-3 text-right text-pe-text-secondary font-mono">
                  {p.seasonAvgPts.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-right text-pe-text-secondary font-mono">
                  {p.last5AvgPts.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-right text-pe-text-muted font-mono">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-emerald-400 font-bold">{p.overCount}</span>
                    <span className="text-pe-text-faint">/5</span>
                  </span>
                </td>
                <td className={`py-2 px-3 text-right font-bold font-mono ${diffColor}`}>
                  {diffPos ? "+" : ""}{p.diff.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Cold Streaks Table ───────────────────────────────────────────────────────

type ColdSortKey = "playerName" | "seasonAvgPts" | "last5AvgPts" | "underCount" | "diff";

function ColdStreaksTable({
  data,
  goToPlayer,
}: {
  data: UnderSeasonAvgLast5[];
  goToPlayer: (name: string, games?: number, stat?: string, line?: number) => void;
}) {
  const [sortKey, setSortKey] = useState<ColdSortKey>("diff");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: ColdSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "playerName" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "playerName") {
        cmp = (a.playerName ?? "").localeCompare(b.playerName ?? "");
      } else if (sortKey === "seasonAvgPts") {
        cmp = a.seasonAvgPts - b.seasonAvgPts;
      } else if (sortKey === "last5AvgPts") {
        cmp = a.last5AvgPts - b.last5AvgPts;
      } else if (sortKey === "underCount") {
        cmp = a.underCount - b.underCount;
      } else {
        cmp = a.diff - b.diff;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-pe-text-faint text-xs">
        No cold streak data available.
      </div>
    );
  }

  function SortableHeader({
    sk,
    children,
    align = "right",
  }: {
    sk: ColdSortKey;
    children: React.ReactNode;
    align?: "left" | "right";
  }) {
    const alignClass = align === "left" ? "text-left" : "text-right";
    return (
      <th
        className={`${alignClass} py-2.5 px-3 text-[10px] font-bold text-pe-text-faint uppercase tracking-widest cursor-pointer select-none hover:text-pe-text-muted transition-colors`}
        onClick={() => handleSort(sk)}
      >
        {children}
        <SortIcon active={sortKey === sk} dir={sortDir} />
      </th>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[520px]">
        <thead>
          <tr className="border-b border-pe-border/10">
            <SortableHeader sk="playerName" align="left">Player</SortableHeader>
            <SortableHeader sk="seasonAvgPts">Season Avg</SortableHeader>
            <SortableHeader sk="last5AvgPts">Last 5 Avg</SortableHeader>
            <SortableHeader sk="underCount">Under Count</SortableHeader>
            <SortableHeader sk="diff">Diff</SortableHeader>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const diffPos = p.diff >= 0;
            const diffColor = diffPos ? "text-emerald-400" : "text-red-400";
            return (
              <tr
                key={`cold-${p.playerName ?? i}-${i}`}
                className="border-b border-pe-border/5 hover:bg-pe-surface-2/30 transition-colors cursor-pointer"
                onClick={() => goToPlayer(p.playerName ?? "", 10, "pts", p.seasonAvgPts)}
              >
                <td className="py-2 px-3 font-semibold text-pe-text-primary whitespace-nowrap">
                  {p.playerName ?? "\u2014"}
                </td>
                <td className="py-2 px-3 text-right text-pe-text-secondary font-mono">
                  {p.seasonAvgPts.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-right text-pe-text-secondary font-mono">
                  {p.last5AvgPts.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-right text-pe-text-muted font-mono">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-sky-400 font-bold">{p.underCount}</span>
                    <span className="text-pe-text-faint">/5</span>
                  </span>
                </td>
                <td className={`py-2 px-3 text-right font-bold font-mono ${diffColor}`}>
                  {diffPos ? "+" : ""}{p.diff.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Trending Table ───────────────────────────────────────────────────────────

type TrendingSortKey = "playerName" | "prev3AvgPts" | "last3AvgPts" | "diff";

function TrendingTable({
  data,
  goToPlayer,
}: {
  data: TrendingPlayer[];
  goToPlayer: (name: string, games?: number, stat?: string, line?: number) => void;
}) {
  const [sortKey, setSortKey] = useState<TrendingSortKey>("diff");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: TrendingSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "playerName" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "playerName") {
        cmp = (a.playerName ?? "").localeCompare(b.playerName ?? "");
      } else if (sortKey === "prev3AvgPts") {
        cmp = a.prev3AvgPts - b.prev3AvgPts;
      } else if (sortKey === "last3AvgPts") {
        cmp = a.last3AvgPts - b.last3AvgPts;
      } else {
        cmp = a.diff - b.diff;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-pe-text-faint text-xs">
        No trending data available.
      </div>
    );
  }

  function SortableHeader({
    sk,
    children,
    align = "right",
  }: {
    sk: TrendingSortKey;
    children: React.ReactNode;
    align?: "left" | "right";
  }) {
    const alignClass = align === "left" ? "text-left" : "text-right";
    return (
      <th
        className={`${alignClass} py-2.5 px-3 text-[10px] font-bold text-pe-text-faint uppercase tracking-widest cursor-pointer select-none hover:text-pe-text-muted transition-colors`}
        onClick={() => handleSort(sk)}
      >
        {children}
        <SortIcon active={sortKey === sk} dir={sortDir} />
      </th>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[440px]">
        <thead>
          <tr className="border-b border-pe-border/10">
            <SortableHeader sk="playerName" align="left">Player</SortableHeader>
            <SortableHeader sk="prev3AvgPts">Prev 3 Avg</SortableHeader>
            <SortableHeader sk="last3AvgPts">Last 3 Avg</SortableHeader>
            <SortableHeader sk="diff">Diff</SortableHeader>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const diffPos = p.diff >= 0;
            const diffColor = diffPos ? "text-emerald-400" : "text-red-400";
            return (
              <tr
                key={`trending-${p.playerName ?? i}-${i}`}
                className="border-b border-pe-border/5 hover:bg-pe-surface-2/30 transition-colors cursor-pointer"
                onClick={() => goToPlayer(p.playerName ?? "", 10, "pts", p.last3AvgPts)}
              >
                <td className="py-2 px-3 font-semibold text-pe-text-primary whitespace-nowrap">
                  {p.playerName ?? "\u2014"}
                </td>
                <td className="py-2 px-3 text-right text-pe-text-secondary font-mono">
                  {p.prev3AvgPts.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-right text-pe-text-secondary font-mono">
                  {p.last3AvgPts.toFixed(1)}
                </td>
                <td className={`py-2 px-3 text-right font-bold font-mono ${diffColor}`}>
                  {diffPos ? "+" : ""}{p.diff.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsPageContent({
  overSeasonAvgLast5 = [],
  underSeasonAvgLast5 = [],
  trendingPlayers = [],
  topPicks = [],
  underPicks = [],
  backtestResults = { gameDate: "", picks: [] },
  lastUpdated = null,
}: AnalyticsPageContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("over");

  const goToPlayer = (name: string, games = 10, stat?: string, line?: number) => {
    const params = new URLSearchParams();
    params.set("games", String(games));
    if (stat) params.set("stat", stat);
    if (line != null && !Number.isNaN(line)) params.set("line", String(line));
    router.push(`/player/${encodeURIComponent(name)}?${params.toString()}`);
  };

  const backtestWins = backtestResults.picks.filter((p: BacktestPick) => p.result === "win").length;
  const backtestLosses = backtestResults.picks.filter((p: BacktestPick) => p.result === "loss").length;
  const totalPicks = topPicks.length + underPicks.length;

  const tabCounts: Record<Tab, number> = {
    over: topPicks.length,
    under: underPicks.length,
    results: backtestResults.picks.length,
    hot: overSeasonAvgLast5.length,
    cold: underSeasonAvgLast5.length,
    trending: trendingPlayers.length,
    parlay: 0,
  };

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-lg font-black uppercase tracking-tight text-pe-text-primary">
          Analytics
        </h1>
        <p className="text-xs text-pe-text-faint mt-0.5">
          Updated{" "}
          <span className="text-pe-text-muted">
            {formatRelativeTimeShort(lastUpdated)}
          </span>
        </p>
      </div>

      {/* Status bar */}
      <StatusBar
        lastUpdated={lastUpdated}
        totalPicks={totalPicks}
        backtestWins={backtestWins}
        backtestLosses={backtestLosses}
      />

      {/* Main panel */}
      <div className="bg-pe-surface-1/40 border border-pe-border/10 rounded-xl overflow-hidden">
        {/* Tab bar */}
        <div className="px-2 pt-2">
          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            counts={tabCounts}
          />
        </div>

        {/* Tab content */}
        <div className="pt-1 pb-2">
          {activeTab === "over" && (
            <PicksTable
              picks={topPicks}
              side="over"
              goToPlayer={goToPlayer}
            />
          )}
          {activeTab === "under" && (
            <PicksTable
              picks={underPicks}
              side="under"
              goToPlayer={goToPlayer}
            />
          )}
          {activeTab === "results" && (
            <ResultsTab
              picks={backtestResults.picks}
              gameDate={backtestResults.gameDate}
            />
          )}
          {activeTab === "hot" && (
            <HotStreaksTable data={overSeasonAvgLast5} goToPlayer={goToPlayer} />
          )}
          {activeTab === "cold" && (
            <ColdStreaksTable data={underSeasonAvgLast5} goToPlayer={goToPlayer} />
          )}
          {activeTab === "trending" && (
            <TrendingTable data={trendingPlayers} goToPlayer={goToPlayer} />
          )}
          {activeTab === "parlay" && (
            <ParlayBuilder topPicks={topPicks} underPicks={underPicks} />
          )}
        </div>
      </div>
    </div>
  );
}
