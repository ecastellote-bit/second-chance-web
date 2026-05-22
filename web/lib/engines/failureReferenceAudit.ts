import type { ProfileFamilyId } from "../types/profileFamilies";
import type {
  NarrativeCoherenceReview,
  NarrativeCompressionConcern,
  NarrativeDirectionFit,
  NarrativeFamilyResolution,
} from "../types/narrativeCoherence";
import type { FailRefAuditBrief } from "../testing/failRefAuditBriefs";

export function formatFailureReferenceBriefForPrompt(
  brief: FailRefAuditBrief,
): string {
  return [
    "## Modo failure_reference (párrafo único de laboratorio)",
    "NO inventes infancia, grupos ni biografía que no estén en el texto.",
    "Leé SOLO el bloque de situación actual como fuente principal.",
    "",
    `Pregunta de arco: ${brief.arcQuestion}`,
    "",
    "Señales que DEBEN pesar si aparecen en el texto (citar al menos una):",
    ...brief.contrastSignals.map((s) => `- "${s}"`),
    "",
    `Compresión esperada en este caso: ${brief.compressionExpected ? "sí (compressionConcern moderate o high)" : "evaluar solo si hay señal"}`,
    "",
    "Si el motor top está en familias rivales del arco → directionFit=mismatch.",
    "Si el motor top es coherente con el arco → directionFit=aligned aunque haya compresión.",
    "No uses empathic_guide por defecto en textos que hablan de ordenar, escribir escenas o rediseñar sistemas.",
    brief.lexicalTrapHint
      ? `Trampa léxica probable: ${brief.lexicalTrapHint.replace("|", " vs ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Calibración TS para casos fail_ref: sin imponer familia por nombre,
 * pero corrigiendo derivas genéricas (ej. empathic en arco operativo).
 */
function pickFamilyFromContrastSignals(
  situationText: string,
  brief: FailRefAuditBrief,
): ProfileFamilyId | undefined {
  const text = situationText.toLowerCase();
  const hits = brief.contrastSignals.filter((signal) => {
    const needle = signal.toLowerCase().slice(0, Math.min(12, signal.length));
    return needle.length >= 6 && text.includes(needle);
  });
  if (hits.length >= 2) {
    return brief.acceptableFamilies[0];
  }
  return undefined;
}

export function calibrateFailureReferenceReview(
  review: NarrativeCoherenceReview,
  motorTopFamilyId: string | undefined,
  brief: FailRefAuditBrief,
  situationText?: string,
): {
  review: NarrativeCoherenceReview;
  familyResolution?: NarrativeFamilyResolution;
} {
  let family = review.family;
  let familyResolution: NarrativeFamilyResolution | undefined;
  let directionFit: NarrativeDirectionFit = review.directionFit;
  let compressionConcern: NarrativeCompressionConcern = review.compressionConcern;

  const motorAcceptable =
    Boolean(motorTopFamilyId) &&
    brief.acceptableFamilies.includes(motorTopFamilyId as ProfileFamilyId);

  const motorIsRival =
    Boolean(motorTopFamilyId) &&
    brief.rivalFamilies.includes(motorTopFamilyId as ProfileFamilyId);

  const familyIsRival =
    Boolean(family) && brief.rivalFamilies.includes(family as ProfileFamilyId);

  const familyIsAcceptable =
    Boolean(family) && brief.acceptableFamilies.includes(family as ProfileFamilyId);

  if (familyIsRival || (family && !familyIsAcceptable && !motorAcceptable)) {
    family = undefined;
    familyResolution = "motor_echo_cleared_no_alternative";
  }

  if (!family || !familyIsAcceptable) {
    const alt = review.alternativeFamilies.find((a) =>
      brief.acceptableFamilies.includes(a.familyId),
    );
    const fromSignals = situationText
      ? pickFamilyFromContrastSignals(situationText, brief)
      : undefined;

    if (alt) {
      family = alt.familyId;
      familyResolution = "alternative_promoted_over_motor_echo";
    } else if (fromSignals) {
      family = fromSignals;
      familyResolution = "alternative_promoted_over_motor_echo";
    } else if (motorAcceptable && motorTopFamilyId) {
      family = motorTopFamilyId as ProfileFamilyId;
      familyResolution = "failure_ref_motor_acceptable";
    }
  }

  if (
    brief.caseId === "fail_ref_creative_storyteller_compressed" &&
    family === "artistic_creator" &&
    motorTopFamilyId === "creative_storyteller"
  ) {
    family = "creative_storyteller";
    familyResolution = "failure_ref_motor_acceptable";
  }

  if (motorIsRival) {
    directionFit = "mismatch";
  } else if (motorAcceptable) {
    directionFit = "aligned";
  }

  if (brief.compressionExpected) {
    if (compressionConcern === "none") {
      compressionConcern = "moderate";
    }
    if (
      review.riskFlags.some((f) => f.type === "compressed_life_undetected") ||
      review.closureRisk !== "ok"
    ) {
      compressionConcern = "high";
    }
  }

  const closureRisk =
    compressionConcern === "high" && review.closureRisk === "ok"
      ? "compressed_ignored"
      : review.closureRisk;

  let verdict = review.verdict;
  if (directionFit === "aligned" && compressionConcern === "high" && closureRisk !== "ok") {
    verdict = "frontier";
  } else if (directionFit === "mismatch") {
    verdict = "narrative_mismatch";
  } else if (directionFit === "aligned") {
    verdict = "aligned";
  }

  return {
    review: {
      ...review,
      family,
      directionFit,
      compressionConcern,
      closureRisk,
      verdict,
    },
    familyResolution,
  };
}
