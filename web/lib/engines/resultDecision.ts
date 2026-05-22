import type { UserIntake } from "../types/intake";
import type { EmployabilityDirection, ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType, TransitionAssessment } from "../types/result";
import type { DiagnosticTrace, DecisionReasonCode } from "../types/debug";

/**
 * Esta capa no lee `negativeEvidenceReview` directamente.
 * Las exclusiones del Juez de Descarte se aplican en `analysisPipeline` vía
 * `applyDiscardExclusions` antes de la lectura provisoria.
 */

type ClarificationMeta = {
  roundsCompleted?: number;
};

type FamilyScoreLike = {
  label?: string;
  familyLabel?: string;
  family?: string;
  score?: number;
  confidence?: number;
};

export type ResultDecisionInput = {
  intake: UserIntake;
  signals: DetectedSignal[];
  profiles: ProbableProfile[];
  transitionAssessment: TransitionAssessment;
  plausibleDirections: EmployabilityDirection[];
  clarificationMeta?: ClarificationMeta;
  familyScores?: FamilyScoreLike[];
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const COLLECTIVE_INTAKE_MARKERS = [
  "comunidad",
  "comunidades",
  "grupo",
  "grupos",
  "redes",
  "clubes",
  "juntar gente",
  "armar grupos",
  "armar grupo",
  "sostener movidas",
  "convocar",
  "convocando",
  "sostener el hilo",
  "sosteniendo el hilo",
  "si no muevo yo",
  "se enfrían",
  "se enfrian",
  "participacion",
  "participación",
  "espacio compartido",
  "espacio colectivo",
  "continuidad colectiva",
  "continuidad grupal",
  "pertenencia",
  "trabajos grupales",
  "proyectos grupales",
  "organizar personas",
  "banda de amigos",
  "convocatoria",
];

const STRAIN_OR_VACUUM_MARKERS = [
  "estoy seco",
  "estoy seca",
  "bastante seco",
  "bastante seca",
  "no me queda resto",
  "ahogado",
  "ahogada",
  "sin fuerza",
  "aparece poco",
  "comprimido",
  "comprimida",
  "no esta canalizado",
  "no está canalizado",
  "cansancio",
  "sequedad",
  "me quede sin energia",
  "me quedé sin energía",
  "impulso comunitario esta ahogado",
  "impulso comunitario está ahogado",
];

const STRONG_ONE_TO_ONE_GUARD_MARKERS = [
  "uno a uno",
  "acompañamiento uno a uno",
  "acompanamiento uno a uno",
  "escuchar a una persona",
  "contencion individual",
  "contención individual",
  "proceso personal",
  "acompañar a alguien",
  "acompanar a alguien",
  "ordenar la situacion de alguien",
  "ordenar la situación de alguien",
  "acompañar a una persona",
  "acompanar a una persona",
];

// --- General compression gate signals (family-agnostic) ---

type CompressionSignalDef = { id: string; phrases: string[] };

const COMPRESSION_GATE_SIGNALS: CompressionSignalDef[] = [
  { id: "no_rest", phrases: ["no me queda resto", "menos resto", "poco resto"] },
  { id: "no_margin", phrases: ["sin margen", "no tengo margen"] },
  { id: "no_energy", phrases: ["no tengo energia", "sin energia", "no me queda energia"] },
  { id: "exhaustion", phrases: ["agotado", "agotada"] },
  { id: "dryness", phrases: ["seco", "seca", "sequedad"] },
  { id: "drowned", phrases: ["ahogado", "ahogada"] },
  { id: "confined", phrases: ["encerrado", "encerrada", "frenado", "frenada"] },
  { id: "postponed", phrases: ["postergado", "postergada"] },
  {
    id: "buried_capacity",
    phrases: ["capacidad enterrada", "arrinconado", "arrinconada"],
  },
  { id: "material_fear", phrases: ["miedo material", "miedo economico", "no puedo perder estabilidad"] },
  { id: "unchanneled", phrases: ["no esta canalizado", "no está canalizado"] },
  {
    id: "rare_appearance",
    phrases: [
      "aparece de a ratos",
      "aparece poco",
      "no desaparecio pero aparece poco",
      "no desapareció pero aparece poco",
      "no desaparecio",
      "no desaparecio pero",
    ],
  },
  {
    id: "duty_lock",
    phrases: ["sigo cumpliendo", "por responsabilidades", "tomado por obligaciones"],
  },
  {
    id: "firefighting",
    phrases: ["apagar incendios", "modo bombero", "tapo agujeros", "tapando agujeros"],
  },
  { id: "survival_mode", phrases: ["modo supervivencia", "supervivencia"] },
  {
    id: "no_own_space",
    phrases: [
      "sostengo pero no tengo lugar propio",
      "sin lugar propio",
      "no tengo espacio propio",
    ],
  },
  {
    id: "cant_change",
    phrases: ["no puedo cambiar de golpe", "no puedo resignar", "no puedo dejar", "no puedo largar"],
  },
  { id: "drains", phrases: ["me drena", "drenado", "drenada", "desgasta", "desgaste"] },
  {
    id: "functioning_not_living",
    phrases: ["estoy funcionando pero no viviendo"],
  },
  {
    id: "compressed_explicit",
    phrases: ["vida comprimida", "comprimido", "comprimida"],
  },
  { id: "autopilot", phrases: ["piloto automatico", "piloto automático"] },
  { id: "hidden_activity", phrases: ["a escondidas"] },
  { id: "reactive_mode", phrases: ["reactivo", "modo reactivo"] },
  { id: "back_to_drawer", phrases: ["vuelve al cajon", "vuelve al cajón"] },
];

type CompressionDetectionResult = {
  count: number;
  matchedIds: string[];
};

function detectCompressionSignals(intake: UserIntake): CompressionDetectionResult {
  const parts = [
    intake.narrative?.currentSituation,
    intake.narrative?.childhoodMemories,
    intake.narrative?.earlyFascinations,
    intake.narrative?.meaningfulSchoolSubjects,
    intake.narrative?.repeatedWorkPatterns,
    intake.narrative?.naturalSocialRoles,
    intake.narrative?.lossesOrRenunciations,
    intake.narrative?.whatFeelsCompressedNow,
    intake.narrative?.additionalContext,
    intake.currentContext?.currentSituation,
    intake.currentContext?.currentRole,
    intake.currentContext?.transitionGoal,
    ...(intake.currentContext?.restrictions ?? []),
    ...(intake.currentContext?.assets ?? []),
  ];

  const fullText = normalizeText(parts.filter(Boolean).join(" "));
  if (!fullText.trim()) return { count: 0, matchedIds: [] };

  const matchedIds: string[] = [];
  for (const signal of COMPRESSION_GATE_SIGNALS) {
    const hit = signal.phrases.some((phrase) =>
      fullText.includes(normalizeText(phrase)),
    );
    if (hit) matchedIds.push(signal.id);
  }
  return { count: matchedIds.length, matchedIds };
}

function buildIntakeNarrativeBundle(intake: UserIntake): string {
  const n = intake.narrative;
  const cc = intake.currentContext;
  const parts = [
    n.currentSituation,
    n.childhoodMemories,
    n.earlyFascinations,
    n.meaningfulSchoolSubjects,
    n.repeatedWorkPatterns,
    n.naturalSocialRoles,
    n.lossesOrRenunciations,
    n.whatFeelsCompressedNow,
    n.additionalContext,
    cc.currentSituation,
    ...(cc.restrictions ?? []),
  ];
  return normalizeText(parts.filter(Boolean).join(" "));
}

function familyScoreRowId(row: FamilyScoreLike | undefined): string {
  if (!row) return "";
  const raw = (row as { id?: unknown; familyId?: unknown }).id ?? (row as { familyId?: unknown }).familyId;
  return typeof raw === "string" ? raw.trim() : "";
}

function countIntakeMarkerHits(haystack: string, markers: string[]): number {
  const seen = new Set<string>();
  for (const marker of markers) {
    const n = normalizeText(marker);
    if (n && haystack.includes(n)) seen.add(n);
  }
  return seen.size;
}

type CompressedCommunityPatternOpts = {
  /**
   * Si true: sólo aplica con community_builder como primera familia en el ranking
   * (p. ej. downgrade de clear_direction). Si false: permite segundo muy cercano
   * (rescate desde insufficient_evidence).
   */
  requireTopFamilyCommunity: boolean;
};

function shouldPreferCompressedCommunityPattern(
  input: ResultDecisionInput,
  opts: CompressedCommunityPatternOpts,
): boolean {
  const narrative = buildIntakeNarrativeBundle(input.intake);
  if (!narrative.trim()) return false;

  const collectiveHits = countIntakeMarkerHits(narrative, COLLECTIVE_INTAKE_MARKERS);
  const strainHits = countIntakeMarkerHits(narrative, STRAIN_OR_VACUUM_MARKERS);
  const oneToOneGuard = countIntakeMarkerHits(narrative, STRONG_ONE_TO_ONE_GUARD_MARKERS);

  if (collectiveHits < 5 || strainHits < 2) return false;
  if (oneToOneGuard >= 2) return false;

  const sorted = [...(input.familyScores ?? [])].sort((a, b) => {
    const sa = typeof a.score === "number" && Number.isFinite(a.score) ? a.score : 0;
    const sb = typeof b.score === "number" && Number.isFinite(b.score) ? b.score : 0;
    if (sb !== sa) return sb - sa;
    const ca =
      typeof a.confidence === "number" && Number.isFinite(a.confidence) ? a.confidence : 0;
    const cb =
      typeof b.confidence === "number" && Number.isFinite(b.confidence) ? b.confidence : 0;
    return cb - ca;
  });

  const topId = familyScoreRowId(sorted[0]);
  const second = sorted[1];
  const secondId = familyScoreRowId(second);
  const topScore =
    typeof sorted[0]?.score === "number" && Number.isFinite(sorted[0].score)
      ? sorted[0].score
      : 0;
  const secondScore =
    typeof second?.score === "number" && Number.isFinite(second.score) ? second.score : 0;
  const gap = topScore - secondScore;

  if (opts.requireTopFamilyCommunity) {
    if (topId !== "community_builder") return false;
    if (topScore < 0.42) return false;
    return true;
  }

  const communityInFront =
    topId === "community_builder" ||
    (secondId === "community_builder" &&
      secondScore >= 0.34 &&
      gap >= 0 &&
      gap <= 0.09);

  if (!communityInFront) return false;

  const communityLeadScore =
    topId === "community_builder" ? topScore : secondScore;

  if (communityLeadScore < 0.33) return false;

  return true;
}

function normalizeRoundsCompleted(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 2) return 2;
  return 1;
}

function getFamilyDecisionView(familyScores?: FamilyScoreLike[]) {
  const top = familyScores?.[0];
  const second = familyScores?.[1];

  return {
    topFamilyLabel: top?.familyLabel ?? top?.label ?? top?.family ?? null,
    topFamilyScore:
      typeof top?.score === "number" && Number.isFinite(top.score) ? top.score : 0,
    topFamilyConfidence:
      typeof top?.confidence === "number" && Number.isFinite(top.confidence)
        ? top.confidence
        : 0,
    secondFamilyLabel: second?.familyLabel ?? second?.label ?? second?.family ?? null,
    secondFamilyScore:
      typeof second?.score === "number" && Number.isFinite(second.score) ? second.score : 0,
    secondFamilyConfidence:
      typeof second?.confidence === "number" && Number.isFinite(second.confidence)
        ? second.confidence
        : 0,
  };
}

export function evaluateResultDecision(
  input: ResultDecisionInput
): { resultType: ResultType; trace: DiagnosticTrace } {
  const topProfile = input.profiles[0];
  const secondProfile = input.profiles[1];

  const signalCount = input.signals.length;
  const topConfidence = topProfile?.confidence ?? 0;
  const secondConfidence = secondProfile?.confidence ?? 0;

  const familyView = getFamilyDecisionView(input.familyScores);

  const useFamilyDecisionLayer =
    !!familyView.topFamilyLabel &&
    (familyView.topFamilyScore > 0 || familyView.topFamilyConfidence > 0);

  const hasAnyTopSurface =
    !!topProfile ||
    useFamilyDecisionLayer ||
    familyView.topFamilyScore > 0 ||
    familyView.topFamilyConfidence > 0;

  const hasStrongEnoughTopProfile = topConfidence >= 0.55;
  const hasVeryStrongTopProfile = topConfidence >= 0.85;

  const hasStrongEnoughTopFamily =
    familyView.topFamilyScore >= 0.45 || familyView.topFamilyConfidence >= 0.6;

  const hasVeryStrongTopFamily =
    familyView.topFamilyScore >= 0.62 || familyView.topFamilyConfidence >= 0.8;

  const hasStrongEnoughSecondFamily =
    familyView.secondFamilyScore >= 0.45 ||
    familyView.secondFamilyConfidence >= 0.6;

  const hasStrongEnoughSecondProfile = secondConfidence >= 0.55;

  const topLayerStrongEnough = useFamilyDecisionLayer
    ? hasStrongEnoughTopFamily
    : hasStrongEnoughTopProfile;

  const compressionSurface = [
    input.intake.narrative.whatFeelsCompressedNow ?? "",
    input.intake.currentContext.currentSituation ?? "",
    ...(input.intake.currentContext.restrictions ?? []),
    input.intake.narrative.lossesOrRenunciations ?? "",
    input.intake.narrative.additionalContext ?? "",
  ]
    .join(" ")
    .trim();

  const normalizedCompressionText = normalizeText(compressionSurface);

  const HARD_COMPRESSION_MARKERS = [
    "solo de forma defensiva",
    "supervivencia",
    "apagar incendios",
    "apagando incendios",
    "sin margen",
    "muy por debajo",
    "no puedo mover demasiadas cosas",
    "no puedo resignar ingresos",
    "toda mi energia se va",
    "toda mi energía se va",
    "casi toda mi energia se va",
    "casi toda mi energía se va",
    "sostener funcionamiento inmediato",
    "bajar tensiones urgentes",
    "evitar rupturas",
    "reactivo",
    "urgencias",
    "apagar lo urgente",
    "modo bombero",
    "no en algo propio",
    "poco margen mental",
    "casi no puedo usar mi mejor criterio",
    "piloto automatico",
    "piloto automático",
    "me drena",
    "que no explote nada",
    "para que no explote nada",
    "tomado por obligaciones",
    "bastante tomado por obligaciones",
    "se va en apagar roces",
    "bajar tensiones",
    "evitar choques",
    "en modo defensivo",
  ];

  const SOFT_COMPRESSION_MARKERS = [
    "aparece de a ratos",
    "no como eje",
    "no como eje principal",
    "no como frente principal",
    "aparece lateral",
    "aparece de costado",
    "medio arrumbada",
    "no esta muerta",
    "no está muerta",
    "no estoy destruido",
    "no estoy roto",
    "hay algo apagado",
    "no estoy mudo ni apagado del todo",
    "no estoy apagado del todo",
  ];

  const MANAGEABLE_COMPRESSION_MARKERS = [
    "todavia veo una linea posible",
    "todavía veo una linea posible",
    "todavia veo una linea",
    "todavía veo una línea",
    "linea posible",
    "línea posible",
    "no solo compresion",
    "no solo compresión",
    "restricciones manejables",
    "manejables",
    "hay partes subutilizadas",
  ];

  const hasHardCompressionNarrative = HARD_COMPRESSION_MARKERS.some((marker) =>
    normalizedCompressionText.includes(normalizeText(marker))
  );

  const hasSoftCompressionNarrative = SOFT_COMPRESSION_MARKERS.some((marker) =>
    normalizedCompressionText.includes(normalizeText(marker))
  );

  const hasManageableCompressionNarrative = MANAGEABLE_COMPRESSION_MARKERS.some(
    (marker) => normalizedCompressionText.includes(normalizeText(marker))
  );

  const hasCompressionNarrative =
    hasHardCompressionNarrative ||
    hasSoftCompressionNarrative ||
    hasManageableCompressionNarrative;

  const minimalMargin = input.transitionAssessment.transitionMargin === "minimal";

  const hasHardCompressionPressure =
    hasCompressionNarrative &&
    hasHardCompressionNarrative &&
    !hasManageableCompressionNarrative &&
    !hasSoftCompressionNarrative;

  // Hard compression still counts as context, but should not override
  // a strong family direction. Reserve compressed_life for cases where
  // compression effectively blocks closing an actionable direction.
  const compressionPushesToCompressedLife =
    hasHardCompressionPressure && !topLayerStrongEnough;

  const hasPlausibleDirections = input.plausibleDirections.length > 0;
  const hasRobustEvidence = signalCount >= 5;

  const roundsCompleted = normalizeRoundsCompleted(
    input.clarificationMeta?.roundsCompleted
  );

  const forceAdjudication = roundsCompleted >= 2;

  let decisionReason: DecisionReasonCode;
  let resultTypePreview: ResultType;

  if (!hasAnyTopSurface) {
    decisionReason = "NO_TOP_PROFILE";
    resultTypePreview = "insufficient_evidence";
  } else if (signalCount < 2) {
    decisionReason = "TOO_FEW_SIGNALS";
    resultTypePreview = "insufficient_evidence";
  } else if (topLayerStrongEnough && compressionPushesToCompressedLife) {
    decisionReason = minimalMargin
      ? "MINIMAL_MARGIN_WITH_COMPRESSION"
      : "CLEAR_PROFILE_UNDER_COMPRESSION";
    resultTypePreview = "compressed_life";
  } else if (!hasPlausibleDirections) {
    decisionReason = "NO_PLAUSIBLE_DIRECTIONS";
    resultTypePreview = "insufficient_evidence";
  } else if (!topLayerStrongEnough) {
    decisionReason = "LOW_TOP_CONFIDENCE";
    resultTypePreview = "insufficient_evidence";
  } else {
    const profileSecondTooClose =
      !!secondProfile &&
      topConfidence > 0 &&
      secondConfidence / topConfidence >= 0.995;

    const familySecondTooClose =
      useFamilyDecisionLayer &&
      familyView.secondFamilyScore > 0 &&
      familyView.topFamilyScore > 0 &&
      familyView.secondFamilyScore / familyView.topFamilyScore >= 0.92;

    const familyDominanceGap =
      familyView.topFamilyScore - familyView.secondFamilyScore;

    const familyClearlyAhead =
      useFamilyDecisionLayer &&
      hasStrongEnoughTopFamily &&
      familyDominanceGap >= 0.08;

    const secondTooClose = useFamilyDecisionLayer
      ? familySecondTooClose && !familyClearlyAhead
      : profileSecondTooClose;

    const allowClearDespiteCloseSecond = useFamilyDecisionLayer
      ? familyClearlyAhead || (hasVeryStrongTopFamily && hasPlausibleDirections)
      : !!secondProfile &&
        hasVeryStrongTopProfile &&
        hasRobustEvidence &&
        hasPlausibleDirections;

    const defensibleFrontierWithinCloseRace =
      hasPlausibleDirections &&
      (useFamilyDecisionLayer
        ? signalCount >= 4 &&
          hasStrongEnoughTopFamily &&
          hasStrongEnoughSecondFamily &&
          !!familyView.secondFamilyLabel
        : !!secondProfile &&
          hasStrongEnoughTopProfile &&
          hasStrongEnoughSecondProfile &&
          hasRobustEvidence);

    if (secondTooClose && !allowClearDespiteCloseSecond) {
      if (defensibleFrontierWithinCloseRace) {
        decisionReason = "CLEAR_DIRECTION_DEFENSIBLE_FRONTIER";
        resultTypePreview = "clear_direction";
      } else {
        decisionReason = "SECOND_PROFILE_TOO_CLOSE";
        resultTypePreview = "insufficient_evidence";
      }
    } else {
      decisionReason = "CLEAR_DIRECTION";
      resultTypePreview = "clear_direction";
    }
  }

  if (
    resultTypePreview === "insufficient_evidence" &&
    forceAdjudication &&
    hasAnyTopSurface
  ) {
    const canForceClear =
      hasPlausibleDirections &&
      (topLayerStrongEnough ||
        (topConfidence >= 0.45 && signalCount >= 4) ||
        (familyView.topFamilyScore >= 0.4 && signalCount >= 4));

    if (canForceClear) {
      decisionReason = "FORCED_CLEAR_AFTER_CLARIFICATION";
      resultTypePreview = "clear_direction";
    } else if (topLayerStrongEnough && compressionPushesToCompressedLife) {
      decisionReason = minimalMargin
        ? "MINIMAL_MARGIN_WITH_COMPRESSION"
        : "CLEAR_PROFILE_UNDER_COMPRESSION";
      resultTypePreview = "compressed_life";
    } else {
      decisionReason = "FORCED_COMPRESSED_AFTER_CLARIFICATION";
      resultTypePreview = "compressed_life";
    }
  }

  if (
    resultTypePreview === "insufficient_evidence" &&
    useFamilyDecisionLayer &&
    hasPlausibleDirections &&
    signalCount >= 4 &&
    shouldPreferCompressedCommunityPattern(input, { requireTopFamilyCommunity: false })
  ) {
    resultTypePreview = "compressed_life";
    decisionReason = "COMPRESSED_COMMUNITY_VOCATIONAL_PATTERN";
  }

  if (
    resultTypePreview === "clear_direction" &&
    useFamilyDecisionLayer &&
    hasPlausibleDirections &&
    signalCount >= 4 &&
    shouldPreferCompressedCommunityPattern(input, { requireTopFamilyCommunity: true })
  ) {
    resultTypePreview = "compressed_life";
    decisionReason = "COMPRESSED_COMMUNITY_VOCATIONAL_PATTERN";
  }

  // --- General compression gate (family-agnostic) ---
  // Runs after all existing decision paths. Detects compression from the full
  // narrative surface and can flip clear_direction → compressed_life or rescue
  // insufficient_evidence → compressed_life when a plausible family exists.
  const compressionDetection = detectCompressionSignals(input.intake);
  let compressionGateApplied = false;
  let compressionGateReason: string | null = null;

  if (
    compressionDetection.count >= 2 &&
    (resultTypePreview === "clear_direction" ||
      resultTypePreview === "insufficient_evidence")
  ) {
    const gateTopScore = useFamilyDecisionLayer
      ? familyView.topFamilyScore
      : topConfidence;

    const strongGate =
      compressionDetection.count >= 3 && gateTopScore >= 0.40;
    const moderateGate =
      compressionDetection.count >= 2 && gateTopScore >= 0.50;

    if (strongGate || moderateGate) {
      const priorResult = resultTypePreview;
      compressionGateApplied = true;
      compressionGateReason =
        `${priorResult} → compressed_life (score=${gateTopScore.toFixed(3)}, signals=${compressionDetection.count})`;
      resultTypePreview = "compressed_life";
      decisionReason =
        priorResult === "clear_direction"
          ? "COMPRESSION_GATE_OVERRIDE"
          : "COMPRESSION_GATE_RESCUE";
    }
  }

  const traceTopLabel = useFamilyDecisionLayer
    ? familyView.topFamilyLabel
    : topProfile?.label ?? familyView.topFamilyLabel ?? null;

  const traceTopConfidence = useFamilyDecisionLayer
    ? familyView.topFamilyConfidence > 0
      ? familyView.topFamilyConfidence
      : familyView.topFamilyScore > 0
        ? familyView.topFamilyScore
        : null
    : topProfile?.confidence ??
      (familyView.topFamilyConfidence > 0 ? familyView.topFamilyConfidence : null);

  const traceSecondLabel = useFamilyDecisionLayer
    ? familyView.secondFamilyLabel
    : secondProfile?.label ?? familyView.secondFamilyLabel ?? null;

  const traceSecondConfidence = useFamilyDecisionLayer
    ? familyView.secondFamilyConfidence > 0
      ? familyView.secondFamilyConfidence
      : familyView.secondFamilyScore > 0
        ? familyView.secondFamilyScore
        : null
    : secondProfile?.confidence ??
      (familyView.secondFamilyConfidence > 0
        ? familyView.secondFamilyConfidence
        : null);

  return {
    resultType: resultTypePreview,
    trace: {
      signalCount,
      signalKeys: input.signals.map((signal) => signal.key),
      topProfileLabel: traceTopLabel,
      topProfileConfidence: traceTopConfidence,
      secondProfileLabel: traceSecondLabel,
      secondProfileConfidence: traceSecondConfidence,
      plausibleDirectionLabels: input.plausibleDirections.map(
        (direction) => direction.label
      ),
      transitionMargin: input.transitionAssessment.transitionMargin,
      hasCompressionNarrative,
      decisionReason,
      resultTypePreview,
      compressionGateApplied,
      compressionMarkerCount: compressionDetection.count,
      compressionMarkers: compressionDetection.matchedIds,
      compressionGateReason,
    },
  };
}