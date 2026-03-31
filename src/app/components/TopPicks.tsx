"use client";

import type { TeamDefensiveRating, TopPick } from "@/lib/data";
import AnalyticsPickTable from "./AnalyticsPickTable";

interface Props {
  picks: TopPick[];
  defensiveRatings?: TeamDefensiveRating[];
  propDate?: string | null;
  onSelectPlayer?: (name: string, stat?: string, line?: number) => void;
}

export default function TopPicks({ picks, defensiveRatings = [], propDate, onSelectPlayer }: Props) {
  return (
    <AnalyticsPickTable
      side="over"
      picks={picks}
      defensiveRatings={defensiveRatings}
      propDate={propDate}
      onSelectPlayer={onSelectPlayer}
      sectionId="picks"
    />
  );
}
