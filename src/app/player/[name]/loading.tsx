export default function PlayerLoading() {
  return (
    <div className="animate-pulse">
      {/* Player name skeleton */}
      <div className="mt-4 mb-6">
        <div className="h-9 w-64 bg-zinc-800 rounded-xl" />
        <div className="h-4 w-40 bg-zinc-800/60 rounded-lg mt-2" />
      </div>

      {/* Season stats pills skeleton */}
      <div className="flex gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-24 bg-zinc-800/40 rounded-xl border border-white/5"
          />
        ))}
      </div>

      {/* Chart area skeleton */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="h-80 bg-zinc-800/30 rounded-2xl border border-white/5" />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="h-80 bg-zinc-800/30 rounded-2xl border border-white/5" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-6">
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 bg-zinc-800/40 rounded-lg"
            />
          ))}
        </div>
        <div className="h-64 bg-zinc-800/20 rounded-2xl border border-white/5" />
      </div>
    </div>
  );
}
