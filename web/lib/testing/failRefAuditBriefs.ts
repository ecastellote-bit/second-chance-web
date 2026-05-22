import type { ProfileFamilyId } from "../types/profileFamilies";

export type FailRefAuditBrief = {
  caseId: string;
  arcQuestion: string;
  contrastSignals: string[];
  acceptableFamilies: ProfileFamilyId[];
  rivalFamilies: ProfileFamilyId[];
  compressionExpected: boolean;
  /** Trampa léxica típica a nombrar en riskFlags si aplica. */
  lexicalTrapHint?: string;
};

export const FAIL_REF_AUDIT_BRIEFS: Record<string, FailRefAuditBrief> = {
  fail_ref_creative_storyteller_compressed: {
    caseId: "fail_ref_creative_storyteller_compressed",
    arcQuestion:
      "¿El núcleo es vitalidad narrativa comprimida (escribir escenas, cajón), no comunicación pública ni escucha terapéutica?",
    contrastSignals: [
      "guardada en un cajón",
      "escribir escenas",
      "algo más vivo",
      "no tiene nada que ver conmigo",
    ],
    acceptableFamilies: ["creative_storyteller", "artistic_creator"],
    rivalFamilies: ["public_communicator", "empathic_guide"],
    compressionExpected: true,
    lexicalTrapHint: "public_communicator|creative_storyteller",
  },
  fail_ref_system_designer_parches: {
    caseId: "fail_ref_system_designer_parches",
    arcQuestion:
      "¿La intención es rediseñar la estructura que genera el fallo, no solo arreglar piezas (technical_builder)?",
    contrastSignals: [
      "sistema armado para volver a fallar",
      "rediseñar todo",
      "parches",
      "nadie mira la estructura",
    ],
    acceptableFamilies: ["system_designer", "analytical_strategist"],
    rivalFamilies: ["technical_builder"],
    compressionExpected: false,
    lexicalTrapHint: "technical_builder|system_designer",
  },
  fail_ref_operational_organizer_burnout: {
    caseId: "fail_ref_operational_organizer_burnout",
    arcQuestion:
      "¿El arco es organizar/sacar adelante en modo supervivencia (operational), no escucha terapéutica ni diseño abstracto?",
    contrastSignals: [
      "modo supervivencia",
      "tapo agujeros",
      "sigo funcionando",
      "menos resto por dentro",
    ],
    acceptableFamilies: ["operational_organizer", "resource_steward"],
    rivalFamilies: [
      "technical_builder",
      "system_designer",
      "empathic_guide",
      "diplomatic_social_connector",
    ],
    compressionExpected: true,
    lexicalTrapHint: "empathic_guide|operational_organizer",
  },
  fail_ref_empathic_guide_overload: {
    caseId: "fail_ref_empathic_guide_overload",
    arcQuestion:
      "¿El arco es guía empática desbordada por absorber dolor ajeno (compresión por sobreuso), no conector diplomático grupal?",
    contrastSignals: [
      "absorber dolor ajeno",
      "me está vaciando",
      "escuche sin juzgar",
      "sin espacio para mí",
    ],
    acceptableFamilies: ["empathic_guide"],
    rivalFamilies: ["diplomatic_social_connector", "community_builder"],
    compressionExpected: true,
    lexicalTrapHint: "diplomatic_social_connector|empathic_guide",
  },
};

export const FAILURE_REFERENCE_TAG_PREFIX = "[failure_reference:";

export function parseFailureReferenceCaseId(
  additionalContext: string | undefined,
): string | undefined {
  if (!additionalContext) return undefined;
  const match = additionalContext.match(/\[failure_reference:([^\]]+)\]/);
  return match?.[1]?.trim() || undefined;
}

export function getFailRefAuditBrief(
  caseId: string | undefined,
): FailRefAuditBrief | undefined {
  if (!caseId) return undefined;
  return FAIL_REF_AUDIT_BRIEFS[caseId];
}
