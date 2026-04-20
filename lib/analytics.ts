// lib/analytics.ts
// Only 3 events allowed. Do not add more without updating the spec.
// BROWSER-ONLY — do not import from server components or Node scripts.

import posthog from "posthog-js";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function trackSignalSaved(signalId: string): void {
  if (!isBrowser()) return;
  posthog.capture("signal_saved", { signal_id: signalId });
}

export function trackSignalDismissed(signalId: string): void {
  if (!isBrowser()) return;
  posthog.capture("signal_dismissed", { signal_id: signalId });
}

export function trackUpgradeClicked(location: "nav" | "zone1_gate" | "article"): void {
  if (!isBrowser()) return;
  posthog.capture("upgrade_clicked", { location });
}
