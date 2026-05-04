import type { UserIntake } from "../types/intake";
import type { EmployabilityDirection, ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type {
  ActionVector,
  CommunityRoutingRecommendation,
  FinalReading,
  ResultType,
  TransitionAssessment,
} from "../types/result";
import type { LearningSignal, SimilarCaseMatch } from "../types/learning";
import { toDiagnosticProfileSnapshot } from "../types/finalDiagnostic";
import { buildValueGeneration } from "./valueGenerationEngine";
import { buildCurrentMisalignment } from "./misalignmentEngine";
import { buildBestWorkContexts } from "./workContextEngine";
import { buildMisreadRisk } from "./misreadRiskEngine";
import { buildTransitionRecommendation } from "./transitionRecommendationEngine";
import { evaluateResultDecision } from "./resultDecision";

type FamilyScoreLike = {
  familyId?: string;
  id?: string;
  familyLabel?: string;
  label?: string;
  family?: string;
  score?: number;
  confidence?: number;
};

type FamilyRaceAnalysis = {
  topFamily: FamilyScoreLike | null;
  secondFamily: FamilyScoreLike | null;
  topId: string | null;
  secondId: string | null;
  topLabel: string | null;
  secondLabel: string | null;
  topScore: number;
  secondScore: number;
  topConfidence: number;
  secondConfidence: number;
  scoreGap: number;
  confidenceGap: number;
  isCloseRace: boolean;
  isVeryCloseRace: boolean;
  shouldAvoidSingleClearClaim: boolean;
};

type OrchestratorInput = {
  intake: UserIntake;
  signals: DetectedSignal[];
  profiles: ProbableProfile[];
  transitionAssessment: TransitionAssessment;
  plausibleDirections: EmployabilityDirection[];
  actionVectors: ActionVector[];
  familyScores?: FamilyScoreLike[];
  clarificationMeta?: {
    roundsCompleted?: number;
  };
};

type FinalAdjudicationInput = {
  provisionalReading: FinalReading;
  familyScores?: FamilyScoreLike[];
  similarCases?: SimilarCaseMatch[];
  learningSignal?: LearningSignal | null;
  diagnosticReview?: unknown;
  contextualSituationReview?: unknown;
  transitionAssessment: TransitionAssessment;
};

type FinalAdjudicationVerdict =
  | "keep"
  | "upgrade_compressed_to_clear_direction"
  | "open_frontier_or_review";

type FinalAdjudicationTrace = {
  verdict: FinalAdjudicationVerdict;
  reason: string;
  previousResultType: ResultType;
  finalResultType: ResultType;
  topFamilyLabel: string | null;
  topFamilyScore: number;
  secondFamilyLabel: string | null;
  secondFamilyScore: number;
  scoreGap: number;
  diagnosticReviewAligned: boolean;
  diagnosticReviewConflict: boolean;
  diagnosticReviewSuggestsHumanReview: boolean;
  memorySupportsTopFamily: boolean;
  memoryContradictsTopFamily: boolean;
  influentialSimilarCases: number;
  rawOrCalibrationOnlyMatches: number;
  contextualSuggestsReview: boolean;
  contextualSuggestsFrontier: boolean;
};

const FAMILY_LABELS: Record<string, string> = {
  diplomatic_social_connector: "Diplomatic Social Connector",
  community_builder: "Community Builder",
  analytical_strategist: "Analytical Strategist",
  creative_storyteller: "Creative Storyteller",
  technical_builder: "Technical Builder",
  cultural_explorer: "Cultural Explorer",
  empathic_guide: "Empathic Guide",
  public_communicator: "Public Communicator",
  institutional_operator: "Institutional Operator",
  commercial_connector: "Commercial Connector",
  educator_interpreter: "Educator Interpreter",
  system_designer: "System Designer",
  civic_advocate: "Civic Advocate",
};

function getNumericScore(score: FamilyScoreLike | null | undefined): number {
  return typeof score?.score === "number" && Number.isFinite(score.score)
    ? score.score
    : 0;
}

function getNumericConfidence(score: FamilyScoreLike | null | undefined): number {
  return typeof score?.confidence === "number" && Number.isFinite(score.confidence)
    ? score.confidence
    : 0;
}

function hasUsableFamilySurface(score: FamilyScoreLike | null | undefined): boolean {
  return getNumericScore(score) >= 0.45 || getNumericConfidence(score) >= 0.6;
}

function hasUsableSecondaryFamilySurface(
  score: FamilyScoreLike | null | undefined,
): boolean {
  return getNumericScore(score) >= 0.3 || getNumericConfidence(score) >= 0.35;
}

function hasUsableProfileFallback(
  profile: ProbableProfile | null | undefined,
): boolean {
  const confidence = profile?.confidence;

  return (
    typeof confidence === "number" &&
    Number.isFinite(confidence) &&
    confidence >= 0.55
  );
}

function hasUsableSecondaryProfile(
  profile: ProbableProfile | null | undefined,
): boolean {
  const confidence = profile?.confidence;

  return (
    typeof confidence === "number" &&
    Number.isFinite(confidence) &&
    confidence >= 0.4
  );
}

function resolveFamilyId(score: FamilyScoreLike | null | undefined): string | null {
  if (!score) return null;

  if (typeof score.familyId === "string" && score.familyId.trim().length > 0) {
    return score.familyId;
  }

  if (typeof score.id === "string" && score.id.trim().length > 0) {
    return score.id;
  }

  if (typeof score.family === "string" && score.family.trim().length > 0) {
    return score.family;
  }

  return null;
}

function resolveFamilyLabel(score: FamilyScoreLike | null | undefined): string | null {
  if (!score) return null;

  if (typeof score.familyLabel === "string" && score.familyLabel.trim().length > 0) {
    return score.familyLabel;
  }

  if (typeof score.label === "string" && score.label.trim().length > 0) {
    return score.label;
  }

  const familyId = resolveFamilyId(score);

  return familyId ? FAMILY_LABELS[familyId] ?? familyId : null;
}

function getSortedFamilyScores(familyScores?: FamilyScoreLike[]): FamilyScoreLike[] {
  if (!familyScores || familyScores.length === 0) return [];

  return [...familyScores].sort((a, b) => {
    const scoreDelta = getNumericScore(b) - getNumericScore(a);
    if (scoreDelta !== 0) return scoreDelta;

    const confidenceDelta = getNumericConfidence(b) - getNumericConfidence(a);
    if (confidenceDelta !== 0) return confidenceDelta;

    const aLabel = resolveFamilyLabel(a) ?? "";
    const bLabel = resolveFamilyLabel(b) ?? "";
    return aLabel.localeCompare(bLabel);
  });
}

function getTopFamily(familyScores?: FamilyScoreLike[]): FamilyScoreLike | null {
  return getSortedFamilyScores(familyScores)[0] ?? null;
}

function getSecondFamily(familyScores?: FamilyScoreLike[]): FamilyScoreLike | null {
  return getSortedFamilyScores(familyScores)[1] ?? null;
}

function analyzeFamilyRace(familyScores?: FamilyScoreLike[]): FamilyRaceAnalysis {
  const sorted = getSortedFamilyScores(familyScores);
  const topFamily = sorted[0] ?? null;
  const secondFamily = sorted[1] ?? null;

  const topScore = getNumericScore(topFamily);
  const secondScore = getNumericScore(secondFamily);
  const topConfidence = getNumericConfidence(topFamily);
  const secondConfidence = getNumericConfidence(secondFamily);

  const scoreGap = topScore - secondScore;
  const confidenceGap = topConfidence - secondConfidence;

  const topId = resolveFamilyId(topFamily);
  const secondId = resolveFamilyId(secondFamily);
  const topLabel = resolveFamilyLabel(topFamily);
  const secondLabel = resolveFamilyLabel(secondFamily);

  const secondIsReal =
    !!secondFamily &&
    !!secondLabel &&
    (secondScore >= 0.45 || secondConfidence >= 0.35);

  const isCloseRace =
    !!topFamily &&
    !!secondFamily &&
    topScore >= 0.45 &&
    secondIsReal &&
    scoreGap >= 0 &&
    scoreGap <= 0.1;

  const isVeryCloseRace =
    !!topFamily &&
    !!secondFamily &&
    topScore >= 0.45 &&
    secondScore >= 0.45 &&
    scoreGap >= 0 &&
    scoreGap <= 0.06;

  return {
    topFamily,
    secondFamily,
    topId,
    secondId,
    topLabel,
    secondLabel,
    topScore,
    secondScore,
    topConfidence,
    secondConfidence,
    scoreGap,
    confidenceGap,
    isCloseRace,
    isVeryCloseRace,
    shouldAvoidSingleClearClaim: isCloseRace || isVeryCloseRace,
  };
}

function buildSyntheticProfileFromFamily(
  familyScore: FamilyScoreLike | null | undefined,
): ProbableProfile | null {
  const id = resolveFamilyId(familyScore);
  const label = resolveFamilyLabel(familyScore);

  if (!id && !label) return null;

  const confidence =
    typeof familyScore?.confidence === "number" && Number.isFinite(familyScore.confidence)
      ? familyScore.confidence
      : typeof familyScore?.score === "number" && Number.isFinite(familyScore.score)
        ? familyScore.score
        : 0;

  return {
    id: id ?? "family_inferred_pattern",
    label: label ?? "Family Inferred Pattern",
    confidence,
    summary: label
      ? `El patrón dominante inferido por la capa familiar es ${label}.`
      : "La capa familiar infiere un patrón dominante utilizable para la lectura final.",
  } as ProbableProfile;
}

function resolveDominantPattern(
  input: OrchestratorInput,
  topProfile: ProbableProfile | null,
): { id: string | null; label: string | null } {
  const topFamily = getTopFamily(input.familyScores);
  const familyId = resolveFamilyId(topFamily);
  const familyLabel = resolveFamilyLabel(topFamily);

  if (hasUsableFamilySurface(topFamily) && (familyId || familyLabel)) {
    return {
      id: familyId,
      label: familyLabel ?? (familyId ? FAMILY_LABELS[familyId] ?? familyId : null),
    };
  }

  if (hasUsableProfileFallback(topProfile)) {
    return {
      id: topProfile?.id ?? null,
      label: topProfile?.label ?? null,
    };
  }

  return {
    id: null,
    label: null,
  };
}

function resolveDominantProfile(
  input: OrchestratorInput,
  topProfile: ProbableProfile | null,
): ProbableProfile | null {
  const topFamily = getTopFamily(input.familyScores);
  const familyId = resolveFamilyId(topFamily);
  const familyLabel = resolveFamilyLabel(topFamily);

  if (hasUsableFamilySurface(topFamily) && (familyId || familyLabel)) {
    const matchingProfile =
      input.profiles.find((profile) => {
        if (familyId && profile.id === familyId) return true;
        if (familyLabel && profile.label === familyLabel) return true;
        return false;
      }) ?? null;

    if (matchingProfile) {
      return matchingProfile;
    }

    return buildSyntheticProfileFromFamily(topFamily) ?? null;
  }

  if (hasUsableProfileFallback(topProfile)) {
    return topProfile;
  }

  return null;
}

function resolveSecondaryProfile(
  input: OrchestratorInput,
  dominantProfile: ProbableProfile | null,
  secondProfile: ProbableProfile | null,
): ProbableProfile | null {
  const secondFamily = getSecondFamily(input.familyScores);
  const secondFamilyId = resolveFamilyId(secondFamily);
  const secondFamilyLabel = resolveFamilyLabel(secondFamily);

  if (
    hasUsableSecondaryFamilySurface(secondFamily) &&
    (secondFamilyId || secondFamilyLabel)
  ) {
    const matchingProfile =
      input.profiles.find((profile) => {
        if (dominantProfile?.id && profile.id === dominantProfile.id) return false;
        if (secondFamilyId && profile.id === secondFamilyId) return true;
        if (secondFamilyLabel && profile.label === secondFamilyLabel) return true;
        return false;
      }) ?? null;

    if (matchingProfile) {
      return matchingProfile;
    }

    return buildSyntheticProfileFromFamily(secondFamily) ?? null;
  }

  if (
    hasUsableSecondaryProfile(secondProfile) &&
    secondProfile?.id !== dominantProfile?.id
  ) {
    return secondProfile;
  }

  return null;
}

function buildOrderedSupportingProfiles(
  input: OrchestratorInput,
  dominantProfile: ProbableProfile | null,
  secondaryProfile: ProbableProfile | null,
): ProbableProfile[] {
  const ordered = [dominantProfile, secondaryProfile, ...input.profiles];
  const seen = new Set<string>();

  return ordered.filter((profile): profile is ProbableProfile => {
    if (!profile) return false;

    const key =
      (typeof profile.id === "string" && profile.id.trim().length > 0
        ? profile.id.trim()
        : null) ??
      (typeof profile.label === "string" && profile.label.trim().length > 0
        ? profile.label.trim()
        : null);

    if (!key) return false;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function decideCommunityRouting(
  resultType: ResultType,
): CommunityRoutingRecommendation {
  if (resultType === "compressed_life") return "cohort_candidate";
  if (resultType === "insufficient_evidence") return "reentry_first";
  return "discord_recommended";
}

function resolveSeverity(
  resultType: ResultType,
  transitionAssessment: TransitionAssessment,
): "low" | "medium" | "high" {
  if (
    resultType === "compressed_life" ||
    transitionAssessment.transitionMargin === "minimal"
  ) {
    return "high";
  }

  if (
    resultType === "insufficient_evidence" ||
    transitionAssessment.transitionMargin === "narrow"
  ) {
    return "medium";
  }

  return "low";
}

function resolveFunctionalSubtype(
  dominantPatternId: string | null,
  resultType: ResultType,
  isCloseFamilyRace: boolean,
): string {
  if (resultType === "insufficient_evidence") {
    return "undetermined";
  }

  if (isCloseFamilyRace) {
    return "frontier_pattern_needs_review";
  }

  switch (dominantPatternId) {
    case "diplomatic_social_connector":
      return "institutional_articulator";
    case "community_builder":
      return "community_orchestrator";
    case "analytical_strategist":
      return "strategic_pattern_reader";
    case "creative_storyteller":
      return "narrative_atmosphere_builder";
    case "technical_builder":
      return "operational_system_solver";
    case "cultural_explorer":
      return "cultural_context_reader";
    case "empathic_guide":
      return "human_process_guide";
    case "public_communicator":
      return "editorial_voice_builder";
    case "institutional_operator":
      return "formal_structure_navigator";
    case "commercial_connector":
      return "relational_growth_connector";
    case "educator_interpreter":
      return "concept_translation_guide";
    case "system_designer":
      return "process_architecture_builder";
    case "civic_advocate":
      return "public_issue_advocate";
    default:
      return "undetermined";
  }
}

function buildNextMoveBlock(
  actionVectors: ActionVector[],
  resultType: ResultType,
) {
  const firstVector = actionVectors[0];

  const transitionMode =
    resultType === "compressed_life"
      ? "compressed_but_clear"
      : resultType === "insufficient_evidence"
        ? "needs_confirmation"
        : "guided_repositioning";

  if (!firstVector) {
    return {
      title: "Próximo movimiento",
      headline: "Todavía no conviene mover demasiado",
      summary:
        resultType === "insufficient_evidence"
          ? "Primero hace falta ampliar evidencia real antes de definir una dirección fuerte."
          : "Conviene avanzar con un movimiento pequeño, concreto y reversible.",
      transitionMode,
      items: [
        "Agregar más historia real al intake",
        "Nombrar mejor qué se repite y qué drena",
        "Volver a correr el sistema con más matices",
      ],
    };
  }

  return {
    title: "Próximo movimiento",
    headline: firstVector.label,
    summary: firstVector.description,
    transitionMode,
    items:
      firstVector.microActions?.length > 0
        ? firstVector.microActions
        : ["Hacer un primer movimiento pequeño y verificable"],
  };
}

function buildCompressionSurface(intake: UserIntake): string {
  return [
    intake.narrative.whatFeelsCompressedNow ?? "",
    intake.currentContext.currentSituation ?? "",
    ...(intake.currentContext.restrictions ?? []),
    intake.narrative.lossesOrRenunciations ?? "",
    intake.narrative.additionalContext ?? "",
  ]
    .join(" ")
    .trim();
}

function buildFallbackTrace(
  input: OrchestratorInput,
  resultType: ResultType,
  familyRace: FamilyRaceAnalysis,
) {
  const dominantProfile = resolveDominantProfile(input, input.profiles[0] ?? null);
  const secondaryProfile = resolveSecondaryProfile(
    input,
    dominantProfile,
    input.profiles[1] ?? null,
  );

  const compressionSurface = buildCompressionSurface(input.intake);

  return {
    signalCount: input.signals.length,
    signalKeys: input.signals.map((signal) => signal.key),
    topProfileLabel: dominantProfile?.label ?? null,
    topProfileConfidence: dominantProfile?.confidence ?? null,
    secondProfileLabel: secondaryProfile?.label ?? null,
    secondProfileConfidence: secondaryProfile?.confidence ?? null,
    plausibleDirectionLabels: input.plausibleDirections.map(
      (direction) => direction.label,
    ),
    transitionMargin: input.transitionAssessment.transitionMargin,
    hasCompressionNarrative: compressionSurface.length > 0,
    decisionReason: "ORCHESTRATOR_FALLBACK_TRACE",
    resultTypePreview: resultType,
    familyRace,
  };
}

function mergeTraceWithFamilyRace(
  trace: unknown,
  familyRace: FamilyRaceAnalysis,
): unknown {
  if (trace && typeof trace === "object" && !Array.isArray(trace)) {
    return {
      ...trace,
      familyRace,
    };
  }

  return {
    rawTrace: trace ?? null,
    familyRace,
  };
}

function mergeTraceWithFinalAdjudication(
  trace: unknown,
  finalAdjudication: FinalAdjudicationTrace,
): unknown {
  if (trace && typeof trace === "object" && !Array.isArray(trace)) {
    return {
      ...trace,
      finalAdjudication,
    };
  }

  return {
    rawTrace: trace ?? null,
    finalAdjudication,
  };
}

function shouldExposeDominantPattern(resultType: ResultType): boolean {
  return resultType !== "insufficient_evidence";
}

function buildCorePatternLabel(params: {
  dominantLabel: string | null;
  secondLabel: string | null;
  resultType: ResultType;
  isCloseRace: boolean;
}): string {
  if (params.resultType === "insufficient_evidence") {
    return "Todavía no aparece un patrón dominante suficientemente claro.";
  }

  if (params.isCloseRace && params.dominantLabel && params.secondLabel) {
    return `${params.dominantLabel} / ${params.secondLabel}`;
  }

  return params.dominantLabel ?? "Todavía no aparece un patrón dominante suficientemente claro.";
}

function buildDominantTension(params: {
  resultType: ResultType;
  transitionAssessment: TransitionAssessment;
  familyRace: FamilyRaceAnalysis;
}): string {
  if (params.resultType === "compressed_life") {
    return "La vida actual parece más comprimida que alineada.";
  }

  if (params.resultType === "insufficient_evidence") {
    return "La evidencia todavía no alcanza para afirmar una dirección seria.";
  }

  if (
    params.familyRace.shouldAvoidSingleClearClaim &&
    params.familyRace.topLabel &&
    params.familyRace.secondLabel
  ) {
    return `Hay una frontera fuerte entre ${params.familyRace.topLabel} y ${params.familyRace.secondLabel}. No conviene tratar esta lectura como una sentencia única.`;
  }

  return "Hay una dirección plausible, pero debe probarse contra la realidad.";
}

function buildDirectionsText(params: {
  resultType: ResultType;
  familyRace: FamilyRaceAnalysis;
  plausibleDirections: EmployabilityDirection[];
}): string {
  if (
    params.resultType !== "insufficient_evidence" &&
    params.familyRace.shouldAvoidSingleClearClaim &&
    params.familyRace.topLabel &&
    params.familyRace.secondLabel
  ) {
    return `Las direcciones más plausibles hoy están en frontera entre ${params.familyRace.topLabel} y ${params.familyRace.secondLabel}.`;
  }

  if (params.plausibleDirections.length > 0) {
    return `Las direcciones más plausibles hoy son ${params.plausibleDirections
      .map((direction) => direction.label)
      .join(" y ")}.`;
  }

  return "Todavía no conviene forzar una dirección específica.";
}

function buildDiagnosticSummary(params: {
  resultType: ResultType;
  familyRace: FamilyRaceAnalysis;
}): string {
  if (
    params.resultType === "clear_direction" &&
    params.familyRace.shouldAvoidSingleClearClaim &&
    params.familyRace.topLabel &&
    params.familyRace.secondLabel
  ) {
    return `Aparecen dos direcciones fuertes y cercanas: ${params.familyRace.topLabel} y ${params.familyRace.secondLabel}. La lectura debe tratarse como una frontera activa, no como una sentencia cerrada.`;
  }

  if (params.resultType === "clear_direction") {
    return "Aparece una dirección plausible con señales repetidas y compatibles.";
  }

  if (params.resultType === "compressed_life") {
    return "No aparece todavía una vocación nítida; aparece una vida comprimida por el presente.";
  }

  return "La lectura todavía no tiene evidencia suficiente para afirmar una dirección sin inventar.";
}

function normalizeDiagnosticText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .replace(/[^a-z0-9ñ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function familiesMatch(a: unknown, b: unknown): boolean {
  const normalizedA = normalizeDiagnosticText(a);
  const normalizedB = normalizeDiagnosticText(b);

  return normalizedA.length > 0 && normalizedB.length > 0 && normalizedA === normalizedB;
}

function readReviewText(review: unknown): string {
  if (!review || typeof review !== "object") return "";

  const value = review as any;

  return [
    value.finalVerdict,
    value.verdict,
    value.status,
    value.summary,
    value.reason,
    value.recommendation,
    value.warning,
    ...(Array.isArray(value.findings)
      ? value.findings.flatMap((finding: any) => [
          finding?.verdict,
          finding?.status,
          finding?.reason,
          finding?.summary,
          finding?.family,
          finding?.familyLabel,
          finding?.recommendedFamily,
        ])
      : []),
  ]
    .filter(Boolean)
    .map(String)
    .join(" ");
}

function includesAny(text: string, markers: string[]): boolean {
  return markers.some((marker) => text.includes(normalizeDiagnosticText(marker)));
}

function readBooleanFlag(source: unknown, keys: string[]): boolean | null {
  if (!source || typeof source !== "object") return null;

  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

function textHasExplicitNegativeConflict(text: string): boolean {
  return includesAny(text, [
    "red flag no",
    "red flag de aprendizaje no",
    "red flag false",
    "conflicto detectado no",
    "conflict detected false",
    "no contradice",
    "no contradice de forma fuerte",
    "no se detecta una rivalidad",
    "no se detecta patron fuerte",
    "no se detecta patrón fuerte",
    "sin contradiccion fuerte",
    "sin contradicción fuerte",
    "memoria historica no contradice",
    "memoria histórica no contradice",
  ]);
}

function textHasExplicitPositiveConflict(text: string): boolean {
  return includesAny(text, [
    "strong conflict",
    "contradiccion fuerte",
    "contradicción fuerte",
    "misread warning",
    "red flag true",
    "red flag si",
    "red flag sí",
    "red flag activo",
    "not aligned",
    "desalineado",
    "conflict detected true",
    "conflicto detectado si",
    "conflicto detectado sí",
    "contradice de forma fuerte",
  ]);
}

function diagnosticReviewIsAligned(diagnosticReview: unknown): boolean {
  const text = normalizeDiagnosticText(readReviewText(diagnosticReview));

  if (!text) return false;

  if (textHasExplicitPositiveConflict(text) && !textHasExplicitNegativeConflict(text)) {
    return false;
  }

  const hasAligned =
    includesAny(text, [
      "veredicto general aligned",
      "final verdict aligned",
      "aligned",
      "alineado",
      "alignment",
    ]) && !includesAny(text, ["not aligned", "desalineado"]);

  return hasAligned;
}

function diagnosticReviewHasConflict(diagnosticReview: unknown): boolean {
  if (!diagnosticReview || typeof diagnosticReview !== "object") return false;

  const review = diagnosticReview as Record<string, unknown>;

  const explicitConflict = readBooleanFlag(review, [
    "hasConflict",
    "conflictDetected",
    "shouldRaiseRedFlag",
    "raisesRedFlag",
    "redFlag",
  ]);

  if (explicitConflict !== null) {
    return explicitConflict;
  }

  const text = normalizeDiagnosticText(readReviewText(diagnosticReview));

  if (textHasExplicitNegativeConflict(text)) {
    return false;
  }

  return textHasExplicitPositiveConflict(text);
}

function diagnosticReviewSuggestsHumanReview(diagnosticReview: unknown): boolean {
  if (!diagnosticReview || typeof diagnosticReview !== "object") return false;

  const review = diagnosticReview as Record<string, unknown>;

  const explicitHumanReview = readBooleanFlag(review, [
    "requiresHumanReview",
    "humanReviewSuggested",
    "suggestsHumanReview",
    "suggestHumanReview",
    "needsHumanReview",
  ]);

  if (explicitHumanReview !== null) {
    return explicitHumanReview;
  }

  const text = normalizeDiagnosticText(readReviewText(diagnosticReview));

  if (
    includesAny(text, [
      "revision humana sugerida no",
      "revisión humana sugerida no",
      "sugiere revision humana no",
      "sugiere revisión humana no",
      "requires human review false",
      "human review no",
      "human review false",
    ])
  ) {
    return false;
  }

  return includesAny(text, [
    "revision humana sugerida si",
    "revisión humana sugerida sí",
    "sugiere revision humana si",
    "sugiere revisión humana sí",
    "requires human review true",
    "human review required",
    "human review suggested",
    "needs human review",
  ]);
}

function contextualSuggestsReview(contextualSituationReview: unknown): boolean {
  if (!contextualSituationReview || typeof contextualSituationReview !== "object") {
    return false;
  }

  const review = contextualSituationReview as Record<string, unknown>;

  const explicitHumanReview = readBooleanFlag(review, [
    "suggestsHumanReview",
    "suggestHumanReview",
    "requiresHumanReview",
    "needsHumanReview",
  ]);

  if (explicitHumanReview !== null) {
    return explicitHumanReview;
  }

  const text = normalizeDiagnosticText(readReviewText(contextualSituationReview));

  if (
    includesAny(text, [
      "revision humana sugerida no",
      "revisión humana sugerida no",
      "sugiere revision humana no",
      "sugiere revisión humana no",
      "requires human review false",
      "human review no",
      "human review false",
    ])
  ) {
    return false;
  }

  return includesAny(text, [
    "revision humana sugerida si",
    "revisión humana sugerida sí",
    "sugiere revision humana si",
    "sugiere revisión humana sí",
    "requires human review true",
    "human review required",
    "human review suggested",
    "needs human review",
  ]);
}

function contextualSuggestsFrontier(contextualSituationReview: unknown): boolean {
  if (!contextualSituationReview || typeof contextualSituationReview !== "object") {
    return false;
  }

  const review = contextualSituationReview as Record<string, unknown>;

  const explicitOpenFrontier = readBooleanFlag(review, [
    "suggestsOpenFrontier",
    "suggestOpenFrontier",
    "shouldOpenFrontier",
    "opensFrontier",
    "needsFrontierReview",
  ]);

  if (explicitOpenFrontier !== null) {
    return explicitOpenFrontier;
  }

  const text = normalizeDiagnosticText(readReviewText(contextualSituationReview));

  if (
    includesAny(text, [
      "sugiere abrir frontera no",
      "abrir frontera no",
      "should open frontier false",
      "open frontier false",
      "open frontier no",
    ])
  ) {
    return false;
  }

  return includesAny(text, [
    "sugiere abrir frontera si",
    "sugiere abrir frontera sí",
    "abrir frontera si",
    "abrir frontera sí",
    "should open frontier true",
    "open frontier true",
    "open frontier required",
    "open frontier suggested",
    "needs frontier review",
  ]);
}

function getSimilarityInfluenceWeight(match: SimilarCaseMatch): number {
  const extended = match as any;

  if (extended.shouldInfluenceFutureCases === false) {
    return 0;
  }

  if (
    typeof extended.influenceWeight === "number" &&
    Number.isFinite(extended.influenceWeight)
  ) {
    return Math.max(0, Math.min(1, extended.influenceWeight));
  }

  const status = normalizeDiagnosticText(extended.reviewStatus);

  if (
    status.includes("raw") ||
    status.includes("calibration only") ||
    status.includes("calibration_only") ||
    status.includes("rejected")
  ) {
    return 0;
  }

  return 1;
}

function countRawOrCalibrationOnlyMatches(similarCases: SimilarCaseMatch[]): number {
  return similarCases.filter((match) => getSimilarityInfluenceWeight(match) <= 0).length;
}

function countInfluentialSimilarCases(similarCases: SimilarCaseMatch[]): number {
  return similarCases.filter((match) => getSimilarityInfluenceWeight(match) > 0).length;
}

function calculateMemoryPressureForFamily(
  similarCases: SimilarCaseMatch[],
  familyLabel: string | null,
): { support: number; contradiction: number } {
  if (!familyLabel) {
    return { support: 0, contradiction: 0 };
  }

  let support = 0;
  let contradiction = 0;

  for (const match of similarCases) {
    const influenceWeight = getSimilarityInfluenceWeight(match);
    if (influenceWeight <= 0) continue;

    const similarity =
      typeof match.similarityScore === "number" && Number.isFinite(match.similarityScore)
        ? match.similarityScore
        : 0;

    const weightedSimilarity = similarity * influenceWeight;

    const matchSupportsFamily =
      familiesMatch(match.expectedPrimaryFamily, familyLabel) ||
      match.acceptableFamilies?.some((family) => familiesMatch(family, familyLabel));

    if (matchSupportsFamily) {
      support += weightedSimilarity;
    } else {
      contradiction += weightedSimilarity;
    }
  }

  return { support, contradiction };
}

function memorySupportsTopFamily(params: {
  similarCases: SimilarCaseMatch[];
  learningSignal?: LearningSignal | null;
  familyRace: FamilyRaceAnalysis;
}): boolean {
  const topLabel = params.familyRace.topLabel;
  const topId = params.familyRace.topId;

  if (!topLabel && !topId) return false;

  const pressure = calculateMemoryPressureForFamily(params.similarCases, topLabel);

  const strongestHistoricalFamily = (params.learningSignal as any)?.strongestHistoricalFamily;

  const strongestMatchesTop =
    familiesMatch(strongestHistoricalFamily, topLabel) ||
    familiesMatch(strongestHistoricalFamily, topId);

  return (
    strongestMatchesTop ||
    (pressure.support > 0 && pressure.support >= pressure.contradiction)
  );
}

function memoryContradictsTopFamily(params: {
  similarCases: SimilarCaseMatch[];
  learningSignal?: LearningSignal | null;
  familyRace: FamilyRaceAnalysis;
}): boolean {
  const topLabel = params.familyRace.topLabel;
  const pressure = calculateMemoryPressureForFamily(params.similarCases, topLabel);

  const learningSignalRaisesRedFlag = params.learningSignal?.shouldRaiseRedFlag === true;

  return (
    learningSignalRaisesRedFlag ||
    (pressure.contradiction >= 0.28 && pressure.contradiction > pressure.support + 0.12)
  );
}

function hasClearFamilyDirection(familyRace: FamilyRaceAnalysis): boolean {
  return (
    !!familyRace.topLabel &&
    familyRace.topScore >= 0.6 &&
    familyRace.scoreGap >= 0.12 &&
    !familyRace.shouldAvoidSingleClearClaim
  );
}

function shouldUpgradeCompressedLifeToClearDirection(params: {
  provisionalReading: FinalReading;
  familyRace: FamilyRaceAnalysis;
  diagnosticReviewAligned: boolean;
  diagnosticReviewConflict: boolean;
  diagnosticReviewSuggestsHumanReview: boolean;
  memorySupportsTopFamily: boolean;
  memoryContradictsTopFamily: boolean;
  contextualSuggestsReview: boolean;
  contextualSuggestsFrontier: boolean;
  transitionAssessment: TransitionAssessment;
}): boolean {
  if (params.provisionalReading.resultType !== "compressed_life") return false;

  if (!hasClearFamilyDirection(params.familyRace)) return false;

  if (!params.diagnosticReviewAligned) return false;

  if (
    params.diagnosticReviewConflict ||
    params.diagnosticReviewSuggestsHumanReview ||
    params.memoryContradictsTopFamily ||
    params.contextualSuggestsReview ||
    params.contextualSuggestsFrontier
  ) {
    return false;
  }

  if (
    params.transitionAssessment.transitionMargin === "minimal" &&
    params.familyRace.topScore < 0.72
  ) {
    return false;
  }

  return params.memorySupportsTopFamily || params.familyRace.topScore >= 0.66;
}

function buildUpgradedCompressedLifeSummary(params: {
  provisionalReading: FinalReading;
  familyRace: FamilyRaceAnalysis;
}): FinalReading["summaryForUser"] {
  const previous = params.provisionalReading.summaryForUser;

  return {
    ...previous,
    diagnostico: params.familyRace.topLabel
      ? `Aparece una dirección dominante suficientemente clara: ${params.familyRace.topLabel}. La compresión existe, pero no tapa la orientación principal.`
      : "Aparece una dirección dominante suficientemente clara. La compresión existe, pero no tapa la orientación principal.",
    tensiones:
      previous.tensiones ??
      "La tensión principal no es falta total de dirección, sino dificultad para convertir esa dirección en movimiento real dentro de las restricciones actuales.",
    direccion: params.familyRace.topLabel
      ? `La dirección más consistente hoy se ordena alrededor de ${params.familyRace.topLabel}.`
      : previous.direccion,
    cierre:
      "No hace falta negar la compresión ni forzar una reinvención brusca. Hace falta proteger la dirección detectada y probarla con un movimiento pequeño, concreto y reversible.",
  };
}

function buildFrontierOrReviewSummary(params: {
  provisionalReading: FinalReading;
  familyRace: FamilyRaceAnalysis;
}): FinalReading["summaryForUser"] {
  const previous = params.provisionalReading.summaryForUser;

  const frontier =
    params.familyRace.topLabel && params.familyRace.secondLabel
      ? `${params.familyRace.topLabel} / ${params.familyRace.secondLabel}`
      : params.familyRace.topLabel ?? "la familia principal detectada";

  return {
    ...previous,
    diagnostico:
      "La lectura detecta una dirección posible, pero la auditoría recomienda tratarla como frontera activa antes de cerrarla.",
    direccion: `La zona que conviene revisar es ${frontier}.`,
    cierre:
      "No conviene emitir una sentencia cerrada todavía. La memoria histórica o los jueces sugieren revisar la frontera antes de convertir esto en conclusión final.",
  };
}

export function finalizeReadingAfterDiagnosticReview(
  input: FinalAdjudicationInput,
): FinalReading {
  const familyScores =
    input.familyScores ??
    ((input.provisionalReading as any).familyScores as FamilyScoreLike[] | undefined) ??
    [];

  const familyRace = analyzeFamilyRace(familyScores);
  const similarCases = input.similarCases ?? [];

  const diagnosticReviewAligned = diagnosticReviewIsAligned(input.diagnosticReview);
  const diagnosticReviewConflict = diagnosticReviewHasConflict(input.diagnosticReview);
  const diagnosticReviewHumanReview = diagnosticReviewSuggestsHumanReview(
    input.diagnosticReview,
  );
  const contextualReview = contextualSuggestsReview(input.contextualSituationReview);
  const contextualFrontier = contextualSuggestsFrontier(input.contextualSituationReview);

  const memorySupport = memorySupportsTopFamily({
    similarCases,
    learningSignal: input.learningSignal,
    familyRace,
  });

  const memoryContradiction = memoryContradictsTopFamily({
    similarCases,
    learningSignal: input.learningSignal,
    familyRace,
  });

  const influentialSimilarCases = countInfluentialSimilarCases(similarCases);
  const rawOrCalibrationOnlyMatches = countRawOrCalibrationOnlyMatches(similarCases);

  const shouldUpgradeToClear = shouldUpgradeCompressedLifeToClearDirection({
    provisionalReading: input.provisionalReading,
    familyRace,
    diagnosticReviewAligned,
    diagnosticReviewConflict,
    diagnosticReviewSuggestsHumanReview: diagnosticReviewHumanReview,
    memorySupportsTopFamily: memorySupport,
    memoryContradictsTopFamily: memoryContradiction,
    contextualSuggestsReview: contextualReview,
    contextualSuggestsFrontier: contextualFrontier,
    transitionAssessment: input.transitionAssessment,
  });

  const shouldOpenFrontierOrReview =
    !shouldUpgradeToClear &&
    input.provisionalReading.resultType !== "insufficient_evidence" &&
    (diagnosticReviewConflict ||
      diagnosticReviewHumanReview ||
      memoryContradiction ||
      contextualReview ||
      contextualFrontier);

  const finalResultType: ResultType = shouldUpgradeToClear
    ? "clear_direction"
    : input.provisionalReading.resultType;

  const adjudicationTrace: FinalAdjudicationTrace = {
    verdict: shouldUpgradeToClear
      ? "upgrade_compressed_to_clear_direction"
      : shouldOpenFrontierOrReview
        ? "open_frontier_or_review"
        : "keep",
    reason: shouldUpgradeToClear
      ? "La lectura inicial era compressed_life, pero la familia principal es clara, los jueces están alineados y la memoria no contradice la dirección. Se conserva la advertencia de compresión sin dejar que tape la dirección."
      : shouldOpenFrontierOrReview
        ? "La auditoría detecta tensión relevante entre diagnóstico, memoria histórica o contexto. No se cambia necesariamente el resultType, pero se marca frontera/revisión."
        : "La auditoría no aporta fuerza suficiente para modificar la lectura provisoria.",
    previousResultType: input.provisionalReading.resultType,
    finalResultType,
    topFamilyLabel: familyRace.topLabel,
    topFamilyScore: familyRace.topScore,
    secondFamilyLabel: familyRace.secondLabel,
    secondFamilyScore: familyRace.secondScore,
    scoreGap: familyRace.scoreGap,
    diagnosticReviewAligned,
    diagnosticReviewConflict,
    diagnosticReviewSuggestsHumanReview: diagnosticReviewHumanReview,
    memorySupportsTopFamily: memorySupport,
    memoryContradictsTopFamily: memoryContradiction,
    influentialSimilarCases,
    rawOrCalibrationOnlyMatches,
    contextualSuggestsReview: contextualReview,
    contextualSuggestsFrontier: contextualFrontier,
  };

  if (shouldUpgradeToClear) {
    const previousDiagnostic = input.provisionalReading.finalDiagnostic as any;

    return {
      ...input.provisionalReading,
      resultType: "clear_direction",
      communityRouting: decideCommunityRouting("clear_direction"),
      dominantTension:
        "La dirección principal aparece suficientemente clara, aunque la transición todavía está condicionada por restricciones reales.",
      currentCost:
        "El costo principal no es la falta de dirección, sino avanzar sin cuidar margen, energía y exposición.",
      summaryForUser: buildUpgradedCompressedLifeSummary({
        provisionalReading: input.provisionalReading,
        familyRace,
      }),
      finalDiagnostic: {
        ...previousDiagnostic,
        severity: resolveSeverity("clear_direction", input.transitionAssessment),
        functionalSubtype: resolveFunctionalSubtype(
          familyRace.topId,
          "clear_direction",
          familyRace.shouldAvoidSingleClearClaim,
        ),
        nextMove: previousDiagnostic?.nextMove
          ? {
              ...previousDiagnostic.nextMove,
              transitionMode: "guided_repositioning",
            }
          : previousDiagnostic?.nextMove,
      },
      trace: mergeTraceWithFinalAdjudication(
        input.provisionalReading.trace,
        adjudicationTrace,
      ),
    } as FinalReading;
  }

  if (shouldOpenFrontierOrReview) {
    const previousDiagnostic = input.provisionalReading.finalDiagnostic as any;

    return {
      ...input.provisionalReading,
      summaryForUser: buildFrontierOrReviewSummary({
        provisionalReading: input.provisionalReading,
        familyRace,
      }),
      finalDiagnostic: {
        ...previousDiagnostic,
        functionalSubtype: "frontier_pattern_needs_review",
        needsHumanReview: true,
      },
      trace: mergeTraceWithFinalAdjudication(
        input.provisionalReading.trace,
        adjudicationTrace,
      ),
    } as FinalReading;
  }

  return {
    ...input.provisionalReading,
    trace: mergeTraceWithFinalAdjudication(
      input.provisionalReading.trace,
      adjudicationTrace,
    ),
  } as FinalReading;
}

export function buildFinalReading(input: OrchestratorInput): FinalReading {
  const familyRace = analyzeFamilyRace(input.familyScores);

  const decision = evaluateResultDecision({
    intake: input.intake,
    signals: input.signals,
    profiles: input.profiles,
    transitionAssessment: input.transitionAssessment,
    plausibleDirections: input.plausibleDirections,
    clarificationMeta: input.clarificationMeta,
    familyScores: input.familyScores,
  });

  const resultType = decision.resultType;
  const legacyTopProfile = input.profiles[0] ?? null;

  const analyticalDominantPattern = resolveDominantPattern(input, legacyTopProfile);
  const analyticalDominantProfile = resolveDominantProfile(input, legacyTopProfile);
  const analyticalSecondaryProfile = resolveSecondaryProfile(
    input,
    analyticalDominantProfile,
    input.profiles[1] ?? null,
  );

  const exposeDominantPattern = shouldExposeDominantPattern(resultType);

  const presentedDominantPattern = exposeDominantPattern
    ? analyticalDominantPattern
    : { id: null, label: null };

  const presentedDominantProfile = exposeDominantPattern
    ? analyticalDominantProfile
    : null;

  const presentedSecondaryProfile = exposeDominantPattern
    ? analyticalSecondaryProfile
    : null;

  const valueGeneration = buildValueGeneration({
    intake: input.intake,
    dominantProfile: presentedDominantProfile,
    signals: input.signals,
  });

  const currentMisalignment = buildCurrentMisalignment({
    intake: input.intake,
    dominantProfile: presentedDominantProfile,
    signals: input.signals,
    resultType,
  });

  const bestWorkContexts = buildBestWorkContexts({
    intake: input.intake,
    dominantProfile: presentedDominantProfile,
    signals: input.signals,
    resultType,
  });

  const misreadRisk = buildMisreadRisk({
    dominantProfile: presentedDominantProfile,
    secondaryProfile: presentedSecondaryProfile,
    signals: input.signals,
    resultType,
  });

  const transitionRecommendation = buildTransitionRecommendation({
    intake: input.intake,
    dominantProfile: presentedDominantProfile,
    resultType,
  });

  const nextMove = buildNextMoveBlock(input.actionVectors, resultType);

  const corePattern = buildCorePatternLabel({
    dominantLabel: presentedDominantPattern.label,
    secondLabel: familyRace.secondLabel,
    resultType,
    isCloseRace: familyRace.shouldAvoidSingleClearClaim,
  });

  const finalDiagnostic = {
    severity: resolveSeverity(resultType, input.transitionAssessment),
    functionalSubtype: resolveFunctionalSubtype(
      presentedDominantPattern.id,
      resultType,
      familyRace.shouldAvoidSingleClearClaim,
    ),
    profileSnapshot:
      presentedDominantProfile && resultType !== "insufficient_evidence"
        ? toDiagnosticProfileSnapshot(presentedDominantProfile)
        : null,
    valueGeneration,
    currentMisalignment,
    bestWorkContexts,
    misreadRisk,
    transitionRecommendation,
    nextMove,
  };

  const directionsText = buildDirectionsText({
    resultType,
    familyRace,
    plausibleDirections: input.plausibleDirections,
  });

  const actionText =
    transitionRecommendation.summary ??
    input.actionVectors[0]?.description ??
    "El siguiente paso correcto es ampliar evidencia antes de mover demasiado.";

  const minimalPath =
    nextMove.items?.[0] ??
    input.actionVectors[0]?.microActions?.[0] ??
    "Volver a entrar al sistema con más historia, más matices y más contexto.";

  const baseTrace =
    (decision as { trace?: unknown })?.trace ??
    buildFallbackTrace(input, resultType, familyRace);

  const trace = mergeTraceWithFamilyRace(baseTrace, familyRace);

  const alignedSupportingProfiles = buildOrderedSupportingProfiles(
    input,
    analyticalDominantProfile,
    analyticalSecondaryProfile,
  );

  return {
    resultType,
    familyScores: input.familyScores ?? [],
    corePattern,
    dominantTension: buildDominantTension({
      resultType,
      transitionAssessment: input.transitionAssessment,
      familyRace,
    }),
    currentCost:
      input.transitionAssessment.transitionMargin === "minimal"
        ? "El costo actual de mover demasiado es alto."
        : resultType === "insufficient_evidence"
          ? "Antes de mover demasiado, conviene ganar claridad real y evidencia más firme."
          : familyRace.shouldAvoidSingleClearClaim
            ? "El costo principal ahora no es moverse, sino cerrar demasiado pronto una lectura que todavía está en frontera."
            : "El costo actual permite movimientos graduales si se sostienen con criterio.",
    plausibleDirections: input.plausibleDirections,
    actionVectors: input.actionVectors,
    transitionAssessment: input.transitionAssessment,
    supportingProfiles: alignedSupportingProfiles,
    detectedSignals: input.signals,
    communityRouting: decideCommunityRouting(resultType),
    summaryForUser: {
      diagnostico: buildDiagnosticSummary({
        resultType,
        familyRace,
      }),
      hilo_conductor:
        valueGeneration.summary ??
        (presentedDominantProfile?.summary ??
          "Todavía no hay un hilo conductor suficientemente sostenido para organizar una lectura fuerte."),
      tensiones:
        currentMisalignment.summary ?? input.transitionAssessment.summary,
      direccion: directionsText,
      action: actionText,
      camino_minimo: minimalPath,
      cierre:
        resultType === "clear_direction"
          ? familyRace.shouldAvoidSingleClearClaim
            ? "No conviene cerrar esto como sentencia única. Hace falta revisar la frontera antes de decidir."
            : "No hace falta romper todo ahora. Hace falta probar bien."
          : resultType === "compressed_life"
            ? "Antes de exigir claridad total, hay que recuperar espacio interno y margen de maniobra."
            : "Más evidencia ahora vale más que una conclusión linda pero falsa.",
    },
    finalDiagnostic,
    trace,
  };
}