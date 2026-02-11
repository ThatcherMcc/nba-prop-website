"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { PlayerGameLog } from "@/db/schema";
import { isDnpMinutes } from "@/lib/dnp";

const PlayerChartDisplay = dynamic(() => import("./PlayerChartDisplay"), {
  ssr: false,
});
const PlayerCard = dynamic(() => import("./PlayerCard"), { ssr: false });

const FEATURED_STAT = "pts" as const;
const FEATURED_LINE = 20;

interface FeaturedPlayerProps {
  playerName: string;
  data: PlayerGameLog[];
}

export default function FeaturedPlayer({ playerName, data }: FeaturedPlayerProps) {
  const propLine = FEATURED_LINE;
  const hitRate = useMemo(() => {
    const played = data.filter((g) => !isDnpMinutes(g.mp));
    if (played.length === 0) return "0";
    const gamesOver = played.filter(
      (g) => ((g.pts as number | null) ?? 0) > propLine
    ).length;
    return ((gamesOver / played.length) * 100).toFixed(1);
  }, [data, propLine]);

  if (data.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          ⭐ Featured — last 10 games
        </h2>
        <Link
          href={`/player/${encodeURIComponent(playerName)}`}
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          View full profile →
        </Link>
      </div>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-square bg-gradient-to-b from-blue-600/20 to-transparent relative">
              <Image
                src="/LebronPic.png"
                fill
                className="object-contain p-4"
                alt={playerName}
              />
            </div>
            <div className="p-4 border-t border-white/10">
              <p className="text-sm font-bold text-zinc-400">{playerName}</p>
              <p className="text-xs text-zinc-500">PTS · Line {propLine}</p>
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
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl h-full min-h-[500px]">
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
