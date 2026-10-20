// Placeholder UI sounds (section 8: "subtle, tasteful UI sounds — hover
// ticks, modal open/close, transition whoosh"). No real sound-design assets
// exist (not listed anywhere in section 11's asset inventory), so rather than
// inventing/sourcing binary audio files, these are tiny synthesized tones via
// the raw Web Audio API — no Howler needed for a few short oscillator blips,
// which is the lighter option per section 0. Replace with real sound design
// later; keep these quiet and short in the meantime.

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(frequency: number, durationMs: number, type: OscillatorType = "sine", peakGain = 0.05) {
  const audioCtx = getContext();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  const now = audioCtx.currentTime;
  const durationS = durationMs / 1000;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationS);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + durationS);
}

/** Short hover tick (nav links). */
export function playTick() {
  tone(880, 60, "sine", 0.03);
}

/** Modal/panel opening. */
export function playOpen() {
  tone(520, 90, "triangle", 0.045);
}

/** Modal/panel closing — slightly lower than open. */
export function playClose() {
  tone(360, 90, "triangle", 0.04);
}

/** Route/page transition whoosh — a quick upward sweep. */
export function playWhoosh() {
  const audioCtx = getContext();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  const now = audioCtx.currentTime;
  const durationS = 0.15;
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(660, now + durationS);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationS);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + durationS);
}

/** Short haptic buzz on touch devices, independent of sound playback. */
export function vibrate(ms = 10) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  navigator.vibrate(ms);
}
