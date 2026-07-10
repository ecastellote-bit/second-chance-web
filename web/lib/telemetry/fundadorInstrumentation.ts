"use client";

import { trackEvent, trackEventOnce } from "./client";

const ROUTE = "/fundador";

export type FounderTelemetrySection =
  | "hero"
  | "emotional"
  | "ecosystem"
  | "footer"
  | "microchoice"
  | "soft_nudge"
  | "exit_modal";

type FounderCtaProps = {
  ctaId: string;
  labelKey: string;
  destination: string;
  section: FounderTelemetrySection;
};

export function trackFounderLandingViewed(opts?: {
  hasFounderParam?: boolean;
  preview?: boolean;
  qualified?: boolean;
}): void {
  trackEventOnce("founder_landing_viewed_/fundador", {
    name: "founder_landing_viewed",
    path: ROUTE,
    properties: {
      variant: "community_v2",
      source: "landing",
      route: ROUTE,
      ...(opts?.hasFounderParam != null ? { hasFounderParam: opts.hasFounderParam } : {}),
      ...(opts?.preview != null ? { previewMode: opts.preview } : {}),
      ...(opts?.qualified != null ? { qualified: opts.qualified } : {}),
    },
  });
}

export function trackFounderPrimaryCta(props: FounderCtaProps): void {
  trackEvent({
    name: "founder_primary_cta_clicked",
    path: ROUTE,
    properties: { ...props, route: ROUTE },
  });
}

export function trackFounderSecondaryCta(props: FounderCtaProps): void {
  trackEvent({
    name: "founder_secondary_cta_clicked",
    path: ROUTE,
    properties: { ...props, route: ROUTE },
  });
}

export function trackFounderMicrochoiceSelected(props: {
  choiceId: string;
  destination: string;
}): void {
  trackEvent({
    name: "founder_microchoice_selected",
    path: ROUTE,
    properties: {
      choiceId: props.choiceId,
      destination: props.destination,
      section: "microchoice",
      route: ROUTE,
    },
  });
}

export function trackScrollDepthReached(depth: 50 | 90): void {
  trackEventOnce(`scroll_depth_${depth}_/fundador`, {
    name: "scroll_depth_reached",
    path: ROUTE,
    properties: {
      route: ROUTE,
      depth,
    },
  });
}

export function trackFounderExitFeedbackOpened(trigger: string): void {
  trackEvent({
    name: "founder_exit_feedback_opened",
    path: ROUTE,
    properties: {
      trigger: trigger.slice(0, 40),
      route: ROUTE,
    },
  });
}

export function trackFounderExitFeedbackSubmitted(props: {
  trigger: string;
  optionId?: string | null;
  feedbackId?: string | null;
  hasFreeText: boolean;
  freeTextLength: number;
}): void {
  trackEvent({
    name: "founder_exit_feedback_submitted",
    path: ROUTE,
    properties: {
      trigger: props.trigger.slice(0, 40),
      ...(props.optionId ? { optionId: props.optionId } : {}),
      ...(props.feedbackId ? { feedbackId: props.feedbackId } : {}),
      hasFreeText: props.hasFreeText,
      freeTextLength: props.freeTextLength,
      route: ROUTE,
    },
  });
}
