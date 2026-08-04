/** Tipos de evento del observatorio — ampliar según crezca el producto */
export type ObservatoryEventType =
  | "funnel.fundador_view"
  | "funnel.barrio_view"
  | "funnel.full_reading_intro"
  | "funnel.full_step1_view"
  | "funnel.full_step2_view"
  | "funnel.full_step3_view"
  | "funnel.full_step4_view"
  | "funnel.full_step5_view"
  | "funnel.analysis_started"
  | "funnel.diagnostic_archived"
  | "funnel.comenzar_view"
  | "funnel.onboarding_door"
  | "funnel.tematica_selected"
  | "funnel.activacion_cartel"
  | "funnel.plaza_post_activacion"
  | "funnel.barrio_commitment"
  | "funnel.profile_resumed"
  | "diagnostic.full_result_view"
  | "diagnostic.case_archived"
  | "human_case.persisted"
  | "learning.observation_stored"
  | "learning.validated_case_stored"
  | "barrio.action_card_click"
  | "barrio.start_reading_click"
  | "surface_interest_started"
  | "surface_interest_submitted"
  | "surface_interest_email_requested"
  | "surface_interest_email_submitted"
  | "surface_interest_profile_invite_clicked"
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

export type ObservatoryEvent = {
  id: string;
  at: string;
  type: ObservatoryEventType;
  /** Agrupación legible: funnel, diagnostic, learning, community */
  scenario: string;
  sessionId?: string;
  payload?: Record<string, string | number | boolean | null>;
};

export type ObservatoryPeriod = "7d" | "30d" | "all";

export type ObservatoryCampaignFunnel = {
  fundadorViews: number;
  fullReadingIntroViews: number;
  step1Views: number;
  step2Views: number;
  step3Views: number;
  step4Views: number;
  step5Views: number;
  analysisStarted: number;
  diagnosticArchived: number;
  fundadorToStep1Rate: number | null;
  fundadorToAnalysisRate: number | null;
  fundadorToArchivedRate: number | null;
};

export type ObservatoryReportReadMeta = {
  /** Lectura recortada por tiempo o límite de eventos. */
  partial?: boolean;
  /** Reporte servido desde caché server por fallo del cálculo fresco. */
  stale?: boolean;
  fetchedEvents?: number;
  listedBlobs?: number;
  timedOut?: boolean;
  cachedAt?: string;
};

export type ObservatoryReport = {
  generatedAt: string;
  period: {
    id: ObservatoryPeriod;
    label: string;
    from: string | null;
    to: string;
  };
  readMeta?: ObservatoryReportReadMeta;
  store: {
    backend: "blob" | "local_jsonl";
    durable: boolean;
  };
  totals: {
    events: number;
    uniqueSessions: number;
  };
  byType: Record<string, number>;
  byScenario: Record<string, number>;
  campaign: ObservatoryCampaignFunnel;
  funnel: {
    comenzarViews: number;
    onboardingDoors: number;
    tematicasSelected: number;
    activacionCarteles: number;
    plazaPostActivacion: number;
    barrioCommitments: number;
    activacionToPlazaRate: number | null;
    commitmentAfterPlazaRate: number | null;
  };
  activacionCarteles: Record<string, number>;
  onboardingDoors: Record<string, number>;
  tematicas: Record<string, number>;
  commitments: Record<string, number>;
  diagnostic: {
    archived: number;
    byResultType: Record<string, number>;
    byPrimaryFamily: Record<string, number>;
    humanReviewSuggested: number;
    compressionSignals: number;
  };
  notes: string[];
};
