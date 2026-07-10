"use client";

import type { TelemetryEventInput, TelemetryIngestBody } from "./types";

const ANON_KEY = "vu_telemetry_anon";
const SESSION_KEY = "vu_telemetry_session";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getTelemetryAnonymousId(): string {
  if (!isBrowser()) return "server";
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return `anon_ephemeral_${Date.now()}`;
  }
}

export function getTelemetrySessionId(): string {
  if (!isBrowser()) return "server";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `sess_ephemeral_${Date.now()}`;
  }
}

function readUtmParams(): Pick<
  TelemetryIngestBody,
  "utmSource" | "utmMedium" | "utmCampaign"
> {
  if (!isBrowser()) return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get("utm_source")?.trim().slice(0, 80) || undefined,
      utmMedium: params.get("utm_medium")?.trim().slice(0, 80) || undefined,
      utmCampaign: params.get("utm_campaign")?.trim().slice(0, 80) || undefined,
    };
  } catch {
    return {};
  }
}

function buildIngestBody(input: TelemetryEventInput): TelemetryIngestBody {
  const path =
    input.path?.trim() ||
    (isBrowser() ? window.location.pathname : "/");

  return {
    name: input.name,
    path,
    sessionId: getTelemetrySessionId(),
    anonymousId: getTelemetryAnonymousId(),
    referrer: isBrowser() ? document.referrer?.trim().slice(0, 200) || undefined : undefined,
    ...readUtmParams(),
    properties: input.properties,
    timestamp: input.timestamp ?? new Date().toISOString(),
  };
}

function sendTelemetryPayload(body: TelemetryIngestBody): void {
  const json = JSON.stringify(body);

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([json], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/telemetry/event", blob);
      if (sent) return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch("/api/telemetry/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => {
  });
}

/** Fire-and-forget — nunca lanza hacia la UI pública. */
export function trackEvent(input: TelemetryEventInput): void {
  if (!isBrowser()) return;

  try {
    const body = buildIngestBody(input);
    sendTelemetryPayload(body);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[telemetry] trackEvent failed", err instanceof Error ? err.name : "error");
    }
  }
}

const DEDUPE_PREFIX = "vu_telemetry_once_";

/** Una sola vez por pestaña/sesión — dedupe vía sessionStorage. */
export function trackEventOnce(dedupeKey: string, input: TelemetryEventInput): void {
  if (!isBrowser()) return;

  try {
    const key = DEDUPE_PREFIX + dedupeKey;
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
    trackEvent(input);
  } catch {
    trackEvent(input);
  }
}
