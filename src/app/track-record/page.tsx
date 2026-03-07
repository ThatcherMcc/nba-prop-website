import {
  getBacktestResults,
  getAvailableInsightWeeks,
  getWeeklyRecap,
} from "@/lib/data";
import type { BacktestResult, WeeklyRecap } from "@/lib/data";
import TrackRecordContent from "@/app/components/TrackRecordContent";

export const metadata = {
  title: "Track Record",
  description: "PropEdge historical pick accuracy and performance tracking.",
};

export default async function TrackRecordPage() {
  let recentDay: BacktestResult = { gameDate: "", picks: [] };
  let recentWeek: WeeklyRecap | null = null;

  try {
    // Fetch most recent graded day and available weeks in parallel
    const [dayResult, weeks] = await Promise.all([
      getBacktestResults(),
      getAvailableInsightWeeks(),
    ]);

    recentDay = dayResult;

    // If there are completed weeks, fetch the most recent one
    if (weeks.length > 0) {
      recentWeek = await getWeeklyRecap(weeks[0].weekStart);
    }
  } catch (e) {
    console.error("Track Record page data load failed:", e);
  }

  return (
    <TrackRecordContent recentDay={recentDay} recentWeek={recentWeek} />
  );
}
