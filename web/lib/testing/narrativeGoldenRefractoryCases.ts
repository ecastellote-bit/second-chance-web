import type { EvaluationCase } from "./evaluationCases";

/** IDs del golden set refractario para selector rápido en /lab */
export const NARRATIVE_REFRACTORY_GOLDEN_IDS = [
  "estefi_pioneer",
  "voc_human_01_voz_publica_encerrada",
  "voc_human_02_narrador_sin_puerta",
  "voc_human_03_guia_empatico_sin_cauce",
  "fail_ref_creative_storyteller_compressed",
  "fail_ref_system_designer_parches",
  "fail_ref_operational_organizer_burnout",
  "fail_ref_empathic_guide_overload",
] as const;

export type NarrativeRefractoryCaseSource =
  | "estefi_import"
  | "human_language"
  | "learned_fail_ref";

export type NarrativeRefractoryLabCase = {
  id: string;
  label: string;
  source: NarrativeRefractoryCaseSource;
  expectation: string;
  /** Para casos human: payload estándar */
  payload?: EvaluationCase["payload"];
};
