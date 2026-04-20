// lib/analytics.ts
// Only 3 events allowed. Do not add more without updating the spec.

import posthog from "posthog-js";

export function trackSignalSaved(signalId: string): void {
  posthog.capture("signal_saved", { signal_id: signalId });
}

export function trackSignalDismissed(signalId: string): void {
  posthog.capture("signal_dismissed", { signal_id: signalId });
}

export function trackUpgradeClicked(location: "nav" | "zone1_gate" | "article"): void {
  posthog.capture("upgrade_clicked", { location });
}
