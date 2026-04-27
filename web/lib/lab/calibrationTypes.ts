import type { ResultType } from "../types/result";

export type CalibrationEntryMode =
  | "pain"
  | "compression"
  | "curiosity"
  | "expansion"
  | "complete_but_searching";

export type CalibrationFocus =
  | "compression_boundary"
  | "public_vs_narrative"
  | "connector_viability"
  | "strategy_vs_narrative"
  | "ambiguous_fragment";

export type CalibrationField =
  | "currentSituation"
  | "repeatedWorkPatterns"
  | "naturalSocialRoles"
  | "whatFeelsCompressedNow"
  | "additionalContext";

export interface CalibrationFragment {
  field: CalibrationField;
  text: string;
}

export interface CalibrationExpectation {
  resultType?: ResultType;
  topFamily?: string;
  rivalFamily?: string;
  notes?: string;
}

export interface CalibrationCase {
  id: string;
  title: string;
  entryMode: CalibrationEntryMode;
  focus: CalibrationFocus;
  fragments: CalibrationFragment[];
  expectation: CalibrationExpectation;
  tags?: string[];
}

/**
 * Casos aprendidos por experiencia diagnóstica.
 *
 * No son simples casos de prueba: son memoria revisada.
 * Deben usarse sólo después de revisión humana.
 */
export type LearnedCaseVerdict =
  | "learning_candidate"
  | "confirmed"
  | "frontier_case"
  | "control_case"
  | "needs_human_review"
  | "rejected";

export type LearnedCaseSource =
  | "manual_review"
  | "lab_case"
  | "real_user_export"
  | "synthetic_control"
  | "internet_research"
  | "vocational_office";

export interface LearnedCaseHumanReview {
  expectedPrimaryFamily?: string;
  acceptableFamilies?: string[];
  rivalFamilies?: string[];
  verdict?: LearnedCaseVerdict;
  correctionNote?: string;
  shouldBecomeLearnedCase?: boolean;
}

export interface LearnedCase {
  id: string;
  title: string;

  /**
   * Texto consolidado del caso.
   * Puede venir de respuestas del usuario, del lab o de una exportación revisada.
   */
  inputText: string;

  /**
   * Familia que, después de revisión humana, se considera principal.
   */
  expectedPrimaryFamily: string;

  /**
   * Familias que serían aceptables sin considerar el diagnóstico como error.
   */
  acceptableFamilies?: string[];

  /**
   * Familias rivales que el sistema tiende a confundir en este tipo de caso.
   */
  rivalFamilies?: string[];

  /**
   * Señales o afinidades que deberían aparecer si el sistema está leyendo bien.
   */
  confirmedSignals?: string[];

  /**
   * Señales que el sistema no detectó bien o que conviene reforzar.
   */
  missingCuesDetected?: string[];

  /**
   * Marcadores de lenguaje humano que explican por qué este caso debe recordar
   * una dirección determinada.
   */
  matchedLanguage?: string[];

  /**
   * Alias futuro más correcto. Por ahora puede convivir con matchedLanguage.
   */
  languageMarkers?: string[];

  /**
   * Resultado de revisión del caso.
   */
  verdict: LearnedCaseVerdict;

  /**
   * Lección diagnóstica que este caso deja para casos futuros.
   */
  lesson: string;

  /**
   * Define si el motor de aprendizaje debe usarlo para influir casos futuros.
   */
  shouldInfluenceFutureCases: boolean;

  source?: LearnedCaseSource;
  createdAt?: string;
  reviewedAt?: string;

  /**
   * Campos opcionales para conservar exportaciones completas si hiciera falta
   * auditar el caso más adelante.
   */
  sourceInput?: unknown;
  resultSnapshot?: unknown;
  diagnosticReview?: unknown;
  humanReview?: LearnedCaseHumanReview;

  tags?: string[];
}