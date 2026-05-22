import { LEARNED_DIAGNOSTIC_CASES } from "../learning/learnedCases";
import type { UserIntake } from "../types/intake";
import { NARRATIVE_REFRACTORY_GOLDEN_IDS } from "./narrativeGoldenRefractoryCases";
import { FAILURE_REFERENCE_TAG_PREFIX } from "./failRefAuditBriefs";

const LAB_PLACEHOLDER =
  "Caso failure_reference: el relato completo está solo en situación actual.";

const COMPRESSION_CASE_IDS = new Set([
  "fail_ref_creative_storyteller_compressed",
  "fail_ref_operational_organizer_burnout",
  "fail_ref_empathic_guide_overload",
]);

/**
 * Payload limpio para el juez (un bloque en prompt) pero con campos mínimos
 * para pasar validación del pipeline.
 */
function buildFailRefPayload(caseId: string, inputText: string): Partial<UserIntake> {
  const compressionCase = COMPRESSION_CASE_IDS.has(caseId);

  return {
    profile: {
      age: 38,
      country: "Argentina",
      language: "es",
      employmentStatus: "employed",
      educationLevel: "tertiary",
    },
    narrative: {
      childhoodMemories: LAB_PLACEHOLDER,
      earlyFascinations: LAB_PLACEHOLDER,
      meaningfulSchoolSubjects: "",
      repeatedWorkPatterns: "",
      naturalSocialRoles: "",
      lossesOrRenunciations: "",
      whatFeelsCompressedNow: compressionCase ? inputText : LAB_PLACEHOLDER,
      additionalContext: `${FAILURE_REFERENCE_TAG_PREFIX}${caseId}]\n${inputText}`,
    },
    currentContext: {
      currentSituation: inputText,
      restrictions: ["Estabilidad económica"],
      assets: ["Experiencia laboral"],
    },
  };
}

const EXPECTATIONS: Record<string, string> = {
  fail_ref_creative_storyteller_compressed:
    "Creative + compresión; no Public por escribir.",
  fail_ref_system_designer_parches: "System designer; no technical_builder.",
  fail_ref_operational_organizer_burnout:
    "Operational + compresión; no clear cerrado.",
  fail_ref_empathic_guide_overload: "Empathic + compresión por sobreuso.",
};

export const FAIL_REF_LAB_CASES = NARRATIVE_REFRACTORY_GOLDEN_IDS.filter((id) =>
  id.startsWith("fail_ref_"),
).map((id) => {
  const learned = LEARNED_DIAGNOSTIC_CASES.find((c) => c.id === id);
  return {
    id,
    label: `★ ${learned?.title ?? id}`,
    expectation: EXPECTATIONS[id] ?? "",
    payload: buildFailRefPayload(id, learned?.inputText ?? ""),
  };
});
