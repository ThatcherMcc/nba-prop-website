"use client";

function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return "Updating...";
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

export default function HomeHero({
  lastUpdated,
}: {
  lastUpdated?: string | null;
}) {
  const isRecent =
    lastUpdated != null &&
    Date.now() - new Date(lastUpdated).getTime() < 6 * 3600000;

  return (
    <header className="mb-12 pt-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2.5 w-2.5">
          {isRecent && (
            <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRecent ? "bg-emerald-500" : "bg-zinc-500"}`}
          />
        </span>
        <span
          className={`text-xs font-bold uppercase tracking-widest ${isRecent ? "text-emerald-400" : "text-zinc-400"}`}
        >
          {formatRelativeTime(lastUpdated)}
        </span>
      </div>

      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
          Find Your Edge
        </span>
      </h1>

      <p className="text-zinc-400 text-base md:text-lg max-w-2xl mb-6">
        Real-time player trends, hot streaks & cold spells — built for smarter bets.
        Pick a player and see the numbers that matter.
      </p>

      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 bg-zinc-800/80 border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-300">
          <span className="text-blue-400">515+</span> Players Tracked
        </span>
        <span className="inline-flex items-center gap-1.5 bg-zinc-800/80 border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-300">
          <span className="text-purple-400">26</span> Stat Categories
        </span>
        <span className="inline-flex items-center gap-1.5 bg-zinc-800/80 border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-300">
          <span className="text-emerald-400">Daily</span> Updates
        </span>
      </div>
    </header>
  );
}
