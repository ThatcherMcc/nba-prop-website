import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const MARKET_COLORS: Record<string, string> = {
  PTS: "#3b82f6",   // blue
  REB: "#f59e0b",   // amber
  AST: "#10b981",   // emerald
  BLK: "#a855f7",   // purple
  STL: "#f43f5e",   // rose
  FG3: "#f97316",   // orange
  PRA: "#6366f1",   // indigo
  PR:  "#818cf8",   // indigo-400
  PA:  "#2dd4bf",   // teal
  RA:  "#22d3ee",   // cyan
  SB:  "#ec4899",   // pink
};

function getMarketColor(code: string): string {
  return MARKET_COLORS[code] ?? "#71717a";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const player      = searchParams.get("player")     ?? "Player";
  const market      = searchParams.get("market")     ?? "PTS";
  const line        = searchParams.get("line")       ?? "0";
  const direction   = searchParams.get("direction")  ?? "OVER";
  const confidence  = searchParams.get("confidence") ?? "";
  const date        = searchParams.get("date")       ?? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const isOver      = direction.toUpperCase() !== "UNDER";
  const dirColor    = isOver ? "#10b981" : "#ef4444";
  const marketColor = getMarketColor(market.toUpperCase());
  const confPct     = confidence ? `${Math.round(parseFloat(confidence) * 100)}%` : null;

  // Trim long player names for layout
  const displayName = player.length > 22 ? player.slice(0, 21) + "…" : player;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle gradient accent behind the card */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-120px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${dirColor}18 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${marketColor}12 0%, transparent 70%)`,
          }}
        />

        {/* Top bar — branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 48px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Logo mark */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "900",
                color: "#ffffff",
              }}
            >
              P
            </div>
            <span
              style={{
                fontSize: "22px",
                fontWeight: "900",
                color: "#ffffff",
                letterSpacing: "-0.5px",
              }}
            >
              PropEdge
            </span>
          </div>
          <span
            style={{
              fontSize: "14px",
              color: "#52525b",
              fontWeight: "600",
            }}
          >
            AI Pick
          </span>
        </div>

        {/* Center card */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              width: "100%",
              maxWidth: "900px",
            }}
          >
            {/* Direction badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  background: isOver ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1.5px solid ${dirColor}50`,
                  borderRadius: "12px",
                  padding: "8px 20px",
                  fontSize: "16px",
                  fontWeight: "900",
                  color: dirColor,
                  letterSpacing: "2px",
                }}
              >
                {direction.toUpperCase()}
              </div>

              {/* Market badge */}
              <div
                style={{
                  background: `${marketColor}18`,
                  border: `1.5px solid ${marketColor}40`,
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "900",
                  color: marketColor,
                  letterSpacing: "1px",
                }}
              >
                {market.toUpperCase()}
              </div>
            </div>

            {/* Player name */}
            <div
              style={{
                fontSize: displayName.length > 16 ? "60px" : "72px",
                fontWeight: "900",
                color: "#ffffff",
                textAlign: "center",
                lineHeight: "1",
                letterSpacing: "-2px",
              }}
            >
              {displayName}
            </div>

            {/* Line */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "80px",
                  fontWeight: "900",
                  color: dirColor,
                  lineHeight: "1",
                  letterSpacing: "-3px",
                }}
              >
                {line}
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#71717a",
                  marginBottom: "8px",
                }}
              >
                {market.toUpperCase()}
              </span>
            </div>

            {/* Confidence bar */}
            {confPct && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  width: "320px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    borderRadius: "4px",
                    background: "#27272a",
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      width: confPct,
                      height: "8px",
                      background: dirColor,
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: dirColor,
                    letterSpacing: "0.5px",
                  }}
                >
                  {confPct} model confidence
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 48px 32px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#3f3f46",
              fontWeight: "600",
            }}
          >
            {date}
          </span>
          <span
            style={{
              fontSize: "13px",
              color: "#3f3f46",
              fontWeight: "700",
            }}
          >
            propedge.bet
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
