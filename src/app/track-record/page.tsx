import {
  getBacktestResults,
  getAvailableInsightWeeks,
  getWeeklyRecap,
} from "@/lib/data";
import type { BacktestResult, WeeklyRecap } from "@/lib/data";
import TrackRecordContent from "@/app/components/TrackRecordContent";

export const metadata = {
  title: "Track Record | PropEdge",
  description: "PropEdge historical analytics pick results and weekly recap tracking.",
};

export default async function TrackRecordPage() {
  let recentDay: BacktestResult = { gameDate: "", picks: [] };
  let recentWeek: WeeklyRecap | null = null;

  try {
    const [dayResult, weeks] = await Promise.all([
      getBacktestResults(),
      getAvailableInsightWeeks(),
    ]);

    recentDay = dayResult;

    if (weeks.length > 0) {
      recentWeek = await getWeeklyRecap(weeks[0].weekStart);
    }
  } catch (e) {
    console.error("Track Record page data load failed:", e);
  }

  return (
    <TrackRecordContent
      recentDay={recentDay}
      recentWeek={recentWeek}
    />
  );
}
