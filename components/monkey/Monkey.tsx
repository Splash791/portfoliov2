"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/motion";
import { useMonkey } from "./MonkeyContext";
import { drawMonkeyFrame, SPRITE_SIZE, type MonkeyFrame } from "./sprite";
import { pickSurprise, type Anchor } from "./surprises";

const DROP_DURATION_MS = 900;
const TRANSIT_SPEED_SCALE = 1.6; // anchors/sec, scaled by remaining distance
// -- slowed per direct request (was 3.5/5/1.2; the whole swing+fall hop
// takes roughly this much longer end to end now).
const TRANSIT_MAX_SPEED = 2.2; // anchors/sec cap, so a long scroll skip still
// catches up reasonably rather than lagging behind (per spec) -- just not
// at the original, faster pace.
const SNAP_THRESHOLD = 3; // anchors -- a gap larger than this snaps
// instantly to within one hop of the target instead of animating the
// whole distance (see the comment at its use site).
const FLIP_UPDATE_THRESHOLD = 0.3; // anchors -- below this, a direction
// change is a settle-time correction, not a real swing, and shouldn't
// flip which way the sprite faces (see the comment at its use site).
const TRANSIT_MIN_SPEED = 0.55; // anchors/sec floor -- without this, speed
// (proportional to remaining distance with no floor) shrinks toward zero
// as the monkey nears its target and asymptotically never arrives
// (reproduced live: `current` crept toward `target` for seconds without
// ever reaching it, leaving the monkey stuck oscillating between the
// swing/fall sub-phases instead of ever settling into the hang pose).
const ROPE_LEN = 26;
const HANG_SAG = 22; // px the hand hangs below the anchor's top-edge grip
// point while settled or at full swing extension -- also what makes the
// rope a real, visibly-above-the-sprite length rather than a sliver
// buried inside the sprite's own bounding box.
const SWING_RELEASE = 0.55; // fraction of a hop spent swinging before the
// pendulum "releases" into the parabolic-arc fall toward the next anchor.
const CLICK_LINES = ["Eek!", "Ooh!", "Hi there!", "Weee!", "Ook ook!"];

type Phase = "drop" | "idle" | "hang" | "swing" | "fall";

const TEXT_GAP = 10; // px of breathing room beyond the sprite's own
// half-width -- lands the monkey beside its text/card instead of on top
// of it. Per direct feedback: centering on the anchor (the original
// approach) put the monkey directly over the Hero heading and over card
// titles/body text. `x` below targets the sprite's *center*, so the
// clearance must cover the sprite's own half-width too, not just a fixed
// margin -- an earlier fixed-22px version left the sprite's near edge
// still ~26px inside the text (48px half-width minus 22px margin).

function measureAnchors(half: number): Anchor[] {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-monkey-anchor]"));
  return els.map((el) => {
    const rect = el.getBoundingClientRect();
    return {
      el,
      // No horizontal scroll on this page, so `rect.left`/`rect.right`
      // double as document-space x with no scrollX correction needed.
      x: rect.right + half + TEXT_GAP,
      y: rect.top + window.scrollY + rect.height / 2,
      top: rect.top + window.scrollY,
    };
  });
}

function nearestAnchorIndex(anchors: Anchor[]): number {
  if (!anchors.length) return 0;
  const viewportCenterY = window.scrollY + window.innerHeight / 2;
  let nearest = 0;
  let nearestDist = Infinity;
  anchors.forEach((a, i) => {
    const d = Math.abs(a.y - viewportCenterY);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = i;
    }
  });
  return nearest;
}

/**
 * The interactive pixel monkey (see the Hero button it's triggered from).
 * Not rendered at all until `active` -- and under reduced motion, renders
 * a single static badge near the trigger button instead of the full
 * scroll-swinging system (see CLAUDE.md's reduced-motion rules: this is a
 * hard behavioral branch, not a shortened animation).
 */
export default function Monkey() {
  const { active, surpriseToken } = useMonkey();
  const reducedMotion = useReducedMotionSafe();

  const [speech, setSpeech] = useState<{ text: string; visible: boolean }>({
    text: "",
    visible: false,
  });

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const speechElRef = useRef<HTMLDivElement | null>(null);
  const ropeRef = useRef<HTMLDivElement | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastFrameRef = useRef<MonkeyFrame | null>(null);
  const halfSizeRef = useRef(48);

  const anchorsRef = useRef<Anchor[]>([]);
  const targetIndexRef = useRef(0);
  const currentIndexRef = useRef(0);
  const phaseRef = useRef<Phase>("drop");
  const dropStartRef = useRef<number | null>(null);
  // True once the monkey has swung away from its drop-in landing spot at
  // least once -- a boolean, not an elapsed-time window, specifically
  // because a timestamp-based "show idle for N ms after landing" window
  // also fires (wrongly) on a later arrival at a *different* anchor if
  // that arrival happens to land within the same N ms of page load (e.g.
  // a quick scroll right after landing) -- reproduced live via a scripted
  // test: scrolling within ~1s of landing showed the sitting pose (no
  // rope) at the new anchor instead of the hanging pose. The idle *pose*
  // is reserved for "just dropped in and hasn't swung yet"; every arrival
  // after the first real swing should hang, regardless of clock time.
  const hasSwungRef = useRef(false);
  const bobPhaseRef = useRef(0);
  const flipRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const scrollRafPendingRef = useRef(false);
  const speechHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSurpriseIndexRef = useRef(-1);
  const prevSurpriseTokenRef = useRef(surpriseToken);

  function showSpeech(text: string, ms: number) {
    setSpeech({ text, visible: true });
    if (speechHideTimerRef.current) clearTimeout(speechHideTimerRef.current);
    speechHideTimerRef.current = setTimeout(() => {
      setSpeech((s) => ({ ...s, visible: false }));
    }, ms);
  }

  function handleSpriteClick() {
    showSpeech(CLICK_LINES[Math.floor(Math.random() * CLICK_LINES.length)], 1400);
  }

  // Full experience: measure anchors, track scroll, and run the rAF swing
  // loop. Skipped entirely under reduced motion (see the simpler branch
  // below) or before the monkey exists at all.
  useEffect(() => {
    if (!active || reducedMotion) return;

    function remeasure() {
      // Half-size first -- anchor x-positions are derived from it (see
      // measureAnchors), so it needs to be current before they're computed.
      if (wrapperRef.current) {
        halfSizeRef.current = wrapperRef.current.getBoundingClientRect().width / 2;
      }
      anchorsRef.current = measureAnchors(halfSizeRef.current);
    }
    remeasure();

    const landingIndex = nearestAnchorIndex(anchorsRef.current);
    currentIndexRef.current = landingIndex;
    targetIndexRef.current = landingIndex;
    phaseRef.current = "drop";
    dropStartRef.current = performance.now();
    lastScrollYRef.current = window.scrollY;

    function onScroll() {
      if (scrollRafPendingRef.current) return;
      scrollRafPendingRef.current = true;
      requestAnimationFrame(() => {
        scrollRafPendingRef.current = false;
        const sy = window.scrollY;
        lastScrollYRef.current = sy;
        targetIndexRef.current = nearestAnchorIndex(anchorsRef.current);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);

    let lastTs = performance.now();

    function tick(now: number) {
      const dt = Math.min(now - lastTs, 50) / 1000;
      lastTs = now;
      bobPhaseRef.current += dt;

      const anchors = anchorsRef.current;
      if (!anchors.length) {
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      let screenX: number;
      let screenY: number;
      let frame: MonkeyFrame;
      let ropeVisible = false;
      let ropeAnchorX = 0;
      let ropeAnchorY = 0;

      if (phaseRef.current === "drop") {
        const clampedIndex = Math.min(currentIndexRef.current, anchors.length - 1);
        const landing = anchors[Math.max(0, Math.round(clampedIndex))];
        const landScreenY = landing.y - window.scrollY;
        const landScreenX = landing.x;
        const startY = -60;
        const t = Math.min((now - (dropStartRef.current ?? now)) / DROP_DURATION_MS, 1);
        const fallT = Math.min(t / 0.75, 1);
        const bounceT = t > 0.75 ? (t - 0.75) / 0.25 : 0;
        const eased = fallT * fallT;
        screenY = startY + (landScreenY - startY) * eased - Math.sin(bounceT * Math.PI) * 8 * (1 - bounceT);
        screenX = landScreenX;
        frame = "fall";
        if (t >= 1) {
          phaseRef.current = "idle";
          showSpeech("ooh ooh!", 2200);
        }
      } else {
        const target = targetIndexRef.current;
        let diff = target - currentIndexRef.current;
        // A gradual wheel/touch scroll nudges `target` by a little at a
        // time, so `diff` is normally small and the per-frame speed below
        // closes it smoothly. But an instant jump (scrollbar-thumb drag,
        // Home/End, a `scrollTo` call) can move `target` many anchors at
        // once in a single tick -- and every anchor's *screen* position is
        // `doc-space - window.scrollY`, so once `window.scrollY` has
        // already jumped, anchors far from the new `target` convert to
        // wildly off-screen screen-space coordinates. Animating the full
        // distance through those anchors rendered the monkey far outside
        // the viewport for the whole catch-up (reproduced live: `top:
        // -671px` after an instant scroll to the page bottom). Snapping
        // instantly to one hop away from `target` keeps the only
        // *animated* distance short enough that its anchors are always
        // close to -- and therefore on-screen relative to -- the current
        // scroll position.
        if (Math.abs(diff) > SNAP_THRESHOLD) {
          currentIndexRef.current = target - Math.sign(diff);
          diff = target - currentIndexRef.current;
        }
        if (Math.abs(diff) > 0.001) {
          const dir = Math.sign(diff);
          // Only a *meaningful* move updates which way the sprite faces --
          // not every sub-anchor nudge. Native momentum scrolling settles
          // over several frames and can overshoot `target` slightly before
          // correcting back down; if `current` had already raced past that
          // revised target, the final correction's direction is backward
          // even though the whole scroll was clearly one way. Direction
          // only updates once per frame while actively moving (never
          // "un-sets" on settle), so that tiny backward correction stuck
          // permanently -- reproduced live via a debug trace: `flip` read
          // `true` (facing up) after a sustained scroll *down*.
          if (Math.abs(diff) > FLIP_UPDATE_THRESHOLD) {
            flipRef.current = dir < 0;
          }
          const speed = Math.max(
            Math.min(Math.abs(diff) * TRANSIT_SPEED_SCALE, TRANSIT_MAX_SPEED),
            TRANSIT_MIN_SPEED,
          );
          let next = currentIndexRef.current + dir * speed * dt;
          if ((dir > 0 && next >= target) || (dir < 0 && next <= target)) next = target;
          currentIndexRef.current = next;
          hasSwungRef.current = true;
        }

        const lower = Math.max(0, Math.min(anchors.length - 1, Math.floor(currentIndexRef.current)));
        const upper = Math.max(0, Math.min(anchors.length - 1, currentIndexRef.current > lower ? lower + 1 : lower));
        const t = upper === lower ? 0 : currentIndexRef.current - lower;

        const a0 = anchors[lower];
        const a1 = anchors[upper];
        // Two different y-references on purpose: the "idle" sit pose (no
        // rope) rests at the anchor's *center*, matching where the drop-in
        // sequence above already lands (also center-based) so there's no
        // visible jump at the hand-off between the two. Hang/swing/fall
        // all pivot from the anchor's *top edge* instead -- using the
        // center there put the rope's whole short length inside the
        // sprite's own 96px-tall box (hidden behind the opaque canvas);
        // reproduced live via a scripted contrast check, where the rope
        // element existed with correct geometry but was never visible.
        const a0CenterY = a0.y - window.scrollY;
        const a0TopY = a0.top - window.scrollY;
        const a1TopY = a1.top - window.scrollY;
        const half = halfSizeRef.current;

        if (t <= 0.0001) {
          const settledFrame: Phase = hasSwungRef.current ? "hang" : "idle";
          phaseRef.current = settledFrame;
          const bob = Math.sin(bobPhaseRef.current * 1.6) * 2.5;
          screenX = a0.x;
          frame = settledFrame === "hang" ? "hang" : "idle";
          if (settledFrame === "hang") {
            const handY = a0TopY + HANG_SAG + bob;
            screenY = handY + half;
            ropeVisible = true;
            ropeAnchorX = a0.x;
            ropeAnchorY = a0TopY;
          } else {
            screenY = a0CenterY + bob;
          }
        } else {
          const dxSign = Math.sign(a1.x - a0.x) || (flipRef.current ? -1 : 1);
          if (t < SWING_RELEASE) {
            phaseRef.current = "swing";
            const swingT = t / SWING_RELEASE;
            const angle = Math.sin(swingT * Math.PI) * 0.9 * dxSign;
            const handX = a0.x + Math.sin(angle) * ROPE_LEN;
            const handY = a0TopY + Math.cos(angle) * ROPE_LEN;
            screenX = handX;
            screenY = handY + half;
            frame = "swing";
            ropeVisible = true;
            ropeAnchorX = a0.x;
            ropeAnchorY = a0TopY;
          } else {
            phaseRef.current = "fall";
            const fallT = (t - SWING_RELEASE) / (1 - SWING_RELEASE);
            const releaseAngle = 0.9 * dxSign;
            const startHandX = a0.x + Math.sin(releaseAngle) * ROPE_LEN;
            const startHandY = a0TopY + Math.cos(releaseAngle) * ROPE_LEN;
            const endHandX = a1.x;
            const endHandY = a1TopY + HANG_SAG;
            const handX = startHandX + (endHandX - startHandX) * fallT;
            const handY =
              startHandY + (endHandY - startHandY) * fallT + Math.sin(fallT * Math.PI) * 14;
            screenX = handX;
            screenY = handY + half;
            frame = "fall";
          }
        }
      }

      const pad = 12 + halfSizeRef.current;
      screenX = Math.min(Math.max(screenX, pad), window.innerWidth - pad);

      if (wrapperRef.current) {
        const half = halfSizeRef.current;
        wrapperRef.current.style.transform =
          `translate3d(${screenX - half}px, ${screenY - half}px, 0) scaleX(${flipRef.current ? -1 : 1})`;
      }
      if (speechElRef.current) {
        speechElRef.current.style.transform = `translate3d(${screenX}px, ${screenY - halfSizeRef.current}px, 0)`;
      }
      if (canvasCtxRef.current && frame !== lastFrameRef.current) {
        drawMonkeyFrame(canvasCtxRef.current, frame);
        lastFrameRef.current = frame;
      }
      if (ropeRef.current) {
        if (ropeVisible) {
          // The rope's far end is the monkey's hand, which is where the
          // sprite's own top edge sits (`screenY - half`), not the
          // sprite's center (`screenY`) -- see HANG_SAG's comment.
          const handScreenY = screenY - halfSizeRef.current;
          const dx = screenX - ropeAnchorX;
          const dy = handScreenY - ropeAnchorY;
          const length = Math.hypot(dx, dy);
          const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
          ropeRef.current.style.display = "block";
          ropeRef.current.style.width = `${length}px`;
          ropeRef.current.style.transform = `translate3d(${ropeAnchorX}px, ${ropeAnchorY}px, 0) rotate(${angleDeg}deg)`;
        } else {
          ropeRef.current.style.display = "none";
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    }

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [active, reducedMotion]);

  // Surprise requests: watched via a ref comparison (not a dependency
  // array trick) since Hero and this component only share the token
  // through context, not a direct call.
  useEffect(() => {
    if (surpriseToken === prevSurpriseTokenRef.current) return;
    prevSurpriseTokenRef.current = surpriseToken;
    if (!active) return;

    if (reducedMotion) {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>("#projects [data-monkey-anchor]"),
      );
      if (!cards.length) return;
      const card = cards[Math.floor(Math.random() * cards.length)];
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("monkey-highlight");
      setTimeout(() => card.classList.remove("monkey-highlight"), 900);
      return;
    }

    const anchors = anchorsRef.current;
    if (!anchors.length) return;
    const { index, run } = pickSurprise(lastSurpriseIndexRef.current);
    lastSurpriseIndexRef.current = index;
    run({
      anchors,
      setTarget: (i) => {
        targetIndexRef.current = i;
      },
      say: (text) => showSpeech(text, 1800),
    });
  }, [surpriseToken, active, reducedMotion]);

  if (!active) return null;

  if (reducedMotion) {
    return (
      <ReducedMotionBadge speech={speech} onClick={handleSpriteClick} />
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <div
        ref={ropeRef}
        className="absolute left-0 top-0 h-[2px] bg-[var(--color-sage)]"
        style={{ width: 0, transformOrigin: "0 0", display: "none" }}
      />
      <div
        ref={wrapperRef}
        role="button"
        tabIndex={0}
        aria-label="A pixel monkey. Click for a reaction."
        onClick={handleSpriteClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleSpriteClick();
        }}
        className="pointer-events-auto absolute left-0 top-0 h-16 w-16 cursor-pointer sm:h-24 sm:w-24"
        style={{ transformOrigin: "50% 50%", willChange: "transform" }}
      >
        <canvas
          ref={(el) => {
            if (el && !canvasCtxRef.current) {
              const ctx = el.getContext("2d");
              if (ctx) {
                ctx.imageSmoothingEnabled = false;
                canvasCtxRef.current = ctx;
              }
            }
          }}
          width={SPRITE_SIZE}
          height={SPRITE_SIZE}
          style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
        />
      </div>
      <div
        ref={speechElRef}
        className="pointer-events-none absolute left-0 top-0"
        style={{ willChange: "transform" }}
      >
        {speech.visible && (
          <div className="-translate-x-1/2 -translate-y-[150%] whitespace-nowrap rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] text-paper shadow">
            {speech.text}
          </div>
        )}
      </div>
    </div>
  );
}

function ReducedMotionBadge({
  speech,
  onClick,
}: {
  speech: { text: string; visible: boolean };
  onClick: () => void;
}) {
  // Measured once via useState's lazy initializer (runs exactly once, on
  // mount) -- this only ever mounts client-side (gated behind `active &&
  // reducedMotion`, both false during SSR), so `document` is safe here.
  const [{ x, y }] = useState(() => {
    const trigger = document.querySelector<HTMLElement>("[data-monkey-trigger]");
    const rect = trigger?.getBoundingClientRect();
    return rect
      ? { x: Math.min(rect.right + 16, window.innerWidth - 56), y: Math.max(rect.top - 8, 16) }
      : { x: window.innerWidth - 72, y: 16 };
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[90] h-12 w-12"
      style={{ left: x, top: y }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="A pixel monkey. Click for a reaction."
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
        className="pointer-events-auto h-full w-full cursor-pointer"
      >
        <canvas
          ref={(el) => {
            const ctx = el?.getContext("2d");
            if (ctx) {
              ctx.imageSmoothingEnabled = false;
              drawMonkeyFrame(ctx, "idle");
            }
          }}
          width={SPRITE_SIZE}
          height={SPRITE_SIZE}
          style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
        />
      </div>
      {speech.visible && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] text-paper shadow">
          {speech.text}
        </div>
      )}
    </div>
  );
}
