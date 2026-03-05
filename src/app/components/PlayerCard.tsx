interface PlayerCardProps {
  playerName: string;
  stat: string;
  propLine: number;
  hitRate: string;
  gameCount?: number;
  verdict?: string;
}

export default function PlayerCard({
  playerName,
  stat,
  propLine,
  hitRate,
  gameCount,
  verdict,
}: PlayerCardProps) {
  void playerName;
  void stat;
  const isHighHit = parseFloat(hitRate) >= 60;
  const isLowHit = parseFloat(hitRate) <= 40;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-pe-surface-1/50 border border-pe-border/10 p-6 backdrop-blur-md shadow-2xl ring-1 ring-inset ring-white/5">
      <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[80px] opacity-20 transition-colors duration-500 ${isHighHit ? "bg-emerald-500" : isLowHit ? "bg-rose-500" : "bg-blue-500"}`} />

      <div className="flex flex-col gap-6 relative z-10">
        {/* Betting signal — plain language for "is this a good bet?" */}
        {verdict && (
          <div className="rounded-xl bg-pe-surface-2/30 border border-pe-border/10 p-3">
            <p className="text-[9px] uppercase text-pe-text-faint font-bold tracking-widest mb-1.5">Betting signal</p>
            <p className="text-sm font-medium text-pe-text-secondary leading-snug">{verdict}</p>
            {gameCount != null && (
              <p className="text-[10px] text-pe-text-faint mt-1.5">Based on last {gameCount} games.</p>
            )}
          </div>
        )}

        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pe-text-faint">Your line</p>
            <h2 className="text-5xl font-black text-pe-text-primary tracking-tighter">{propLine}</h2>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pe-text-faint">Hit rate (Over)</p>
            <h2 className={`text-5xl font-black tracking-tighter ${isHighHit ? "text-emerald-400" : isLowHit ? "text-rose-400" : "text-amber-400"}`}>
              {hitRate}%
            </h2>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-pe-border/10 to-transparent" />

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-pe-surface-2/30 rounded-xl p-3 border border-pe-border/5">
            <p className="text-[9px] uppercase text-pe-text-faint font-bold tracking-widest mb-1">Status</p>
            <p className={`text-sm font-bold ${isHighHit ? "text-emerald-400" : "text-pe-text-secondary"}`}>
              {isHighHit ? "🔥 ON FIRE" : "🧊 STRETCH"}
            </p>
          </div>
          <div className="bg-pe-surface-2/30 rounded-xl p-3 border border-pe-border/5">
            <p className="text-[9px] uppercase text-pe-text-faint font-bold tracking-widest mb-1">Consistency</p>
            <p className="text-sm font-bold text-pe-text-secondary">
              {parseFloat(hitRate) > 50 ? "Reliable" : "Volatile"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
