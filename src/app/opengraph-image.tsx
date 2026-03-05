import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PropEdge — NBA player prop trends & analytics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #09090b 0%, #0d1f17 50%, #09090b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              background: "#10b981",
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 900,
              color: "#09090b",
              letterSpacing: "-1px",
            }}
          >
            PE
          </div>
          <div
            style={{
              fontSize: "80px",
              fontWeight: 900,
              letterSpacing: "-3px",
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            PROP
            <span style={{ color: "#10b981" }}>EDGE</span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#a1a1aa",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          NBA Player Prop Trends &amp; Analytics
        </div>

        {/* Accent bar */}
        <div
          style={{
            marginTop: "48px",
            width: "120px",
            height: "4px",
            background: "#10b981",
            borderRadius: "2px",
          }}
        />

        {/* Domain */}
        <div
          style={{
            marginTop: "24px",
            fontSize: "20px",
            color: "#10b981",
            letterSpacing: "2px",
          }}
        >
          propedge.bet
        </div>
      </div>
    ),
    { ...size }
  );
}
