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
import { isDnpMinutes } from "@/lib/dnp";

export interface ChartProps {
  data: PlayerGameLog[];
  statKey: PLAYER_STAT_TYPE;
  propLine: number;
  /** When true, use smaller height and typography for small multiples. */
  compact?: boolean;
}

// Design Constants
const COLORS = {
  OVER: "#4ade80",
  UNDER: "#fbbf24",
  PUSH: "#94a3b8",
  DNP: "#64748b",
  GRID: "rgba(255, 255, 255, 0.05)",
  TEXT: "#94a3b8"
};

// Format YYYY-MM-DD as M/D without timezone shift (DB date is calendar date, not UTC midnight).
function formatGameDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return dateStr;
  return `${month}/${day}`;
}

// Bar value for DNP so the bar is visible but minimal (Recharts needs a number).
const DNP_BAR_VALUE = 0;

type ChartTooltipPayload = { isDnp?: boolean; value?: number; displayDate?: string };

function ChartTooltip(
  props: { active?: boolean; payload?: Array<{ payload: ChartTooltipPayload }>; label?: string }
) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/20 bg-zinc-900 px-3 py-2 text-sm shadow-xl">
      <div className="font-medium text-zinc-300">{label ?? entry.displayDate}</div>
      {entry.isDnp ? (
        <div className="font-bold text-zinc-400">DNP</div>
      ) : (
        <div className="font-bold text-white">{entry.value}</div>
      )}
    </div>
  );
}

export default function PlayerChartDisplay({ data, statKey, propLine, compact = false }: ChartProps) {
  const formattedData = useMemo(() => {
    return data
      .filter((game) => game.gameDate !== null)
      .map((game) => {
        const dnp = isDnpMinutes(game.mp);
        const statValue = dnp ? null : ((game[statKey] as number) ?? 0);
        const value = dnp ? DNP_BAR_VALUE : statValue!;
        return {
          ...game,
          value,
          isDnp: dnp,
          displayDate: formatGameDate(game.gameDate as string),
          fillColor: dnp
            ? COLORS.DNP
            : value > propLine
              ? COLORS.OVER
              : value < propLine
                ? COLORS.UNDER
                : COLORS.PUSH,
        };
      });
  }, [data, statKey, propLine]);

  const titleClass = compact
    ? "text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2"
    : "text-slate-400 text-xs font-bold uppercase tracking-widest mb-4";

  return (
    <div className={`p-4 bg-[#1e1e1e] border border-white/5 rounded-2xl shadow-2xl w-full ${compact ? "h-[280px]" : "h-[450px]"}`}>
      <h3 className={titleClass}>
        Last {data.length} Games: {statKey.toUpperCase()}
      </h3>
      
      <ResponsiveContainer width="100%" height={compact ? "85%" : "90%"}>
        <BarChart data={formattedData} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.GRID} />
          
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.TEXT, fontSize: compact ? 8 : 10 }}
            interval={Math.floor(formattedData.length / 10)} 
            dy={10}
          />
          
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.TEXT, fontSize: compact ? 9 : 12 }}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />

          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]} 
            barSize={Math.min(compact ? 20 : 32, Math.max(4, (compact ? 400 : 800) / formattedData.length))}
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
            label={
              compact
                ? undefined
                : {
                    value: `LINE: ${propLine}`,
                    position: "right",
                    fill: "#fff",
                    fontSize: 10,
                    fontWeight: "bold",
                  }
            }
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}