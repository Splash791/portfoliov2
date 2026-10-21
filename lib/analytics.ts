// Inert analytics hook (section 7's phase list). section 2's stack doesn't
// name a specific analytics provider, so this stays a no-op placeholder
// rather than wiring up a new third-party service unprompted — swap the
// body for a real provider call (e.g. Vercel Analytics) when one is chosen.
export function trackEvent(name: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics:stub]", name, data);
  }
}
