import type { MlbStarterGame } from "@/lib/mlbStarters";

function formatGameTime(time: string): string {
  if (!time) {
    return "TBD";
  }

  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m} ET`;
}

function statusStyles(status: string): { dot: string; text: string; label: string } {
  switch (status) {
    case "In Progress":
      return {
        dot: "bg-emerald-400 animate-pulse",
        text: "text-emerald-400",
        label: "Live",
      };
    case "Final":
      return {
        dot: "bg-zinc-500",
        text: "text-pe-text-faint",
        label: "Final",
      };
    default:
      return {
        dot: "bg-sky-400",
        text: "text-sky-400",
        label: status,
      };
  }
}

function GameCard({ game }: { game: MlbStarterGame }) {
  const st = statusStyles(game.status);
  const isSpringTraining = game.game_type === "S";

  return (
    <div className="bg-pe-surface-1 border border-pe-border/10 rounded-xl p-4 flex flex-col gap-3 hover:border-pe-border/20 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-pe-text-faint tabular-nums">
          {formatGameTime(game.game_time)}
        </span>
        <div className="flex items-center gap-2">
          {isSpringTraining && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
              ST
            </span>
          )}
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${st.text}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>
      </div>

      <div className="flex items-stretch gap-3">
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <span className="text-base font-black text-pe-text-primary tracking-tight">
            {game.away_team}
          </span>
          <span className="text-xs text-pe-text-faint leading-tight truncate">
            {game.away_pitcher.name}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-pe-text-faint">@</span>
        </div>

        <div className="flex-1 flex flex-col items-end gap-1 min-w-0">
          <span className="text-base font-black text-pe-text-primary tracking-tight">
            {game.home_team}
          </span>
          <span className="text-xs text-pe-text-faint leading-tight text-right truncate">
            {game.home_pitcher.name}
          </span>
        </div>
      </div>

      <div className="border-t border-pe-border/10 pt-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-pe-text-faint font-medium">
          Away SP
        </span>
        <span className="text-[10px] uppercase tracking-wider text-pe-text-faint font-medium">
          Home SP
        </span>
      </div>
    </div>
  );
}

interface MlbStartersTodayProps {
  games: MlbStarterGame[];
  title?: string;
}

export default function MlbStartersToday({
  games,
  title = "Today's Starters",
}: MlbStartersTodayProps) {
  const liveCount = games.filter((game) => game.status === "In Progress").length;
  const totalCount = games.length;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-pe-text-primary">{title}</h2>
          {liveCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {liveCount} Live
            </span>
          )}
        </div>
        <span className="text-xs text-pe-text-faint">
          {totalCount} {totalCount === 1 ? "game" : "games"}
        </span>
      </div>

      {games.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.game_pk} game={game} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-pe-border/10 bg-pe-surface-1 px-5 py-10 text-center">
          <p className="text-pe-text-faint text-sm">No games scheduled for today.</p>
        </div>
      )}
    </section>
  );
}
