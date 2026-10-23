// Procedural 24x24 pixel-art monkey -- painted with integer-aligned
// fillRect calls only (no path-fill curves like ctx.arc/ellipse), because
// Canvas2D anti-aliases vector fill edges and there is no way to turn
// that off; at 24x24 scaled up ~4x via `image-rendering: pixelated`, an
// anti-aliased edge blows up into a soft blur instead of a crisp pixel-
// art block. `fillEllipsePx` below gets the "ellipse" shape by scanning
// integer coordinates and testing each one against the ellipse equation,
// not by asking the canvas to rasterize a curve.
//
// Colors are hardcoded hex, not CSS vars -- same reasoning as
// app/opengraph-image.tsx: canvas 2D (like satori) reads `ctx.fillStyle`
// directly and has no CSS cascade, so these need manual sync with
// app/globals.css's palette if it ever changes again.
export const SPRITE_SIZE = 24;

const OUTLINE = "#2a1d12";
const FUR = "#5e4830"; // umber
const FUR_LIGHT = "#8c6b42"; // tan
const FACE = "#ddd0b0"; // cream
const EYE = "#141210"; // ink
const MOUTH = "#3a2c1e"; // espresso

export type MonkeyFrame = "idle" | "hang" | "swing" | "fall";

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

function fillEllipsePx(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
) {
  const x0 = Math.floor(cx - rx);
  const x1 = Math.ceil(cx + rx);
  const y0 = Math.floor(cy - ry);
  const y1 = Math.ceil(cy + ry);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1) px(ctx, x, y, color);
    }
  }
}

// Paints a slightly larger ellipse in `outline` first, then the real
// ellipse in `fill` on top -- a cheap way to get a 1px outline ring
// without a separate stroke pass.
function fillRingPx(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  outline: string,
) {
  fillEllipsePx(ctx, cx, cy, rx + 0.8, ry + 0.8, outline);
  fillEllipsePx(ctx, cx, cy, rx, ry, fill);
}

function fillDotsPx(ctx: CanvasRenderingContext2D, points: [number, number][], color: string) {
  for (const [x, y] of points) px(ctx, x, y, color);
}

const TAIL_BY_FRAME: Record<MonkeyFrame, [number, number][]> = {
  idle: [[17, 18], [18, 17], [19, 16], [19, 15], [18, 14], [17, 14]],
  hang: [[17, 20], [18, 19], [19, 18], [19, 17], [18, 16]],
  swing: [[19, 20], [20, 19], [21, 18], [21, 16], [20, 15]],
  fall: [[18, 17], [19, 17], [20, 17], [21, 17]],
};

/**
 * Paints one animation frame into a 24x24 canvas context. The caller owns
 * the canvas's size/scale/horizontal-flip (flip is a plain CSS
 * `scaleX(-1)` on the element wrapping the canvas, not handled here) --
 * this only fills pixels for the given frame.
 */
export function drawMonkeyFrame(ctx: CanvasRenderingContext2D, frame: MonkeyFrame) {
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  const bodyDrop = frame === "hang" || frame === "swing" ? 2 : 0;
  const leanX = frame === "swing" ? 1 : 0;
  const headCx = 12 + leanX;
  const headCy = 7 + bodyDrop;
  const bodyCx = 12 + leanX;
  const bodyCy = 16 + bodyDrop;

  // Tail, painted first so it sits behind the body silhouette.
  fillDotsPx(ctx, TAIL_BY_FRAME[frame], FUR);

  // Legs.
  if (frame === "fall") {
    fillDotsPx(ctx, [[9, 20], [8, 21], [7, 22], [6, 23]], FUR);
    fillDotsPx(ctx, [[15, 20], [16, 21], [17, 22], [18, 23]], FUR);
  } else if (frame === "hang") {
    fillEllipsePx(ctx, 9, 23, 1.7, 2, FUR);
    fillEllipsePx(ctx, 15, 23, 1.7, 2, FUR);
  } else if (frame === "swing") {
    fillEllipsePx(ctx, 10 + leanX, 22, 1.7, 2.2, FUR);
    fillEllipsePx(ctx, 17 + leanX, 23, 1.7, 2, FUR);
  } else {
    fillEllipsePx(ctx, 9, 21, 1.8, 2.4, FUR);
    fillEllipsePx(ctx, 15, 21, 1.8, 2.4, FUR);
  }

  // Body + belly.
  fillRingPx(ctx, bodyCx, bodyCy, 4.5, 5.5, FUR, OUTLINE);
  fillEllipsePx(ctx, bodyCx, bodyCy + 0.5, 2.6, 3.8, FACE);

  // Arms.
  if (frame === "fall") {
    fillDotsPx(ctx, [[8, 13], [7, 12], [6, 11], [5, 10]], FUR);
    fillDotsPx(ctx, [[16, 13], [17, 12], [18, 11], [19, 10]], FUR);
  } else if (frame === "hang" || frame === "swing") {
    // Gripping arm -- a vertical limb reaching up to a fixed point above
    // the sprite; the rope itself is drawn by Monkey.tsx, not here.
    fillRingPx(ctx, 17 + leanX, 4, 1.6, 4.5, FUR, OUTLINE);
    fillEllipsePx(ctx, 8, 17 + bodyDrop, 1.6, 2.4, FUR);
  } else {
    fillEllipsePx(ctx, 7.5, 15, 1.6, 2.6, FUR);
    fillEllipsePx(ctx, 16.5, 15, 1.6, 2.6, FUR);
  }

  // Ears.
  fillRingPx(ctx, headCx - 5, headCy - 2, 1.8, 1.8, FUR, OUTLINE);
  fillRingPx(ctx, headCx + 5, headCy - 2, 1.8, 1.8, FUR, OUTLINE);

  // Head + face.
  fillRingPx(ctx, headCx, headCy, 5, 4.5, FUR, OUTLINE);
  fillEllipsePx(ctx, headCx, headCy + 1.5, 3, 2.5, FACE);
  fillDotsPx(
    ctx,
    [
      [headCx - 2, headCy - 1],
      [headCx - 2, headCy],
      [headCx + 2, headCy - 1],
      [headCx + 2, headCy],
    ],
    EYE,
  );
  fillDotsPx(
    ctx,
    [
      [headCx - 0.5, headCy + 2],
      [headCx + 0.5, headCy + 2],
    ],
    MOUTH,
  );

  // A light fur highlight for a touch of depth.
  fillDotsPx(ctx, [[headCx - 3, headCy - 3], [bodyCx - 3, bodyCy - 3]], FUR_LIGHT);
}
