import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";

type ContextualForceKind =
  | "life_pressure"
  | "compressed_capacity"
  | "transition_need"
  | "public_voice"
  | "civic_or_political_drive"
  | "community_or_group_drive"
  | "creative_expression"
  | "teaching_or_interpretation"
  | "technical_practical_drive"
  | "stability_constraint"
  | "exposure_fear"
  | "available_assets";

type ContextualForce = {
  kind: ContextualForceKind;
  label: string;
  strength: number;
  evidence: string[];
  interpretation: string;
};

type FamilyAdjustment = {
  family: string;
  direction: "raise" | "keep" | "watch" | "lower";
  strength: number;
  reason: string;
};

type ThemeHint = {
  themeId: string;
  label: string;
  reason: string;
  linkedFamilies: string[];
  activationFit: "high" | "medium" | "low";
  caution?: string;
};

type ActivationHint = {
  path:
    | "asociarme_con_otras_personas"
    | "formarme_en_algo_nuevo"
    | "integrar_proyectos_existentes"
    | "armar_mi_propio_proyecto"
    | "explorar_primero_la_comunidad";
  fit: "high" | "medium" | "low";
  reason: string;
};

export type ContextualSituationReview = {
  judgeId: "contextual_situation_judge";
  verdict:
    | "context_supports_current_reading"
    | "context_suggests_frontier"
    | "context_suggests_human_review"
    | "context_insufficient";
  confidence: number;
  situationFrame: string;
  summary: string;
  forces: ContextualForce[];
  familyAdjustments: FamilyAdjustment[];
  themeHints: ThemeHint[];
  activationHints: ActivationHint[];
  cautions: string[];
  shouldInfluenceDiagnostic: boolean;
  shouldInfluenceGuidedSelection: boolean;
};

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function collectText(intake: UserIntake): string {
  const safe = intake as any;

  return [
    safe?.profile?.age,
    safe?.profile?.country,
    safe?.profile?.occupation,
    safe?.profile?.employmentStatus,
    safe?.profile?.familyLoad,
    safe?.profile?.energyLevel,

    safe?.currentContext?.currentSituation,
    safe?.currentContext?.transitionGoal,
    safe?.currentContext?.constraints,
    safe?.currentContext?.assets,

    safe?.narrative?.childhoodMemories,
    safe?.narrative?.earlyFascinations,
    safe?.narrative?.meaningfulSchoolSubjects,
    safe?.narrative?.repeatedWorkPatterns,
    safe?.narrative?.naturalSocialRoles,
    safe?.narrative?.lossesOrRenunciations,
    safe?.narrative?.whatFeelsCompressedNow,
    safe?.narrative?.additionalContext,
  ]
    .filter((item) => item !== null && typeof item !== "undefined")
    .join("\n");
}

function pushForce(
  forces: ContextualForce[],
  force: ContextualForce,
): void {
  if (force.evidence.length === 0) return;
  forces.push(force);
}

function scoreFromEvidence(count: number, base = 0.35): number {
  return Math.min(0.95, base + count * 0.15);
}

function getCorePatternText(finalReading: FinalReading): string {
  const safe = finalReading as any;

  return [
    safe?.corePattern,
    safe?.dominantTension,
    safe?.currentCost,
    safe?.summaryForUser?.diagnostico,
    safe?.summaryForUser?.direccion,
    safe?.summaryForUser?.tensiones,
    safe?.summaryForUser?.cierre,
  ]
    .filter((item) => typeof item === "string")
    .join("\n");
}

function getTopFamilies(finalReading: FinalReading): string[] {
  const safe = finalReading as any;
  const familyScores = Array.isArray(safe?.familyScores)
    ? safe.familyScores
    : [];

  return familyScores
    .slice()
    .sort((a: any, b: any) => {
      const scoreA = typeof a?.score === "number" ? a.score : 0;
      const scoreB = typeof b?.score === "number" ? b.score : 0;
      return scoreB - scoreA;
    })
    .slice(0, 5)
    .map((item: any) => item?.id ?? item?.familyId ?? item?.family ?? item?.label)
    .filter((item: unknown): item is string => typeof item === "string");
}

function buildFamilyAdjustments(params: {
  text: string;
  forces: ContextualForce[];
  topFamilies: string[];
}): FamilyAdjustment[] {
  const { text, forces, topFamilies } = params;
  const adjustments: FamilyAdjustment[] = [];

  const hasPublicVoice = forces.some((force) => force.kind === "public_voice");
  const hasCivicDrive = forces.some(
    (force) => force.kind === "civic_or_political_drive",
  );
  const hasCommunityDrive = forces.some(
    (force) => force.kind === "community_or_group_drive",
  );
  const hasCreativeDrive = forces.some(
    (force) => force.kind === "creative_expression",
  );
  const hasTeachingDrive = forces.some(
    (force) => force.kind === "teaching_or_interpretation",
  );
  const hasExposureFear = forces.some((force) => force.kind === "exposure_fear");
  const hasCompression = forces.some(
    (force) => force.kind === "compressed_capacity",
  );

  if (hasPublicVoice) {
    adjustments.push({
      family: "public_communicator",
      direction: "raise",
      strength: hasCivicDrive ? 0.85 : 0.7,
      reason:
        "El caso no sólo menciona expresión: aparece deseo de voz hacia otros, escena pública, medios, columnas, agenda o intervención comunicacional.",
    });
  }

  if (hasCivicDrive) {
    adjustments.push({
      family: "civic_advocate",
      direction: "raise",
      strength: 0.78,
      reason:
        "El interés político, cívico o de incidencia pública no debe quedar absorbido sólo como comunicación: puede señalar impulso de intervención colectiva.",
    });
  }

  if (hasCommunityDrive) {
    adjustments.push({
      family: "community_builder",
      direction: "raise",
      strength: 0.72,
      reason:
        "La aparición de grupos, equipos, conducción o armado colectivo sugiere una dimensión de construcción social, no sólo voz individual.",
    });
  }

  if (hasCreativeDrive && hasPublicVoice) {
    adjustments.push({
      family: "creative_storyteller",
      direction: "keep",
      strength: 0.62,
      reason:
        "La dimensión narrativa existe, pero debe leerse como soporte de voz o intervención pública si el objeto principal es audiencia, agenda o exposición.",
    });
  } else if (hasCreativeDrive) {
    adjustments.push({
      family: "creative_storyteller",
      direction: "raise",
      strength: 0.72,
      reason:
        "La historia muestra imaginación, relato, escritura, escenas o creación de mundos como línea humana relevante.",
    });
  }

  if (hasTeachingDrive) {
    adjustments.push({
      family: "educator_interpreter",
      direction: "watch",
      strength: 0.65,
      reason:
        "Si la persona busca explicar, traducir complejidad o ayudar a otros a comprender, Educator Interpreter debe quedar como frontera posible.",
    });
  }

  if (hasExposureFear && hasPublicVoice) {
    adjustments.push({
      family: "public_communicator",
      direction: "watch",
      strength: 0.7,
      reason:
        "La presencia de miedo a exposición no elimina la vocación pública; puede indicar capacidad comprimida que requiere activación gradual.",
    });
  }

  if (hasCompression) {
    for (const family of topFamilies.slice(0, 3)) {
      adjustments.push({
        family,
        direction: "watch",
        strength: 0.58,
        reason:
          "La dirección aparece en un contexto de vida comprimida; conviene evitar una sentencia triunfalista y pensar una transición viable.",
      });
    }
  }

  if (
    includesAny(text, ["oficio", "profesion u oficio", "hacer con las manos"]) &&
    !includesAny(text, ["herramientas", "arreglar", "motores", "instalaciones"])
  ) {
    adjustments.push({
      family: "technical_builder",
      direction: "watch",
      strength: 0.35,
      reason:
        "La palabra oficio sola no alcanza para subir Technical Builder si no hay evidencia práctica concreta.",
    });
  }

  return adjustments;
}

function buildThemeHints(params: {
  forces: ContextualForce[];
  familyAdjustments: FamilyAdjustment[];
}): ThemeHint[] {
  const { forces, familyAdjustments } = params;

  const hasForce = (kind: ContextualForceKind) =>
    forces.some((force) => force.kind === kind);

  const hasFamily = (family: string) =>
    familyAdjustments.some(
      (adjustment) =>
        adjustment.family === family &&
        ["raise", "keep", "watch"].includes(adjustment.direction),
    );

  const hints: ThemeHint[] = [];

  if (hasForce("public_voice")) {
    hints.push({
      themeId: "armar_voz_publica_propia",
      label: "Armar una voz pública propia",
      reason:
        "Aparece una necesidad de decir, ordenar ideas y poner una voz en circulación frente a otros.",
      linkedFamilies: ["public_communicator", "creative_storyteller"],
      activationFit: "high",
      caution: hasForce("exposure_fear")
        ? "Conviene empezar con exposición gradual, no con salto público masivo."
        : undefined,
    });
  }

  if (hasForce("civic_or_political_drive")) {
    hints.push({
      themeId: "decir_lo_que_otros_no_dicen",
      label: "Decir lo que otros no están diciendo",
      reason:
        "El interés político, social o cívico sugiere deseo de intervenir en conversaciones colectivas, no sólo de escribir.",
      linkedFamilies: ["public_communicator", "civic_advocate"],
      activationFit: "high",
    });
  }

  if (hasForce("community_or_group_drive")) {
    hints.push({
      themeId: "construir_algo_con_otros",
      label: "Construir algo con otros",
      reason:
        "La historia muestra señales de grupos, conducción, pertenencia o armado colectivo.",
      linkedFamilies: ["community_builder", "public_communicator"],
      activationFit: "high",
    });
  }

  if (hasForce("compressed_capacity")) {
    hints.push({
      themeId: "recuperar_parte_tuya_tapada",
      label: "Recuperar una parte tuya que quedó tapada",
      reason:
        "El caso muestra capacidades existentes que no están encontrando espacio real en la vida actual.",
      linkedFamilies: ["creative_storyteller", "public_communicator"],
      activationFit: "medium",
      caution:
        "Debe conectarse con una acción concreta, no quedar como introspección indefinida.",
    });
  }

  if (hasForce("creative_expression")) {
    hints.push({
      themeId: "convertir_experiencia_en_relato",
      label: "Convertir experiencia en relato",
      reason:
        "Aparece imaginación, historia, escritura, creación de escenas o necesidad de dar forma narrativa.",
      linkedFamilies: ["creative_storyteller"],
      activationFit: hasFamily("public_communicator") ? "medium" : "high",
    });
  }

  if (hasForce("teaching_or_interpretation")) {
    hints.push({
      themeId: "explicar_lo_complejo_con_claridad",
      label: "Explicar lo complejo con claridad",
      reason:
        "Aparece capacidad de traducir ideas, ordenar complejidad o ayudar a otros a comprender.",
      linkedFamilies: ["educator_interpreter"],
      activationFit: "medium",
    });
  }

  return hints.slice(0, 5);
}

function buildActivationHints(forces: ContextualForce[]): ActivationHint[] {
  const hasForce = (kind: ContextualForceKind) =>
    forces.some((force) => force.kind === kind);

  const hints: ActivationHint[] = [];

  if (hasForce("public_voice") || hasForce("civic_or_political_drive")) {
    hints.push({
      path: "armar_mi_propio_proyecto",
      fit: "high",
      reason:
        "La persona parece necesitar ordenar una voz, una idea o una intervención propia, no sólo sumarse pasivamente a algo ya hecho.",
    });
  }

  if (hasForce("community_or_group_drive")) {
    hints.push({
      path: "asociarme_con_otras_personas",
      fit: "high",
      reason:
        "La presencia de grupos, conducción o armado colectivo sugiere que el avance puede potenciarse con otros.",
    });
  }

  if (hasForce("stability_constraint") || hasForce("exposure_fear")) {
    hints.push({
      path: "explorar_primero_la_comunidad",
      fit: "medium",
      reason:
        "Si hay presión, miedo o restricciones fuertes, conviene ofrecer una entrada de bajo riesgo antes de exigir exposición o decisión grande.",
    });
  }

  if (hasForce("teaching_or_interpretation")) {
    hints.push({
      path: "formarme_en_algo_nuevo",
      fit: "medium",
      reason:
        "Puede ser útil transformar la capacidad de explicar o interpretar en una habilidad comunicable, enseñable o profesionalizable.",
    });
  }

  return hints.slice(0, 4);
}

export function runContextualSituationJudge(params: {
    intake: UserIntake;
    finalReading: FinalReading;
    familyScores?: unknown[];
    affinityScores?: unknown[];
    similarCases?: unknown[];
    learningSignal?: unknown;
    diagnosticReview?: unknown;
    experienceDistillation?: unknown;
  }): ContextualSituationReview {
  const rawText = collectText(params.intake);
  const text = normalizeText(rawText);
  const finalReadingText = normalizeText(getCorePatternText(params.finalReading));
  const topFamilies = getTopFamilies(params.finalReading);

  const forces: ContextualForce[] = [];

  const publicVoiceEvidence = [
    includesAny(text, ["radio"]) ? "radio" : "",
    includesAny(text, ["tv", "television"]) ? "TV" : "",
    includesAny(text, ["columnas", "columna de opinion"])
      ? "columnas de opinión"
      : "",
    includesAny(text, ["medios de comunicacion"]) ? "medios de comunicación" : "",
    includesAny(text, ["audiencia", "publico", "publica", "publico"])
      ? "audiencia/público"
      : "",
    includesAny(text, ["comunicar", "comunicacion"]) ? "comunicación" : "",
  ].filter(Boolean);

  pushForce(forces, {
    kind: "public_voice",
    label: "Voz pública o comunicacional",
    strength: scoreFromEvidence(publicVoiceEvidence.length),
    evidence: publicVoiceEvidence,
    interpretation:
      "El caso muestra señales de comunicación hacia otros, no sólo expresión privada.",
  });

  const civicEvidence = [
    includesAny(text, ["politica", "politico", "politicos"]) ? "política" : "",
    includesAny(text, ["estado", "gobierno"]) ? "Estado/Gobierno" : "",
    includesAny(text, ["causa publica", "asuntos colectivos", "social"])
      ? "asuntos colectivos"
      : "",
    includesAny(text, ["militancia", "activista", "dirigente"])
      ? "militancia/dirigencia"
      : "",
  ].filter(Boolean);

  pushForce(forces, {
    kind: "civic_or_political_drive",
    label: "Impulso cívico, político o de incidencia",
    strength: scoreFromEvidence(civicEvidence.length),
    evidence: civicEvidence,
    interpretation:
      "La orientación política o cívica puede señalar intervención pública, liderazgo o incidencia, no sólo interés temático.",
  });

  const communityEvidence = [
    includesAny(text, ["grupo", "grupos"]) ? "grupos" : "",
    includesAny(text, ["equipo", "equipos"]) ? "equipos" : "",
    includesAny(text, ["liderar", "conducir"]) ? "liderar/conducir" : "",
    includesAny(text, ["armar", "crear grupos", "conformacion"])
      ? "armar o conformar"
      : "",
  ].filter(Boolean);

  pushForce(forces, {
    kind: "community_or_group_drive",
    label: "Construcción grupal o conducción colectiva",
    strength: scoreFromEvidence(communityEvidence.length),
    evidence: communityEvidence,
    interpretation:
      "Hay señales de armado social, liderazgo o coordinación de personas.",
  });

  const creativeEvidence = [
    includesAny(text, ["dibujar", "dibujos"]) ? "dibujos" : "",
    includesAny(text, ["historias", "relatos", "escribir historias"])
      ? "historias/relatos"
      : "",
    includesAny(text, ["inventar", "imaginaba", "imaginacion"])
      ? "inventar/imaginar"
      : "",
    includesAny(text, ["protagonista", "actor", "cantante", "famoso"])
      ? "escena/protagonismo imaginado"
      : "",
    includesAny(text, ["reinos", "imperio", "emperadores"])
      ? "mundos narrativos"
      : "",
  ].filter(Boolean);

  pushForce(forces, {
    kind: "creative_expression",
    label: "Imaginación narrativa y expresión creativa",
    strength: scoreFromEvidence(creativeEvidence.length),
    evidence: creativeEvidence,
    interpretation:
      "Aparece una corriente expresiva y narrativa que puede sostener escritura, comunicación o creación de mundos.",
  });

  const teachingEvidence = [
    includesAny(text, ["explicar", "enseñar", "comprender"])
      ? "explicar/comprender"
      : "",
    includesAny(text, ["formacion", "formar", "orientar"]) ? "formación" : "",
    includesAny(text, ["hacer entender", "claridad"]) ? "claridad para otros" : "",
  ].filter(Boolean);

  pushForce(forces, {
    kind: "teaching_or_interpretation",
    label: "Interpretación o explicación para otros",
    strength: scoreFromEvidence(teachingEvidence.length),
    evidence: teachingEvidence,
    interpretation:
      "Puede haber una dimensión pedagógica o interpretativa si la comunicación busca hacer comprender.",
  });

  const compressionEvidence = [
    includesAny(text, ["no la soporto", "estres", "estresado", "me apago"])
      ? "malestar actual"
      : "",
    includesAny(text, ["vida comprimida", "comprimida", "quedo tapada"])
      ? "capacidad comprimida"
      : "",
    includesAny(text, ["deje de lado", "renuncias", "perdidas"])
      ? "renuncias previas"
      : "",
  ].filter(Boolean);

  pushForce(forces, {
    kind: "compressed_capacity",
    label: "Capacidad comprimida",
    strength: scoreFromEvidence(compressionEvidence.length, 0.4),
    evidence: compressionEvidence,
    interpretation:
      "Hay capacidades o deseos que parecen haber quedado relegados por presión, miedo, economía o trayectoria laboral.",
  });

  const exposureEvidence = [
    includesAny(text, ["miedo a exponerme", "dudas a exponerme"])
      ? "miedo o dudas a exponerse"
      : "",
    includesAny(text, ["presion social", "presion familiar"])
      ? "presión social/familiar"
      : "",
  ].filter(Boolean);

  pushForce(forces, {
    kind: "exposure_fear",
    label: "Miedo o freno ante exposición",
    strength: scoreFromEvidence(exposureEvidence.length, 0.45),
    evidence: exposureEvidence,
    interpretation:
      "El miedo a exposición no anula la dirección pública; obliga a diseñar una activación gradual.",
  });

  const stabilityEvidence = [
    includesAny(text, ["economica", "economicas", "plata", "familia"])
      ? "restricción económica/familiar"
      : "",
    includesAny(text, ["actualmente estoy ejerciendo", "trabajo", "profesion"])
      ? "ocupación actual"
      : "",
  ].filter(Boolean);

  pushForce(forces, {
    kind: "stability_constraint",
    label: "Restricciones de transición",
    strength: scoreFromEvidence(stabilityEvidence.length, 0.35),
    evidence: stabilityEvidence,
    interpretation:
      "La transición debe ser viable y gradual; no conviene proponer un salto idealizado.",
  });

  const assetEvidence = [
    includesAny(text, ["experiencia en politica"]) ? "experiencia política" : "",
    includesAny(text, ["medios de comunicacion"]) ? "medios" : "",
    includesAny(text, ["libros", "columnas"]) ? "libros/columnas" : "",
    includesAny(text, ["estado y gobierno"]) ? "Estado y Gobierno" : "",
  ].filter(Boolean);

  pushForce(forces, {
    kind: "available_assets",
    label: "Activos actuales aprovechables",
    strength: scoreFromEvidence(assetEvidence.length, 0.4),
    evidence: assetEvidence,
    interpretation:
      "El caso no parte de cero: hay experiencia, lenguaje, intereses y capital acumulado que pueden orientar la transición.",
  });

  const familyAdjustments = buildFamilyAdjustments({
    text,
    forces,
    topFamilies,
  });

  const themeHints = buildThemeHints({ forces, familyAdjustments });
  const activationHints = buildActivationHints(forces);

  const hasPublic = forces.some((force) => force.kind === "public_voice");
  const hasCivic = forces.some(
    (force) => force.kind === "civic_or_political_drive",
  );
  const hasCommunity = forces.some(
    (force) => force.kind === "community_or_group_drive",
  );
  const hasCompression = forces.some(
    (force) => force.kind === "compressed_capacity",
  );
  const hasExposureFear = forces.some((force) => force.kind === "exposure_fear");

  const cautions: string[] = [];

  if (hasExposureFear) {
    cautions.push(
      "No empujar a exposición pública brusca si el caso muestra miedo o dudas a exponerse.",
    );
  }

  if (hasCompression) {
    cautions.push(
      "No presentar la dirección como solución mágica: hay vida comprimida y restricciones reales.",
    );
  }

  if (hasPublic && hasCivic) {
    cautions.push(
      "No reducir el caso a escritura o comunicación genérica: hay contenido cívico/político que cambia la lectura.",
    );
  }

  if (hasCommunity) {
    cautions.push(
      "No leer liderazgo o grupos como simple rasgo social: puede ser señal de construcción colectiva.",
    );
  }

  const situationFrame =
    hasPublic && hasCivic && hasCommunity
      ? "voz_publica_con_impulso_civico_y_construccion_grupal"
      : hasPublic && hasCivic
        ? "voz_publica_con_impulso_civico"
        : hasPublic && hasCompression
          ? "voz_publica_comprimida"
          : hasCompression
            ? "capacidad_relevante_comprimida_por_contexto"
            : "contexto_general_de_transicion";

  const shouldInfluenceDiagnostic =
    familyAdjustments.some((item) => item.strength >= 0.7) ||
    forces.some((force) => force.strength >= 0.75);

  const shouldInfluenceGuidedSelection = themeHints.length > 0;

  const verdict =
    forces.length === 0
      ? "context_insufficient"
      : shouldInfluenceDiagnostic && topFamilies.length > 0
        ? "context_suggests_frontier"
        : "context_supports_current_reading";

  const summary =
    situationFrame === "voz_publica_con_impulso_civico_y_construccion_grupal"
      ? "El caso no debe leerse sólo como comunicación. La historia combina voz pública, interés cívico/político y señales de conducción o armado colectivo. Conviene interpretar la dirección como una posible intervención pública gradual, no como simple escritura o contenido."
      : situationFrame === "voz_publica_con_impulso_civico"
        ? "El caso combina comunicación con interés cívico o político. La lectura debería contemplar una frontera entre voz pública, incidencia y explicación para otros."
        : situationFrame === "voz_publica_comprimida"
          ? "Aparece una capacidad comunicacional que no está plenamente desplegada. La activación debería ser gradual y concreta."
          : situationFrame === "capacidad_relevante_comprimida_por_contexto"
            ? "La lectura debe considerar que parte de la energía vital está absorbida por sostener la situación actual. La transición necesita prudencia y pasos realistas."
            : "El contexto aporta información útil, pero todavía no modifica de forma fuerte la lectura principal.";

  const confidence =
    forces.length === 0
      ? 0.2
      : Math.min(
          0.9,
          0.45 +
            forces.filter((force) => force.strength >= 0.65).length * 0.08,
        );

  return {
    judgeId: "contextual_situation_judge",
    verdict,
    confidence,
    situationFrame,
    summary,
    forces,
    familyAdjustments,
    themeHints,
    activationHints,
    cautions,
    shouldInfluenceDiagnostic,
    shouldInfluenceGuidedSelection,
  };
}