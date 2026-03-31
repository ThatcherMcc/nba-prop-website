"use client";

import type { TeamDefensiveRating, UnderPick } from "@/lib/data";
import AnalyticsPickTable from "./AnalyticsPickTable";

interface Props {
  picks: UnderPick[];
  defensiveRatings?: TeamDefensiveRating[];
  propDate?: string | null;
  onSelectPlayer?: (name: string, stat?: string, line?: number) => void;
}

export default function UnderPicks({ picks, defensiveRatings = [], propDate, onSelectPlayer }: Props) {
  return (
    <AnalyticsPickTable
      side="under"
      picks={picks}
      defensiveRatings={defensiveRatings}
      propDate={propDate}
      onSelectPlayer={onSelectPlayer}
    />
  );
}
