"use client";

import type { ObservatoryEventType } from "./types";

const SESSION_KEY = "vu_observatory_session";

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
