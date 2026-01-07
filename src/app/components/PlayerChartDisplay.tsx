"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  CartesianGrid
} from "recharts";
import { PlayerGameLog, PLAYER_STAT_TYPE } from "@/db/schema";

interface ChartProps {
  data: PlayerGameLog[];
  statKey: PLAYER_STAT_TYPE;
  propLine: number;
}

// Design Constants
const COLORS = {
  OVER: "#4ade80",
  UNDER: "#fbbf24",
  PUSH: "#94a3b8",
  GRID: "rgba(255, 255, 255, 0.05)",
  TEXT: "#94a3b8" 
};

export default function PlayerChartDisplay({ data, statKey, propLine }: ChartProps) {
  
  // 1. Memoize formatting to prevent unnecessary recalculations
  const formattedData = useMemo(() => {
    return data
      .filter((game) => game.gameDate !== null)
      .map((game) => {
        const statValue = (game[statKey] as number) ?? 0;
        return {
          ...game,
          value: statValue,
          displayDate: new Date(game.gameDate as string).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
          }),
          fillColor:
            statValue > propLine ? COLORS.OVER : 
            statValue < propLine ? COLORS.UNDER : COLORS.PUSH,
        };
      });
  }, [data, statKey, propLine]);

  return (
    <div className="p-4 bg-[#1e1e1e] border border-white/5 rounded-2xl shadow-2xl h-[450px] w-full">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
        Last {data.length} Games: {statKey.toUpperCase()}
      </h3>
      
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {/* Subtle horizontal grid lines only */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.GRID} />
          
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.TEXT, fontSize: 10 }}
            interval={Math.floor(formattedData.length / 10)} 
            dy={10}
          />
          
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.TEXT, fontSize: 12 }}
          />

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#fff"
            }}
            itemStyle={{ fontWeight: "bold" }}
          />

          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]} 
            barSize={Math.min(32, Math.max(4, 800 / formattedData.length))}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fillColor} fillOpacity={0.9} className="hover:opacity-100 transition-opacity" />
            ))}
          </Bar>

          <ReferenceLine
            y={propLine}
            stroke="#fff"
            strokeDasharray="5 5"
            strokeWidth={1}
            label={{
              value: `LINE: ${propLine}`,
              position: "right",
              fill: "#fff",
              fontSize: 10,
              fontWeight: "bold",
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}