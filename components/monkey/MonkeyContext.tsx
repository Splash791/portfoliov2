"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type MonkeyContextValue = {
  // Becomes true on the Hero button's first click; before that the
  // monkey has no DOM presence at all (not hidden -- not rendered).
  active: boolean;
  activate: () => void;
  // Bumped on every "Give me a surprise" click. Monkey.tsx watches this
  // value (via a ref comparison, not a dependency array trick) rather
  // than Hero calling into Monkey directly -- the two are siblings
  // under MonkeyProvider in app/page.tsx, not parent/child.
  surpriseToken: number;
  triggerSurprise: () => void;
};

const MonkeyContext = createContext<MonkeyContextValue | null>(null);

export function MonkeyProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [surpriseToken, setSurpriseToken] = useState(0);

  const activate = useCallback(() => setActive(true), []);
  const triggerSurprise = useCallback(() => setSurpriseToken((t) => t + 1), []);

  return (
    <MonkeyContext.Provider value={{ active, activate, surpriseToken, triggerSurprise }}>
      {children}
    </MonkeyContext.Provider>
  );
}

export function useMonkey() {
  const ctx = useContext(MonkeyContext);
  if (!ctx) {
    throw new Error("useMonkey must be used within a MonkeyProvider");
  }
  return ctx;
}
