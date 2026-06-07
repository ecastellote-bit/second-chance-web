"use client";

import { useEffect, useRef, useState } from "react";
import { trackFounderConversionOnce } from "@/lib/founder/founderConversionTelemetry";

export type FounderExitTrigger =
  | "browser_back"
  | "desktop_exit_intent"
  | "external_navigation"
  | "unknown_exit_attempt";

const EXIT_MODAL_SESSION_KEY = "vu_founder_exit_modal_shown";
const BACK_GUARD_STATE_KEY = "vu_founder_back_guard";

export type FounderExitDebugSnapshot = {
  hasRelevantAction: boolean;
  exitModalShownThisSession: boolean;
  backGuardArmed: boolean;
  listenerActive: boolean;
  lastExitTrigger: FounderExitTrigger | null;
  sessionStorageValue: string | null;
};

export function isFounderExitModalShownThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(EXIT_MODAL_SESSION_KEY) === "1";
}

export function markFounderExitModalShownThisSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(EXIT_MODAL_SESSION_KEY, "1");
}

export function clearFounderExitModalSessionForDebug(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(EXIT_MODAL_SESSION_KEY);
}

function mergeHistoryState(extra: Record<string, unknown>): Record<string, unknown> {
  const current = window.history.state;
  if (current && typeof current === "object" && !Array.isArray(current)) {
    return { ...current, ...extra };
  }
  return { ...extra };
}

function guardUrlFromLocation(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function debugLog(enabled: boolean, message: string, detail?: unknown): void {
  if (!enabled) return;
  if (detail !== undefined) {
    console.debug(`[founder-exit] ${message}`, detail);
  } else {
    console.debug(`[founder-exit] ${message}`);
  }
}

export function useFounderScrollDepth(enabled: boolean): void {
  const sent = useRef({ p25: false, p50: false, p75: false });

  useEffect(() => {
    if (!enabled) return;

    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const depth = window.scrollY / max;

      if (depth >= 0.25 && !sent.current.p25) {
        sent.current.p25 = true;
        trackFounderConversionOnce("founder.scroll_25", { scrollDepth: 25 });
      }
      if (depth >= 0.5 && !sent.current.p50) {
        sent.current.p50 = true;
        trackFounderConversionOnce("founder.scroll_50", { scrollDepth: 50 });
      }
      if (depth >= 0.75 && !sent.current.p75) {
        sent.current.p75 = true;
        trackFounderConversionOnce("founder.scroll_75", { scrollDepth: 75 });
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);
}

type ExitInterceptOptions = {
  getShouldIntercept: () => boolean;
  onTrigger: (exitTrigger: FounderExitTrigger) => void;
  /** Restaura la ruta en App Router tras interceptar back (evita desmontaje prematuro). */
  onRestoreRoute?: () => void;
  debug?: boolean;
  debugHasRelevantAction?: boolean;
};

/** Exit modal sólo ante intento real de salida — nunca por scroll ni inactividad. */
export function useFounderExitIntercept({
  getShouldIntercept,
  onTrigger,
  onRestoreRoute,
  debug = false,
  debugHasRelevantAction = false,
}: ExitInterceptOptions): FounderExitDebugSnapshot {
  const onTriggerRef = useRef(onTrigger);
  const onRestoreRouteRef = useRef(onRestoreRoute);
  const getShouldInterceptRef = useRef(getShouldIntercept);
  const guardUrlRef = useRef("");
  const backGuardArmedRef = useRef(false);
  const listenerActiveRef = useRef(false);
  const lastExitTriggerRef = useRef<FounderExitTrigger | null>(null);

  onTriggerRef.current = onTrigger;
  onRestoreRouteRef.current = onRestoreRoute;
  getShouldInterceptRef.current = getShouldIntercept;

  const [debugSnapshot, setDebugSnapshot] = useState<FounderExitDebugSnapshot>({
    hasRelevantAction: debugHasRelevantAction,
    exitModalShownThisSession: false,
    backGuardArmed: false,
    listenerActive: false,
    lastExitTrigger: null,
    sessionStorageValue: null,
  });

  function publishDebug(extra?: Partial<FounderExitDebugSnapshot>): void {
    if (!debug) return;
    setDebugSnapshot({
      hasRelevantAction: debugHasRelevantAction,
      exitModalShownThisSession: isFounderExitModalShownThisSession(),
      backGuardArmed: backGuardArmedRef.current,
      listenerActive: listenerActiveRef.current,
      lastExitTrigger: lastExitTriggerRef.current,
      sessionStorageValue:
        typeof window !== "undefined"
          ? sessionStorage.getItem(EXIT_MODAL_SESSION_KEY)
          : null,
      ...extra,
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    guardUrlRef.current = guardUrlFromLocation();

    function pushGuardState(): void {
      const url = guardUrlRef.current;
      window.history.pushState(
        mergeHistoryState({ [BACK_GUARD_STATE_KEY]: true }),
        "",
        url,
      );
      backGuardArmedRef.current = true;
      debugLog(debug, "back guard armed", { url, depth: window.history.length });
      publishDebug({ backGuardArmed: true });
    }

    function handlePopState(): void {
      debugLog(debug, "popstate fired", {
        pathname: window.location.pathname,
        guardUrl: guardUrlRef.current,
        sessionShown: isFounderExitModalShownThisSession(),
        shouldIntercept: getShouldInterceptRef.current(),
      });

      if (isFounderExitModalShownThisSession()) {
        debugLog(debug, "popstate → allow leave (modal already shown this session)");
        publishDebug();
        return;
      }

      if (!getShouldInterceptRef.current()) {
        debugLog(debug, "popstate → allow leave (relevant action or modal/microgate open)");
        publishDebug();
        return;
      }

      const url = guardUrlRef.current;
      window.history.pushState(
        mergeHistoryState({ [BACK_GUARD_STATE_KEY]: true }),
        "",
        url,
      );
      onRestoreRouteRef.current?.();
      debugLog(debug, "popstate → intercepted, restoring route", { url });

      lastExitTriggerRef.current = "browser_back";
      onTriggerRef.current("browser_back");
      publishDebug({ lastExitTrigger: "browser_back" });
    }

    function handleMouseOut(event: MouseEvent): void {
      if (window.innerWidth < 768) return;
      if (event.clientY > 12) return;
      const related = event.relatedTarget;
      if (related && related instanceof Node && document.documentElement.contains(related)) {
        return;
      }
      if (isFounderExitModalShownThisSession()) return;
      if (!getShouldInterceptRef.current()) return;

      lastExitTriggerRef.current = "desktop_exit_intent";
      onTriggerRef.current("desktop_exit_intent");
      publishDebug({ lastExitTrigger: "desktop_exit_intent" });
    }

    if (getShouldInterceptRef.current() && !isFounderExitModalShownThisSession()) {
      pushGuardState();
    } else {
      debugLog(debug, "back guard not armed on mount", {
        shouldIntercept: getShouldInterceptRef.current(),
        sessionShown: isFounderExitModalShownThisSession(),
      });
    }

    window.addEventListener("popstate", handlePopState, true);
    document.addEventListener("mouseout", handleMouseOut);
    listenerActiveRef.current = true;
    publishDebug({ listenerActive: true, backGuardArmed: backGuardArmedRef.current });

    return () => {
      window.removeEventListener("popstate", handlePopState, true);
      document.removeEventListener("mouseout", handleMouseOut);
      listenerActiveRef.current = false;
      backGuardArmedRef.current = false;
    };
  }, [debug]);

  useEffect(() => {
    publishDebug();
  }, [debug, debugHasRelevantAction]);

  return debugSnapshot;
}
