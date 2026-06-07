"use client";

import {
  buildFundadorViewPayload,
  getObservatorySessionId,
  trackObservatoryEvent,
  trackObservatoryEventOnce,
} from "@/lib/observatory/client";
import type { ObservatoryEventType } from "@/lib/observatory/types";

export type FounderConversionEvent =
  | "founder.view"
  | "founder.primary_cta_click"
  | "founder.secondary_cta_click"
  | "founder.microgate_opened"
  | "founder.microgate_option_selected"
  | "founder.microgate_continue_click"
  | "founder.microgate_secondary_click"
  | "founder.sticky_nudge_shown"
  | "founder.sticky_nudge_click"
  | "founder.soft_feedback_nudge_shown"
  | "founder.soft_feedback_nudge_click"
  | "founder.soft_feedback_nudge_dismissed"
  | "founder.exit_modal_shown"
  | "founder.exit_feedback_modal_shown"
  | "founder.exit_feedback_selected"
  | "founder.exit_feedback_text_started"
  | "founder.exit_feedback_submitted"
  | "founder.exit_continue_click"
  | "founder.scroll_25"
  | "founder.scroll_50"
  | "founder.scroll_75";

function deviceCategory(): string {
  if (typeof window === "undefined") return "unknown";
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

function basePayload(
  extra?: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> {
  return {
    ...buildFundadorViewPayload(),
    deviceCategory: deviceCategory(),
    ...extra,
  };
}

export function trackFounderConversion(
  type: FounderConversionEvent,
  extra?: Record<string, string | number | boolean | null>,
): void {
  trackObservatoryEvent(type as ObservatoryEventType, "campaign", basePayload(extra));
}

export function trackFounderConversionOnce(
  type: FounderConversionEvent,
  extra?: Record<string, string | number | boolean | null>,
): void {
  if (typeof window === "undefined") return;
  const dedupeKey = `vu_founder_done_${type}`;
  if (sessionStorage.getItem(dedupeKey)) return;
  sessionStorage.setItem(dedupeKey, "1");
  trackFounderConversion(type, extra);
}

export function trackFounderView(): void {
  trackObservatoryEventOnce("funnel.fundador_view", "campaign", buildFundadorViewPayload());
  trackFounderConversionOnce("founder.view");
}

export function getFounderSessionId(): string {
  return getObservatorySessionId();
}
