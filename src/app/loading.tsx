export default function Loading() {
  return (
    <div className="py-8 space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="space-y-4">
        <div className="h-10 w-72 bg-zinc-800 rounded-xl" />
        <div className="h-5 w-96 bg-zinc-800/60 rounded-lg" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 bg-zinc-800/40 rounded-2xl border border-white/5"
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="mt-8 space-y-3">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-zinc-800/30 rounded-xl border border-white/5"
          />
        ))}
      </div>
    </div>
  );
}
