interface PlayerCardProps {
  playerName: string;
  stat: string;
  propLine: number;
  hitRate: string;
}

const ACCENT_COLOR_LINE = "#FFC72C"; // Vibrant Gold for the target line
const COLOR_HIT = "#66BB6A"; // Clean Green
const COLOR_MISS = "#EF5350"; // Clear Red

export default function PlayerCard({
  playerName,
  stat,
  propLine,
  hitRate,
}: PlayerCardProps) {
  const hitRateColor =
    parseFloat(hitRate) >= 60
      ? COLOR_HIT
      : parseFloat(hitRate) <= 40
      ? COLOR_MISS
      : "#FFA726";

  return (
    <div className="py-5 px-10 rounded-xl bg-[#2a2a2a] mb-[30px] text-[#f0f0f0] shadow-2xl shadow-black/40">
      <div className="grid grid-cols-3 gap-[30px]">
        {/* 1. Prop Line (Target) */}
        <div style={{ textAlign: "center" }}>
          <p className="text-md m-0 text-[#aaa]">TARGET LINE</p>
          <p
            style={{
              fontSize: "3.5rem",
              fontWeight: "900",
              color: ACCENT_COLOR_LINE,
              margin: "5px 0 0 0",
            }}
          >
            {propLine}
          </p>
        </div>

        {/* 2. Hit Rate */}
        <div style={{ textAlign: "center" }}>
          <p className="text-md m-0 text-[#aaa]">HIT RATE</p>
          <p
            style={{
              fontSize: "3.5rem",
              fontWeight: "900",
              color: hitRateColor,
              margin: "5px 0 0 0",
            }}
          >
            {hitRate}%
          </p>
        </div>

        {/* 3. ML Prediction / Prop Edge (Placeholder) */}
        <div style={{ textAlign: "center" }}>
          <p className="text-md m-0 text-[#aaa]">ANALYTICS EDGE</p>
          <p
            style={{
              fontSize: "3.5rem",
              fontWeight: "900",
              color: "#ccc",
              margin: "5px 0 0 0",
              opacity: 0.6,
            }}
          >
            N/A
          </p>
        </div>
      </div>
    </div>
  );
}
