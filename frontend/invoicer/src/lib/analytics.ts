import posthog from "posthog-js";

const TOKEN = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN || "";
const HOST = import.meta.env.VITE_POSTHOG_HOST || "https://eu.i.posthog.com";

let ready = false;

export function initAnalytics() {
  if (ready || !TOKEN || typeof window === "undefined") return;
  posthog.init(TOKEN, {
    api_host: HOST,
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    opt_out_capturing_by_default: true,
  });
  ready = true;
}

export const analytics = {
  setAllowed(allowed: boolean) {
    if (!TOKEN) return;
    initAnalytics();
    if (allowed) posthog.opt_in_capturing();
    else posthog.opt_out_capturing();
  },
  identify(userId: string, props?: { locale?: string }) {
    if (!TOKEN) return;
    initAnalytics();
    posthog.identify(userId, props);
  },
  reset() {
    if (!TOKEN) return;
    posthog.reset();
  },
  pageview(path: string) {
    if (!TOKEN) return;
    posthog.capture("$pageview", { path });
  },
  track(name: string, props?: Record<string, string | number | boolean>) {
    if (!TOKEN) return;
    posthog.capture(name, props);
  },
};
