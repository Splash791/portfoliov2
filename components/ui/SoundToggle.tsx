"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "sound-enabled";
const listeners = new Set<() => void>();

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot() {
  return false;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setSoundEnabled(next: boolean) {
  window.localStorage.setItem(STORAGE_KEY, String(next));
  listeners.forEach((listener) => listener());
}

// Reusable read hook so other components (Nav, ProjectModal, TripGallery,
// PageTransition) can check the persisted sound/haptics preference — section
// 8 groups sound + haptics under this one toggle, no separate switch.
export function useSoundEnabled() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function SoundToggle() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setSoundEnabled(!enabled)}
      aria-pressed={enabled}
      // Accessible name must contain the visible "ON"/"OFF" text (WCAG
      // 2.5.3 Label in Name) — a voice-control user sees "OFF" on screen
      // and needs that word in what they can say to target it, even though
      // the span itself is aria-hidden for screen-reader phrasing.
      aria-label={enabled ? "ON, tap to mute sound" : "OFF, tap to enable sound"}
      className="flex h-8 w-8 items-center justify-center rounded-full text-ink/70 transition-colors hover:text-ink"
    >
      <span aria-hidden className="text-xs font-mono">
        {enabled ? "ON" : "OFF"}
      </span>
    </button>
  );
}
