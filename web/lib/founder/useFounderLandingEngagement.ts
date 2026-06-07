"use client";

import { useEffect, useRef } from "react";
import { trackFounderConversionOnce } from "@/lib/founder/founderConversionTelemetry";

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
        trackFounderConversionOnce("founder.scroll_25", {
          scrollDepth: 25,
        });
      }
      if (depth >= 0.5 && !sent.current.p50) {
        sent.current.p50 = true;
        trackFounderConversionOnce("founder.scroll_50", {
          scrollDepth: 50,
        });
      }
      if (depth >= 0.75 && !sent.current.p75) {
        sent.current.p75 = true;
        trackFounderConversionOnce("founder.scroll_75", {
          scrollDepth: 75,
        });
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);
}

type ExitInterceptOptions = {
  enabled: boolean;
  onTrigger: () => void;
  inactivityMs?: number;
  scrollDepthTrigger?: number;
};

export function useFounderExitIntercept({
  enabled,
  onTrigger,
  inactivityMs = 25000,
  scrollDepthTrigger = 0.58,
}: ExitInterceptOptions): void {
  const triggered = useRef(false);
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    function maybeTrigger(reason: string) {
      if (triggered.current) return;
      triggered.current = true;
      onTrigger();
      trackFounderConversionOnce("founder.exit_modal_shown", { triggerReason: reason });
    }

    function bumpActivity() {
      lastActivity.current = Date.now();
    }

    function onScroll() {
      bumpActivity();
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max >= scrollDepthTrigger) {
        maybeTrigger("scroll_depth");
      }
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        maybeTrigger("visibility_hidden");
      }
    }

    const inactivityTimer = window.setInterval(() => {
      if (Date.now() - lastActivity.current >= inactivityMs) {
        maybeTrigger("inactivity");
      }
    }, 3000);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", bumpActivity, { passive: true });
    window.addEventListener("keydown", bumpActivity);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(inactivityTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", bumpActivity);
      window.removeEventListener("keydown", bumpActivity);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, inactivityMs, onTrigger, scrollDepthTrigger]);
}
