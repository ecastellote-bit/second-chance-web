"use client";

import { useFullAnswers } from "../fullAnswersContext";

type FamilyScoreForView = {
  id?: string;
  familyId?: string;
  label?: string;
  familyLabel?: string;
  family?: string;
  summary?: string;
  score?: number;
  confidence?: number;
  rationale?: string[];
};

type SimilarCaseForView = {
  id?: string;
  caseId?: string;
  title?: string;
  similarityScore?: number;
  expectedPrimaryFamily?: string;
  acceptableFamilies?: string[];
  rivalFamilies?: string[];
  matchedLanguage?: string[];
  keyHumanLanguage?: string[];
  lesson?: string;
};

type LearningAssistedHypothesisForView = {
  family: string;
  reason: string;
  confidence: number;
  basedOnCases: number;
};

type LearningSignalForView = {
  strongestHistoricalFamily?: string;
  similarCases?: SimilarCaseForView[];
  warning?: string;
  shouldRaiseRedFlag?: boolean;
  learningAssistedHypothesis?: LearningAssistedHypothesisForView;
};

type DiagnosticJudgeFindingForView = {
  judgeId?: string;
  verdict?: string;
  family?: string;
  confidence?: number;
  reason?: string;
  evidence?: string[];
};

type DiagnosticReviewForView = {
  finalVerdict?: string;
  recommendedPrimaryFamily?: string;
  recommendedFrontier?: string[];
  shouldRequestHumanReview?: boolean;
  findings?: DiagnosticJudgeFindingForView[];
};

type ContextualMarkerForView = {
  marker?: string;
  supportsFamilies?: string[];
  contextMeaning?: string;
  notEnoughFor?: string[];
};

type ExtractedLearningLessonForView = {
  type?: string;
  families?: string[];
  primaryFamily?: string;
  secondaryFamily?: string;
  strength?: number;
  lesson?: string;
  conditions?: string[];
  positiveMarkers?: string[];
  negativeMarkers?: string[];
  contextualMarkers?: ContextualMarkerForView[];
  misreadWarnings?: string[];
  requiresHumanApproval?: boolean;
};

type ExperienceDistillationForView = {
  verdict?: string;
  recommendedLearningUse?: string;
  shouldBecomeFullLearnedCase?: boolean;
  shouldCreateObservation?: boolean;
  shouldRaiseRedFlag?: boolean;
  confidence?: number;
  summary?: string;

  extractedLessons?: ExtractedLearningLessonForView[];
  lessons?: ExtractedLearningLessonForView[];
  distilledLessons?: ExtractedLearningLessonForView[];

  contextualMarkers?: ContextualMarkerForView[];
  misreadWarnings?: string[];
  warnings?: string[];
  notes?: string[];
};

type FamilyRaceForView = {
  topLabel?: string | null;
  secondLabel?: string | null;
  topScore?: number;
  secondScore?: number;
  scoreGap?: number;
  isCloseRace?: boolean;
  isVeryCloseRace?: boolean;
  shouldAvoidSingleClearClaim?: boolean;
};

type SummaryForUserForView = {
  diagnostico?: string;
  hilo_conductor?: string;
  tensiones?: string;
  direccion?: string;
  action?: string;
  camino_minimo?: string;
  cierre?: string;
};

type ResultForView = {
  resultType?: string;
  corePattern?: string;
  dominantTension?: string;
  currentCost?: string;

  familyScores?: FamilyScoreForView[];
  learningSignal?: LearningSignalForView;
  similarCases?: SimilarCaseForView[];

  diagnosticReview?: DiagnosticReviewForView | null;
  diagnosticJudgeReview?: DiagnosticReviewForView | null;

  experienceDistillation?: ExperienceDistillationForView | null;
  diagnosticExperienceDistillation?: ExperienceDistillationForView | null;
  diagnosticSurgery?: ExperienceDistillationForView | null;
  learningDistillation?: ExperienceDistillationForView | null;

  summaryForUser?: SummaryForUserForView;

  trace?: {
    familyRace?: FamilyRaceForView;
  };
};

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function getFamilyLabel(family: FamilyScoreForView): string {
  return (
    family.label ??
    family.familyLabel ??
    family.family ??
    family.id ??
    family.familyId ??
    "Dirección sin nombre"
  );
}

function getFamilyScore(family: FamilyScoreForView): number {
  return typeof family.score === "number" && Number.isFinite(family.score)
    ? family.score
    : 0;
}

function getFamilyConfidence(family: FamilyScoreForView): number {
  return typeof family.confidence === "number" &&
    Number.isFinite(family.confidence)
    ? family.confidence
    : 0;
}

function formatPercent(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "0%";

  if (value > 1 && value <= 100) {
    return `${Math.round(value)}%`;
  }

  return `${Math.round(value * 100)}%`;
}

function normalizeLabel(value: string | undefined | null): string {
  if (!value) return "Sin dato";

  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeForComparison(value: string | undefined | null): string {
  if (!value) return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDirectionParts(direction: string): string[] {
  return direction
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getSimilarCaseId(similarCase: SimilarCaseForView): string {
  return similarCase.caseId ?? similarCase.id ?? "case";
}

function getMatchedLanguage(similarCase: SimilarCaseForView): string[] {
  const matchedLanguage = safeArray(similarCase.matchedLanguage);
  if (matchedLanguage.length > 0) return matchedLanguage;

  return safeArray(similarCase.keyHumanLanguage);
}

function getExperienceDistillation(
  rawResult: ResultForView,
): ExperienceDistillationForView | null {
  return (
    rawResult.experienceDistillation ??
    rawResult.diagnosticExperienceDistillation ??
    rawResult.diagnosticSurgery ??
    rawResult.learningDistillation ??
    null
  );
}

function getExtractedLessons(
  experienceDistillation: ExperienceDistillationForView | null,
): ExtractedLearningLessonForView[] {
  if (!experienceDistillation) return [];

  const extractedLessons = safeArray(experienceDistillation.extractedLessons);
  if (extractedLessons.length > 0) return extractedLessons;

  const lessons = safeArray(experienceDistillation.lessons);
  if (lessons.length > 0) return lessons;

  return safeArray(experienceDistillation.distilledLessons);
}

function toSerializableSnapshot(value: unknown): unknown {
  const seen = new WeakSet<object>();

  function clean(input: unknown): unknown {
    if (input === null) return null;

    if (
      typeof input === "string" ||
      typeof input === "number" ||
      typeof input === "boolean"
    ) {
      return input;
    }

    if (typeof input === "undefined") return null;

    if (typeof input === "function" || typeof input === "symbol") {
      return undefined;
    }

    if (input instanceof Date) {
      return input.toISOString();
    }

    if (Array.isArray(input)) {
      return input
        .map((item) => clean(item))
        .filter((item) => typeof item !== "undefined");
    }

    if (typeof input === "object") {
      if (seen.has(input)) return "[Circular]";
      seen.add(input);

      const output: Record<string, unknown> = {};

      for (const [key, item] of Object.entries(input)) {
        const cleaned = clean(item);
        if (typeof cleaned !== "undefined") {
          output[key] = cleaned;
        }
      }

      return output;
    }

    return String(input);
  }

  return clean(value);
}

function buildSourceInputSnapshot(fullAnswersContext: unknown): unknown {
  const context = fullAnswersContext as Record<string, unknown>;

  return toSerializableSnapshot({
    state: context.state ?? null,
    followup: context.followup ?? null,
    isHydrated: context.isHydrated ?? null,

    fallbackContext:
      typeof context.state === "undefined" ? fullAnswersContext : undefined,
  });
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
}

function buildHeadline(params: {
  resultType?: string;
  isFrontierReading: boolean;
}): string {
  if (params.resultType === "insufficient_evidence") {
    return "Todavía no hay evidencia suficiente para cerrar una dirección";
  }

  if (params.resultType === "compressed_life") {
    return "Aparece una vida comprimida antes que una dirección nítida";
  }

  if (params.isFrontierReading) {
    return "Aparecen dos direcciones fuertes que conviene revisar juntas";
  }

  return "Hay una dirección que aparece con claridad";
}

function buildDirectionLabel(params: {
  resultType?: string;
  isFrontierReading: boolean;
}): string {
  if (params.resultType === "insufficient_evidence") {
    return "Estado de la lectura";
  }

  if (params.isFrontierReading) {
    return "Frontera principal";
  }

  return "Dirección principal";
}

function buildMainExplanation(params: {
  resultType?: string;
  isFrontierReading: boolean;
  dominantTension?: string;
  diagnosticSummary?: string;
}): string {
  if (params.diagnosticSummary) {
    return params.diagnosticSummary;
  }

  if (params.resultType === "insufficient_evidence") {
    return "La información reunida todavía no alcanza para afirmar una dirección sin inventar.";
  }

  if (params.resultType === "compressed_life") {
    return "La lectura detecta que parte importante de tu energía está puesta en sostener lo inmediato.";
  }

  if (params.isFrontierReading) {
    return (
      params.dominantTension ??
      "Tu caso no queda reducido a una sola etiqueta: aparecen dos líneas fuertes que necesitan revisarse juntas."
    );
  }

  return (
    params.dominantTension ??
    "Esta dirección aparece porque hay patrones consistentes en cómo leés situaciones, tomás decisiones y respondés a lo que te toca sostener."
  );
}

function buildAssistedHypothesis(params: {
  learningSignal: LearningSignalForView | null;
  similarCases: SimilarCaseForView[];
  shouldRaiseRedFlag: boolean;
}): LearningAssistedHypothesisForView | null {
  if (params.learningSignal?.learningAssistedHypothesis) {
    return params.learningSignal.learningAssistedHypothesis;
  }

  const fallbackFamily =
    params.shouldRaiseRedFlag && params.learningSignal?.strongestHistoricalFamily
      ? params.learningSignal.strongestHistoricalFamily
      : null;

  if (!fallbackFamily) return null;

  return {
    family: fallbackFamily,
    reason:
      "El diagnóstico principal y la memoria de casos aprendidos no están completamente alineados. La comparación histórica sugiere revisar esta dirección antes de cerrar la lectura.",
    confidence: params.similarCases[0]?.similarityScore ?? 0,
    basedOnCases: params.similarCases.length,
  };
}

export default function ResultPage() {
  const fullAnswersContext = useFullAnswers();
  const { analysis } = fullAnswersContext;

  const result = analysis?.result;

  if (!result) {
    return <div>No hay resultado disponible</div>;
  }

  const rawResult = result as unknown as ResultForView;

  const mainDirection =
    rawResult.corePattern ?? "Todavía no aparece una dirección clara";

  const familyScores: FamilyScoreForView[] = Array.isArray(rawResult.familyScores)
    ? rawResult.familyScores
    : [];

  const sortedFamilyScores = [...familyScores].sort(
    (a: FamilyScoreForView, b: FamilyScoreForView) => {
      const scoreDelta = getFamilyScore(b) - getFamilyScore(a);
      if (scoreDelta !== 0) return scoreDelta;

      return getFamilyConfidence(b) - getFamilyConfidence(a);
    },
  );

  const usefulFamilyScores = sortedFamilyScores.filter(
    (family) => getFamilyScore(family) > 0 || getFamilyConfidence(family) > 0,
  );

  const visibleFamilyScores =
    usefulFamilyScores.length > 0
      ? usefulFamilyScores.slice(0, 5)
      : sortedFamilyScores.slice(0, 5);

  const familyRace = rawResult.trace?.familyRace ?? null;

  const mainDirectionParts = getDirectionParts(mainDirection);

  const isFrontierReading =
    Boolean(familyRace?.shouldAvoidSingleClearClaim) ||
    mainDirectionParts.length > 1;

  const mainDirectionKeys = new Set(
    [
      ...mainDirectionParts,
      familyRace?.topLabel ?? "",
      familyRace?.secondLabel ?? "",
    ].map((part) => normalizeForComparison(part)),
  );

  const secondaryDirections = sortedFamilyScores
    .filter((family) => {
      const label = normalizeForComparison(getFamilyLabel(family));
      if (!label) return false;
      if (mainDirectionKeys.has(label)) return false;

      return getFamilyScore(family) > 0 || getFamilyConfidence(family) > 0;
    })
    .slice(0, 2);

  const learningSignal: LearningSignalForView | null =
    rawResult.learningSignal ?? null;

  const diagnosticReview: DiagnosticReviewForView | null =
    rawResult.diagnosticReview ?? rawResult.diagnosticJudgeReview ?? null;

  const experienceDistillation = getExperienceDistillation(rawResult);

  const effectiveLearningRedFlag =
    experienceDistillation?.shouldRaiseRedFlag ??
    learningSignal?.shouldRaiseRedFlag ??
    false;

  const diagnosticFindings: DiagnosticJudgeFindingForView[] = Array.isArray(
    diagnosticReview?.findings,
  )
    ? diagnosticReview.findings
    : [];

  const extractedLessons = getExtractedLessons(experienceDistillation);

  const distillationContextualMarkers = safeArray(
    experienceDistillation?.contextualMarkers,
  );

  const distillationWarnings = [
    ...safeArray(experienceDistillation?.misreadWarnings),
    ...safeArray(experienceDistillation?.warnings),
  ];

  const distillationNotes = safeArray(experienceDistillation?.notes);

  const similarCases: SimilarCaseForView[] = Array.isArray(rawResult.similarCases)
    ? rawResult.similarCases
    : Array.isArray(learningSignal?.similarCases)
      ? learningSignal.similarCases
      : [];

  const assistedHypothesis = buildAssistedHypothesis({
    learningSignal,
    similarCases,
    shouldRaiseRedFlag: effectiveLearningRedFlag,
  });

  const headline = buildHeadline({
    resultType: rawResult.resultType,
    isFrontierReading,
  });

  const directionLabel = buildDirectionLabel({
    resultType: rawResult.resultType,
    isFrontierReading,
  });

  const explanation = buildMainExplanation({
    resultType: rawResult.resultType,
    isFrontierReading,
    dominantTension: rawResult.dominantTension,
    diagnosticSummary: rawResult.summaryForUser?.diagnostico,
  });

  const isCompressed = rawResult.resultType === "compressed_life";

  const compressionText =
    rawResult.currentCost ??
    "Hoy parte de esta capacidad no está desplegada como podría, porque gran parte de tu energía está en sostener lo inmediato.";

  const secondaryDirectionText = isFrontierReading
    ? "También aparece como línea posible, aunque con menos fuerza que la frontera principal."
    : "También aparece como línea posible, aunque con menos fuerza que la dirección principal.";

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Resultado de tu lectura
          </p>

          <h1 className="text-3xl font-semibold">{headline}</h1>

          <p className="text-base text-neutral-700 leading-7">
            Esto no es una etiqueta. Es una lectura basada en patrones que
            aparecen en tu historia.
          </p>
        </div>

        {/* DIRECCIÓN / FRONTERA PRINCIPAL */}
        <div className="border border-neutral-200 rounded-xl p-6 space-y-3">
          <p className="text-sm text-neutral-500">{directionLabel}</p>

          <h2 className="text-2xl font-semibold">{mainDirection}</h2>

          <p className="text-sm text-neutral-700 leading-6">{explanation}</p>

          {isFrontierReading && familyRace?.topLabel && familyRace?.secondLabel && (
            <p className="text-sm text-neutral-600 leading-6">
              La diferencia entre <strong>{familyRace.topLabel}</strong> y{" "}
              <strong>{familyRace.secondLabel}</strong> es suficientemente chica
              como para no cerrar esta lectura como una sentencia única.
            </p>
          )}
        </div>

        {/* RANKING REAL */}
        {visibleFamilyScores.length > 0 && (
          <div className="border border-neutral-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-medium">
              Cómo se ordenan las direcciones en tu caso
            </h3>

            <div className="space-y-4">
              {visibleFamilyScores.map((family, index) => (
                <div
                  key={`${getFamilyLabel(family)}-${index}`}
                  className="space-y-1"
                >
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-medium">{getFamilyLabel(family)}</span>
                    <span className="text-neutral-600">
                      {formatPercent(getFamilyScore(family))}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500">
                    Confianza: {formatPercent(getFamilyConfidence(family))}
                  </p>

                  {family.summary && (
                    <p className="text-sm text-neutral-700 leading-6">
                      {family.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OTRAS DIRECCIONES */}
        {secondaryDirections.length > 0 && (
          <div className="border border-neutral-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-medium">
              Otras direcciones que también aparecen
            </h3>

            <div className="space-y-3">
              {secondaryDirections.map((family, index) => (
                <div key={`${getFamilyLabel(family)}-secondary-${index}`}>
                  <p className="font-medium">{getFamilyLabel(family)}</p>
                  <p className="text-sm text-neutral-700">
                    {secondaryDirectionText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APRENDIZAJE DIAGNÓSTICO */}
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-blue-700">
              Aprendizaje diagnóstico
            </p>

            <h3 className="text-lg font-medium">
              Comparación con casos aprendidos
            </h3>

            <p className="text-sm text-neutral-700 leading-6">
              Esta capa compara tu caso con experiencias diagnósticas anteriores.
              Por ahora funciona como juez auditor: advierte similitudes, pero no
              reemplaza automáticamente el resultado principal.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              Casos similares encontrados:{" "}
              <strong>{similarCases.length}</strong>
            </p>

            <p>
              Familia histórica dominante:{" "}
              <strong>
                {normalizeLabel(
                  learningSignal?.strongestHistoricalFamily ??
                    assistedHypothesis?.family,
                )}
              </strong>
            </p>

            <p>
              Red flag de aprendizaje:{" "}
              <strong>{effectiveLearningRedFlag ? "Sí" : "No"}</strong>
            </p>

            {learningSignal?.warning && effectiveLearningRedFlag && (
              <p className="text-neutral-700 leading-6">
                Advertencia: {learningSignal.warning}
              </p>
            )}

            {learningSignal?.warning &&
              !effectiveLearningRedFlag &&
              experienceDistillation && (
                <p className="text-neutral-700 leading-6">
                  Observación: la memoria detectó una posible tensión, pero la
                  extracción quirúrgica no la sostiene como red flag fuerte.
                </p>
              )}
          </div>

          {assistedHypothesis && effectiveLearningRedFlag && (
            <div className="border border-blue-400 bg-white rounded-lg p-4 space-y-2">
              <p className="text-sm uppercase tracking-wide text-blue-700">
                Hipótesis asistida por aprendizaje
              </p>

              <h4 className="text-lg font-semibold">
                {normalizeLabel(assistedHypothesis.family)}
              </h4>

              <p className="text-sm text-neutral-700 leading-6">
                {assistedHypothesis.reason}
              </p>

              <p className="text-sm text-neutral-600">
                Confianza asistida:{" "}
                {formatPercent(assistedHypothesis.confidence)}
                {" · "}
                Basada en {assistedHypothesis.basedOnCases} casos similares.
              </p>

              <p className="text-sm text-neutral-700 leading-6">
                Esto no reemplaza automáticamente el diagnóstico principal, pero
                funciona como una señal fuerte de revisión. Si el sistema
                principal se desvía, esta capa ayuda a no perder una dirección
                humana evidente.
              </p>
            </div>
          )}

          {similarCases.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Casos más parecidos</h4>

              {similarCases.slice(0, 5).map((similarCase, index) => {
                const matchedLanguage = getMatchedLanguage(similarCase);

                return (
                  <div
                    key={`${getSimilarCaseId(similarCase)}-${index}`}
                    className="bg-white border border-blue-100 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between gap-4 text-sm">
                      <p className="font-medium">
                        {similarCase.title ?? "Caso aprendido"}
                      </p>

                      <p className="text-neutral-500">
                        Similitud: {formatPercent(similarCase.similarityScore)}
                      </p>
                    </div>

                    <p className="text-sm text-neutral-700">
                      Familia esperada en ese caso:{" "}
                      <strong>
                        {normalizeLabel(similarCase.expectedPrimaryFamily)}
                      </strong>
                    </p>

                    {matchedLanguage.length > 0 && (
                      <p className="text-sm text-neutral-700">
                        Lenguaje coincidente: {matchedLanguage.join(", ")}
                      </p>
                    )}

                    {similarCase.lesson && (
                      <p className="text-sm text-neutral-700 leading-6">
                        Lección: {similarCase.lesson}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REVISIÓN DE JUECES DIAGNÓSTICOS */}
        {diagnosticReview && (
          <div className="border border-amber-300 bg-amber-50 rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-amber-700">
                Revisión de jueces diagnósticos
              </p>

              <h3 className="text-lg font-medium">
                Auditoría interna del resultado
              </h3>

              <p className="text-sm text-neutral-700 leading-6">
                Esta capa revisa si el diagnóstico principal, el ranking
                familiar, el aprendizaje por casos similares y la evidencia del
                usuario están alineados o si conviene abrir una frontera antes de
                cerrar la lectura.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                Veredicto general:{" "}
                <strong>{normalizeLabel(diagnosticReview.finalVerdict)}</strong>
              </p>

              {diagnosticReview.recommendedPrimaryFamily && (
                <p>
                  Familia recomendada por jueces:{" "}
                  <strong>
                    {normalizeLabel(diagnosticReview.recommendedPrimaryFamily)}
                  </strong>
                </p>
              )}

              {safeArray(diagnosticReview.recommendedFrontier).length > 0 && (
                <p>
                  Frontera recomendada:{" "}
                  <strong>
                    {safeArray(diagnosticReview.recommendedFrontier)
                      .map((family) => normalizeLabel(family))
                      .join(" / ")}
                  </strong>
                </p>
              )}

              <p>
                Revisión humana sugerida:{" "}
                <strong>
                  {diagnosticReview.shouldRequestHumanReview ? "Sí" : "No"}
                </strong>
              </p>
            </div>

            {diagnosticFindings.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Hallazgos de los jueces</h4>

                {diagnosticFindings.map((finding, index) => (
                  <div
                    key={`${finding.judgeId ?? "judge"}-${index}`}
                    className="bg-white border border-amber-100 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between gap-4 text-sm">
                      <p className="font-medium">
                        {normalizeLabel(finding.judgeId)}
                      </p>

                      <p className="text-neutral-500">
                        {normalizeLabel(finding.verdict)}
                      </p>
                    </div>

                    {finding.family && (
                      <p className="text-sm text-neutral-700">
                        Familia señalada:{" "}
                        <strong>{normalizeLabel(finding.family)}</strong>
                      </p>
                    )}

                    {finding.reason && (
                      <p className="text-sm text-neutral-700 leading-6">
                        {finding.reason}
                      </p>
                    )}

                    {safeArray(finding.evidence).length > 0 && (
                      <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                        {safeArray(finding.evidence)
                          .slice(0, 4)
                          .map((item, itemIndex) => (
                            <li
                              key={`${
                                finding.judgeId ?? "judge"
                              }-evidence-${itemIndex}`}
                            >
                              {item}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EXTRACCIÓN QUIRÚRGICA DE APRENDIZAJE */}
        {experienceDistillation && (
          <div className="border border-emerald-300 bg-emerald-50 rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-emerald-700">
                Extracción quirúrgica de aprendizaje
              </p>

              <h3 className="text-lg font-medium">
                Qué enseñanza deja este caso
              </h3>

              <p className="text-sm text-neutral-700 leading-6">
                Esta capa no decide el diagnóstico. Separa qué parte del caso
                puede servir como aprendizaje, qué parte debe quedar sólo como
                observación y qué riesgos de mala lectura conviene guardar.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                Veredicto del cirujano:{" "}
                <strong>
                  {normalizeLabel(experienceDistillation.verdict)}
                </strong>
              </p>

              <p>
                Uso recomendado:{" "}
                <strong>
                  {normalizeLabel(
                    experienceDistillation.recommendedLearningUse,
                  )}
                </strong>
              </p>

              <p>
                ¿Convertir en caso aprendido completo?:{" "}
                <strong>
                  {experienceDistillation.shouldBecomeFullLearnedCase
                    ? "Sí"
                    : "No"}
                </strong>
              </p>

              <p>
                ¿Crear observación parcial?:{" "}
                <strong>
                  {experienceDistillation.shouldCreateObservation ? "Sí" : "No"}
                </strong>
              </p>

              <p>
                ¿Sostener red flag?:{" "}
                <strong>
                  {experienceDistillation.shouldRaiseRedFlag ? "Sí" : "No"}
                </strong>
              </p>

              <p>
                Confianza del cirujano:{" "}
                <strong>
                  {formatPercent(experienceDistillation.confidence)}
                </strong>
              </p>

              {experienceDistillation.summary && (
                <p className="text-neutral-700 leading-6">
                  {experienceDistillation.summary}
                </p>
              )}
            </div>

            {extractedLessons.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Lecciones extraídas</h4>

                {extractedLessons.map((lesson, index) => (
                  <div
                    key={`${lesson.type ?? "lesson"}-${index}`}
                    className="bg-white border border-emerald-100 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between gap-4 text-sm">
                      <p className="font-medium">
                        {normalizeLabel(lesson.type)}
                      </p>

                      <p className="text-neutral-500">
                        Fuerza: {formatPercent(lesson.strength)}
                      </p>
                    </div>

                    {safeArray(lesson.families).length > 0 && (
                      <p className="text-sm text-neutral-700">
                        Familias:{" "}
                        <strong>
                          {safeArray(lesson.families)
                            .map((family) => normalizeLabel(family))
                            .join(" / ")}
                        </strong>
                      </p>
                    )}

                    {!safeArray(lesson.families).length &&
                      (lesson.primaryFamily || lesson.secondaryFamily) && (
                        <p className="text-sm text-neutral-700">
                          Familias:{" "}
                          <strong>
                            {[lesson.primaryFamily, lesson.secondaryFamily]
                              .filter(Boolean)
                              .map((family) => normalizeLabel(family))
                              .join(" / ")}
                          </strong>
                        </p>
                      )}

                    {lesson.lesson && (
                      <p className="text-sm text-neutral-700 leading-6">
                        {lesson.lesson}
                      </p>
                    )}

                    {safeArray(lesson.conditions).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Condiciones</p>
                        <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                          {safeArray(lesson.conditions)
                            .slice(0, 5)
                            .map((item, itemIndex) => (
                              <li key={`lesson-condition-${index}-${itemIndex}`}>
                                {item}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {safeArray(lesson.positiveMarkers).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Marcadores positivos
                        </p>
                        <p className="text-sm text-neutral-700 leading-6">
                          {safeArray(lesson.positiveMarkers).join(", ")}
                        </p>
                      </div>
                    )}

                    {safeArray(lesson.negativeMarkers).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Marcadores que limitan la lectura
                        </p>
                        <p className="text-sm text-neutral-700 leading-6">
                          {safeArray(lesson.negativeMarkers).join(", ")}
                        </p>
                      </div>
                    )}

                    {safeArray(lesson.misreadWarnings).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Riesgos de mala lectura
                        </p>
                        <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                          {safeArray(lesson.misreadWarnings)
                            .slice(0, 4)
                            .map((item, itemIndex) => (
                              <li key={`lesson-warning-${index}-${itemIndex}`}>
                                {item}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {lesson.requiresHumanApproval && (
                      <p className="text-sm text-neutral-700 leading-6">
                        Esta lección requiere aprobación humana antes de
                        convertirse en aprendizaje estable.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {distillationContextualMarkers.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Marcadores contextuales</h4>

                {distillationContextualMarkers
                  .slice(0, 6)
                  .map((marker, index) => (
                    <div
                      key={`${marker.marker ?? "marker"}-${index}`}
                      className="bg-white border border-emerald-100 rounded-lg p-4 space-y-2"
                    >
                      <p className="font-medium">
                        {marker.marker ?? "Marcador sin nombre"}
                      </p>

                      {marker.contextMeaning && (
                        <p className="text-sm text-neutral-700 leading-6">
                          {marker.contextMeaning}
                        </p>
                      )}

                      {safeArray(marker.supportsFamilies).length > 0 && (
                        <p className="text-sm text-neutral-700">
                          Apoya:{" "}
                          <strong>
                            {safeArray(marker.supportsFamilies)
                              .map((family) => normalizeLabel(family))
                              .join(" / ")}
                          </strong>
                        </p>
                      )}

                      {safeArray(marker.notEnoughFor).length > 0 && (
                        <p className="text-sm text-neutral-700">
                          No alcanza por sí solo para:{" "}
                          <strong>
                            {safeArray(marker.notEnoughFor)
                              .map((family) => normalizeLabel(family))
                              .join(" / ")}
                          </strong>
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {distillationWarnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Advertencias preservadas</h4>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {distillationWarnings.slice(0, 5).map((warning, index) => (
                    <li key={`distillation-warning-${index}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {distillationNotes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Notas internas</h4>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {distillationNotes.slice(0, 5).map((note, index) => (
                    <li key={`distillation-note-${index}`}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* COMPRESIÓN */}
        {isCompressed && (
          <div className="border border-neutral-300 bg-neutral-50 rounded-xl p-6 space-y-3">
            <h3 className="text-lg font-medium">
              Algo importante a tener en cuenta
            </h3>

            <p className="text-sm text-neutral-700 leading-6">
              {compressionText}
            </p>
          </div>
        )}

        {/* EXPORTAR CASO PARA APRENDIZAJE */}
        <div className="border border-neutral-300 bg-neutral-50 rounded-xl p-6 space-y-3">
          <h3 className="text-lg font-medium">
            Exportar caso para aprendizaje
          </h3>

          <p className="text-sm text-neutral-700 leading-6">
            Usá esto sólo después de revisar humanamente el resultado. No todo
            caso corrido debe convertirse en caso aprendido.
          </p>

          <button
            type="button"
            className="border border-neutral-400 rounded-lg px-4 py-2 text-sm hover:bg-neutral-100"
            onClick={async () => {
              const payload = {
                exportedAt: new Date().toISOString(),

                sourceInput: {
                  fullAnswersContext: buildSourceInputSnapshot(
                    fullAnswersContext,
                  ),
                },

                currentResult: {
                  resultType: rawResult.resultType,
                  corePattern: rawResult.corePattern,
                  dominantTension: rawResult.dominantTension,
                  currentCost: rawResult.currentCost,
                  familyScores: rawResult.familyScores ?? [],
                  learningSignal: rawResult.learningSignal ?? null,
                  similarCases,
                  diagnosticReview,
                  experienceDistillation,
                  effectiveLearningRedFlag,
                  summaryForUser: rawResult.summaryForUser ?? null,
                  trace: rawResult.trace ?? null,
                },

                humanReview: {
                  expectedPrimaryFamily: "",
                  acceptableFamilies: [],
                  rivalFamilies: [],
                  verdict: "pending_human_review",
                  correctionNote: "",
                  shouldBecomeLearnedCase: false,
                },
              };

              try {
                await copyTextToClipboard(JSON.stringify(payload, null, 2));

                alert("Caso copiado al portapapeles para revisión/aprendizaje.");
              } catch (error) {
                console.error("No se pudo copiar el caso:", error);
                alert(
                  "No se pudo copiar automáticamente. Revisá la consola del navegador.",
                );
              }
            }}
          >
            Copiar caso para revisión
          </button>
        </div>

        {/* CIERRE */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Qué hacer con esto</h3>

          <p className="text-sm text-neutral-700 leading-6">
            {rawResult.summaryForUser?.cierre ??
              "Esto no es una conclusión final. Es un punto de partida más claro para empezar a moverte con dirección."}
          </p>

          {rawResult.summaryForUser?.action && (
            <p className="text-sm text-neutral-700 leading-6">
              {rawResult.summaryForUser.action}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}