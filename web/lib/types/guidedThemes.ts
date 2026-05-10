export type GuidedThemeActivationPath =
  | "asociarme_con_otras_personas"
  | "formarme_en_algo_nuevo"
  | "integrar_proyectos_existentes"
  | "armar_mi_propio_proyecto"
  | "explorar_primero_comunidad";

export type GuidedThemeStatus =
  | "mvp_v0_1"
  | "draft"
  | "active"
  | "needs_review"
  | "deprecated";

export type GuidedThemeRule = string | Record<string, unknown>;

export interface GuidedTheme {
  id: string;

  shortLabel: string;
  userFacingText: string;
  recognitionPhrase: string;

  linkedFamilies: string[];

  coreAffinities: string[];
  supportingAffinities?: string[];
  futureAffinityHints?: string[];

  compressionSensitive: boolean;

  suggestedActivationPaths: GuidedThemeActivationPath[];

  /**
   * Routing hints only.
   * These are NOT final community-space names.
   */
  communitySpaceHints: string[];

  exampleUserSignals?: string[];

  /**
   * Rules that make this theme eligible.
   */
  entryRules?: GuidedThemeRule[];

  /**
   * Signals that should reduce or block this theme.
   */
  avoidIfSignals?: GuidedThemeRule[];

  /**
   * Explicit discard/boundary rules.
   */
  discardRules?: GuidedThemeRule[];

  /**
   * Soft ranking helper.
   * Recommended range: 0.1 to 1.0
   */
  priorityWeight?: number;

  status?: GuidedThemeStatus;
  version?: string;

  notesForProduction?: string;
  notesForVocational?: string;

  /**
   * Temporary flexibility while Vocational and Production converge.
   * Later, this can be removed to make the schema stricter.
   */
  [key: string]: unknown;
}