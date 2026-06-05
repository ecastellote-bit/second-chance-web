"use client";

import type { ObservatoryEventType } from "./types";

const SESSION_KEY = "vu_observatory_session";
const DEDUPE_PREFIX = "vu_obs_done_";

export function getObservatorySessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess_${Date.now()}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function buildFundadorViewPayload(): Record<string, string | null> {
  if (typeof window === "undefined") {
    return { referrer: null, path: "/fundador", search: null };
  }

  const params = new URLSearchParams(window.location.search);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

  const payload: Record<string, string | null> = {
    referrer: document.referrer?.trim().slice(0, 200) || null,
    path: window.location.pathname.slice(0, 120),
    search: window.location.search.slice(0, 200) || null,
  };

  for (const key of utmKeys) {
    payload[key] = params.get(key)?.trim().slice(0, 120) || null;
  }

  return payload;
}

export function trackObservatoryEvent(
  type: ObservatoryEventType,
  scenario: string,
  payload?: Record<string, string | number | boolean | null>,
): void {
  if (typeof window === "undefined") return;

  const body = {
    type,
    scenario,
    sessionId: getObservatorySessionId(),
    payload,
  };

  fetch("/api/observatory/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {
    // no bloquear UX
  });
}

/** Una vez por sesión de pestaña — evita inflar métricas por re-render. */
export function trackObservatoryEventOnce(
  type: ObservatoryEventType,
  scenario: string,
  payload?: Record<string, string | number | boolean | null>,
): void {
  if (typeof window === "undefined") return;
  const dedupeKey = `${DEDUPE_PREFIX}${type}`;
  if (sessionStorage.getItem(dedupeKey)) return;
  sessionStorage.setItem(dedupeKey, "1");
  trackObservatoryEvent(type, scenario, payload);
}
