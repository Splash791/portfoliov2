export type Anchor = {
  el: HTMLElement;
  x: number; // document-space center (no horizontal scroll on this page,
  y: number; // so this doubles as viewport-space x without adjustment)
  top: number; // document-space top edge -- the rope's grip point hangs
  // from here, not from the element's center (see Monkey.tsx).
};

export type MonkeyApi = {
  anchors: Anchor[];
  /** Points the swing system at this anchor index; Monkey.tsx's own rAF
   *  loop animates the actual swing there. */
  setTarget: (index: number) => void;
  /** Shows a short speech-bubble line above the monkey. */
  say: (text: string) => void;
};

function highlight(el: HTMLElement) {
  el.classList.add("monkey-highlight");
  setTimeout(() => el.classList.remove("monkey-highlight"), 900);
}

function goTo(api: MonkeyApi, el: HTMLElement, say: string) {
  const index = api.anchors.findIndex((a) => a.el === el);
  if (index === -1) return;
  api.setTarget(index);
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  highlight(el);
  api.say(say);
}

// Kept as an array of small functions (not a switch) specifically so more
// can be dropped in later without touching the picking logic below.
export const surprises: Array<(api: MonkeyApi) => void> = [
  (api) => {
    const cards = api.anchors.filter((a) => a.el.closest("#projects") && a.el.tagName === "BUTTON");
    if (!cards.length) return;
    const target = cards[Math.floor(Math.random() * cards.length)];
    goTo(api, target.el, "Check this one out!");
  },
  (api) => {
    const target = api.anchors.find((a) => a.el.closest("#travel"));
    if (!target) return;
    goTo(api, target.el, "Let's go somewhere!");
  },
  (api) => {
    const target = api.anchors.find((a) => a.el.closest("#about"));
    if (!target) return;
    goTo(api, target.el, "This is Tyler!");
  },
  (api) => {
    const cards = api.anchors.filter((a) => a.el.closest("#experience"));
    if (!cards.length) return;
    const target = cards[Math.floor(Math.random() * cards.length)];
    goTo(api, target.el, "Hard worker, that one.");
  },
];

/** Picks a random surprise, never repeating the index passed as `lastIndex`. */
export function pickSurprise(lastIndex: number): { index: number; run: (api: MonkeyApi) => void } {
  let index = Math.floor(Math.random() * surprises.length);
  if (surprises.length > 1) {
    while (index === lastIndex) index = Math.floor(Math.random() * surprises.length);
  }
  return { index, run: surprises[index] };
}
