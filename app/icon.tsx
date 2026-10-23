import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Dynamic favicon via Next's file convention + next/og, same approach as
// app/opengraph-image.tsx -- no static asset to source/fabricate for the
// background. The "Tq" mark itself is the user-supplied logo image
// (app/assets/tq-mark.png, black ink cut to a transparent PNG), composited
// on the paper background and centered, so the favicon matches the
// supplied logo exactly instead of approximating it with a font.
// --color-paper is hardcoded hex (not a CSS var) -- satori has no CSS
// cascade, so keep this in sync with app/globals.css by hand if it moves.
export default async function Icon() {
  const markData = await readFile(
    path.join(process.cwd(), "app/assets/tq-mark.png"),
  );
  const markSrc = `data:image/png;base64,${markData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f5f0",
        }}
      >
        <img src={markSrc} width={40} height={44} alt="" />
      </div>
    ),
    size,
  );
}
