"use client";

import { useEffect, useRef } from "react";
import { trackFounderConversionOnce } from "@/lib/founder/founderConversionTelemetry";

export type FounderExitTrigger =
  | "browser_back"
  | "desktop_exit_intent"
  | "external_navigation"
  | "unknown_exit_attempt";

const EXIT_MODAL_SESSION_KEY = "vu_founder_exit_modal_shown";
const BACK_GUARD_STATE_KEY = "vu_founder_back_guard";

export function isFounderExitModalShownThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(EXIT_MODAL_SESSION_KEY) === "1";
}

export function markFounderExitModalShownThisSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(EXIT_MODAL_SESSION_KEY, "1");
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
  enabled: boolean;
  onTrigger: (exitTrigger: FounderExitTrigger) => void;
};

/** Exit modal sólo ante intento real de salida — nunca por scroll ni inactividad. */
export function useFounderExitIntercept({ enabled, onTrigger }: ExitInterceptOptions): void {
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  useEffect(() => {
    if (!enabled) return;
    if (isFounderExitModalShownThisSession()) return;

    window.history.pushState({ [BACK_GUARD_STATE_KEY]: true }, "");

    function handlePopState() {
      if (isFounderExitModalShownThisSession()) return;
      markFounderExitModalShownThisSession();
      onTriggerRef.current("browser_back");
      window.history.pushState({ [BACK_GUARD_STATE_KEY]: true }, "");
    }

    function handleMouseOut(event: MouseEvent) {
      if (window.innerWidth < 768) return;
      if (event.clientY > 12) return;
      const related = event.relatedTarget;
      if (related && related instanceof Node && document.documentElement.contains(related)) {
        return;
      }
      if (isFounderExitModalShownThisSession()) return;
      markFounderExitModalShownThisSession();
      onTriggerRef.current("desktop_exit_intent");
    }

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [enabled]);
}
