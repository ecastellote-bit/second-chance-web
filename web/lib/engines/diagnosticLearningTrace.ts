type JsonRecord = Record<string, unknown>;

export type DiagnosticLearningTier =
  | "full_learned_case"
  | "partial_observation"
  | "negative_control"
  | "frontier_support"
  | "misread_warning"
  | "calibration_only";

export type DiagnosticLearningTrace = {
  shouldStoreTrace: true;
  learningTier: DiagnosticLearningTier;
  shouldInfluenceFutureCases: boolean;
  influenceStrength: number;
  lesson: string;
  whyNotStronger?: string;
  familiesInvolved: string[];
  riskPrevented?: string;
  requiresHumanApproval: boolean;
};

type LearningTraceContext = {
  finalReading?: unknown;
  diagnosticReview?: unknown;
  contextualSituationReview?: unknown;
  similarCases?: unknown[];
  learningSignal?: unknown;
};

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function getString(source: unknown, key: string): string | undefined {
  const value = asRecord(source)[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getNumber(source: unknown, key: string): number | undefined {
  const value = asRecord(source)[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getBoolean(source: unknown, key: string): boolean | undefined {
  const value = asRecord(source)[key];
  return typeof value === "boolean" ? value : undefined;
}

function normalize(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function splitFamilyLabel(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

function collectFamiliesFromArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;

      if (!isRecord(item)) return "";

      return (
        getString(item, "family") ??
        getString(item, "familyId") ??
        getString(item, "id") ??
        getString(item, "label") ??
        getString(item, "primaryFamily") ??
        getString(item, "secondaryFamily") ??
        ""
      );
    })
    .filter(Boolean);
}

function collectFamilies(params: {
  distillation: unknown;
  context: LearningTraceContext;
}): string[] {
  const distillation = asRecord(params.distillation);
  const finalReading = asRecord(params.context.finalReading);
  const diagnosticReview = asRecord(params.context.diagnosticReview);
  const contextualReview = asRecord(params.context.contextualSituationReview);
  const trace = asRecord(finalReading.trace);
  const familyRace = asRecord(trace.familyRace);

  const extractedLessons =
    (Array.isArray(distillation.extractedLessons) && distillation.extractedLessons) ||
    (Array.isArray(distillation.lessons) && distillation.lessons) ||
    (Array.isArray(distillation.distilledLessons) && distillation.distilledLessons) ||
    [];

  const lessonFamilies = extractedLessons.flatMap((lesson) => {
    if (!isRecord(lesson)) return [];

    return [
      ...collectFamiliesFromArray(lesson.families),
      getString(lesson, "primaryFamily") ?? "",
      getString(lesson, "secondaryFamily") ?? "",
    ];
  });

  return uniqueStrings([
    ...splitFamilyLabel(getString(finalReading, "corePattern")),
    getString(familyRace, "topLabel") ?? "",
    getString(familyRace, "secondLabel") ?? "",
    getString(diagnosticReview, "recommendedPrimaryFamily") ?? "",
    ...collectFamiliesFromArray(diagnosticReview.recommendedFrontier),
    getString(contextualReview, "suggestedPrimaryFamily") ?? "",
    ...collectFamiliesFromArray(contextualReview.suggestedFrontier),
    ...lessonFamilies,
  ]);
}

function inferLearningTier(distillation: unknown): DiagnosticLearningTier {
  const verdictKey = normalize(getString(distillation, "verdict"));
  const useKey = normalize(getString(distillation, "recommendedLearningUse"));

  if (getBoolean(distillation, "shouldBecomeFullLearnedCase")) {
    return "full_learned_case";
  }

  if (useKey.includes("misread") || verdictKey.includes("misread")) {
    return "misread_warning";
  }

  if (useKey.includes("frontier") || verdictKey.includes("frontier")) {
    return "frontier_support";
  }

  if (getBoolean(distillation, "shouldCreateObservation")) {
    return "partial_observation";
  }

  if (
    useKey.includes("do not learn") ||
    useKey.includes("calibration") ||
    verdictKey.includes("no useful")
  ) {
    return "calibration_only";
  }

  return "calibration_only";
}

function inferInfluence(params: {
  tier: DiagnosticLearningTier;
  confidence?: number;
}): {
  shouldInfluenceFutureCases: boolean;
  influenceStrength: number;
  requiresHumanApproval: boolean;
} {
  const confidence =
    typeof params.confidence === "number" && Number.isFinite(params.confidence)
      ? params.confidence
      : 0.3;

  switch (params.tier) {
    case "full_learned_case":
      return {
        shouldInfluenceFutureCases: true,
        influenceStrength: Math.max(0.7, confidence),
        requiresHumanApproval: false,
      };

    case "frontier_support":
      return {
        shouldInfluenceFutureCases: false,
        influenceStrength: Math.min(0.35, Math.max(0.2, confidence * 0.4)),
        requiresHumanApproval: true,
      };

    case "misread_warning":
      return {
        shouldInfluenceFutureCases: true,
        influenceStrength: Math.min(0.4, Math.max(0.25, confidence * 0.5)),
        requiresHumanApproval: true,
      };

    case "partial_observation":
      return {
        shouldInfluenceFutureCases: false,
        influenceStrength: Math.min(0.2, Math.max(0.1, confidence * 0.3)),
        requiresHumanApproval: true,
      };

    case "negative_control":
      return {
        shouldInfluenceFutureCases: false,
        influenceStrength: 0.05,
        requiresHumanApproval: true,
      };

    case "calibration_only":
    default:
      return {
        shouldInfluenceFutureCases: false,
        influenceStrength: 0,
        requiresHumanApproval: false,
      };
  }
}

function buildLesson(params: {
  tier: DiagnosticLearningTier;
  familiesInvolved: string[];
}): string {
  const families =
    params.familiesInvolved.length > 0
      ? params.familiesInvolved.join(" / ")
      : "las familias detectadas";

  switch (params.tier) {
    case "full_learned_case":
      return `El caso deja una enseñanza suficientemente clara para funcionar como precedente aprendido sobre ${families}.`;

    case "frontier_support":
      return `El caso deja una regla de frontera útil: preservar la tensión entre ${families} cuando la evidencia no alcanza para cerrar una sentencia única.`;

    case "misread_warning":
      return `El caso deja una advertencia de mala lectura: no arrastrar automáticamente el diagnóstico hacia ${families} sin evidencia diferencial suficiente.`;

    case "partial_observation":
      return `El caso deja una observación parcial sobre ${families}, útil para auditoría y calibración, pero todavía no suficientemente fuerte para influir de forma estable.`;

    case "negative_control":
      return `El caso sirve como control negativo: muestra un patrón que no debe convertirse automáticamente en aprendizaje fuerte.`;

    case "calibration_only":
    default:
      return `El caso no deja una enseñanza suficientemente limpia para influir en futuros diagnósticos, pero sí debe guardarse como traza de calibración.`;
  }
}

function buildWhyNotStronger(params: {
  tier: DiagnosticLearningTier;
  distillation: unknown;
}): string | undefined {
  if (params.tier === "full_learned_case") return undefined;

  const summary = getString(params.distillation, "summary");

  if (summary) {
    return summary;
  }

  switch (params.tier) {
    case "frontier_support":
      return "La evidencia ayuda a sostener una frontera, pero no alcanza para convertirla en aprendizaje estable sin revisión humana.";

    case "misread_warning":
      return "La advertencia es útil, pero debe mantenerse como control de lectura antes de influir con peso alto.";

    case "partial_observation":
      return "La observación es útil, pero todavía no tiene limpieza suficiente para modificar futuros casos.";

    case "calibration_only":
      return "La corrida aporta información sobre cómo respondió el sistema, aunque no contiene una lección diagnóstica fuerte.";

    case "negative_control":
      return "El valor del caso está en mostrar qué no conviene aprender todavía.";

    default:
      return undefined;
  }
}

function buildRiskPrevented(tier: DiagnosticLearningTier): string | undefined {
  switch (tier) {
    case "frontier_support":
      return "Evitar cerrar como sentencia única una frontera que todavía necesita contraste.";

    case "misread_warning":
      return "Evitar que una señal superficial arrastre futuras lecturas hacia una familia equivocada.";

    case "negative_control":
      return "Evitar que un caso débil o ambiguo se convierta en precedente fuerte.";

    case "calibration_only":
      return "Evitar que una corrida sin enseñanza limpia se pierda sin dejar registro de calibración.";

    default:
      return undefined;
  }
}

export function ensureDiagnosticLearningTrace<T>(
  distillationInput: T,
  context: LearningTraceContext = {},
): T & {
  shouldStoreTrace: true;
  learningTier: DiagnosticLearningTier;
  shouldInfluenceFutureCases: boolean;
  influenceStrength: number;
  whyNotStronger?: string;
  learningTrace: DiagnosticLearningTrace;
} {
  const base = isRecord(distillationInput)
    ? distillationInput
    : {
        verdict: "calibration_trace_only",
        recommendedLearningUse: "calibration_only",
        shouldBecomeFullLearnedCase: false,
        shouldCreateObservation: false,
        shouldRaiseRedFlag: false,
        confidence: 0.2,
        summary:
          "No se recibió una extracción quirúrgica completa, pero la corrida debe dejar traza mínima de calibración.",
      };

  const tier = inferLearningTier(base);
  const confidence = getNumber(base, "confidence") ?? 0.3;
  const familiesInvolved = collectFamilies({
    distillation: base,
    context,
  });

  const influence = inferInfluence({
    tier,
    confidence,
  });

  const learningTrace: DiagnosticLearningTrace = {
    shouldStoreTrace: true,
    learningTier: tier,
    shouldInfluenceFutureCases: influence.shouldInfluenceFutureCases,
    influenceStrength: influence.influenceStrength,
    lesson: buildLesson({
      tier,
      familiesInvolved,
    }),
    whyNotStronger: buildWhyNotStronger({
      tier,
      distillation: base,
    }),
    familiesInvolved,
    riskPrevented: buildRiskPrevented(tier),
    requiresHumanApproval: influence.requiresHumanApproval,
  };

  return {
    ...(base as JsonRecord),
    shouldStoreTrace: true,
    learningTier: tier,
    shouldInfluenceFutureCases: learningTrace.shouldInfluenceFutureCases,
    influenceStrength: learningTrace.influenceStrength,
    whyNotStronger: learningTrace.whyNotStronger,
    learningTrace,
  } as T & {
    shouldStoreTrace: true;
    learningTier: DiagnosticLearningTier;
    shouldInfluenceFutureCases: boolean;
    influenceStrength: number;
    whyNotStronger?: string;
    learningTrace: DiagnosticLearningTrace;
  };
}