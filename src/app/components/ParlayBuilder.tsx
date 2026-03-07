"use client";

import { useState, useMemo } from "react";
import type { TopPick, UnderPick } from "@/lib/data";
import { StatBadge, hitRateTextClass } from "./homepage-shared";

// ── Types ────────────────────────────────────────────────────────────────────

type Direction = "over" | "under";

interface ParlayLeg {
  id: string; // playerName + marketCode + direction
  playerName: string;
  marketCode: string;
  marketName: string;
  bookLine: number;
  hitRate: number; // 0-100
  direction: Direction;
  gamesChecked: number;
  hitCount: number;
}

interface AvailablePick {
  playerName: string;
  marketCode: string;
  marketName: string;
  bookLine: number;
  hitRate: number;
  direction: Direction;
  gamesChecked: number;
  hitCount: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MIN_LEGS = 2;
const MAX_LEGS = 8;
const ODDS_MULTIPLIER = 1.91; // standard -110
const DEFAULT_STAKE = 100;

// ── Helpers ──────────────────────────────────────────────────────────────────

function legId(playerName: string, marketCode: string, direction: Direction): string {
  return `${playerName}::${marketCode}::${direction}`;
}

function combinedProbability(legs: ParlayLeg[]): number {
  if (legs.length === 0) return 0;
  return legs.reduce((acc, leg) => acc * (leg.hitRate / 100), 1) * 100;
}

function estimatedPayout(numLegs: number, stake: number): number {
  if (numLegs < MIN_LEGS) return 0;
  return stake * Math.pow(ODDS_MULTIPLIER, numLegs);
}

function probColor(prob: number): string {
  if (prob > 30) return "text-emerald-400";
  if (prob >= 15) return "text-amber-400";
  return "text-red-400";
}

function probRingClass(prob: number): string {
  if (prob > 30) return "border-emerald-500";
  if (prob >= 15) return "border-amber-500";
  return "border-red-500";
}

// ── Available Pick Row ────────────────────────────────────────────────────────

function AvailablePickRow({
  pick,
  isAdded,
  isDisabled,
  onAdd,
}: {
  pick: AvailablePick;
  isAdded: boolean;
  isDisabled: boolean;
  onAdd: () => void;
}) {
  const hitColor = hitRateTextClass(pick.hitRate, pick.direction);
  const dirBadge =
    pick.direction === "over"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : "bg-sky-500/15 text-sky-400 border-sky-500/30";

  return (
    <div
      className={[
        "flex items-center gap-3 px-3 py-2.5 border-b border-pe-border/5 transition-colors",
        isAdded ? "bg-pe-surface-2/40" : "hover:bg-pe-surface-2/20",
      ].join(" ")}
    >
      {/* Player name + stat info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-pe-text-primary truncate">
            {pick.playerName}
          </span>
          <StatBadge code={pick.marketCode} />
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${dirBadge}`}
          >
            {pick.direction === "over" ? "OVR" : "UND"}
          </span>
        </div>
        <p className="text-[11px] text-pe-text-faint mt-0.5">
          Line{" "}
          <span className="text-pe-text-muted font-semibold font-mono">
            {pick.bookLine}
          </span>
          <span className="mx-1.5 text-pe-border/30">·</span>
          <span className={`font-bold font-mono ${hitColor}`}>
            {pick.hitRate}%
          </span>
          <span className="text-pe-text-faint ml-1 font-mono">
            ({pick.hitCount}/{pick.gamesChecked})
          </span>
        </p>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={onAdd}
        disabled={isAdded || isDisabled}
        className={[
          "shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all",
          isAdded
            ? "bg-pe-surface-2 text-pe-text-faint cursor-default"
            : isDisabled
              ? "bg-pe-surface-2 text-pe-text-faint cursor-not-allowed opacity-50"
              : "bg-pe-accent-strong text-pe-text-primary hover:opacity-90 active:scale-95",
        ].join(" ")}
        aria-label={
          isAdded
            ? `${pick.playerName} ${pick.marketCode} already added`
            : `Add ${pick.playerName} ${pick.marketCode} to parlay`
        }
      >
        {isAdded ? "Added" : isDisabled ? "Full" : "+ Add"}
      </button>
    </div>
  );
}

// ── Parlay Leg Row ────────────────────────────────────────────────────────────

function ParlayLegRow({
  leg,
  index,
  onRemove,
}: {
  leg: ParlayLeg;
  index: number;
  onRemove: () => void;
}) {
  const hitColor = hitRateTextClass(leg.hitRate, leg.direction);
  const dirBadge =
    leg.direction === "over"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : "bg-sky-500/15 text-sky-400 border-sky-500/30";

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-pe-border/5 group">
      {/* Leg number */}
      <span className="shrink-0 w-5 text-[11px] font-mono text-pe-text-faint text-center">
        {index + 1}
      </span>

      {/* Leg info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-pe-text-primary truncate">
            {leg.playerName}
          </span>
          <StatBadge code={leg.marketCode} />
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${dirBadge}`}
          >
            {leg.direction === "over" ? "OVR" : "UND"}
          </span>
        </div>
        <p className="text-[11px] text-pe-text-faint mt-0.5">
          Line{" "}
          <span className="text-pe-text-muted font-semibold font-mono">
            {leg.bookLine}
          </span>
          <span className="mx-1.5 text-pe-border/30">·</span>
          <span className={`font-bold font-mono ${hitColor}`}>
            {leg.hitRate}%
          </span>
        </p>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors px-1 py-1 rounded opacity-60 group-hover:opacity-100"
        aria-label={`Remove ${leg.playerName} ${leg.marketCode} from parlay`}
      >
        Remove
      </button>
    </div>
  );
}

// ── Payout Summary ────────────────────────────────────────────────────────────

function PayoutSummary({
  legs,
  stake,
  onStakeChange,
}: {
  legs: ParlayLeg[];
  stake: number;
  onStakeChange: (v: number) => void;
}) {
  const numLegs = legs.length;
  const prob = combinedProbability(legs);
  const payout = estimatedPayout(numLegs, stake);
  const profit = payout - stake;
  const isReady = numLegs >= MIN_LEGS;

  const probColorClass = probColor(prob);
  const ringClass = probRingClass(prob);

  return (
    <div className="px-3 pt-3 pb-3 space-y-3">
      {/* Probability ring + label */}
      <div className="flex items-center gap-4">
        <div
          className={`shrink-0 w-16 h-16 rounded-full border-4 flex items-center justify-center ${isReady ? ringClass : "border-pe-border/20"}`}
        >
          <span
            className={`text-sm font-black leading-none ${isReady ? probColorClass : "text-pe-text-faint"}`}
          >
            {isReady ? `${prob.toFixed(1)}%` : "\u2014"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-pe-text-faint uppercase tracking-widest">
            Combined Hit Rate
          </p>
          {isReady ? (
            <p className={`text-2xl font-black font-mono mt-0.5 ${probColorClass}`}>
              {prob.toFixed(1)}%
            </p>
          ) : (
            <p className="text-xs text-pe-text-faint mt-1">
              Add {MIN_LEGS - numLegs} more leg{MIN_LEGS - numLegs !== 1 ? "s" : ""} to calculate
            </p>
          )}
        </div>
      </div>

      {/* Stake input */}
      <div className="flex items-center gap-2 bg-pe-surface-2/50 border border-pe-border/10 rounded-lg px-3 py-2">
        <span className="text-pe-text-faint text-xs font-bold shrink-0">Stake $</span>
        <input
          type="number"
          min={1}
          max={10000}
          value={stake}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v > 0 && v <= 10000) onStakeChange(v);
          }}
          className="flex-1 bg-transparent text-pe-text-primary text-xs font-mono font-bold text-right outline-none w-0 min-w-0"
          aria-label="Stake amount in dollars"
        />
      </div>

      {/* Payout grid */}
      <div
        className={[
          "grid grid-cols-2 gap-2 rounded-lg border p-3 transition-colors",
          isReady
            ? "bg-pe-surface-2/30 border-pe-border/10"
            : "bg-pe-surface-1/30 border-pe-border/5 opacity-50",
        ].join(" ")}
      >
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
            To Win
          </p>
          <p className="text-base font-black font-mono text-emerald-400 mt-0.5">
            {isReady ? `$${profit.toFixed(2)}` : "\u2014"}
          </p>
        </div>
        <div className="text-center border-l border-pe-border/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint">
            Total Payout
          </p>
          <p className="text-base font-black font-mono text-pe-text-primary mt-0.5">
            {isReady ? `$${payout.toFixed(2)}` : "\u2014"}
          </p>
        </div>
      </div>

      {/* Legs count + odds info */}
      <div className="flex items-center justify-between text-[10px] text-pe-text-faint">
        <span className="font-mono">
          {numLegs} leg{numLegs !== 1 ? "s" : ""} · -110 per leg
        </span>
        <span>
          Multiplier{" "}
          <span className="text-pe-text-muted font-mono font-bold">
            {isReady ? `${Math.pow(ODDS_MULTIPLIER, numLegs).toFixed(2)}x` : "\u2014"}
          </span>
        </span>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-pe-text-faint leading-relaxed border-t border-pe-border/5 pt-2">
        Hit rates are historical. Standard -110 odds assumed for each leg.
        Combined probability is a mathematical product of individual hit rates.
      </p>
    </div>
  );
}

// ── Empty Parlay State ────────────────────────────────────────────────────────

function EmptyParlay() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-pe-surface-2/50 border border-pe-border/10 flex items-center justify-center mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-pe-text-faint"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <p className="text-xs font-bold text-pe-text-muted">No legs added yet</p>
      <p className="text-[11px] text-pe-text-faint mt-1">
        Add {MIN_LEGS}–{MAX_LEGS} picks from the left panel
      </p>
    </div>
  );
}

// ── Search / Filter bar ───────────────────────────────────────────────────────

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative px-3 py-2 border-b border-pe-border/10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pe-text-faint pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter by player or market..."
        className="w-full bg-pe-surface-2/50 border border-pe-border/10 rounded-lg text-xs text-pe-text-primary placeholder:text-pe-text-faint pl-7 pr-3 py-1.5 outline-none focus:border-pe-accent/40 transition-colors"
        aria-label="Filter available picks"
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ParlayBuilderProps {
  topPicks: TopPick[];
  underPicks: UnderPick[];
}

export default function ParlayBuilder({
  topPicks,
  underPicks,
}: ParlayBuilderProps) {
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
  const [stake, setStake] = useState(DEFAULT_STAKE);
  const [filter, setFilter] = useState("");

  // Convert all picks to a unified available picks list
  const availablePicks = useMemo<AvailablePick[]>(() => {
    const overItems: AvailablePick[] = topPicks.map((p) => ({
      playerName: p.playerName,
      marketCode: p.marketCode,
      marketName: p.marketName,
      bookLine: p.bookLine,
      hitRate: p.hitRate,
      direction: "over" as Direction,
      gamesChecked: p.gamesChecked,
      hitCount: p.overCount,
    }));
    const underItems: AvailablePick[] = underPicks.map((p) => ({
      playerName: p.playerName,
      marketCode: p.marketCode,
      marketName: p.marketName,
      bookLine: p.bookLine,
      hitRate: p.hitRate,
      direction: "under" as Direction,
      gamesChecked: p.gamesChecked,
      hitCount: p.underCount,
    }));
    // Sort by hitRate descending
    return [...overItems, ...underItems].sort((a, b) => b.hitRate - a.hitRate);
  }, [topPicks, underPicks]);

  // Set of added leg IDs for O(1) lookup
  const addedIds = useMemo(
    () => new Set(parlayLegs.map((l) => l.id)),
    [parlayLegs]
  );

  // Filtered picks for search
  const filteredPicks = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return availablePicks;
    return availablePicks.filter(
      (p) =>
        p.playerName.toLowerCase().includes(q) ||
        p.marketCode.toLowerCase().includes(q) ||
        p.marketName.toLowerCase().includes(q)
    );
  }, [availablePicks, filter]);

  const isFull = parlayLegs.length >= MAX_LEGS;

  function addLeg(pick: AvailablePick) {
    if (isFull) return;
    const id = legId(pick.playerName, pick.marketCode, pick.direction);
    if (addedIds.has(id)) return;

    // Check if same player + market already added (different direction)
    const conflict = parlayLegs.some(
      (l) => l.playerName === pick.playerName && l.marketCode === pick.marketCode
    );
    if (conflict) return;

    setParlayLegs((prev) => [
      ...prev,
      {
        id,
        playerName: pick.playerName,
        marketCode: pick.marketCode,
        marketName: pick.marketName,
        bookLine: pick.bookLine,
        hitRate: pick.hitRate,
        direction: pick.direction,
        gamesChecked: pick.gamesChecked,
        hitCount: pick.hitCount,
      },
    ]);
  }

  function removeLeg(id: string) {
    setParlayLegs((prev) => prev.filter((l) => l.id !== id));
  }

  function clearAll() {
    setParlayLegs([]);
  }

  // Determine if an available pick is "disabled" (player+market conflict or full)
  function isPickDisabled(pick: AvailablePick): boolean {
    if (isFull) return true;
    // Same player + market already in parlay (regardless of direction) = conflict
    return parlayLegs.some(
      (l) => l.playerName === pick.playerName && l.marketCode === pick.marketCode
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 min-h-[520px]">
      {/* ── Left: Available Picks ── */}
      <div className="flex flex-col lg:w-1/2 border-b lg:border-b-0 lg:border-r border-pe-border/10">
        {/* Panel header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-pe-border/10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-pe-text-faint">
              Available Picks
            </p>
            <p className="text-[10px] text-pe-text-faint mt-0.5">
              {availablePicks.length} picks · sorted by hit rate
            </p>
          </div>
          <span className="text-[10px] font-mono text-pe-text-faint bg-pe-surface-2/50 border border-pe-border/10 px-2 py-0.5 rounded-full">
            {parlayLegs.length}/{MAX_LEGS} legs
          </span>
        </div>

        {/* Search */}
        <SearchBar value={filter} onChange={setFilter} />

        {/* Picks list */}
        <div className="overflow-y-auto flex-1 max-h-[400px] lg:max-h-[480px]">
          {filteredPicks.length === 0 ? (
            <div className="py-10 text-center text-xs text-pe-text-faint">
              {filter ? "No picks match your filter." : "No picks available today."}
            </div>
          ) : (
            filteredPicks.map((pick) => {
              const id = legId(pick.playerName, pick.marketCode, pick.direction);
              return (
                <AvailablePickRow
                  key={id}
                  pick={pick}
                  isAdded={addedIds.has(id)}
                  isDisabled={isPickDisabled(pick)}
                  onAdd={() => addLeg(pick)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: Current Parlay ── */}
      <div className="flex flex-col lg:w-1/2">
        {/* Panel header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-pe-border/10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-pe-text-faint">
              Your Parlay
            </p>
            <p className="text-[10px] text-pe-text-faint mt-0.5">
              {parlayLegs.length === 0
                ? `Min ${MIN_LEGS} legs required`
                : `${parlayLegs.length} leg${parlayLegs.length !== 1 ? "s" : ""} · max ${MAX_LEGS}`}
            </p>
          </div>
          {parlayLegs.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors px-2 py-0.5 rounded"
              aria-label="Clear all parlay legs"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Legs list */}
        <div className="flex-1 overflow-y-auto max-h-[240px] lg:max-h-[240px]">
          {parlayLegs.length === 0 ? (
            <EmptyParlay />
          ) : (
            parlayLegs.map((leg, i) => (
              <ParlayLegRow
                key={leg.id}
                leg={leg}
                index={i}
                onRemove={() => removeLeg(leg.id)}
              />
            ))
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-pe-border/10" />

        {/* Payout summary */}
        <PayoutSummary
          legs={parlayLegs}
          stake={stake}
          onStakeChange={setStake}
        />
      </div>
    </div>
  );
}
