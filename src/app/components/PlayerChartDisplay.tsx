"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { PlayerGameLog } from "@/db/schema";
import { PLAYER_STAT_TYPE } from "@/db/schema";

interface ChartProps {
  data: PlayerGameLog[];
  statKey: PLAYER_STAT_TYPE;
  propLine: number;
}
type ChartDataPoint = PlayerGameLog & {
  value: number;
  fillColor: string;
  gameDate: string;
};

export default function PlayerChartDisplay({
  data,
  statKey,
  propLine,
}: ChartProps) {
  /**
   * Formats the player data for charting,
   * Filters out null rows
   * Fetchs individual stat
   * Returns:
   *   the row data,
   *   adds value of the stat,
   *   changes date value to date
   *   adds fill color key
   */
  const formattedData = data
    .filter((game) => game.gameDate !== null)
    .map((game) => {
      // Get the stat value, defaulting to 0 if null
      const statValue = (game[statKey] as number) ?? 0;

      return {
        ...game,
        value: statValue,
        gameDate: new Date(game.gameDate as string).toLocaleDateString(
          "en-US",
          {
            month: "2-digit",
            day: "2-digit",
          }
        ),

        fillColor:
          statValue > propLine
            ? "#68dfdfff"
            : statValue < propLine
            ? "#eeb436ff"
            : "#767f86ff",
      };
    });

  return (
    <div className="p-2 flex flex-col bg-[#2a2a2a] rounded-xl shadow-xl/40 h-full">
      {/** STAT CHART */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 40, right: 30, left: 10, bottom: 20 }}
        >
          <XAxis
            dataKey="gameDate"
            angle={-45}
            textAnchor="end"
            interval={0}
            stroke="#ffffffff"
            tick={{ fill: "#ffffffff", fontSize: 12 }}
          />
          <YAxis
            dataKey="value"
            stroke="#ffffffff"
            tick={{ fill: "#ffffffff" }}
            type="number"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffffff",
              border: "1px solid #ffffffff",
              color: "s#ffffffff",
            }}
            labelStyle={{ color: "#ffffffff" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />

          <Bar
            dataKey="value"
            name={statKey.toUpperCase()}
            fill="#888"
            isAnimationActive={false}
          >
            {formattedData.map((entry: ChartDataPoint, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.fillColor} />
            ))}
          </Bar>

          <ReferenceLine
            y={propLine}
            stroke="#ffffffff"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Prop Line: ${propLine}`,
              position: "top",
              fill: "#ffffffff",
              fontSize: 14,
            }}
            className=""
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
