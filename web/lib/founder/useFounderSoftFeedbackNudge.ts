"use client";

import { type RefObject, useEffect, useRef } from "react";

export type SoftFeedbackNudgeReason = "time" | "scroll_depth" | "content_reached";

const SOFT_NUDGE_SESSION_KEY = "vu_founder_soft_feedback_nudge_done";
const SHOW_AFTER_MS = 22_000;

export function isSoftFeedbackNudgeDoneThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SOFT_NUDGE_SESSION_KEY) === "1";
}

export function markSoftFeedbackNudgeDoneThisSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SOFT_NUDGE_SESSION_KEY, "1");
}

type Options = {
  enabled: boolean;
  barrioSectionRef: RefObject<HTMLElement | null>;
  activityBlockRef: RefObject<HTMLDivElement | null>;
  onEligible: (reason: SoftFeedbackNudgeReason) => void;
  showAfterMs?: number;
  scrollDepthThreshold?: number;
};

/** Dispara una sola vez por sesión cuando hay tiempo sin acción o el usuario llegó al contenido inferior. */
export function useFounderSoftFeedbackNudge({
  enabled,
  barrioSectionRef,
  activityBlockRef,
  onEligible,
  showAfterMs = SHOW_AFTER_MS,
  scrollDepthThreshold = 0.78,
}: Options): void {
  const firedRef = useRef(false);
  const enabledRef = useRef(enabled);
  const onEligibleRef = useRef(onEligible);

  enabledRef.current = enabled;
  onEligibleRef.current = onEligible;

  useEffect(() => {
    if (!enabled) return;
    if (isSoftFeedbackNudgeDoneThisSession()) return;

    function fire(reason: SoftFeedbackNudgeReason): void {
      if (firedRef.current || !enabledRef.current) return;
      if (isSoftFeedbackNudgeDoneThisSession()) return;
      firedRef.current = true;
      onEligibleRef.current(reason);
    }

    const timer = window.setTimeout(() => fire("time"), showAfterMs);

    function onScroll() {
      if (firedRef.current || !enabledRef.current) return;

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const depth = max > 0 ? window.scrollY / max : 0;

      if (depth >= scrollDepthThreshold) {
        fire("scroll_depth");
        return;
      }

      const activity = activityBlockRef.current;
      if (activity) {
        const rect = activity.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          fire("content_reached");
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, barrioSectionRef, activityBlockRef, showAfterMs, scrollDepthThreshold]);
}
