/** Tipos de evento del observatorio — ampliar según crezca el producto */
export type ObservatoryEventType =
  | "funnel.comenzar_view"
  | "funnel.onboarding_door"
  | "funnel.tematica_selected"
  | "funnel.activacion_cartel"
  | "funnel.plaza_post_activacion"
  | "funnel.barrio_commitment"
  | "diagnostic.full_result_view"
  | "diagnostic.case_archived"
  | "human_case.persisted"
  | "learning.observation_stored"
  | "learning.validated_case_stored";

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

export type ObservatoryReport = {
  generatedAt: string;
  period: {
    id: ObservatoryPeriod;
    label: string;
    from: string | null;
    to: string;
  };
  totals: {
    events: number;
    uniqueSessions: number;
  };
  byType: Record<string, number>;
  byScenario: Record<string, number>;
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
