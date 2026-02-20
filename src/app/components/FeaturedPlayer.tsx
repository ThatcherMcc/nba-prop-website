"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { PlayerGameLog } from "@/db/schema";
import { isDnpMinutes } from "@/lib/dnp";

const PlayerChartDisplay = dynamic(() => import("./PlayerChartDisplay"), {
  ssr: false,
});
const PlayerCard = dynamic(() => import("./PlayerCard"), { ssr: false });

const FEATURED_STAT = "pts" as const;
const DEFAULT_LINE = 10;

interface FeaturedPlayerProps {
  playerName: string;
  data: PlayerGameLog[];
}

function avg(nums: (number | null)[]): string {
  const valid = nums.filter((n): n is number => n != null && !isNaN(n));
  if (valid.length === 0) return "—";
  return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
}

export default function FeaturedPlayer({ playerName, data }: FeaturedPlayerProps) {
  const [propLine, setPropLine] = useState(DEFAULT_LINE);

  const played = useMemo(
    () => data.filter((g) => !isDnpMinutes(g.mp)),
    [data]
  );

  const hitRate = useMemo(() => {
    if (played.length === 0) return "0";
    const gamesOver = played.filter(
      (g) => ((g.pts as number | null) ?? 0) > propLine
    ).length;
    return ((gamesOver / played.length) * 100).toFixed(1);
  }, [played, propLine]);

  const avgPts = useMemo(() => avg(played.map((g) => g.pts)), [played]);
  const avgAst = useMemo(() => avg(played.map((g) => g.ast)), [played]);
  const avgReb = useMemo(() => avg(played.map((g) => g.trb)), [played]);

  if (data.length === 0) return null;

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wide text-yellow-400">
              GOAT Updates
            </h2>
            <p className="text-xs text-zinc-500">
              Year 22 and still cooking — The King&apos;s court is in session
            </p>
          </div>
        </div>
        <Link
          href={`/player/${encodeURIComponent(playerName)}`}
          className="text-sm font-medium text-yellow-400/80 hover:text-yellow-300 transition-colors"
        >
          Full stats →
        </Link>
      </div>

      {/* Quick stats bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="bg-zinc-900/80 border border-yellow-500/20 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
          <p className="text-xl font-black text-white">{avgPts}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/70">PTS</p>
        </div>
        <div className="bg-zinc-900/80 border border-yellow-500/20 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
          <p className="text-xl font-black text-white">{avgAst}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/70">AST</p>
        </div>
        <div className="bg-zinc-900/80 border border-yellow-500/20 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
          <p className="text-xl font-black text-white">{avgReb}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/70">REB</p>
        </div>
        <div className="bg-zinc-900/80 border border-yellow-500/20 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
          <p className="text-xl font-black text-white">{hitRate}%</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/70">HIT RATE</p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 border border-yellow-500/20 rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-square bg-gradient-to-b from-yellow-600/20 to-transparent relative">
              <Image
                src="/LebronPic.png"
                fill
                className="object-contain p-4"
                alt={playerName}
              />
            </div>
            <div className="p-4 border-t border-yellow-500/20">
              <p className="text-sm font-bold text-yellow-400">{playerName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-500">PTS · Line</span>
                <input
                  type="number"
                  value={propLine}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0) setPropLine(v);
                  }}
                  className="w-16 bg-zinc-800 border border-yellow-500/30 rounded-md px-2 py-0.5 text-xs text-white text-center outline-none focus:ring-1 focus:ring-yellow-500/50"
                  step={0.5}
                  min={0}
                />
                <span className="text-xs text-zinc-500">· Last {played.length} games</span>
              </div>
            </div>
          </div>
          <PlayerCard
            playerName={playerName}
            stat="PTS"
            propLine={propLine}
            hitRate={hitRate}
          />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-zinc-900 border border-yellow-500/20 rounded-2xl p-6 shadow-2xl h-full min-h-[500px]">
            <PlayerChartDisplay
              data={data}
              statKey={FEATURED_STAT}
              propLine={propLine}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
