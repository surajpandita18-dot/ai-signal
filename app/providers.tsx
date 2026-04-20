// app/providers.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
    if (key) {
      posthog.init(key, {
        api_host: host,
        capture_pageview: false,   // manual only
        capture_pageleave: false,
        autocapture: false,        // NO autocapture — only our 3 events
        disable_session_recording: true,
        persistence: "localStorage",
      });
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
