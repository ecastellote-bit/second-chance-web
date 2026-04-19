import type { ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType, TransitionAssessment } from "../types/result";
import type { AmbiguityType, FollowupRound } from "../types/followup";

export type AmbiguityAssessmentInput = {
  resultType: ResultType;
  profiles: ProbableProfile[];
  signals: DetectedSignal[];
  transitionAssessment?: TransitionAssessment;
};

export type AmbiguityAssessment = {
  needsFollowupRound: boolean;
  recommendedRound: FollowupRound | null;
  ambiguityType: AmbiguityType | null;
  candidateProfiles: string[];
  questionStrategy: string;
  reason: string;
  signalCount: number;
  topProfileId: string | null;
  topProfileLabel: string | null;
  topProfileConfidence: number | null;
  secondProfileId: string | null;
  secondProfileLabel: string | null;
  secondProfileConfidence: number | null;
  confidenceGap: number | null;
  allowForcedAdjudicationAfterRound2: boolean;
};

const PROFILE_PAIR_TO_AMBIGUITY: Record<string, AmbiguityType> = {
  "community_builder|empathic_guide": "guide_vs_community",
  "diplomatic_social_connector|empathic_guide": "guide_vs_connector",
  "analytical_strategist|technical_builder": "strategist_vs_builder",
  "creative_storyteller|cultural_explorer": "storyteller_vs_cultural",
  "creative_storyteller|diplomatic_social_connector":
    "connector_vs_storyteller",
};

function buildPairKey(a?: string | null, b?: string | null): string | null {
  if (!a || !b) return null;
  return [a, b].sort().join("|");
}

function resolvePairAmbiguity(
  topProfileId?: string | null,
  secondProfileId?: string | null,
): AmbiguityType | null {
  const pairKey = buildPairKey(topProfileId, secondProfileId);
  if (!pairKey) return null;
  return PROFILE_PAIR_TO_AMBIGUITY[pairKey] ?? null;
}

function normalizeConfidence(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function buildCandidateProfiles(
  top: ProbableProfile | undefined,
  second: ProbableProfile | undefined,
): string[] {
  return [top?.label, second?.label].filter(
    (value): value is string => Boolean(value),
  );
}

function resolveQuestionStrategy(ambiguityType: AmbiguityType | null): string {
  switch (ambiguityType) {
    case "guide_vs_community":
      return "Separar foco uno-a-uno vs sostén de comunidad o vida grupal.";
    case "guide_vs_connector":
      return "Separar escucha profunda vs articulación entre actores y partes.";
    case "strategist_vs_builder":
      return "Separar lectura estratégica vs resolución operativa concreta.";
    case "storyteller_vs_cultural":
      return "Separar exploración/contexto vs forma verbal y construcción narrativa.";
    case "connector_vs_storyteller":
      return "Separar lectura de actores/intereses vs construcción de mensaje.";
    case "weak_signal_general":
      return "Agregar evidencia real y separar patrón dominante de adaptación táctica.";
    default:
      return "Agregar evidencia donde la lectura todavía no se separa con suficiente nitidez.";
  }
}

function resolveReason(
  resultType: ResultType,
  signalCount: number,
  ambiguityType: AmbiguityType | null,
  confidenceGap: number | null,
): string {
  if (resultType !== "insufficient_evidence") {
    return "No hace falta follow-up: la salida ya no quedó en insufficient_evidence.";
  }

  if (signalCount < 3) {
    return "Hay muy poca señal todavía. Hace falta más evidencia antes de adjudicar una rama seria.";
  }

  if (ambiguityType === "weak_signal_general") {
    return "Hay algo de señal, pero todavía no se separa un patrón dominante con suficiente claridad.";
  }

  if (ambiguityType && confidenceGap != null) {
    return `La lectura ya encontró dos perfiles plausibles, pero siguen demasiado cerca entre sí (gap ${confidenceGap.toFixed(
      3,
    )}).`;
  }

  return "La lectura todavía necesita una ronda de clarificación para separar mejor lo dominante de lo vecino.";
}

function resolveRecommendedRound(
  resultType: ResultType,
  signalCount: number,
  topConfidence: number,
  secondConfidence: number,
  ambiguityType: AmbiguityType | null,
): FollowupRound | null {
  if (resultType !== "insufficient_evidence") return null;

  if (signalCount < 3) return 2;

  if (!ambiguityType) return 2;

  if (topConfidence >= 0.75 && secondConfidence >= 0.65) {
    return 2;
  }

  return 2;
}

function shouldAllowForcedAdjudicationAfterRound2(
  signalCount: number,
  ambiguityType: AmbiguityType | null,
): boolean {
  if (signalCount >= 4) return true;
  if (
    ambiguityType === "guide_vs_community" ||
    ambiguityType === "guide_vs_connector" ||
    ambiguityType === "strategist_vs_builder" ||
    ambiguityType === "storyteller_vs_cultural" ||
    ambiguityType === "connector_vs_storyteller"
  ) {
    return true;
  }
  return false;
}

export function assessAmbiguity(
  input: AmbiguityAssessmentInput,
): AmbiguityAssessment {
  const topProfile = input.profiles[0];
  const secondProfile = input.profiles[1];

  const signalCount = input.signals.length;
  const topConfidence = normalizeConfidence(topProfile?.confidence);
  const secondConfidence = normalizeConfidence(secondProfile?.confidence);

  const confidenceGap =
    topProfile && secondProfile ? topConfidence - secondConfidence : null;

  const pairAmbiguity = resolvePairAmbiguity(topProfile?.id, secondProfile?.id);

  const ambiguityType: AmbiguityType | null =
    input.resultType === "insufficient_evidence"
      ? pairAmbiguity ??
        (signalCount < 4 ? "weak_signal_general" : "weak_signal_general")
      : null;

  const needsFollowupRound = input.resultType === "insufficient_evidence";

  const recommendedRound = resolveRecommendedRound(
    input.resultType,
    signalCount,
    topConfidence,
    secondConfidence,
    ambiguityType,
  );

  return {
    needsFollowupRound,
    recommendedRound,
    ambiguityType,
    candidateProfiles: buildCandidateProfiles(topProfile, secondProfile),
    questionStrategy: resolveQuestionStrategy(ambiguityType),
    reason: resolveReason(
      input.resultType,
      signalCount,
      ambiguityType,
      confidenceGap,
    ),
    signalCount,
    topProfileId: topProfile?.id ?? null,
    topProfileLabel: topProfile?.label ?? null,
    topProfileConfidence: topProfile?.confidence ?? null,
    secondProfileId: secondProfile?.id ?? null,
    secondProfileLabel: secondProfile?.label ?? null,
    secondProfileConfidence: secondProfile?.confidence ?? null,
    confidenceGap,
    allowForcedAdjudicationAfterRound2:
      shouldAllowForcedAdjudicationAfterRound2(signalCount, ambiguityType),
  };
}