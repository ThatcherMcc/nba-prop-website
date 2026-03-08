import {
  getBacktestResults,
  getAvailableInsightWeeks,
  getWeeklyRecap,
  getMlBacktestResults,
} from "@/lib/data";
import type { BacktestResult, WeeklyRecap, MlBacktestSummary } from "@/lib/data";
import TrackRecordContent from "@/app/components/TrackRecordContent";

export const metadata = {
  title: "Track Record | PropEdge",
  description: "PropEdge historical pick accuracy and ML model performance tracking.",
};

export default async function TrackRecordPage() {
  let recentDay: BacktestResult = { gameDate: "", picks: [] };
  let recentWeek: WeeklyRecap | null = null;
  let mlBacktest: MlBacktestSummary = {
    totalPicks: 0, totalHits: 0, hitRate: 0, daysCount: 0, edge: 0,
    dailyResults: [], marketBreakdown: [], recentPicks: [],
  };

  try {
    const [dayResult, weeks, mlResult] = await Promise.all([
      getBacktestResults(),
      getAvailableInsightWeeks(),
      getMlBacktestResults(),
    ]);

    recentDay = dayResult;
    mlBacktest = mlResult;

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
      mlBacktest={mlBacktest}
    />
  );
}
