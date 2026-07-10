"use client";

import { useEffect } from "react";
import { trackScrollDepthReached } from "./fundadorInstrumentation";

const MARKS = [50, 90] as const;

/** Scroll depth 50/90 para telemetría interna — independiente del Observatory (25/50/75). */
export function useFundadorTelemetryScroll(enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const hit = new Set<number>();

    function onScroll() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const pct = (scrollTop / scrollHeight) * 100;

      for (const mark of MARKS) {
        if (hit.has(mark)) continue;
        if (pct >= mark) {
          hit.add(mark);
          trackScrollDepthReached(mark);
        }
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);
}
