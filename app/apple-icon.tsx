import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon, same design as app/icon.tsx at the larger size Apple
// expects -- see that file's header comment for why the paper color is
// hardcoded hex and why the mark is a composited image instead of a
// re-set font.
export default async function AppleIcon() {
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
        <img src={markSrc} width={113} height={124} alt="" />
      </div>
    ),
    size,
  );
}
