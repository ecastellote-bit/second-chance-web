import type {
    ContextualMarker,
    DiagnosticExperienceDistillation,
    DiagnosticExperienceDistillerInput,
    ExtractedLearningLesson,
    LearningUseRecommendation,
  } from "../types/learningObservations";
  
  type FamilyScoreLike = {
    id?: string;
    familyId?: string;
    label?: string;
    familyLabel?: string;
    family?: string;
    score?: number;
    confidence?: number;
  };
  
  type LearningSignalLike = {
    strongestHistoricalFamily?: string;
    similarCases?: Array<{
      caseId?: string;
      expectedPrimaryFamily?: string;
      similarityScore?: number;
      matchedLanguage?: string[];
    }>;
    shouldRaiseRedFlag?: boolean;
    warning?: string;
  };
  
  type DiagnosticFindingLike = {
    judgeId?: string;
    verdict?: string;
    family?: string;
    confidence?: number;
    reason?: string;
    evidence?: string[];
  };
  
  type DiagnosticReviewLike = {
    finalVerdict?: string;
    recommendedPrimaryFamily?: string;
    recommendedFrontier?: string[];
    shouldRequestHumanReview?: boolean;
    findings?: DiagnosticFindingLike[];
  };
  
  type ResultLike = {
    resultType?: string;
    corePattern?: string;
    familyScores?: FamilyScoreLike[];
    learningSignal?: LearningSignalLike;
    diagnosticReview?: DiagnosticReviewLike;
    diagnosticJudgeReview?: DiagnosticReviewLike;
    trace?: {
      familyRace?: {
        topId?: string;
        secondId?: string;
        topLabel?: string;
        secondLabel?: string;
        topScore?: number;
        secondScore?: number;
        scoreGap?: number;
        isCloseRace?: boolean;
        isVeryCloseRace?: boolean;
        shouldAvoidSingleClearClaim?: boolean;
      };
    };
  };
  
  function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  }
  
  function normalizeFamilyId(value: string | undefined | null): string {
    if (!value) return "";
  
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\//g, " ")
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\s/g, "_");
  }
  
  function normalizeFamilyLabel(value: string | undefined | null): string {
    if (!value) return "";
  
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  
  function getFamilyScore(family: FamilyScoreLike | null | undefined): number {
    return typeof family?.score === "number" && Number.isFinite(family.score)
      ? family.score
      : 0;
  }
  
  function getFamilyConfidence(family: FamilyScoreLike | null | undefined): number {
    return typeof family?.confidence === "number" && Number.isFinite(family.confidence)
      ? family.confidence
      : 0;
  }
  
  function getFamilyId(family: FamilyScoreLike | null | undefined): string {
    return normalizeFamilyId(family?.id ?? family?.familyId ?? family?.family);
  }
  
  function getFamilyLabel(family: FamilyScoreLike | null | undefined): string {
    return (
      family?.label ??
      family?.familyLabel ??
      family?.family ??
      family?.id ??
      family?.familyId ??
      ""
    );
  }
  
  function parseResult(input: DiagnosticExperienceDistillerInput): ResultLike {
    const direct =
      input.currentResult ??
      input.finalReading ??
      asRecord(input.sourceInput).currentResult ??
      asRecord(input.sourceInput).result;
  
    return asRecord(direct) as ResultLike;
  }
  
  function parseLearningSignal(
    input: DiagnosticExperienceDistillerInput,
    result: ResultLike,
  ): LearningSignalLike | null {
    const candidate = input.learningSignal ?? result.learningSignal;
    if (!candidate || typeof candidate !== "object") return null;
  
    return candidate as LearningSignalLike;
  }
  
  function parseDiagnosticReview(
    input: DiagnosticExperienceDistillerInput,
    result: ResultLike,
  ): DiagnosticReviewLike | null {
    const candidate =
      input.diagnosticReview ??
      result.diagnosticReview ??
      result.diagnosticJudgeReview;
  
    if (!candidate || typeof candidate !== "object") return null;
  
    return candidate as DiagnosticReviewLike;
  }
  
  function getSortedFamilyScores(result: ResultLike): FamilyScoreLike[] {
    const familyScores = Array.isArray(result.familyScores)
      ? result.familyScores
      : [];
  
    return [...familyScores].sort((a, b) => {
      const scoreDelta = getFamilyScore(b) - getFamilyScore(a);
      if (scoreDelta !== 0) return scoreDelta;
  
      return getFamilyConfidence(b) - getFamilyConfidence(a);
    });
  }
  
  function getCorePatternFamilies(corePattern: string | undefined): string[] {
    if (!corePattern) return [];
  
    return corePattern
      .split("/")
      .map((part) => normalizeFamilyId(part))
      .filter(Boolean);
  }
  
  function getRecommendedFrontierFamilies(
    diagnosticReview: DiagnosticReviewLike | null,
  ): string[] {
    if (!Array.isArray(diagnosticReview?.recommendedFrontier)) return [];
  
    return diagnosticReview.recommendedFrontier
      .map((family) => normalizeFamilyId(family))
      .filter(Boolean);
  }
  
  function resolveFrontierFamilies(
    result: ResultLike,
    diagnosticReview: DiagnosticReviewLike | null,
  ): string[] {
    const reviewFrontier = getRecommendedFrontierFamilies(diagnosticReview);
    if (reviewFrontier.length >= 2) return reviewFrontier.slice(0, 2);
  
    const coreFamilies = getCorePatternFamilies(result.corePattern);
    if (coreFamilies.length >= 2) return coreFamilies.slice(0, 2);
  
    const familyRace = result.trace?.familyRace;
    if (
      familyRace?.shouldAvoidSingleClearClaim &&
      familyRace.topLabel &&
      familyRace.secondLabel
    ) {
      return [
        normalizeFamilyId(familyRace.topLabel),
        normalizeFamilyId(familyRace.secondLabel),
      ].filter(Boolean);
    }
  
    const sorted = getSortedFamilyScores(result);
    const top = sorted[0];
    const second = sorted[1];
  
    if (!top || !second) return [];
  
    const topScore = getFamilyScore(top);
    const secondScore = getFamilyScore(second);
    const gap = Math.abs(topScore - secondScore);
  
    if (topScore > 0 && secondScore > 0 && gap <= 0.08) {
      return [getFamilyId(top), getFamilyId(second)].filter(Boolean);
    }
  
    return [];
  }
  
  function collectHumanLexiconMarkers(
    diagnosticReview: DiagnosticReviewLike | null,
  ): string[] {
    const findings = Array.isArray(diagnosticReview?.findings)
      ? diagnosticReview.findings
      : [];
  
    const lexiconFinding = findings.find((finding) =>
      normalizeFamilyId(finding.judgeId).includes("human_lexicon"),
    );
  
    if (!Array.isArray(lexiconFinding?.evidence)) return [];
  
    return lexiconFinding.evidence
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  
  function collectSimilarCaseMarkers(
    learningSignal: LearningSignalLike | null,
  ): string[] {
    const similarCases = Array.isArray(learningSignal?.similarCases)
      ? learningSignal.similarCases
      : [];
  
    return similarCases
      .flatMap((similarCase) =>
        Array.isArray(similarCase.matchedLanguage)
          ? similarCase.matchedLanguage
          : [],
      )
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  
  function uniqueStrings(values: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
  
    for (const value of values) {
      const key = normalizeFamilyId(value);
      if (!key || seen.has(key)) continue;
  
      seen.add(key);
      result.push(value);
    }
  
    return result;
  }
  
  function buildContextualMarkersForFrontier(
    frontierFamilies: string[],
    markers: string[],
  ): ContextualMarker[] {
    const markerSet = new Set(markers.map((marker) => normalizeFamilyId(marker)));
  
    const contextualMarkers: ContextualMarker[] = [];
  
    if (
      frontierFamilies.includes("creative_storyteller") &&
      markerSet.has("voz")
    ) {
      contextualMarkers.push({
        marker: "voz",
        supportsFamilies: ["creative_storyteller", "public_communicator"],
        contextMeaning:
          "Puede ser voz narrativa propia o voz pública; necesita contexto para no sobreadjudicar.",
        notEnoughFor: ["public_communicator"],
      });
    }
  
    if (
      frontierFamilies.includes("creative_storyteller") &&
      frontierFamilies.includes("educator_interpreter")
    ) {
      contextualMarkers.push(
        {
          marker: "escribir",
          supportsFamilies: ["creative_storyteller"],
          contextMeaning:
            "Señal narrativa fuerte cuando aparece junto a historias, textos, tono o voz propia.",
          notEnoughFor: ["public_communicator"],
        },
        {
          marker: "explicar",
          supportsFamilies: ["educator_interpreter"],
          contextMeaning:
            "Señal pedagógica o interpretativa cuando el foco es que otros comprendan.",
          notEnoughFor: ["creative_storyteller"],
        },
        {
          marker: "poner en palabras",
          supportsFamilies: ["creative_storyteller", "educator_interpreter"],
          contextMeaning:
            "Puede ser forma narrativa o traducción de complejidad; debe leerse por objeto y destino.",
        },
      );
    }
  
    if (
      frontierFamilies.includes("technical_builder") &&
      frontierFamilies.includes("system_designer")
    ) {
      contextualMarkers.push(
        {
          marker: "meter mano",
          supportsFamilies: ["technical_builder"],
          contextMeaning: "Intervención práctica directa sobre funcionamiento real.",
          notEnoughFor: ["system_designer"],
        },
        {
          marker: "flujo",
          supportsFamilies: ["system_designer"],
          contextMeaning:
            "Diseño estructural o de proceso cuando el foco está en arquitectura y prevención.",
          notEnoughFor: ["technical_builder"],
        },
      );
    }
  
    return contextualMarkers;
  }
  
  function buildFrontierLesson(
    frontierFamilies: string[],
    markers: string[],
  ): ExtractedLearningLesson | null {
    const hasCreativeEducator =
      frontierFamilies.includes("creative_storyteller") &&
      frontierFamilies.includes("educator_interpreter");
  
    if (hasCreativeEducator) {
      return {
        type: "frontier_rule",
        families: ["creative_storyteller", "educator_interpreter"],
        primaryFamily: "creative_storyteller",
        secondaryFamily: "educator_interpreter",
        strength: 0.74,
        lesson:
          "Cuando escritura, relato, voz propia y construcción de textos aparecen junto con explicar ideas, claridad para otros o ayudar a comprender, la lectura no debe cerrarse como Creative Storyteller puro ni como Educator Interpreter puro: debe abrir frontera entre ambas familias.",
        conditions: [
          "aparece escritura o relato",
          "aparece explicación o traducción de ideas",
          "aparece claridad para otros",
          "no hay suficiente señal de postura pública o agenda externa",
        ],
        positiveMarkers: markers,
        negativeMarkers: [
          "postura pública",
          "agenda pública",
          "militancia pública",
          "audiencia explícita",
        ],
        contextualMarkers: buildContextualMarkersForFrontier(
          frontierFamilies,
          markers,
        ),
        misreadWarnings: [
          "No convertir automáticamente escritura en Public Communicator si no hay postura pública, audiencia o agenda.",
          "No bajar Educator Interpreter si el relato está al servicio de comprensión ajena.",
          "No cerrar sentencia única cuando la brecha entre Creative Storyteller y Educator Interpreter es pequeña.",
        ],
        requiresHumanApproval: true,
      };
    }
  
    const hasTechnicalSystem =
      frontierFamilies.includes("technical_builder") &&
      frontierFamilies.includes("system_designer");
  
    if (hasTechnicalSystem) {
      return {
        type: "frontier_rule",
        families: ["technical_builder", "system_designer"],
        primaryFamily: "technical_builder",
        secondaryFamily: "system_designer",
        strength: 0.72,
        lesson:
          "Cuando aparecen señales de reparar, probar, meter mano y hacer funcionar, junto con estructura, sistema o diseño de proceso, debe abrirse frontera Technical Builder / System Designer en vez de cerrar prematuramente una sola familia.",
        conditions: [
          "hay funcionamiento concreto",
          "hay reparación o prueba",
          "también aparece estructura, sistema o proceso",
        ],
        positiveMarkers: markers,
        contextualMarkers: buildContextualMarkersForFrontier(
          frontierFamilies,
          markers,
        ),
        misreadWarnings: [
          "No llevar todo a System Designer si la persona quiere intervenir sobre cosas reales.",
          "No llevar todo a Technical Builder si el foco principal está en arquitectura, flujos y prevención.",
        ],
        requiresHumanApproval: true,
      };
    }
  
    if (frontierFamilies.length >= 2) {
      const first = frontierFamilies[0];
      const second = frontierFamilies[1];
  
      return {
        type: "frontier_rule",
        families: [first, second],
        primaryFamily: first,
        secondaryFamily: second,
        strength: 0.6,
        lesson: `El caso muestra una frontera activa entre ${normalizeFamilyLabel(
          first,
        )} y ${normalizeFamilyLabel(
          second,
        )}. La lectura debe preservar ambas hipótesis hasta que haya evidencia diferencial más clara.`,
        conditions: [
          "las dos familias principales aparecen cercanas",
          "la evidencia no alcanza para cerrar sentencia única",
        ],
        positiveMarkers: markers,
        contextualMarkers: buildContextualMarkersForFrontier(
          frontierFamilies,
          markers,
        ),
        misreadWarnings: [
          "No convertir una frontera estrecha en diagnóstico único sólo por diferencia numérica pequeña.",
        ],
        requiresHumanApproval: true,
      };
    }
  
    return null;
  }
  
  function resolveRecommendation(params: {
    frontierFamilies: string[];
    historicalFamily: string;
    historicalInsideFrontier: boolean;
    rawLearningRedFlag: boolean;
    diagnosticReview: DiagnosticReviewLike | null;
  }): {
    verdict: DiagnosticExperienceDistillation["verdict"];
    recommendedLearningUse: LearningUseRecommendation;
    shouldRaiseRedFlag: boolean;
    shouldBecomeFullLearnedCase: boolean;
    shouldCreateObservation: boolean;
    summary: string;
  } {
    if (params.frontierFamilies.length >= 2 && params.historicalInsideFrontier) {
      return {
        verdict: "collect_partial_learning",
        recommendedLearningUse: "frontier_support",
        shouldRaiseRedFlag: false,
        shouldBecomeFullLearnedCase: false,
        shouldCreateObservation: true,
        summary:
          "La memoria aprendida no contradice el resultado: fortalece una de las familias de la frontera. Debe tratarse como apoyo de frontera, no como red flag fuerte.",
      };
    }
  
    if (params.rawLearningRedFlag && !params.historicalInsideFrontier) {
      return {
        verdict: "requires_human_review",
        recommendedLearningUse: "misread_warning",
        shouldRaiseRedFlag: true,
        shouldBecomeFullLearnedCase: false,
        shouldCreateObservation: true,
        summary:
          "La memoria aprendida empuja hacia una familia que no está dentro de la lectura actual. Conviene revisión humana antes de convertir esto en aprendizaje.",
      };
    }
  
    if (params.frontierFamilies.length >= 2) {
      return {
        verdict: "collect_partial_learning",
        recommendedLearningUse: "partial_lesson",
        shouldRaiseRedFlag: false,
        shouldBecomeFullLearnedCase: false,
        shouldCreateObservation: true,
        summary:
          "El caso no debe entrar automáticamente como caso aprendido completo, pero sí puede dejar una regla parcial de frontera.",
      };
    }
  
    if (params.diagnosticReview?.finalVerdict === "aligned") {
      return {
        verdict: "promote_to_learned_case_candidate",
        recommendedLearningUse: "full_case",
        shouldRaiseRedFlag: false,
        shouldBecomeFullLearnedCase: false,
        shouldCreateObservation: false,
        summary:
          "El resultado parece alineado, pero todavía requiere aprobación humana antes de convertirse en caso aprendido completo.",
      };
    }
  
    return {
      verdict: "no_useful_learning",
      recommendedLearningUse: "do_not_learn_yet",
      shouldRaiseRedFlag: false,
      shouldBecomeFullLearnedCase: false,
      shouldCreateObservation: false,
      summary:
        "No aparece una enseñanza suficientemente limpia para guardar sin revisión adicional.",
    };
  }
  
  export function runDiagnosticExperienceDistiller(
    input: DiagnosticExperienceDistillerInput,
  ): DiagnosticExperienceDistillation {
    const result = parseResult(input);
    const learningSignal = parseLearningSignal(input, result);
    const diagnosticReview = parseDiagnosticReview(input, result);
  
    const frontierFamilies = resolveFrontierFamilies(result, diagnosticReview);
    const historicalFamily = normalizeFamilyId(
      learningSignal?.strongestHistoricalFamily,
    );
  
    const historicalInsideFrontier =
      historicalFamily.length > 0 && frontierFamilies.includes(historicalFamily);
  
    const rawLearningRedFlag = Boolean(learningSignal?.shouldRaiseRedFlag);
  
    const lexiconMarkers = collectHumanLexiconMarkers(diagnosticReview);
    const similarCaseMarkers = collectSimilarCaseMarkers(learningSignal);
    const markers = uniqueStrings([...lexiconMarkers, ...similarCaseMarkers]);
  
    const recommendation = resolveRecommendation({
      frontierFamilies,
      historicalFamily,
      historicalInsideFrontier,
      rawLearningRedFlag,
      diagnosticReview,
    });
  
    const extractedLessons: ExtractedLearningLesson[] = [];
  
    const frontierLesson = buildFrontierLesson(frontierFamilies, markers);
  
    if (frontierLesson && recommendation.shouldCreateObservation) {
      extractedLessons.push(frontierLesson);
    }
  
    const contextualMarkers = extractedLessons.flatMap(
      (lesson) => lesson.contextualMarkers ?? [],
    );
  
    const misreadWarnings = uniqueStrings(
      extractedLessons.flatMap((lesson) => lesson.misreadWarnings ?? []),
    );
  
    const notes: string[] = [];
  
    if (historicalInsideFrontier) {
      notes.push(
        "La familia histórica dominante está dentro de la frontera actual; no corresponde tratarlo como contradicción fuerte.",
      );
    }
  
    if (rawLearningRedFlag && historicalInsideFrontier) {
      notes.push(
        "Se neutralizó un red flag demasiado sensible porque la memoria aprendida no contradice la frontera.",
      );
    }
  
    if (frontierFamilies.length >= 2) {
      notes.push(
        `Frontera detectada: ${frontierFamilies
          .map((family) => normalizeFamilyLabel(family))
          .join(" / ")}.`,
      );
    }
  
    return {
      verdict: recommendation.verdict,
      recommendedLearningUse: recommendation.recommendedLearningUse,
      shouldBecomeFullLearnedCase: recommendation.shouldBecomeFullLearnedCase,
      shouldCreateObservation: recommendation.shouldCreateObservation,
      shouldRaiseRedFlag: recommendation.shouldRaiseRedFlag,
      confidence:
        extractedLessons.length > 0
          ? Math.max(...extractedLessons.map((lesson) => lesson.strength))
          : 0.3,
      summary: recommendation.summary,
      extractedLessons,
      contextualMarkers,
      misreadWarnings,
      notes,
    };
  }