import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          borderRadius: "40px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            fontSize: "80px",
            fontWeight: 900,
            color: "#10b981",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          PE
        </span>
      </div>
    ),
    { ...size }
  );
}
