import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "7px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: 900,
            color: "#10b981",
            letterSpacing: "-0.5px",
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
