import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamic OG image via Next's file convention + next/og — no static asset
// to source/fabricate, the lighter option per section 0.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f5f0",
          // Hardcoded hex, not CSS vars -- next/og's satori renderer runs
          // outside the regular page/Tailwind pipeline, so these have to
          // be kept in sync with app/globals.css's palette by hand.
          backgroundImage:
            "radial-gradient(circle at 15% 20%, #8c6b42 0%, transparent 40%), radial-gradient(circle at 85% 15%, #3a2c1e 0%, transparent 40%), radial-gradient(circle at 75% 85%, #b89968 0%, transparent 40%), radial-gradient(circle at 20% 85%, #5e4830 0%, transparent 40%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "48px 72px",
            borderRadius: 40,
            background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(255,255,255,0.45)",
          }}
        >
          <div style={{ fontSize: 88, color: "#141210", fontWeight: 600 }}>
            Tyler Quach
          </div>
          <div style={{ fontSize: 32, color: "#141210", opacity: 0.7, marginTop: 12 }}>
            CS @ Oregon State University
          </div>
        </div>
      </div>
    ),
    size,
  );
}
